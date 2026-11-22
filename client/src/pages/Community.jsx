/** Community reports page: submit a report and browse pending / verified ones. */
import { useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import ReportForm from '@/components/community/ReportForm';
import ReportList from '@/components/community/ReportList';

export default function Community() {
  const [refreshKey, setRefreshKey] = useState(0);
  return (
    <main className="mx-auto max-w-[1200px] px-4 pb-20 pt-6 sm:px-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold sm:text-4xl">Community reports</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">Saw something unsafe? Tell others. Every report starts as Pending and is only marked Verified after an admin reviews it. In an emergency, call Police on 15 first.</p>
      </header>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <GlassCard className="p-6 lg:sticky lg:top-24 lg:self-start">
          <h2 className="mb-4 text-lg font-bold">Submit a report</h2>
          <ReportForm onSubmitted={() => setRefreshKey((k) => k + 1)} />
        </GlassCard>
        <ReportList refreshKey={refreshKey} />
      </div>
    </main>
  );
}
