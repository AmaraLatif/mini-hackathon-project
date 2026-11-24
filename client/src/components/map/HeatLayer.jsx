/** Module 2 - draws a leaflet.heat layer. Weights come from the risk level so red zones glow hottest. */
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import { RISK_META } from '@/utils/risk';

function isValidLatLng(crime) {
  return (
    typeof crime?.latitude === 'number' &&
    typeof crime?.longitude === 'number' &&
    Number.isFinite(crime.latitude) &&
    Number.isFinite(crime.longitude)
  );
}

export default function HeatLayer({ crimes }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !Array.isArray(crimes) || crimes.length === 0) return undefined;

    if (typeof L.heatLayer !== 'function') {
      console.warn('leaflet.heat failed to load; heatmap disabled');
      return undefined;
    }

    const points = crimes
      .filter(isValidLatLng)
      .map((c) => {
        const weight = RISK_META[c.riskLevel]?.weight ?? 0.5;
        return [c.latitude, c.longitude, weight];
      });

    if (!points.length) return undefined;

    const layer = L.heatLayer(points, {
      radius: 38,
      blur: 30,
      maxZoom: 11,
      minOpacity: 0.35,
      gradient: { 0.25: '#22c55e', 0.55: '#facc15', 0.85: '#ef4444' },
    }).addTo(map);

    return () => {
      if (map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
    };
  }, [map, crimes]);

  return null;
}