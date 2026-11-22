import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiMenu, FiX } from 'react-icons/fi';
import Logo from '@/components/ui/Logo';
import GradientButton from '@/components/ui/GradientButton';

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/dashboard', label: 'Map' },
  { to: '/official', label: 'Official stats' },
  { to: '/community', label: 'Community' },
  { to: '/about', label: 'About' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);

  const linkClass = ({ isActive }) =>
    `rounded-full px-4 py-2 text-sm font-medium transition ${isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`;

  return (
    <header className="fixed inset-x-0 top-3 z-[2000] px-3 sm:px-6">
      <nav className="glass mx-auto flex max-w-6xl items-center justify-between rounded-full px-4 py-2.5 sm:px-5" aria-label="Main">
        <Link to="/" aria-label="SafeZone AI home"><Logo /></Link>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className={linkClass}>{l.label}</NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <GradientButton to="/dashboard" className="hidden !px-5 !py-2 md:inline-flex">Open dashboard</GradientButton>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-white md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="glass mx-auto mt-2 flex max-w-6xl flex-col gap-1 rounded-3xl p-3 md:hidden"
          >
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.to === '/'} className={linkClass}>{l.label}</NavLink>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
