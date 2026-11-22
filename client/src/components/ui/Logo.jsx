import { FiShield } from 'react-icons/fi';

export default function Logo({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2.5 font-display text-lg font-bold text-white ${className}`}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-sonar-400 to-sonar-500 text-ink-950 shadow-glow">
        <FiShield size={18} strokeWidth={2.6} />
      </span>
      SafeZone <span className="text-gradient">AI</span>
    </span>
  );
}
