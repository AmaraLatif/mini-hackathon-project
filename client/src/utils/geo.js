/** Module 2 - small geo helpers (no library needed). */
const toRad = (d) => (d * Math.PI) / 180;

export function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** Nearest record to a clicked point, or null if nothing is within maxKm. */
export function findNearest(crimes, lat, lng, maxKm = 25) {
  let best = null;
  let bestDist = Infinity;
  for (const c of crimes) {
    const d = haversineKm(lat, lng, c.latitude, c.longitude);
    if (d < bestDist) {
      best = c;
      bestDist = d;
    }
  }
  return bestDist <= maxKm ? best : null;
}
