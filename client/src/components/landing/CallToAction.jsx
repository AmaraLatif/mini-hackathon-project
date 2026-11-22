import GradientButton from '@/components/ui/GradientButton';

export default function CallToAction() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-24 pt-10">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-sonar-400/15 via-ink-800 to-sonar-500/20 p-10 text-center shadow-glass sm:p-16">
        <div aria-hidden="true" className="absolute -left-10 -top-10 h-56 w-56 rounded-full bg-risk-low/20 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-12 -right-10 h-64 w-64 rounded-full bg-risk-high/20 blur-3xl" />
        <h2 className="relative mx-auto max-w-2xl text-3xl font-bold sm:text-5xl">Check an area before you go.</h2>
        <p className="relative mx-auto mt-4 max-w-xl text-slate-300">
          Open the dashboard, search a neighbourhood and get your first safety advice in a few seconds.
        </p>
        <div className="relative mt-8 flex justify-center">
          <GradientButton to="/dashboard">Open the dashboard</GradientButton>
        </div>
      </div>
    </section>
  );
}
