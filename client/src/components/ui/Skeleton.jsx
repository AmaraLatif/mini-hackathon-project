/** Shimmering placeholder block. Size it with className (e.g. "h-4 w-24"). */
export default function Skeleton({ className = '' }) {
  return <div aria-hidden="true" className={`skeleton rounded-xl ${className}`} />;
}
