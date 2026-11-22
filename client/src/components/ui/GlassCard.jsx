import { motion } from 'framer-motion';

/** Frosted-glass container. Pass `hover` for a lift-on-hover micro-interaction. */
export default function GlassCard({ hover = false, className = '', children, ...rest }) {
  const base = `glass rounded-2xl ${className}`;
  if (!hover) return <div className={base} {...rest}>{children}</div>;
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      className={`${base} transition-colors duration-200 hover:border-white/25`}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
