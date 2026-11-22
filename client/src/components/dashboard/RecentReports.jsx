/** Module 1 - latest sample reports. Clicking one selects it on the map. */
import { FiChevronRight } from 'react-icons/fi';
import GlassCard from '@/components/ui/GlassCard';
import RiskBadge from '@/components/ui/RiskBadge';
import Skeleton from '@/components/ui/Skeleton';
import { formatDate } from '@/utils/format';

export default function RecentReports({ reports, selectedId, onSelect, loading }) {
  return (
    <GlassCard className="p-6">
      <h2 className="text-lg font-bold">Recent reports</h2>
      <ul className="mt-4 space-y-2">
        {loading && Array.from({ length: 5 }).map((_, i) => <li key={i}><Skeleton className="h-16 w-full" /></li>)}
        {!loading && reports.length === 0 && <li className="text-sm text-slate-500">No reports for the current filters.</li>}
        {!loading && reports.map((r) => (
          <li key={r.id}>
            <button
              type="button"
              onClick={() => onSelect(r.id)}
              className={`group flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition hover:border-white/25 hover:bg-white/[0.07] ${selectedId === r.id ? 'border-sonar-400/50 bg-sonar-400/10' : 'border-white/10 bg-white/[0.03]'}`}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{r.area}, {r.city}</p>
                <p className="mt-0.5 truncate text-xs text-slate-400">{r.crimeType} · {formatDate(r.reportedAt)}</p>
              </div>
              <RiskBadge risk={r.riskLevel} />
              <FiChevronRight className="shrink-0 text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-slate-300" />
            </button>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}
