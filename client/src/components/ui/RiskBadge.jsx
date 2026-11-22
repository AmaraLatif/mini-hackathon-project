const STYLES = {
  Low: 'border-risk-low/30 bg-risk-low/15 text-green-300',
  Medium: 'border-risk-medium/30 bg-risk-medium/15 text-yellow-200',
  High: 'border-risk-high/30 bg-risk-high/15 text-red-300',
};
const DOT = { Low: 'bg-risk-low', Medium: 'bg-risk-medium', High: 'bg-risk-high' };

export default function RiskBadge({ risk, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${STYLES[risk]} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${DOT[risk]}`} />
      {risk} risk
    </span>
  );
}
