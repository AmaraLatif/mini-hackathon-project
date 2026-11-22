/**
 * Ranked list of the riskiest areas (like the "hotspot ranking" panels in crime dashboards).
 * Ranks by the sample risk score (100 minus the safety score), so it is as illustrative as the map itself.
 */
import GlassCard from '@/components/ui/GlassCard';
import SampleTag from '@/components/ui/SampleTag';
import Skeleton from '@/components/ui/Skeleton';
import { RISK_META, calcSafetyScore } from '@/utils/risk';

export default function HotspotRanking({ crimes, selectedId, onSelect, loading }) {
  const ranked = [...crimes]
    .map((c) => ({ ...c, risk: 100 - calcSafetyScore(c) }))
    .sort((a, b) => b.risk - a.risk)
    .slice(0, 8);

  return (
    <GlassCard className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold">Hotspot ranking</h2>
        <SampleTag />
      </div>
      <p className="mt-1 text-xs text-slate-500">Highest risk score first, for the current filters.</p>

      <ol className="mt-4 space-y-2.5">
        {loading && Array.from({ length: 6 }).map((_, i) => <li key={i}><Skeleton className="h-10 w-full" /></li>)}
        {!loading && ranked.length === 0 && <li className="text-sm text-slate-500">No areas for the current filters.</li>}
        {!loading && ranked.map((c, i) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => onSelect(c.id)}
              className={`w-full rounded-2xl border px-3 py-2.5 text-left transition hover:border-white/25 hover:bg-white/[0.06] ${selectedId === c.id ? 'border-sonar-400/50 bg-sonar-400/10' : 'border-transparent'}`}
            >
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0 truncate">
                  <span className="mr-2 text-xs font-bold text-slate-500">{i + 1}</span>
                  <span className="font-semibold text-white">{c.area}</span>
                  <span className="ml-1.5 text-xs text-slate-500">{c.city}</span>
                </span>
                <span className="shrink-0 text-xs font-bold" style={{ color: RISK_META[c.riskLevel].color }}>{c.risk}%</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                <div className="h-full rounded-full" style={{ width: `${c.risk}%`, background: RISK_META[c.riskLevel].color }} />
              </div>
            </button>
          </li>
        ))}
      </ol>
    </GlassCard>
  );
}
