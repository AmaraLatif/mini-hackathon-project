/** Module 1 - presentation helpers. */
export function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

export const formatCoords = (lat, lng) => `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
