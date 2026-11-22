/** Recharts visuals for official statistics (trend over time, categories, districts). */
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import GlassCard from '@/components/ui/GlassCard';

const AXIS = '#94a3b8';
const GRID = 'rgba(255,255,255,0.08)';
const tooltipStyle = { background: 'rgba(8,12,24,0.95)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 12, color: '#e2e8f0', fontSize: 12 };

function Card({ title, empty, children }) {
  return (
    <GlassCard className="p-6">
      <h3 className="text-base font-bold">{title}</h3>
      <div className="mt-4">{empty ? <p className="text-sm text-slate-500">No data for the current filters.</p> : children}</div>
    </GlassCard>
  );
}

function Ranking({ data, labelKey, color }) {
  const top = data.slice(0, 10);
  return (
    <ResponsiveContainer width="100%" height={Math.max(180, top.length * 34 + 30)}>
      <BarChart data={top} layout="vertical" margin={{ left: 8, right: 16 }}>
        <CartesianGrid stroke={GRID} horizontal={false} />
        <XAxis type="number" stroke={AXIS} fontSize={11} />
        <YAxis type="category" dataKey={labelKey} stroke={AXIS} fontSize={11} width={130} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
        <Bar dataKey="cases" fill={color} radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function OfficialCharts({ summary }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="lg:col-span-2">
        <Card title={`Cases per ${summary.selected.periodType === 'yearly' ? 'year' : 'month'}`} empty={summary.byPeriod.length === 0}>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={summary.byPeriod} margin={{ left: 0, right: 16 }}>
              <CartesianGrid stroke={GRID} />
              <XAxis dataKey="period" stroke={AXIS} fontSize={11} />
              <YAxis stroke={AXIS} fontSize={11} width={44} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="cases" stroke="#a78bfa" strokeWidth={2.5} dot={summary.byPeriod.length < 14} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <Card title="By crime category" empty={summary.byCategory.length === 0}><Ranking data={summary.byCategory} labelKey="category" color="#8b5cf6" /></Card>
      <Card title="By district" empty={summary.byDistrict.length === 0}><Ranking data={summary.byDistrict} labelKey="district" color="#34e0c8" /></Card>
    </div>
  );
}
