/** Module 3 - thin fetch wrapper for the Express API. */
const BASE = import.meta.env.VITE_API_URL || '/api';

export async function get(path, { signal } = {}) {
  const res = await fetch(`${BASE}${path}`, { signal, headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json(); // throws if the body is not JSON (e.g. SPA fallback HTML)
}
