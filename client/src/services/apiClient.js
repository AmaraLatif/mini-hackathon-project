/** Fetch wrapper for JSON requests with optional admin token. Errors carry `.status` and `.fields`. */
const BASE = import.meta.env.VITE_API_URL || '/api';

export async function request(path, { method = 'GET', body, token, signal } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    signal,
    headers: {
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON body (for example the SPA fallback page when the API is not running) */
  }

  if (!res.ok) {
    const err = new Error(data?.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.fields = data?.fields;
    throw err;
  }
  if (data === null) throw new Error('The server returned an unexpected response. Is the API running?');
  return data;
}

export const toQuery = (params) => {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== '') q.set(k, v);
  const s = q.toString();
  return s ? `?${s}` : '';
};
