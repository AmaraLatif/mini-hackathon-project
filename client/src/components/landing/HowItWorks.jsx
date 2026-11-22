import SectionHeading from '@/components/ui/SectionHeading';
import GlassCard from '@/components/ui/GlassCard';

// This one IS a sequence, so the numbering carries meaning.
const STEPS = [
  { title: 'Find an area', text: 'Search by name or click a marker on the map.' },
  { title: 'Read the risk', text: 'Colour-coded markers and the heatmap show how risky it is.' },
  { title: 'Ask the advisor', text: 'Get a safety score, a summary and tips in seconds.' },
  { title: 'Act on it', text: 'Adjust your plans, and keep emergency numbers one tap away.' },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-28 px-6 py-20">
      <SectionHeading title="From a place name to a plan, in four steps" />
      <ol className="relative mt-12 grid gap-5 md:grid-cols-4">
        <div aria-hidden="true" className="absolute left-0 right-0 top-[34px] hidden h-px bg-gradient-to-r from-transparent via-white/20 to-transparent md:block" />
        {STEPS.map((s, i) => (
          <li key={s.title} className="relative">
            <GlassCard className="h-full p-6 pt-12">
              <span className="absolute -top-0 left-6 grid h-[68px] w-[68px] -translate-y-1/3 place-items-center rounded-full border border-white/15 bg-ink-800 font-display text-2xl font-extrabold text-gradient">
                {i + 1}
              </span>
              <h3 className="text-lg font-bold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.text}</p>
            </GlassCard>
          </li>
        ))}
      </ol>
    </section>
  );
}
