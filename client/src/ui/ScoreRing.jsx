import { motion } from 'framer-motion';
import { scoreBand } from '@/utils/risk';

const R = 52;
const C = 2 * Math.PI * R;

/** Circular 0-100 gauge, coloured by safety band. */
export default function ScoreRing({ score, size = 120, showBand = false }) {
  const band = scoreBand(score);
  return (
    <div className="inline-flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox="0 0 120 120" role="img" aria-label={`Safety score ${score} out of 100`}>
        <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
        <motion.circle
          key={score}
          cx="60" cy="60" r={R} fill="none" stroke={band.color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          animate={{ strokeDashoffset: C * (1 - score / 100) }}
          transition={{ duration: 1, ease: 'easeOut' }}
          transform="rotate(-90 60 60)"
        />
        <text x="60" y="64" textAnchor="middle" fontSize="32" fontWeight="700" fill="#fff" fontFamily="Bricolage Grotesque, sans-serif">{score}</text>
        <text x="60" y="82" textAnchor="middle" fontSize="10" fill="#94a3b8">out of 100</text>
      </svg>
      {showBand && <span className="text-xs font-semibold" style={{ color: band.color }}>{band.label}</span>}
    </div>
  );
}
