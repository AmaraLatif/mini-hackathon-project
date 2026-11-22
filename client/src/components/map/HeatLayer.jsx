/** Module 2 - draws a leaflet.heat layer. Weights come from the risk level so red zones glow hottest. */
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import { RISK_META } from '@/utils/risk';

export default function HeatLayer({ crimes }) {
  const map = useMap();

  useEffect(() => {
    if (typeof L.heatLayer !== 'function') {
      console.warn('leaflet.heat failed to load; heatmap disabled');
      return undefined;
    }
    const points = crimes.map((c) => [c.latitude, c.longitude, RISK_META[c.riskLevel].weight]);
    const layer = L.heatLayer(points, {
      radius: 38,
      blur: 30,
      maxZoom: 11,
      minOpacity: 0.35,
      gradient: { 0.25: '#22c55e', 0.55: '#facc15', 0.85: '#ef4444' },
    }).addTo(map);
    return () => {
      map.removeLayer(layer);
    };
  }, [map, crimes]);

  return null;
}
