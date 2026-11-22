/** Module 1 - the six headline widgets. Pure props, no data fetching. */
import { motion } from 'framer-motion';
import { FiAlertTriangle, FiClock, FiMapPin, FiShield } from 'react-icons/fi';
import GlassCard from '@/components/ui/GlassCard';
import CountUp from '@/components/ui/CountUp';
import Skeleton from '@/components/ui/Skeleton';
import { scoreBand } from '@/utils/risk';
import { formatDate } from '@/utils/format';

const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

function Card({ icon: Icon, tint, label, children, className = '' }) {
  return (
    <motion.div variants={item} className={className}>
      <GlassCard hover className="h-full p-5">
        <div className="flex items-center gap-2.5 text-sm text-slate-400">
          <span className="grid h-8 w-8 place-items-center rounded-xl" style={{ background: `${tint}22`, color: tint }}><Icon size={16} /></span>
          {label}
        </div>
        <div className="mt-4">{children}</div>
      </GlassCard>
    </motion.div>
  );
}

const Num = ({ value }) => <p className="font-display text-4xl font-extrabold text-white"><CountUp value={value} /></p>;

export default function StatCards({ stats, selected, selectedScore, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <GlassCard key={i} className="space-y-4 p-5"><Skeleton className="h-8 w-8" /><Skeleton className="h-9 w-16" /></GlassCard>
        ))}
      </div>
    );
  }

  const score = selected ? selectedScore : stats.averageScore;
  const band = score != null ? scoreBand(score) : null;

  return (
    <motion.div
      initial="hidden"
      animate="show"
      transition={{ staggerChildren: 0.06 }}
      variants={{ show: { transition: { staggerChildren: 0.06 } } }}
      className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6"
    >
      <Card icon={FiMapPin} tint="#3fa9ff" label="Total areas"><Num value={stats.total} /></Card>
      <Card icon={FiAlertTriangle} tint="#ef4444" label="High risk"><Num value={stats.high} /></Card>
      <Card icon={FiAlertTriangle} tint="#facc15" label="Medium risk"><Num value={stats.medium} /></Card>
      <Card icon={FiShield} tint="#22c55e" label="Low risk"><Num value={stats.low} /></Card>
      <Card icon={FiClock} tint="#a78bfa" label="Latest incident" className="col-span-2 md:col-span-1">
        {stats.latest ? (
          <>
            <p className="truncate text-lg font-bold text-white" title={`${stats.latest.area}, ${stats.latest.city}`}>{stats.latest.area}</p>
            <p className="mt-0.5 text-xs text-slate-400">{stats.latest.crimeType} · {formatDate(stats.latest.reportedAt)}</p>
          </>
        ) : <p className="text-sm text-slate-500">No data</p>}
      </Card>
      <Card icon={FiShield} tint={band?.color ?? '#94a3b8'} label={selected ? 'Safety score' : 'Average score'} className="col-span-2 md:col-span-1">
        {score != null ? (
          <>
            <Num value={score} />
            <p className="mt-0.5 text-xs font-semibold" style={{ color: band.color }}>{band.label}</p>
          </>
        ) : <p className="text-sm text-slate-500">No data</p>}
      </Card>
    </motion.div>
  );
}
