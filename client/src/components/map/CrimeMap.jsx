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
const FALLBACK_RISK = { color: '#38bdf8' };

function hasValidCoords(record) {
  return (
    typeof record?.latitude === 'number' &&
    typeof record?.longitude === 'number' &&
    Number.isFinite(record.latitude) &&
    Number.isFinite(record.longitude)
  );
}

/** Moves the camera: fit all visible areas when filters change, fly to the selected area. */
function CameraController({ crimes, selected }) {
  const map = useMap();
  const validCrimes = useMemo(() => crimes.filter(hasValidCoords), [crimes]);
  const idsKey = useMemo(() => validCrimes.map((c) => c.id).join('|'), [validCrimes]);

  useEffect(() => {
    if (!validCrimes.length) {
      map.setView(PAKISTAN_CENTER, 5, { animate: true });
      return;
    }

    if (validCrimes.length === 1) {
      map.flyTo([validCrimes[0].latitude, validCrimes[0].longitude], 12, { duration: 0.9 });
      return;
    }

    map.fitBounds(
      validCrimes.map((c) => [c.latitude, c.longitude]),
      { padding: [48, 48], maxZoom: 11, animate: true }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey, map]);

  useEffect(() => {
    if (selected && hasValidCoords(selected)) {
      map.flyTo([selected.latitude, selected.longitude], Math.max(map.getZoom(), 12), { duration: 1.1 });
    }
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
  const validCrimes = useMemo(() => crimes.filter(hasValidCoords), [crimes]);

  // Draw high-risk markers last so they are never hidden under green ones.
  const ordered = useMemo(
    () =>
      [...validCrimes].sort(
        (a, b) => (riskOrder[a.riskLevel] ?? 0) - (riskOrder[b.riskLevel] ?? 0)
      ),
    [validCrimes]
  );

  return (
    <div className="glass relative isolate h-[520px] overflow-hidden rounded-2xl lg:h-[600px]">
      <MapContainer center={PAKISTAN_CENTER} zoom={5} minZoom={4} zoomControl={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />
        <CameraController crimes={validCrimes} selected={selected} />
        <ClickToSelect crimes={validCrimes} onSelect={onSelect} />

        {layers?.heat && <HeatLayer crimes={validCrimes} />}

        {layers?.markers &&
          ordered.map((c) => {
            const color = RISK_META[c.riskLevel]?.color ?? FALLBACK_RISK.color;
            const isSelected = selected?.id === c.id;
            return (
              <CircleMarker
                key={c.id}
                center={[c.latitude, c.longitude]}
                radius={isSelected ? 11 : 7}
                pathOptions={{
                  color: isSelected ? '#ffffff' : 'rgba(5,7,15,0.9)',
                  weight: isSelected ? 3 : 2,
                  fillColor: color,
                  fillOpacity: 0.95,
                }}
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

      {!loading && (
        <div className="pointer-events-none absolute top-3 left-3 z-[1000] flex flex-wrap items-center gap-2">
          <span className="glass rounded-xl px-3 py-1.5 text-xs font-medium text-slate-200">
            {validCrimes.length} {validCrimes.length === 1 ? 'area' : 'areas'} plotted
          </span>

          {selected && (
            <button
              type="button"
              onClick={() => onSelect(null)}
              className="pointer-events-auto glass rounded-xl px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/15"
            >
              {selected.area} &times;
            </button>
          )}
        </div>
      )}

      <MapLegend layers={layers} onToggle={onToggleLayer} />

      {!loading && validCrimes.length === 0 && (
        <div className="pointer-events-none absolute inset-0 z-[1000] grid place-items-center">
          <p className="glass rounded-2xl px-5 py-3 text-sm text-slate-200">
            No areas match these filters. Try resetting them.
          </p>
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