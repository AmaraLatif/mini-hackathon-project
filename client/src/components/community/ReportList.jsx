/** Public list of community reports: pending and verified only (rejected ones are never shown). */
import { useEffect, useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import Skeleton from '@/components/ui/Skeleton';
import StatusBadge from '@/components/ui/StatusBadge';
import { listCommunityReports } from '@/services/dataService';
import { formatDate } from '@/utils/format';

const TABS = [
  { value: '', label: 'All' },
  { value: 'verified', label: 'Verified' },
  { value: 'pending', label: 'Pending' },
];

export default function ReportList({ refreshKey }) {
  const [status, setStatus] = useState('');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    listCommunityReports({ status, limit: 50 }, { signal: ctrl.signal })
      .then((r) => { setReports(r.data); setError(null); })
      .catch((e) => { if (e.name !== 'AbortError') setError(e.message); })
      .finally(() => { if (!ctrl.signal.aborted) setLoading(false); });
    return () => ctrl.abort();
  }, [status, refreshKey]);

  return (
    <GlassCard className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold">Community reports</h2>
        <div className="flex gap-1.5" role="group" aria-label="Filter by status">
          {TABS.map((t) => (
            <button key={t.value} type="button" aria-pressed={status === t.value} onClick={() => setStatus(t.value)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${status === t.value ? 'border-white/25 bg-white/10 text-white' : 'border-white/10 text-slate-500 hover:text-slate-300'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-500">Submitted by the public. Only reports marked Verified have been checked by an admin. None of these are official police statistics.</p>

      {error && <p role="alert" className="mt-4 text-sm text-red-300">Could not load reports: {error}</p>}
      <ul className="mt-4 space-y-3">
        {loading && Array.from({ length: 3 }).map((_, i) => <li key={i}><Skeleton className="h-24 w-full" /></li>)}
        {!loading && !error && reports.length === 0 && <li className="text-sm text-slate-500">No reports yet.</li>}
        {!loading && reports.map((r) => (
          <li key={r.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-white">{r.area}, {r.city}</p>
              <StatusBadge status={r.status} />
            </div>
            <p className="mt-0.5 text-xs text-slate-400">{r.category} · incident on {formatDate(r.incidentDate)}</p>
            <p className="mt-2 whitespace-pre-line break-words text-sm text-slate-300">{r.description}</p>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}
