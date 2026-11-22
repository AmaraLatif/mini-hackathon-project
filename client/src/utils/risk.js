/** Module 2 - re-exports the shared risk helpers so components import from one place. */
export { RISK_LEVELS, RISK_META, calcSafetyScore, scoreBand } from '@shared/riskScore.js';

export const riskOrder = { Low: 0, Medium: 1, High: 2 };
