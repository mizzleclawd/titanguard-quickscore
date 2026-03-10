import { categories, totalQuestions } from "../lib/questions";

interface Props {
  onStart: () => void;
}

export function LandingPage({ onStart }: Props) {
  return (
    <div className="min-h-screen bg-[#070b15] text-white">
      <header className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-titan-cyan to-titan-green flex items-center justify-center font-bold text-[#070b15]">
              T
            </div>
            <div className="leading-tight">
              <p className="font-semibold text-lg tracking-tight">TitanGuard QuickScore</p>
              <p className="text-xs text-gray-400 uppercase tracking-[0.2em]">Security Snapshot</p>
            </div>
          </div>

          <a
            href="https://dmdtechnologies.net"
            target="_blank"
            rel="noopener"
            className="text-sm text-gray-300 hover:text-white transition-colors"
          >
            DMD Technologies ↗
          </a>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-6 lg:px-10 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <p className="inline-flex px-4 py-1.5 rounded-full bg-white/5 border border-white/15 text-sm text-gray-200 mb-8">
                Free assessment • No signup • ~5 minutes
              </p>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] mb-7">
                Know your security posture
                <span className="block text-titan-cyan">before attackers do.</span>
              </h1>

              <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-xl mb-10">
                Answer {totalQuestions} focused questions across {categories.length} domains and get an instant score with clear,
                prioritized actions.
              </p>

              <div className="flex flex-wrap gap-4 items-center">
                <button
                  onClick={onStart}
                  className="bg-gradient-to-r from-titan-cyan to-titan-green text-[#070b15] font-bold text-base md:text-lg px-8 py-4 rounded-xl hover:opacity-95 transition-opacity cursor-pointer"
                >
                  Start Free Assessment →
                </button>
                <p className="text-sm text-gray-400">Instant results, no email required.</p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/15 rounded-2xl p-7 lg:p-8">
              <h2 className="text-xl font-semibold mb-6">What you get instantly</h2>

              <div className="space-y-4 text-gray-200">
                <div className="flex items-start gap-3">
                  <span className="text-titan-green mt-0.5">●</span>
                  <p>Overall risk score (0–100)</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-titan-green mt-0.5">●</span>
                  <p>Domain-by-domain gap breakdown</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-titan-green mt-0.5">●</span>
                  <p>Priority recommendations you can execute immediately</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-8">
                <div className="rounded-lg border border-white/10 bg-black/20 p-3 text-center">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Questions</p>
                  <p className="text-2xl font-bold">{totalQuestions}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/20 p-3 text-center">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Domains</p>
                  <p className="text-2xl font-bold">{categories.length}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/20 p-3 text-center">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Time</p>
                  <p className="text-2xl font-bold">5m</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Framework strip */}
        <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-8">
          <div className="rounded-xl border border-white/10 bg-white/3 px-5 py-4 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-200">
            <span className="font-semibold text-titan-cyan">Framework aligned</span>
            <span>🛡 NIST</span>
            <span>📋 SOC 2</span>
            <span>🏥 HIPAA</span>
            <span>💳 PCI DSS</span>
          </div>
        </section>

        {/* Domains */}
        <section className="max-w-7xl mx-auto px-6 lg:px-10 py-14 lg:py-20">
          <div className="mb-10">
            <p className="text-sm uppercase tracking-[0.2em] text-gray-400 mb-3">Coverage</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">What We Assess</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <article key={cat.id} className="rounded-2xl border border-white/10 bg-white/5 p-6 min-h-[220px]">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-xs text-gray-400 uppercase tracking-[0.18em]">{cat.questions.length} Q</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{cat.name}</h3>
                <p className="text-gray-300 leading-relaxed text-sm">{cat.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-20 lg:pb-24">
          <div className="rounded-2xl border border-titan-cyan/40 bg-gradient-to-r from-titan-cyan/10 to-titan-green/10 p-8 md:p-10 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Get your score in 5 minutes</h2>
            <p className="text-gray-300 mb-7">No forms. No friction. Just a clear security baseline.</p>
            <button
              onClick={onStart}
              className="bg-gradient-to-r from-titan-cyan to-titan-green text-[#070b15] font-bold text-base md:text-lg px-8 py-4 rounded-xl hover:opacity-95 transition-opacity cursor-pointer"
            >
              Start Free Assessment →
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
