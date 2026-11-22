/**
 * AppShell - layout for the working pages (dashboard, official stats, community, admin):
 * slim icon sidebar on desktop, bottom tab bar on mobile, and a top bar with the date and emergency numbers.
 * The landing and about pages keep the original floating Navbar (see SiteLayout in App.jsx).
 */
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { FiBarChart2, FiGrid, FiHome, FiLock, FiPhone, FiUsers } from 'react-icons/fi';
import Logo from '@/components/ui/Logo';

const ITEMS = [
  { to: '/dashboard', label: 'Overview', icon: FiGrid },
  { to: '/official', label: 'Official stats', icon: FiBarChart2 },
  { to: '/community', label: 'Community', icon: FiUsers },
  { to: '/admin', label: 'Admin', icon: FiLock },
];

const TITLES = {
  '/dashboard': 'Overview',
  '/official': 'Official statistics',
  '/community': 'Community reports',
  '/admin': 'Admin panel',
};

const today = () => new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

function SideLink({ to, label, icon: Icon }) {
  return (
    <NavLink
      to={to}
      title={label}
      aria-label={label}
      className={({ isActive }) =>
        `grid h-11 w-11 place-items-center rounded-2xl transition ${isActive ? 'bg-gradient-to-br from-violet-500 to-sonar-500 text-white shadow-glow' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`
      }
    >
      <Icon size={19} />
    </NavLink>
  );
}

export default function AppShell() {
  const { pathname } = useLocation();
  const title = TITLES[pathname] ?? 'SafeZone AI';

  return (
    <div className="min-h-screen lg:pl-[76px]">
      {/* Desktop sidebar */}
      <aside className="glass fixed inset-y-3 left-3 z-[2000] hidden w-[60px] flex-col items-center justify-between rounded-3xl py-4 lg:flex" aria-label="Main">
        <div className="flex flex-col items-center gap-3">
          <NavLink to="/" title="Home" aria-label="SafeZone AI home" className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-sonar-400 to-sonar-500 text-ink-950 shadow-glow">
            <FiHome size={19} />
          </NavLink>
          <span className="my-1 h-px w-7 bg-white/10" />
          {ITEMS.map((i) => <SideLink key={i.to} {...i} />)}
        </div>
      </aside>

      {/* Top bar */}
      <header className="sticky top-0 z-[1500] border-b border-white/10 bg-ink-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <NavLink to="/" aria-label="SafeZone AI home" className="lg:hidden"><Logo className="!text-base" /></NavLink>
            <p className="hidden truncate text-sm text-slate-400 lg:block">
              SafeZone AI <span className="mx-1.5 text-slate-600">/</span> <span className="font-semibold text-white">{title}</span>
            </p>
          </div>
          <div className="flex items-center gap-2.5 text-xs">
            <span className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-slate-300 sm:inline">{today()}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-risk-high/30 bg-risk-high/10 px-3 py-1.5 font-semibold text-red-200">
              <FiPhone size={12} /> Police 15 · Rescue 1122
            </span>
          </div>
        </div>
      </header>

      <div className="pb-16 lg:pb-0"><Outlet /></div>

      {/* Mobile tab bar */}
      <nav className="glass fixed inset-x-3 bottom-3 z-[2000] flex justify-around rounded-3xl p-2 lg:hidden" aria-label="Main">
        <SideLink to="/" label="Home" icon={FiHome} />
        {ITEMS.map((i) => <SideLink key={i.to} {...i} />)}
      </nav>
    </div>
  );
}
