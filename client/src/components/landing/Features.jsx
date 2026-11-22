import { FiMap, FiLayers, FiCpu, FiSearch, FiPhone, FiWifiOff } from 'react-icons/fi';
import SectionHeading from '@/components/ui/SectionHeading';
import GlassCard from '@/components/ui/GlassCard';

// `span` makes a bento layout on a 6-column grid (full width on mobile).
const FEATURES = [
  { icon: FiMap, span: 'md:col-span-4', title: 'Interactive map', text: 'Zoom, pan and click any marker. Hover to preview an area, click to open its details and advice. Click empty map and the nearest area is picked for you.' },
  { icon: FiLayers, span: 'md:col-span-2', title: 'Crime heatmap', text: 'Green, yellow and red zones show where risk concentrates at a glance.' },
  { icon: FiSearch, span: 'md:col-span-2', title: 'Search and filters', text: 'Find an area by name, then narrow by city, crime type or risk level.' },
  { icon: FiCpu, span: 'md:col-span-4', title: 'AI safety advisor', text: 'Pick an area and get a safety score, a short risk summary, practical tips and what to do in an emergency, written by Gemini and checked against our own scoring rules.' },
  { icon: FiPhone, span: 'md:col-span-3', title: 'Emergency contacts', text: 'Verified Pakistani helpline numbers sit one tap away on every result. They never come from the AI.' },
  { icon: FiWifiOff, span: 'md:col-span-3', title: 'Never leaves you blank', text: 'If the AI is slow or offline, built-in guidance fills in instantly so the demo and the product keep working.' },
];

export default function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-20">
      <SectionHeading title="Everything you need to judge an area in under a minute" />
      <div className="mt-12 grid gap-5 md:grid-cols-6">
        {FEATURES.map(({ icon: Icon, title, text, span }) => (
          <GlassCard key={title} hover className={`p-7 ${span}`}>
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-sonar-400/25 to-sonar-500/25 text-sonar-400">
              <Icon size={20} />
            </span>
            <h3 className="mt-5 text-xl font-bold">{title}</h3>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-400">{text}</p>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
