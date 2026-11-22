/** Admin moderation: verify real reports, reject duplicate or misleading ones. */
import { useCallback, useEffect, useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { adminListReports, adminLogin, adminModerate } from '@/services/dataService';
import { formatDate } from '@/utils/format';

const TOKEN_KEY = 'safezone-admin-token';
const TABS = ['pending', 'verified', 'rejected'];

function Login({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { token } = await adminLogin(password);
      sessionStorage.setItem(TOKEN_KEY, token);
      onLogin(token);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <GlassCard className="mx-auto max-w-md p-6">
      <h2 className="text-lg font-bold">Admin sign in</h2>
      <form onSubmit={submit} className="mt-4 space-y-4">
        <input type="password" className="glass-input" placeholder="Admin password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" aria-label="Admin password" required />
        {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
        <button type="submit" disabled={busy} className="btn-gradient w-full disabled:opacity-60">{busy ? 'Signing in...' : 'Sign in'}</button>
      </form>
    </GlassCard>
  );
}

function ReportCard({ report, onDecide, busy }) {
  const [note, setNote] = useState(report.moderationNote ?? '');
  return (
    <li className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-white">{report.area}, {report.city}</p>
        <StatusBadge status={report.status} />
      </div>
      <p className="mt-0.5 text-xs text-slate-400">{report.category} · incident {formatDate(report.incidentDate)} · submitted {formatDate(report.createdAt)}</p>
      <p className="mt-2 whitespace-pre-line break-words text-sm text-slate-300">{report.description}</p>
      {report.contact && <p className="mt-2 text-xs text-slate-400">Contact: {report.contact}</p>}
      {report.duplicateOf && <p className="mt-2 rounded-xl border border-risk-medium/30 bg-risk-medium/10 px-3 py-2 text-xs text-yellow-100">Possible duplicate of report {report.duplicateOf.slice(0, 8)} (same city, area and category within 24 hours).</p>}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input className="glass-input !w-auto min-w-[12rem] flex-1 !py-2" placeholder="Note (optional)" value={note} maxLength={300} onChange={(e) => setNote(e.target.value)} aria-label="Moderation note" />
        {report.status !== 'verified' && <button type="button" disabled={busy} onClick={() => onDecide(report.id, 'verified', note)} className="btn-gradient !px-4 !py-2 disabled:opacity-60">Verify</button>}
        {report.status !== 'rejected' && <button type="button" disabled={busy} onClick={() => onDecide(report.id, 'rejected', note)} className="btn-ghost !px-4 !py-2 disabled:opacity-60">Reject</button>}
        {report.status !== 'pending' && <button type="button" disabled={busy} onClick={() => onDecide(report.id, 'pending', note)} className="btn-ghost !px-4 !py-2 disabled:opacity-60">Back to pending</button>}
      </div>
    </li>
  );
}

export default function Admin() {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY));
  const [tab, setTab] = useState('pending');
  const [data, setData] = useState({ data: [], counts: null });
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }, []);

  const handleError = useCallback((err) => {
    if (err.status === 401) logout(); // expired or invalid session
    else setError(err.message);
  }, [logout]);

  useEffect(() => {
    if (!token) return undefined;
    const ctrl = new AbortController();
    setLoading(true);
    adminListReports(tab, token, { signal: ctrl.signal })
      .then((r) => { setData(r); setError(null); })
      .catch((e) => { if (e.name !== 'AbortError') handleError(e); })
      .finally(() => { if (!ctrl.signal.aborted) setLoading(false); });
    return () => ctrl.abort();
  }, [token, tab, handleError]);

  async function decide(id, status, note) {
    setBusy(true);
    try {
      await adminModerate(id, status, note, token);
      const r = await adminListReports(tab, token);
      setData(r);
      setError(null);
    } catch (e) {
      handleError(e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-[900px] px-4 pb-20 pt-6 sm:px-6">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold sm:text-4xl">Admin panel</h1>
          <p className="mt-2 text-sm text-slate-400">Verify genuine reports. Reject duplicates and misleading submissions.</p>
        </div>
        {token && <button type="button" onClick={logout} className="btn-ghost !px-4 !py-2">Sign out</button>}
      </header>

      {!token ? <Login onLogin={setToken} /> : (
        <>
          <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Report status">
            {TABS.map((t) => (
              <button key={t} type="button" aria-pressed={tab === t} onClick={() => setTab(t)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold capitalize transition ${tab === t ? 'border-white/25 bg-white/10 text-white' : 'border-white/10 text-slate-400 hover:text-white'}`}>
                {t}{data.counts ? ` (${data.counts[t]})` : ''}
              </button>
            ))}
          </div>
          {error && <p role="alert" className="mb-4 rounded-2xl border border-risk-high/30 bg-risk-high/10 px-4 py-3 text-sm text-red-200">{error}</p>}
          <ul className={`space-y-3 ${loading ? 'opacity-60' : ''}`}>
            {!loading && data.data.length === 0 && <li className="text-sm text-slate-500">No {tab} reports.</li>}
            {data.data.map((r) => <ReportCard key={`${r.id}-${r.status}`} report={r} onDecide={decide} busy={busy} />)}
          </ul>
        </>
      )}
    </main>
  );
}
