/** Module 3 - asks the API for advice and degrades gracefully if it is unavailable. */
import { get } from './http';
import { buildOfflineAdvice } from './offlineAdvice';

const isValid = (d) => d && typeof d.safetyScore === 'number' && Array.isArray(d.tips) && d.emergency;

export async function fetchAdvice(area, { signal } = {}) {
  try {
    const data = await get(`/advisor/${encodeURIComponent(area.id)}`, { signal });
    if (!isValid(data)) throw new Error('Unexpected advisor response');
    return data;
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    return buildOfflineAdvice(area);
  }
}
