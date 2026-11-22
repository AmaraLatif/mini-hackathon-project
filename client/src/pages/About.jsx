import { FiTarget, FiGithub, FiUsers } from 'react-icons/fi';
import SectionHeading from '@/components/ui/SectionHeading';
import GlassCard from '@/components/ui/GlassCard';
import { team } from '@/data/team';

const TECH = [
  { name: 'React + Vite', why: 'Component model for reusable UI and an instant dev server, ideal for a hackathon clock.' },
  { name: 'Tailwind CSS', why: 'Design tokens and utility classes keep the premium dark look consistent without custom CSS sprawl.' },
  { name: 'Framer Motion', why: 'Declarative animations that respect reduced-motion settings.' },
  { name: 'Leaflet + OpenStreetMap', why: 'A light, free, keyless map stack with a plugin for heatmaps.' },
  { name: 'Node.js + Express', why: 'A small API that is easy for three people to read, test and deploy.' },
  { name: 'Gemini API', why: 'Turns structured area data into short, readable safety guidance, with a built-in fallback.' },
  { name: 'JSON file storage', why: 'No database setup. A repository layer makes swapping in a real database a one-file change.' },
  { name: 'Vercel', why: 'One-click hosting for the static client and the serverless API.' },
];

const FUTURE = [
  'Live police and emergency APIs', 'Safe-route recommendations', 'One-tap emergency SOS with live location',
  'Crime trend analytics over time', 'User crime reporting with moderation', 'Admin dashboard for data review',
  'Push notifications for high-risk alerts', 'Authentication and saved places', 'Cloud database', 'Mobile app',
];

export default function About() {
  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-36">
      <SectionHeading
        title="About SafeZone AI"
        subtitle="A university hackathon project that shows how a map, a simple scoring rule and an AI writer can make safety information easier to act on."
      />

      <section className="mt-14 grid gap-5 md:grid-cols-[1fr_1.2fr]">
        <GlassCard className="p-8">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-sonar-400/15 text-sonar-400"><FiTarget size={20} /></span>
          <h2 className="mt-5 text-2xl font-bold">Purpose</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            Help residents, students and travellers understand which areas carry more risk, and what to do about it,
            before they head out. The goal is awareness, not alarm.
          </p>
        </GlassCard>
        <GlassCard className="p-8">
          <h2 className="text-2xl font-bold">A note on the data</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            Every incident shown is illustrative sample data created for this demo. It does not describe real events
            and must not be used to judge real neighbourhoods or the people who live in them. Safety scores come from a
            transparent rule (risk level plus crime severity), not a trained prediction model.
          </p>
        </GlassCard>
      </section>

      <section className="mt-20">
        <SectionHeading title="Technology used" subtitle="Each tool was picked to keep the MVP fast to build and easy to split across three people." />
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {TECH.map((t) => (
            <GlassCard key={t.name} hover className="p-6">
              <h3 className="text-lg font-bold">{t.name}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{t.why}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <SectionHeading title="Future scope" />
        <ul className="mt-8 flex flex-wrap gap-3">
          {FUTURE.map((f) => <li key={f} className="chip !px-4 !py-2 !text-sm">{f}</li>)}
        </ul>
      </section>

      <section className="mt-20">
        <SectionHeading title="Team" subtitle="Three members, three independent modules." />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {team.map((m) => (
            <GlassCard key={m.module} hover className="p-7">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-sonar-400 to-sonar-500 text-ink-950"><FiUsers size={24} /></span>
              <h3 className="mt-5 text-xl font-bold">{m.name}</h3>
              <p className="text-sm font-semibold text-sonar-400">{m.module}: {m.role}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{m.focus}</p>
              <a href={m.github} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white">
                <FiGithub /> GitHub profile
              </a>
            </GlassCard>
          ))}
        </div>
      </section>
    </main>
  );
}
