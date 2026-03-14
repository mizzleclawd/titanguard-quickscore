import { categories, totalQuestions } from "../lib/questions";

interface Props {
  onStart: () => void;
}

export function LandingPage({ onStart }: Props) {
  return (
    <div className="min-h-screen bg-[#060b16] text-white">
      <div className="absolute inset-0 pointer-events-none opacity-40 [background:radial-gradient(circle_at_20%_10%,rgba(34,211,238,0.14),transparent_35%),radial-gradient(circle_at_90%_0%,rgba(16,185,129,0.10),transparent_30%)]" />

      <header className="relative z-10 border-b border-white/10 backdrop-blur">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-titan-cyan to-titan-green flex items-center justify-center font-bold text-[#060b16]">
              T
            </div>
            <div>
              <p className="font-semibold text-lg leading-tight">TitanGuard QuickScore</p>
              <p className="text-xs uppercase tracking-[0.22em] text-gray-400">Security Snapshot</p>
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

      <main className="relative z-10">
        <section className="max-w-[1280px] mx-auto px-6 lg:px-12 pt-20 lg:pt-28 pb-16 lg:pb-22">
          <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <div className="inline-flex px-4 py-2 rounded-full border border-white/15 bg-white/5 text-sm text-gray-200 mb-8">
                Assess → Book call → Contact capture
              </div>

              <h1 className="text-[2.6rem] leading-[1.05] md:text-[3.2rem] lg:text-[4rem] font-bold tracking-tight mb-6 max-w-[16ch]">
                Benchmark your security posture <span className="text-titan-cyan">before your next audit, renewal, or breach scare.</span>
              </h1>

              <p className="text-lg lg:text-xl text-gray-300 leading-relaxed max-w-[52ch] mb-9">
                Answer {totalQuestions} focused questions across {categories.length} domains and get an instant score, prioritized action plan, and a fast path to a remediation call if your gaps need hands-on help.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={onStart}
                  className="bg-gradient-to-r from-titan-cyan to-titan-green text-[#060b16] font-bold text-base lg:text-lg px-8 py-4 rounded-xl hover:brightness-110 transition-all cursor-pointer"
                >
                  Start Assessment →
                </button>
                <span className="text-sm text-gray-400">Instant results, contact capture, then optional booking.</span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/15 bg-[#0d1527]/85 p-7 lg:p-9 shadow-2xl shadow-black/35">
              <p className="text-xs uppercase tracking-[0.2em] text-titan-cyan/90 mb-5">Built for regulated teams</p>

              <div className="space-y-4 text-gray-200 mb-7">
                <p><strong className="text-white">HIPAA teams:</strong> identify control gaps before a customer questionnaire or BA review exposes them.</p>
                <p><strong className="text-white">SOC 2 teams:</strong> see where policies, access, logging, and vendor controls need tightening.</p>
                <p><strong className="text-white">NAIC-aligned insurance orgs:</strong> surface governance and third-party risk issues before they become regulatory headaches.</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Metric label="Questions" value={String(totalQuestions)} />
                <Metric label="Domains" value={String(categories.length)} />
                <Metric label="Time" value="5m" />
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-[1280px] mx-auto px-6 lg:px-12 pb-12 lg:pb-16">
          <div className="rounded-xl border border-white/10 bg-white/5 px-6 py-4 flex flex-wrap items-center justify-center gap-5 text-sm text-gray-200">
            <span className="font-semibold text-titan-cyan">Persona aligned</span>
            <span>HIPAA</span>
            <span>SOC 2</span>
            <span>NAIC Model Law 668</span>
            <span>NIST</span>
          </div>
        </section>

        <section className="max-w-[1280px] mx-auto px-6 lg:px-12 py-12 lg:py-20">
          <div className="mb-10 lg:mb-12">
            <p className="text-xs uppercase tracking-[0.24em] text-gray-400 mb-3">Coverage</p>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">What We Assess</h2>
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-7">
            {categories.map((cat) => (
              <article key={cat.id} className="rounded-2xl border border-white/10 bg-[#0e172b]/70 p-6 lg:p-7 min-h-[212px]">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-xs uppercase tracking-[0.2em] text-gray-400">{cat.questions.length} Q</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{cat.name}</h3>
                <p className="text-gray-300 leading-relaxed">{cat.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="max-w-[1280px] mx-auto px-6 lg:px-12 pb-12 lg:pb-18">
          <div className="rounded-2xl border border-white/10 bg-[#0d162a]/70 p-7 lg:p-10">
            <h2 className="text-2xl lg:text-3xl font-bold mb-8">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8 text-gray-200">
              <Step n="01" title="Assess" text="Complete 30 security questions tailored to regulated risk areas." />
              <Step n="02" title="Book call" text="If the score exposes material gaps, book a review call directly from the results page." />
              <Step n="03" title="Contact captured" text="Every completed assessment records contact and campaign attribution for follow-up." />
            </div>
          </div>
        </section>

        <section className="max-w-[1280px] mx-auto px-6 lg:px-12 pb-20 lg:pb-24">
          <div className="rounded-2xl border border-titan-cyan/35 bg-gradient-to-r from-titan-cyan/12 to-titan-green/12 p-8 lg:p-11 text-center">
            <h2 className="text-2xl lg:text-3xl font-bold mb-3">Get your security baseline before the next audit asks for proof</h2>
            <p className="text-gray-300 mb-7">Fast enough for leadership. Specific enough for operators. Built for regulated revenue teams.</p>
            <button
              onClick={onStart}
              className="bg-gradient-to-r from-titan-cyan to-titan-green text-[#060b16] font-bold text-base lg:text-lg px-8 py-4 rounded-xl hover:brightness-110 transition-all cursor-pointer"
            >
              Start Assessment →
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/25 p-3 text-center">
      <p className="text-[11px] uppercase tracking-[0.17em] text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function Step({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-titan-cyan/90 mb-2">{n}</p>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-300 leading-relaxed">{text}</p>
    </div>
  );
}
