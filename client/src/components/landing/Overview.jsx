import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getCrimes } from '@/services/crimeService';
import Skeleton from '@/components/ui/Skeleton';
import SectionHeading from '@/components/ui/SectionHeading';
import GlassCard from '@/components/ui/GlassCard';
import CountUp from '@/components/ui/CountUp';

export default function Overview() {
  const [crimes, setCrimes] = useState(null);
  useEffect(() => {
    let alive = true;
    getCrimes().then((d) => alive && setCrimes(d)).catch(() => {});
    return () => { alive = false; };
  }, []);

  const tiles = [
    { value: crimes?.length, label: 'sample areas mapped' },
    { value: crimes && new Set(crimes.map((c) => c.city)).size, label: 'cities covered' },
    { value: 3, label: 'risk levels: low, medium, high' },
  ];

  return (
    <section className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center">
      <SectionHeading
        title="Safety information should be easy to read, not buried in reports."
        subtitle="Most people only learn an area is risky after something goes wrong. SafeZone AI puts the pattern on a map, then explains what it means for you in a few short, practical lines. It runs on sample data today and is built so live feeds can plug in later."
      />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6 }}
        className="grid gap-4 sm:grid-cols-3"
      >
        {tiles.map((t) => (
          <GlassCard key={t.label} className="p-6">
            {t.value == null ? (
              <Skeleton className="h-12 w-16" />
            ) : (
              <p className="font-display text-5xl font-extrabold text-white"><CountUp value={t.value} /></p>
            )}
            <p className="mt-2 text-sm text-slate-400">{t.label}</p>
          </GlassCard>
        ))}
      </motion.div>
    </section>
  );
}
