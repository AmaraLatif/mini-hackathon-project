const STYLES = {
  pending: 'border-risk-medium/30 bg-risk-medium/15 text-yellow-200',
  verified: 'border-risk-low/30 bg-risk-low/15 text-green-300',
  rejected: 'border-risk-high/30 bg-risk-high/15 text-red-300',
};
const LABEL = { pending: 'Pending review', verified: 'Verified', rejected: 'Rejected' };

/** Verification status of a community report. */
export default function StatusBadge({ status, className = '' }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${STYLES[status] ?? STYLES.pending} ${className}`}>
      {LABEL[status] ?? status}
    </span>
  );
}
