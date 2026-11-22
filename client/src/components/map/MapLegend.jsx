/** Module 2 - legend + layer toggles floating over the map. */
import { FiLayers, FiMapPin } from 'react-icons/fi';
import { RISK_META } from '@/utils/risk';

function Toggle({ active, onClick, icon: Icon, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        active ? 'border-sonar-400/50 bg-sonar-400/15 text-sonar-400' : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
      }`}
    >
      <Icon size={13} /> {children}
    </button>
  );
}

export default function MapLegend({ layers, onToggle }) {
  return (
    <div className="glass absolute left-3 top-3 z-[1000] flex flex-col gap-3 rounded-2xl p-3">
      <div className="flex gap-2">
        <Toggle active={layers.heat} onClick={() => onToggle('heat')} icon={FiLayers}>Heatmap</Toggle>
        <Toggle active={layers.markers} onClick={() => onToggle('markers')} icon={FiMapPin}>Markers</Toggle>
      </div>
      <ul className="flex gap-3 text-xs text-slate-300" aria-label="Risk legend">
        {Object.entries(RISK_META).map(([level, m]) => (
          <li key={level} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: m.color, boxShadow: `0 0 8px ${m.color}` }} />
            {level}
          </li>
        ))}
      </ul>
    </div>
  );
}
