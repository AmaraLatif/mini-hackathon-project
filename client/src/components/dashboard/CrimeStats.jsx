/** Module 1 - crime statistics: incidents by type and risk mix per city. */
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import Skeleton from '@/components/ui/Skeleton';
import { RISK_META } from '@/utils/risk';

export default function CrimeStats({ stats, loading }) {
  if (loading) {
    return (
      <GlassCard className="space-y-4 p-6">
        <Skeleton className="h-6 w-40" />
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-5 w-full" />)}
      </GlassCard>
    );
  }

  const maxType = Math.max(1, ...stats.byType.map((t) => t.count));

  return (
    <GlassCard className="p-6">
      <h2 className="text-lg font-bold">Crime statistics</h2>

      <h3 className="mt-5 text-sm font-semibold text-slate-300">Areas by crime type</h3>
      <ul className="mt-3 space-y-3">
        {stats.byType.map((t) => (
          <li key={t.label}>
            <div className="flex justify-between text-xs"><span className="text-slate-300">{t.label}</span><span className="font-semibold text-white">{t.count}</span></div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/[0.07]">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-sonar-400 to-sonar-500" initial={{ width: 0 }} animate={{ width: `${(t.count / maxType) * 100}%` }} transition={{ duration: 0.7, ease: 'easeOut' }} />
            </div>
          </li>
        ))}
        {stats.byType.length === 0 && <li className="text-sm text-slate-500">No data for the current filters.</li>}
      </ul>

      <h3 className="mt-7 text-sm font-semibold text-slate-300">Risk mix by city</h3>
      <ul className="mt-3 space-y-3">
        {stats.byCity.map((c) => (
          <li key={c.city} className="flex items-center gap-3">
            <span className="w-24 shrink-0 truncate text-xs text-slate-300">{c.city}</span>
            <div className="flex h-2.5 flex-1 overflow-hidden rounded-full bg-white/[0.07]" role="img" aria-label={`${c.city}: ${c.High} high, ${c.Medium} medium, ${c.Low} low`}>
              {['High', 'Medium', 'Low'].map((lvl) => c[lvl] > 0 && <div key={lvl} style={{ width: `${(c[lvl] / c.total) * 100}%`, background: RISK_META[lvl].color }} />)}
            </div>
            <span className="w-4 text-right text-xs text-slate-500">{c.total}</span>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}
