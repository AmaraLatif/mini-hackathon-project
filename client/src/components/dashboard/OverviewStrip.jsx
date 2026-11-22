/** Headline numbers. Official statistics, community reports and the sample map are always shown separately. */
import { Link } from 'react-router-dom';
import { FiClipboard, FiDatabase, FiMap, FiUsers } from 'react-icons/fi';
import GlassCard from '@/components/ui/GlassCard';
import SampleTag from '@/components/ui/SampleTag';
import Skeleton from '@/components/ui/Skeleton';
import { formatDate } from '@/utils/format';

function Tile({ icon: Icon, tint, label, to, children }) {
  const body = (
    <GlassCard hover={Boolean(to)} className="h-full p-5">
      <div className="flex items-center gap-2.5 text-sm text-slate-400">
        <span className="grid h-8 w-8 place-items-center rounded-xl" style={{ background: `${tint}22`, color: tint }}><Icon size={16} /></span>
        {label}
      </div>
      <div className="mt-3">{children}</div>
    </GlassCard>
  );
  return to ? <Link to={to} className="block h-full">{body}</Link> : body;
}

export default function OverviewStrip({ overview, loading, error }) {
  if (loading) {
    return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <GlassCard key={i} className="p-5"><Skeleton className="h-24 w-full" /></GlassCard>)}</div>;
  }
  if (error || !overview) {
    return <p className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-400">Official and community figures are unavailable right now (the API may be offline). The sample map below still works.</p>;
  }

  const { official, community, mapSample } = overview;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Tile icon={FiDatabase} tint="#3fa9ff" label="Official cases" to="/official">
        {official.hasData ? (
          <>
            <p className="font-display text-3xl font-extrabold text-white">{official.totalCases.toLocaleString('en-US')}</p>
            <p className="mt-1 line-clamp-2 text-xs text-slate-400">{official.source}</p>
            {official.isSample && <SampleTag className="mt-2" />}
          </>
        ) : (
          <p className="text-sm text-slate-400">No official statistics imported yet.</p>
        )}
      </Tile>

      <Tile icon={FiUsers} tint="#22c55e" label="Community reports" to="/community">
        <p className="font-display text-3xl font-extrabold text-white">{community.total}</p>
        <p className="mt-1 text-xs text-slate-400">{community.verified} verified · {community.pending} pending · {community.rejected} rejected</p>
        <p className="mt-1 text-xs text-slate-500">Not counted in official cases.</p>
      </Tile>

      <Tile icon={FiClipboard} tint="#a78bfa" label="Latest official data">
        {official.hasData ? (
          <>
            <p className="font-display text-2xl font-extrabold text-white">{official.latestPeriod}</p>
            <p className="mt-1 text-xs text-slate-400">{official.periodType} figures · imported {formatDate(official.lastUpdated)}</p>
          </>
        ) : (
          <p className="text-sm text-slate-400">Nothing yet.</p>
        )}
      </Tile>

      <Tile icon={FiMap} tint="#facc15" label="Map areas">
        <p className="font-display text-3xl font-extrabold text-white">{mapSample.areas}</p>
        <SampleTag className="mt-2" />
        <p className="mt-1 text-xs text-slate-500">Illustrative, not official.</p>
      </Tile>
    </div>
  );
}
