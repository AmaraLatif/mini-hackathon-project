/**
 * geminiService.js - calls the Gemini REST API directly with fetch (no SDK, so
 * there is nothing extra to install). Returns null on ANY problem so the caller
 * can fall back to the built-in advisor. The model only writes prose; scores
 * and emergency phone numbers are always supplied by our own code.
 */
import { config } from '../config.js';

const clip = (s, n) => String(s).trim().slice(0, n);
const cleanList = (arr, count, max) =>
  Array.isArray(arr) ? arr.filter((x) => typeof x === 'string' && x.trim()).map((x) => clip(x, max)).slice(0, count) : [];

function buildPrompt(area, score) {
  return `You are SafeZone AI, a calm, practical public-safety assistant for travellers and residents in Pakistan.
Use ONLY the sample record below. Do not invent statistics, dates, phone numbers or specific incidents.
Do not stereotype residents of any area. Keep advice practical and non-alarmist.

Record:
${JSON.stringify({ city: area.city, area: area.area, crimeType: area.crimeType, riskLevel: area.riskLevel, description: area.description, safetyScore: score })}

Reply with JSON only, in exactly this shape:
{"summary": string (max 45 words), "tips": [5 strings, each max 20 words], "emergencyActions": [3 strings, each max 20 words]}`;
}

export async function generateGeminiAdvice(area, score) {
  if (!config.geminiApiKey) return null;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    config.geminiModel
  )}:generateContent`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.geminiTimeoutMs);

  try {
    const res = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': config.geminiApiKey },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: buildPrompt(area, score) }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 4096, responseMimeType: 'application/json' },
      }),
    });
    if (!res.ok) {
      console.warn(`[gemini] HTTP ${res.status}; using fallback advisor`);
      return null;
    }
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
    const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());

    const summary = typeof parsed.summary === 'string' ? clip(parsed.summary, 400) : '';
    const tips = cleanList(parsed.tips, 5, 160);
    const actions = cleanList(parsed.emergencyActions, 3, 160);
    if (!summary || tips.length < 3 || actions.length < 1) return null;

    return { summary, tips, actions };
  } catch (err) {
    console.warn(`[gemini] ${err.name}: ${err.message}; using fallback advisor`);
    return null;
  } finally {
    clearTimeout(timer);
  }
}
