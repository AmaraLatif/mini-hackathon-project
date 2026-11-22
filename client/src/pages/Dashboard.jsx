/**
 * Module 1 - the dashboard page. It only COMPOSES: data/state comes from
 * useCrimeData (Module 2) and useSafetyAdvice (Module 3); every widget below
 * is a props-driven component.
 */
import { useEffect, useState } from 'react';
import { FiInfo } from 'react-icons/fi';
import { getOverview } from '@/services/dataService';
import OverviewStrip from '@/components/dashboard/OverviewStrip';
import SampleTag from '@/components/ui/SampleTag';
import { useCrimeData } from '@/hooks/useCrimeData';
import { useSafetyAdvice } from '@/hooks/useSafetyAdvice';
import { calcSafetyScore } from '@/utils/risk';
import StatCards from '@/components/dashboard/StatCards';
import AdvisorPanel from '@/components/dashboard/AdvisorPanel';
import CrimeStats from '@/components/dashboard/CrimeStats';
import RecentReports from '@/components/dashboard/RecentReports';
import HotspotRanking from '@/components/dashboard/HotspotRanking';
import SearchBar from '@/components/map/SearchBar';
import FilterBar from '@/components/map/FilterBar';
import CrimeMap from '@/components/map/CrimeMap';
import AreaDetails from '@/components/map/AreaDetails';

export default function Dashboard() {
  const d = useCrimeData();
  const advisor = useSafetyAdvice(d.selected);
  const [overview, setOverview] = useState({ data: null, loading: true, error: false });

  useEffect(() => {
    const ctrl = new AbortController();
    getOverview({ signal: ctrl.signal })
      .then((data) => setOverview({ data, loading: false, error: false }))
      .catch((e) => e.name !== 'AbortError' && setOverview({ data: null, loading: false, error: true }));
    return () => ctrl.abort();
  }, []);

  return (
    <main className="mx-auto max-w-[1400px] px-4 pb-20 pt-6 sm:px-6">
      <header className="mb-6">
        <h1 className="flex flex-wrap items-center gap-3 text-3xl font-bold sm:text-4xl">Safety dashboard</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">Search an area, read its risk on the map, then get advice for that spot.</p>
      </header>

      {d.error && (
        <p role="alert" className="mb-4 rounded-2xl border border-risk-high/30 bg-risk-high/10 px-4 py-3 text-sm text-red-200">
          Could not load the area data: {d.error}
        </p>
      )}

      <section aria-label="Data overview" className="mb-6">
        <OverviewStrip overview={overview.data} loading={overview.loading} error={overview.error} />
      </section>

      <h2 className="mb-3 flex items-center gap-3 text-lg font-bold">Safety map <SampleTag /></h2>
      <StatCards stats={d.stats} selected={d.selected} selectedScore={d.selected ? calcSafetyScore(d.selected) : null} loading={d.loading} />

      <section className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="min-w-0 space-y-4">
          <div className="relative z-20 space-y-3">
            <SearchBar query={d.query} onQueryChange={d.setQuery} suggestions={d.suggestions} onPick={d.selectArea} onClear={d.clearSelection} />
            <FilterBar
              filters={d.filters} cities={d.cities} types={d.types}
              onCity={d.setCity} onType={d.setType} onToggleRisk={d.toggleRisk} onReset={d.resetFilters}
              active={d.filtersActive} resultCount={d.filtered.length}
            />
          </div>
          <CrimeMap crimes={d.filtered} selected={d.selected} onSelect={(id) => (id ? d.selectArea(id) : d.clearSelection())} layers={d.layers} onToggleLayer={d.toggleLayer} loading={d.loading} />
        </div>

        <aside className="space-y-6">
          <AreaDetails area={d.selected} siblings={d.siblings} onSelect={d.selectArea} loading={d.loading} />
          <AdvisorPanel area={d.selected} advice={advisor.advice} loading={advisor.loading} error={advisor.error} onRetry={advisor.retry} />
        </aside>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2 2xl:grid-cols-3">
        <HotspotRanking crimes={d.filtered} selectedId={d.selected?.id} onSelect={d.selectArea} loading={d.loading} />
        <CrimeStats stats={d.stats} loading={d.loading} />
        <RecentReports reports={d.stats.recent} selectedId={d.selected?.id} onSelect={d.selectArea} loading={d.loading} />
      </section>

      <p className="mt-8 flex items-start gap-2 text-xs leading-relaxed text-slate-500">
        <FiInfo className="mt-0.5 shrink-0" /> The map and area scores use illustrative sample data, not official crime statistics. Official figures are on the Official stats page; community reports are shown separately and only count once an admin verifies them.
      </p>
    </main>
  );
}
