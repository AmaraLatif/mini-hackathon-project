/**
 * Hero background: soft blobs in the three risk colours drift slowly, like a
 * heatmap breathing, with a radar sweep over a faint map grid. Pure CSS.
 */
export default function HeatBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-24 top-24 h-[420px] w-[420px] animate-drift rounded-full bg-risk-low/25 blur-[110px]" />
      <div className="absolute left-[38%] top-[8%] h-[360px] w-[360px] animate-driftAlt rounded-full bg-risk-medium/20 blur-[110px]" />
      <div className="absolute -right-20 top-[30%] h-[460px] w-[460px] animate-drift rounded-full bg-risk-high/25 blur-[120px]" />
      <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] animate-driftAlt rounded-full bg-sonar-500/20 blur-[100px]" />

      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.35) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 60% 40%, #000 30%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 60% 40%, #000 30%, transparent 75%)',
        }}
      />

      <div className="absolute right-[-12%] top-[2%] hidden h-[760px] w-[760px] lg:block">
        <div className="absolute inset-0 rounded-full border border-white/10" />
        <div className="absolute inset-[16%] rounded-full border border-white/10" />
        <div className="absolute inset-[32%] rounded-full border border-white/10" />
        <div
          className="absolute inset-0 animate-sweep rounded-full"
          style={{ background: 'conic-gradient(from 0deg, rgba(52,224,200,0.22), transparent 18%)' }}
        />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink-950 to-transparent" />
    </div>
  );
}
