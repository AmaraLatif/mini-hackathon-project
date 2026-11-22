import { Link } from 'react-router-dom';
import Logo from '@/components/ui/Logo';

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-ink-900/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
            An interactive crime heatmap with AI safety guidance, built for a university mini hackathon.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Explore</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
            <li><Link className="hover:text-white" to="/">Home</Link></li>
            <li><Link className="hover:text-white" to="/dashboard">Dashboard</Link></li>
            <li><Link className="hover:text-white" to="/about">About the project</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">In an emergency</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
            <li>Police: <a className="font-semibold text-white hover:text-sonar-400" href="tel:15">15</a></li>
            <li>Rescue: <a className="font-semibold text-white hover:text-sonar-400" href="tel:1122">1122</a></li>
            <li>Edhi Ambulance: <a className="font-semibold text-white hover:text-sonar-400" href="tel:115">115</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-6 py-5 text-center text-xs leading-relaxed text-slate-500">
        All incident data in this demo is illustrative sample data, not official crime statistics. © {new Date().getFullYear()} SafeZone AI Team. MIT licensed.
      </div>
    </footer>
  );
}
