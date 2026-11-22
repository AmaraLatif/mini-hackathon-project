/**
 * shared/riskScore.js
 * -----------------------------------------------------------------------------
 * Single source of truth for risk metadata and the safety-score formula.
 * Imported by BOTH the React client (via the "@shared" alias) and the Express
 * server, so the number a user sees in the UI always matches the number the API
 * returns. Plain ES module, no dependencies.
 *
 * The score is a transparent, rule-based heuristic (not a trained model):
 *   score = base score for the risk level + a small penalty for crime severity.
 */

export const RISK_LEVELS = ['Low', 'Medium', 'High'];

/** Colour + heatmap weight for each risk level. */
export const RISK_META = {
  Low: { color: '#22c55e', weight: 0.3, label: 'Low risk' },
  Medium: { color: '#facc15', weight: 0.6, label: 'Medium risk' },
  High: { color: '#ef4444', weight: 0.95, label: 'High risk' },
};

const BASE_SCORE = { Low: 82, Medium: 58, High: 31 };

/** Extra penalty for more serious crime types. */
const SEVERITY_PENALTY = {
  'Highway Robbery': 8,
  Burglary: 5,
  'Vehicle Theft': 4,
  Harassment: 4,
  'Street Theft': 3,
  'Mobile Snatching': 3,
  Vandalism: 1,
  'Fraud / Scams': 1,
};

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

/** Returns an integer from 5 (very unsafe) to 98 (very safe). */
export function calcSafetyScore(area) {
  const base = BASE_SCORE[area.riskLevel] ?? 55;
  const penalty = SEVERITY_PENALTY[area.crimeType] ?? 2;
  return clamp(base - penalty, 5, 98);
}

/** Human-friendly band for a score. */
export function scoreBand(score) {
  if (score >= 70) return { label: 'Generally safe', color: '#22c55e' };
  if (score >= 45) return { label: 'Stay alert', color: '#facc15' };
  return { label: 'High caution', color: '#ef4444' };
}
