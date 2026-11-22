import { motion } from 'framer-motion';
import { FiMapPin, FiCpu, FiShield } from 'react-icons/fi';
import GradientButton from '@/components/ui/GradientButton';
import GlassCard from '@/components/ui/GlassCard';
import RiskBadge from '@/components/ui/RiskBadge';
import ScoreRing from '@/components/ui/ScoreRing';
import HeatBackdrop from './HeatBackdrop';

// The page's single orchestrated moment: the copy and the sample advisor card arrive in sequence.
const container = { hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } };
const rise = { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } };

const SAMPLE_TIPS = [
  'Keep your phone away from the road edge near junctions.',
  'Prefer daylight and busy, well-lit streets.',
  'Share your live location if you are out late.',
];

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden pb-24 pt-36 sm:pt-44">
      <HeatBackdrop />
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative mx-auto grid max-w-6xl items-center gap-14 px-6 lg:grid-cols-[1.1fr_0.9fr]"
      >
        <div>
          <motion.h1 variants={rise} className="text-5xl font-extrabold leading-[1.02] sm:text-6xl lg:text-7xl">
            Know the street before you step out.
          </motion.h1>
          <motion.p variants={rise} className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
            SafeZone AI maps crime-prone areas across Pakistan and turns any spot you pick into a safety score,
            plain-language tips and the right emergency numbers.
          </motion.p>
          <motion.div variants={rise} className="mt-9 flex flex-wrap gap-3">
            <GradientButton to="/dashboard">Open the dashboard</GradientButton>
            <GradientButton href="#how-it-works" variant="ghost">See how it works</GradientButton>
          </motion.div>
          <motion.ul variants={rise} className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-slate-400">
            <li className="flex items-center gap-2"><FiMapPin className="text-sonar-400" /> 30 sample areas in 8 cities</li>
            <li className="flex items-center gap-2"><FiCpu className="text-sonar-400" /> Gemini-powered advice</li>
            <li className="flex items-center gap-2"><FiShield className="text-sonar-400" /> Works offline with built-in guidance</li>
          </motion.ul>
        </div>

        <motion.div variants={rise}>
          <GlassCard className="relative p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">Sample advisor result</p>
                <h2 className="mt-1 text-2xl font-bold">Saddar, Karachi</h2>
                <RiskBadge risk="Medium" className="mt-3" />
              </div>
              <ScoreRing score={55} size={108} />
            </div>
            <p className="mt-5 text-sm leading-relaxed text-slate-300">
              Busy commercial streets see opportunistic phone snatching, mostly during crowded evening hours.
            </p>
            <ul className="mt-5 space-y-2.5">
              {SAMPLE_TIPS.map((t) => (
                <li key={t} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sonar-400" />
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-5 flex items-center gap-2 text-xs text-slate-400">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping2 rounded-full bg-risk-high/60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-risk-high" />
              </span>
              Police 15 and Rescue 1122 appear with every result
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </section>
  );
}
