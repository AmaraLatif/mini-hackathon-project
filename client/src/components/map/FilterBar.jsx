/** Module 2 - city, crime type and risk-level filters. */
import { FiRotateCcw } from 'react-icons/fi';
import { RISK_LEVELS, RISK_META } from '@/utils/risk';

const selectCls = 'glass-input !w-auto min-w-[9rem] !rounded-full !py-2 !pl-4 !pr-8 cursor-pointer [&>option]:bg-ink-800';

export default function FilterBar({ filters, cities, types, onCity, onType, onToggleRisk, onReset, active, resultCount }) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <select aria-label="Filter by city" value={filters.city} onChange={(e) => onCity(e.target.value)} className={selectCls}>
        <option value="All">All cities</option>
        {cities.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      <select aria-label="Filter by crime type" value={filters.type} onChange={(e) => onType(e.target.value)} className={selectCls}>
        <option value="All">All crime types</option>
        {types.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>

      <div className="flex gap-1.5" role="group" aria-label="Filter by risk level">
        {RISK_LEVELS.map((r) => {
          const on = filters.risks.includes(r);
          return (
            <button
              key={r}
              type="button"
              aria-pressed={on}
              onClick={() => onToggleRisk(r)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold transition ${on ? 'border-white/25 bg-white/10 text-white' : 'border-white/10 text-slate-500 hover:text-slate-300'}`}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: on ? RISK_META[r].color : '#475569' }} />
              {r}
            </button>
          );
        })}
      </div>

      <span className="ml-auto text-xs text-slate-500">{resultCount} areas shown</span>
      {active && (
        <button type="button" onClick={onReset} className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-sonar-400 hover:bg-white/5">
          <FiRotateCcw size={12} /> Reset
        </button>
      )}
    </div>
  );
}
