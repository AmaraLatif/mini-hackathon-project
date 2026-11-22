/** Marks data that is illustrative, so it can never be mistaken for official statistics. */
export default function SampleTag({ className = '' }) {
  return (
    <span className={`inline-flex items-center rounded-full border border-orange-400/40 bg-orange-400/15 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-orange-200 ${className}`}>
      Sample data
    </span>
  );
}
