/** Admin moderation: verify real reports, reject duplicate or misleading ones. */
import { useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import GlassCard from '@/components/ui/GlassCard';
import StatusBadge from '@/components/ui/StatusBadge';
import GradientButton from '@/components/ui/GradientButton';
import { useAuth } from '@/context/AuthContext';
import { adminListReports, adminListUsers, adminModerate, adminSetRole } from '@/services/dataService';
import { formatDate } from '@/utils/format';

const TABS = ['pending', 'verified', 'rejected', 'users'];

function UserRow({ u, isSelf, busy, onRole }) {
  const admin = u.role === 'admin';
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white">{u.name}{isSelf && <span className="ml-2 text-xs font-normal text-slate-500">(you)</span>}</p>
        <p className="truncate text-xs text-slate-400">{u.email} · joined {formatDate(u.createdAt)}{u.lastLoginAt ? ` · last login ${formatDate(u.lastLoginAt)}` : ''}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${admin ? 'border-violet-400/40 bg-violet-500/15 text-violet-200' : 'border-white/10 text-slate-300'}`}>{u.role}</span>
        {!isSelf && (
          <button type="button" disabled={busy} onClick={() => onRole(u.id, admin ? 'user' : 'admin')} className="btn-ghost !px-4 !py-2 disabled:opacity-60">
            {admin ? 'Remove admin' : 'Make admin'}
          </button>
        )}
      </div>
    </li>
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
  const { user, token, ready, logout, isAdmin } = useAuth();
  const [tab, setTab] = useState('pending');
  const [data, setData] = useState({ data: [], counts: null });
  const [userData, setUserData] = useState({ data: [], counts: null });
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const handleError = useCallback((err) => {
    if (err.status === 401) logout(); // expired or invalid session
    else setError(err.message);
  }, [logout]);

  const load = useCallback((signal) => (
    tab === 'users'
      ? adminListUsers(token, { signal }).then(setUserData)
      : adminListReports(tab, token, { signal }).then(setData)
  ), [tab, token]);

  useEffect(() => {
    if (!isAdmin) return undefined;
    const ctrl = new AbortController();
    setLoading(true);
    load(ctrl.signal)
      .then(() => setError(null))
      .catch((e) => { if (e.name !== 'AbortError') handleError(e); })
      .finally(() => { if (!ctrl.signal.aborted) setLoading(false); });
    return () => ctrl.abort();
  }, [isAdmin, load, handleError]);

  async function act(fn) {
    setBusy(true);
    try {
      await fn();
      await load();
      setError(null);
    } catch (e) {
      handleError(e);
    } finally {
      setBusy(false);
    }
  }
  const decide = (id, status, note) => act(() => adminModerate(id, status, note, token));
  const changeRole = (id, role) => act(() => adminSetRole(id, role, token));

  if (!ready) return <main className="mx-auto max-w-[900px] px-4 pt-10 text-sm text-slate-400">Checking your session...</main>;
  if (!user) return <Navigate to="/login?next=/admin" replace />;

  if (!isAdmin) {
    return (
      <main className="mx-auto max-w-[900px] px-4 pb-20 pt-6 sm:px-6">
        <GlassCard className="mx-auto max-w-md p-6 text-center">
          <h1 className="text-xl font-bold">Admins only</h1>
          <p className="mt-2 text-sm text-slate-400">You are signed in as {user.email}, which does not have admin access.</p>
          <GradientButton to="/dashboard" className="mt-5">Back to dashboard</GradientButton>
        </GlassCard>
      </main>
    );
  }

  const label = (t) => (t === 'users' ? `users${userData.counts ? ` (${userData.counts.user + userData.counts.admin})` : ''}` : `${t}${data.counts ? ` (${data.counts[t]})` : ''}`);

  return (
    <main className="mx-auto max-w-[900px] px-4 pb-20 pt-6 sm:px-6">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold sm:text-4xl">Admin panel</h1>
          <p className="mt-2 text-sm text-slate-400">Signed in as {user.name}. Verify genuine reports, reject duplicates and manage user roles.</p>
        </div>
        <button type="button" onClick={logout} className="btn-ghost !px-4 !py-2">Sign out</button>
      </header>

      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Section">
        {TABS.map((t) => (
          <button key={t} type="button" aria-pressed={tab === t} onClick={() => setTab(t)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold capitalize transition ${tab === t ? 'border-white/25 bg-white/10 text-white' : 'border-white/10 text-slate-400 hover:text-white'}`}>
            {label(t)}
          </button>
        ))}
      </div>
      {error && <p role="alert" className="mb-4 rounded-2xl border border-risk-high/30 bg-risk-high/10 px-4 py-3 text-sm text-red-200">{error}</p>}

      <ul className={`space-y-3 ${loading ? 'opacity-60' : ''}`}>
        {tab === 'users' ? (
          <>
            {!loading && userData.data.length === 0 && <li className="text-sm text-slate-500">No users yet.</li>}
            {userData.data.map((u) => <UserRow key={`${u.id}-${u.role}`} u={u} isSelf={u.id === user.id} busy={busy} onRole={changeRole} />)}
          </>
        ) : (
          <>
            {!loading && data.data.length === 0 && <li className="text-sm text-slate-500">No {tab} reports.</li>}
            {data.data.map((r) => <ReportCard key={`${r.id}-${r.status}`} report={r} onDecide={decide} busy={busy} />)}
          </>
        )}
      </ul>
    </main>
  );
}
