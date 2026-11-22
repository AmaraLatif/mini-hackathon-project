/** Module 2 - details card for the selected area. */
import { AnimatePresence, motion } from 'framer-motion';
import { FiClock, FiCrosshair, FiMousePointer } from 'react-icons/fi';
import GlassCard from '@/components/ui/GlassCard';
import RiskBadge from '@/components/ui/RiskBadge';
import Skeleton from '@/components/ui/Skeleton';
import { formatCoords, formatDate } from '@/utils/format';

export default function AreaDetails({ area, siblings, onSelect, loading }) {
  if (loading) {
    return (
      <GlassCard className="space-y-3 p-6">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-16 w-full" />
      </GlassCard>
    );
  }

  if (!area) {
    return (
      <GlassCard className="flex items-start gap-4 p-6">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/5 text-slate-400"><FiMousePointer /></span>
        <div>
          <h2 className="text-lg font-bold">Select an area</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-400">Click a marker, click the map near a city, or search by name to see details and get advice.</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div key={area.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
        <GlassCard className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold">{area.area}</h2>
              <p className="text-sm text-slate-400">{area.city}, Pakistan</p>
            </div>
            <RiskBadge risk={area.riskLevel} />
          </div>

          <span className="chip mt-4">{area.crimeType}</span>
          <p className="mt-4 text-sm leading-relaxed text-slate-300">{area.description}</p>

          <dl className="mt-5 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <dt className="flex items-center gap-1.5 text-slate-500"><FiClock size={12} /> Last report</dt>
              <dd className="mt-1 text-sm font-semibold text-white">{formatDate(area.reportedAt)}</dd>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <dt className="flex items-center gap-1.5 text-slate-500"><FiCrosshair size={12} /> Coordinates</dt>
              <dd className="mt-1 text-sm font-semibold text-white">{formatCoords(area.latitude, area.longitude)}</dd>
            </div>
          </dl>

          {siblings.length > 0 && (
            <div className="mt-5">
              <p className="text-xs text-slate-500">Also in {area.city}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {siblings.map((s) => (
                  <button key={s.id} type="button" onClick={() => onSelect(s.id)} className="chip transition hover:border-white/30 hover:text-white">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.riskLevel === 'High' ? '#ef4444' : s.riskLevel === 'Medium' ? '#facc15' : '#22c55e' }} />
                    {s.area}
                  </button>
                ))}
              </div>
            </div>
          )}
        </GlassCard>
      </motion.div>
    </AnimatePresence>
  );
}
