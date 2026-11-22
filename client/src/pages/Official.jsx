/** Official statistics page: published police / government figures, always shown with source and period. */
import { useEffect, useState } from 'react';
import { FiAlertTriangle, FiExternalLink, FiInfo } from 'react-icons/fi';
import GlassCard from '@/components/ui/GlassCard';
import SampleTag from '@/components/ui/SampleTag';
import Skeleton from '@/components/ui/Skeleton';
import OfficialCharts from '@/components/official/OfficialCharts';
import { getOfficialSummary } from '@/services/dataService';
import { formatDate } from '@/utils/format';

const selectCls = 'glass-input !w-auto min-w-[9rem] !rounded-full !py-2 !pl-4 !pr-8 cursor-pointer [&>option]:bg-ink-800';

function Select({ label, value, onChange, options, allLabel }) {
  return (
    <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className={selectCls}>
      {allLabel && <option value="">{allLabel}</option>}
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

export default function Official() {
  const [filters, setFilters] = useState({ source: '', periodType: '', province: '', district: '', category: '' });
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    getOfficialSummary(filters, { signal: ctrl.signal })
      .then((s) => { setSummary(s); setError(null); })
      .catch((e) => { if (e.name !== 'AbortError') setError(e.message); })
      .finally(() => { if (!ctrl.signal.aborted) setLoading(false); });
    return () => ctrl.abort();
  }, [filters]);

  const set = (key) => (value) =>
    // Changing source or period type invalidates the narrower filters (their options differ per source).
    setFilters((f) => (key === 'source' || key === 'periodType' ? { ...f, [key]: value, province: '', district: '', category: '' } : { ...f, [key]: value }));

  const sel = summary?.selected;

  return (
    <main className="mx-auto max-w-[1200px] px-4 pb-20 pt-6 sm:px-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold sm:text-4xl">Official statistics</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">Published police and government figures. Every number comes with its source and reporting period. Community reports are never added to these totals.</p>
      </header>

      {error && <p role="alert" className="mb-4 rounded-2xl border border-risk-high/30 bg-risk-high/10 px-4 py-3 text-sm text-red-200">Could not load statistics: {error}</p>}

      {loading && !summary && <GlassCard className="p-6"><Skeleton className="h-64 w-full" /></GlassCard>}

      {summary && !summary.hasData && (
        <GlassCard className="p-6">
          <h2 className="text-lg font-bold">No official statistics imported yet</h2>
          <p className="mt-2 text-sm text-slate-400">An admin imports published reports from a CSV file, with the source name, source link and period on every row:</p>
          <pre className="mt-3 overflow-x-auto rounded-2xl bg-ink-800/80 p-4 text-xs text-slate-300">npm run import:official -- path/to/report.csv</pre>
          <p className="mt-3 text-xs text-slate-500">A template is in server/data/official-template.csv; server/data/official-sample.csv holds clearly fake demo data.</p>
        </GlassCard>
      )}

      {summary?.hasData && (
        <div className={loading ? 'opacity-60 transition' : 'transition'}>
          <GlassCard className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-slate-500">Source</p>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-base font-bold text-white">
                  {sel.source} {sel.isSample && <SampleTag />}
                </p>
                <a href={sel.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1.5 text-xs text-sonar-400 hover:underline">
                  <FiExternalLink size={12} /> Open source
                </a>
              </div>
              <p className="text-xs text-slate-500">Imported <span className="font-semibold text-slate-300">{formatDate(summary.lastUpdated)}</span></p>
            </div>
            {sel.isSample && (
              <p className="mt-4 flex items-start gap-2 rounded-2xl border border-orange-400/30 bg-orange-400/10 px-4 py-3 text-xs text-orange-100">
                <FiAlertTriangle className="mt-0.5 shrink-0" /> These figures are synthetic demo data. Import a real published report to replace them.
              </p>
            )}
          </GlassCard>

          <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              ['Total cases', summary.totalCases.toLocaleString('en-US')],
              ['Latest period', summary.latestPeriod],
              ['Districts', summary.byDistrict.length],
              ['Categories', summary.byCategory.length],
            ].map(([label, value]) => (
              <GlassCard key={label} className="p-5">
                <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
                <p className="mt-2 font-display text-3xl font-extrabold text-white">{value}</p>
              </GlassCard>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            {summary.sources.length > 1 && <Select label="Source" value={sel.source} onChange={set('source')} options={summary.sources.map((s) => s.name)} />}
            {summary.options.periodTypes.length > 1 && <Select label="Period type" value={sel.periodType} onChange={set('periodType')} options={summary.options.periodTypes} />}
            <Select label="Province" value={filters.province} onChange={set('province')} options={summary.options.provinces} allLabel="All provinces" />
            <Select label="District" value={filters.district} onChange={set('district')} options={summary.options.districts} allLabel="All districts" />
            <Select label="Category" value={filters.category} onChange={set('category')} options={summary.options.categories} allLabel="All categories" />
          </div>

          <div className="mt-6"><OfficialCharts summary={summary} /></div>

          <p className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-slate-500">
            <FiInfo className="mt-0.5 shrink-0" /> Totals use one source and one period type at a time, so overlapping reports are never added together. Published statistics reflect registered cases and can differ between agencies.
          </p>
        </div>
      )}
    </main>
  );
}
