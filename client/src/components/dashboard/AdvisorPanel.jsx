/**
 * Module 1 - presentation of the AI Safety Advisor. It only renders what the
 * useSafetyAdvice hook (Module 3) hands it: empty, loading, error or result.
 */
import { motion } from 'framer-motion';
import { FiCpu, FiPhone, FiRefreshCw, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import GlassCard from '@/components/ui/GlassCard';
import ScoreRing from '@/components/ui/ScoreRing';
import RiskBadge from '@/components/ui/RiskBadge';
import Skeleton from '@/components/ui/Skeleton';

const SOURCE_LABEL = {
  gemini: 'Written by Gemini',
  fallback: 'Built-in guidance',
  offline: 'Offline guidance',
};

const list = { show: { transition: { staggerChildren: 0.07 } } };
const row = { hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } };

function Header({ source }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2.5 text-lg font-bold">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-sonar-400 to-sonar-500 text-ink-950"><FiCpu size={17} /></span>
        AI safety advisor
      </h2>
      {source && <span className="chip">{SOURCE_LABEL[source] ?? 'Guidance'}</span>}
    </div>
  );
}

export default function AdvisorPanel({ area, advice, loading, error, onRetry }) {
  if (!area) {
    return (
      <GlassCard className="p-6">
        <Header />
        <p className="mt-4 text-sm leading-relaxed text-slate-400">
          Choose an area to get its safety score, a short risk summary, tips and emergency suggestions.
        </p>
      </GlassCard>
    );
  }

  if (loading) {
    return (
      <GlassCard className="p-6" aria-busy="true">
        <Header />
        <div className="mt-6 flex items-center gap-5"><Skeleton className="!rounded-full h-[108px] w-[108px]" /><div className="flex-1 space-y-3"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" /><Skeleton className="h-4 w-2/3" /></div></div>
        <div className="mt-6 space-y-3">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-11 w-full" />)}</div>
      </GlassCard>
    );
  }

  if (error) {
    return (
      <GlassCard className="p-6">
        <Header />
        <p className="mt-4 flex items-start gap-2 text-sm text-red-300"><FiAlertCircle className="mt-0.5 shrink-0" /> {error}</p>
        <button type="button" onClick={onRetry} className="btn-ghost mt-4 !py-2"><FiRefreshCw size={14} /> Try again</button>
      </GlassCard>
    );
  }

  if (!advice) return null;

  return (
    <GlassCard className="p-6">
      <Header source={advice.source} />

      <div className="mt-6 flex items-center gap-5">
        <ScoreRing score={advice.safetyScore} showBand />
        <div className="min-w-0 flex-1">
          <RiskBadge risk={advice.riskLevel} />
          <p className="mt-3 text-sm leading-relaxed text-slate-300">{advice.summary}</p>
        </div>
      </div>

      <h3 className="mt-7 text-sm font-bold text-white">Safety tips</h3>
      <motion.ul key={advice.areaId} initial="hidden" animate="show" variants={list} className="mt-3 space-y-2">
        {advice.tips.map((tip) => (
          <motion.li key={tip} variants={row} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200">
            <FiCheckCircle className="mt-0.5 shrink-0 text-sonar-400" /> {tip}
          </motion.li>
        ))}
      </motion.ul>

      <h3 className="mt-7 text-sm font-bold text-white">If something goes wrong</h3>
      <ul className="mt-3 space-y-2 text-sm text-slate-300">
        {advice.emergency.actions.map((a) => (
          <li key={a} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-risk-high" />{a}</li>
        ))}
      </ul>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {advice.emergency.contacts.map((c) => (
          <a key={c.label} href={`tel:${c.number}`} className="flex items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm transition hover:border-risk-high/50 hover:bg-risk-high/10">
            <span className="truncate text-slate-300">{c.label}</span>
            <span className="flex items-center gap-1.5 font-bold text-white"><FiPhone size={12} /> {c.number}</span>
          </a>
        ))}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-slate-500">Guidance is general and based on sample data. In immediate danger, call the police first.</p>
    </GlassCard>
  );
}
