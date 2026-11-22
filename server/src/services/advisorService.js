/**
 * advisorService.js - orchestrates safety advice for one area:
 *   cache -> Gemini (if configured) -> built-in fallback.
 * Score, risk level and emergency numbers always come from our own code.
 */
import { config } from '../config.js';
import { crimeRepository } from './crimeRepository.js';
import { buildFallbackAdvice, EMERGENCY_CONTACTS } from './fallbackAdvisor.js';
import { generateGeminiAdvice } from './geminiService.js';
import { calcSafetyScore } from '../../../shared/riskScore.js';

const cache = new Map(); // areaId -> { at, advice }

export async function getAdviceForArea(areaId) {
  const area = crimeRepository.findById(areaId);
  if (!area) return null;

  const hit = cache.get(areaId);
  if (hit && Date.now() - hit.at < config.adviceCacheMs) return hit.advice;

  const score = calcSafetyScore(area);
  const ai = await generateGeminiAdvice(area, score);

  const advice = ai
    ? {
        areaId: area.id,
        area: area.area,
        city: area.city,
        safetyScore: score,
        riskLevel: area.riskLevel,
        summary: ai.summary,
        tips: ai.tips,
        emergency: { actions: ai.actions, contacts: EMERGENCY_CONTACTS },
        source: 'gemini',
      }
    : buildFallbackAdvice(area);

  advice.generatedAt = new Date().toISOString();
  cache.set(areaId, { at: Date.now(), advice });
  return advice;
}
