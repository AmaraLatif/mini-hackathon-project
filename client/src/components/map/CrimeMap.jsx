/**
 * Module 2 - the interactive map. Props in, events out: it never fetches data
 * and never touches global state, so it can be developed and tested alone.
 *   crimes      records to draw (already filtered)
 *   selected    the currently selected record or null
 *   onSelect    (id | null) => void
 */
import { useEffect, useMemo } from 'react';
import { CircleMarker, MapContainer, TileLayer, Tooltip, ZoomControl, useMap, useMapEvents } from 'react-leaflet';
import HeatLayer from './HeatLayer';
import MapLegend from './MapLegend';
import Skeleton from '@/components/ui/Skeleton';
import { RISK_META, riskOrder } from '@/utils/risk';
import { findNearest } from '@/utils/geo';

const PAKISTAN_CENTER = [30.3753, 69.3451];

/** Moves the camera: fit all visible areas when filters change, fly to the selected area. */
function CameraController({ crimes, selected }) {
  const map = useMap();
  const idsKey = useMemo(() => crimes.map((c) => c.id).join('|'), [crimes]);

  useEffect(() => {
    if (!crimes.length) return;
    map.fitBounds(crimes.map((c) => [c.latitude, c.longitude]), { padding: [48, 48], maxZoom: 11, animate: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey, map]);

  useEffect(() => {
    if (selected) map.flyTo([selected.latitude, selected.longitude], Math.max(map.getZoom(), 12), { duration: 1.1 });
  }, [selected, map]);

  return null;
}

/** Clicking empty map selects the nearest area (within 25 km), or clears the selection. */
function ClickToSelect({ crimes, onSelect }) {
  useMapEvents({
    click(e) {
      const near = findNearest(crimes, e.latlng.lat, e.latlng.lng, 25);
      onSelect(near ? near.id : null);
    },
  });
  return null;
}

export default function CrimeMap({ crimes, selected, onSelect, layers, onToggleLayer, loading }) {
  // Draw high-risk markers last so they are never hidden under green ones.
  const ordered = useMemo(() => [...crimes].sort((a, b) => riskOrder[a.riskLevel] - riskOrder[b.riskLevel]), [crimes]);

  return (
    <div className="glass relative isolate h-[520px] overflow-hidden rounded-2xl lg:h-[600px]">
      <MapContainer center={PAKISTAN_CENTER} zoom={5} minZoom={4} zoomControl={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />
        <CameraController crimes={crimes} selected={selected} />
        <ClickToSelect crimes={crimes} onSelect={onSelect} />

        {layers.heat && <HeatLayer crimes={crimes} />}

        {layers.markers &&
          ordered.map((c) => {
            const color = RISK_META[c.riskLevel].color;
            const isSelected = selected?.id === c.id;
            return (
              <CircleMarker
                key={c.id}
                center={[c.latitude, c.longitude]}
                radius={isSelected ? 11 : 7}
                pathOptions={{ color: isSelected ? '#ffffff' : 'rgba(5,7,15,0.9)', weight: isSelected ? 3 : 2, fillColor: color, fillOpacity: 0.95 }}
                bubblingMouseEvents={false}
                eventHandlers={{ click: () => onSelect(c.id) }}
              >
                <Tooltip direction="top" offset={[0, -8]} className="sz-tooltip">
                  <strong>{c.area}</strong>, {c.city}
                  <br />
                  {c.riskLevel} risk: {c.crimeType}
                </Tooltip>
              </CircleMarker>
            );
          })}
      </MapContainer>

      <MapLegend layers={layers} onToggle={onToggleLayer} />

      {!loading && crimes.length === 0 && (
        <div className="pointer-events-none absolute inset-0 z-[1000] grid place-items-center">
          <p className="glass rounded-2xl px-5 py-3 text-sm text-slate-200">No areas match these filters. Try resetting them.</p>
        </div>
      )}

      {loading && (
        <div className="absolute inset-0 z-[1100] bg-ink-900/90 p-6">
          <Skeleton className="h-full w-full !rounded-2xl" />
        </div>
      )}
    </div>
  );
}
