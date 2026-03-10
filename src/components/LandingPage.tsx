import { categories, totalQuestions } from "../lib/questions";

interface Props {
  onStart: () => void;
}

export function LandingPage({ onStart }: Props) {
  const domainCount = categories.length;

  return (
    <div className="min-h-screen bg-titan-dark text-white relative overflow-x-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-titan-cyan/8 blur-[140px] rounded-full" />
        <div className="absolute top-[35%] -left-20 w-[500px] h-[500px] bg-titan-green/8 blur-[130px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[520px] h-[520px] bg-titan-cyan/6 blur-[130px] rounded-full" />
      </div>

      {/* Top nav */}
      <header className="relative z-10 border-b border-white/6 bg-titan-dark/60 backdrop-blur">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-titan-cyan to-titan-green flex items-center justify-center font-bold text-titan-dark">
              T
            </div>
            <div className="leading-tight">
              <div className="font-bold text-lg tracking-tight">TitanGuard QuickScore</div>
              <div className="text-xs text-titan-cyan/70 uppercase tracking-[0.18em]">Free Security Snapshot</div>
            </div>
          </div>

          <a
            href="https://dmdtechnologies.net"
            target="_blank"
            rel="noopener"
            className="text-sm text-gray-300 hover:text-titan-cyan transition-colors"
          >
            Powered by DMD Technologies ↗
          </a>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero */}
        <section className="max-w-[1200px] mx-auto px-6 lg:px-10 pt-20 pb-16 lg:pt-24 lg:pb-24">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-titan-cyan/10 border border-titan-cyan/30 text-titan-cyan text-sm font-medium mb-7">
                <span className="w-2 h-2 rounded-full bg-titan-green animate-pulse" />
                5-minute assessment • no signup
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] mb-6">
                How Secure Is Your Business
                <span className="block gradient-text">Right Now?</span>
              </h1>

              <p className="text-lg md:text-xl text-gray-300 max-w-xl mb-8 leading-relaxed">
                Answer {totalQuestions} focused questions across {domainCount} security domains and get an instant risk score,
                priority level, and practical next steps.
              </p>

              <div className="flex flex-wrap gap-4 items-center">
                <button
                  onClick={onStart}
                  className="glow-cta bg-gradient-to-r from-titan-cyan to-titan-green text-titan-dark font-bold text-base md:text-lg px-8 py-4 rounded-xl hover:scale-[1.015] active:scale-[0.985] transition-transform cursor-pointer"
                >
                  Start Free Assessment →
                </button>
                <p className="text-sm text-gray-400">Instant results. No email wall.</p>
              </div>
            </div>

            <div className="bg-titan-navy/70 border border-white/10 rounded-2xl p-6 md:p-7 backdrop-blur shadow-2xl shadow-black/30">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold">QuickScore Preview</h2>
                <span className="text-xs uppercase tracking-[0.18em] text-titan-cyan/80">Live format</span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm text-gray-300">
                  <span>Questions</span>
                  <span className="font-semibold text-white">{totalQuestions}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-300">
                  <span>Domains</span>
                  <span className="font-semibold text-white">{domainCount}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-300">
                  <span>Estimated completion</span>
                  <span className="font-semibold text-white">~5 min</span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-5">
                <p className="text-sm text-gray-300 mb-3">You’ll receive:</p>
                <ul className="space-y-2 text-sm text-gray-200">
                  <li>• Overall security score (0–100)</li>
                  <li>• Domain-by-domain gap view</li>
                  <li>• Priority-ranked recommendations</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Trust strip */}
        <section className="max-w-[1200px] mx-auto px-6 lg:px-10 pb-8 lg:pb-12">
          <div className="bg-titan-navy/45 border border-white/10 rounded-xl px-5 py-4 flex flex-wrap gap-3 md:gap-6 items-center justify-center text-sm text-gray-200">
            <span className="font-semibold text-titan-cyan">Framework aligned:</span>
            <span>🛡 NIST</span>
            <span>📋 SOC 2</span>
            <span>🏥 HIPAA</span>
            <span>💳 PCI DSS</span>
          </div>
        </section>

        {/* What we assess */}
        <section className="max-w-[1200px] mx-auto px-6 lg:px-10 py-14 lg:py-20">
          <div className="flex items-end justify-between mb-8 lg:mb-10 gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-titan-cyan/80 mb-3">Assessment Scope</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">What We Assess</h2>
            </div>
            <button onClick={onStart} className="hidden md:inline-flex text-sm text-titan-cyan hover:text-titan-cyan-light transition-colors">
              Start now →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6">
            {categories.map((cat) => (
              <article
                key={cat.id}
                className="card-hover bg-titan-navy/60 border border-white/10 rounded-2xl p-6 lg:p-7 h-full"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-titan-cyan/15 border border-titan-cyan/30 flex items-center justify-center text-2xl">
                    {cat.icon}
                  </div>
                  <span className="text-xs font-mono uppercase tracking-[0.16em] text-gray-400">{cat.questions.length} Q</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{cat.name}</h3>
                <p className="text-gray-300 leading-relaxed">{cat.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="max-w-[1200px] mx-auto px-6 lg:px-10 pb-14 lg:pb-20">
          <div className="bg-titan-navy/60 border border-white/10 rounded-2xl p-6 md:p-8 lg:p-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="text-xs uppercase tracking-[0.16em] text-titan-cyan/80 mb-2">Step 1</div>
                <h3 className="text-lg font-semibold mb-2">Answer 30 questions</h3>
                <p className="text-gray-300">Fast, plain-language security checks across your core controls.</p>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.16em] text-titan-cyan/80 mb-2">Step 2</div>
                <h3 className="text-lg font-semibold mb-2">Get your score</h3>
                <p className="text-gray-300">Instant grading with a clear risk level and domain breakdown.</p>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.16em] text-titan-cyan/80 mb-2">Step 3</div>
                <h3 className="text-lg font-semibold mb-2">Take action</h3>
                <p className="text-gray-300">Priority recommendations you can implement immediately.</p>
              </div>
            </div>

            <div className="mt-9">
              <button
                onClick={onStart}
                className="bg-gradient-to-r from-titan-cyan to-titan-green text-titan-dark font-bold text-base md:text-lg px-8 py-4 rounded-xl hover:scale-[1.015] active:scale-[0.985] transition-transform cursor-pointer"
              >
                Start Free Assessment →
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
