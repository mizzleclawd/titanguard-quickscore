import { categories, totalQuestions } from "../lib/questions";

interface Props {
  onStart: () => void;
}

export function LandingPage({ onStart }: Props) {
  return (
    <div className="min-h-screen bg-titan-dark">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-titan-cyan/10 via-transparent to-titan-green/5" />
        <div className="relative max-w-5xl mx-auto px-6 py-20 text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-titan-cyan to-titan-green flex items-center justify-center text-2xl font-bold text-titan-dark">
              T
            </div>
            <span className="text-2xl font-bold tracking-tight">
              <span className="text-titan-cyan">Titan</span>
              <span className="text-white">Guard</span>
              <span className="text-titan-slate ml-2 text-lg font-normal">QuickScore</span>
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            How Secure Is Your Business?
            <br />
            <span className="text-titan-cyan">Find Out in 5 Minutes.</span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Answer {totalQuestions} questions across {categories.length} security domains.
            Get an instant score, risk assessment, and actionable recommendations — free.
          </p>

          <button
            onClick={onStart}
            className="bg-gradient-to-r from-titan-cyan to-titan-green text-titan-dark font-bold text-lg px-10 py-4 rounded-xl hover:opacity-90 transition-opacity cursor-pointer shadow-lg shadow-titan-cyan/20"
          >
            Start Free Assessment →
          </button>

          <p className="text-sm text-gray-500 mt-4">No signup required. Results are instant.</p>
        </div>
      </div>

      {/* Categories preview */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">What We Assess</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-titan-navy border border-titan-slate/30 rounded-xl p-5 hover:border-titan-cyan/30 transition-colors"
            >
              <div className="text-3xl mb-3">{cat.icon}</div>
              <h3 className="text-white font-semibold mb-1">{cat.name}</h3>
              <p className="text-gray-400 text-sm">{cat.description}</p>
              <p className="text-gray-500 text-xs mt-2">{cat.questions.length} questions</p>
            </div>
          ))}
        </div>
      </div>

      {/* Trust bar */}
      <div className="border-t border-titan-slate/30 py-12">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-gray-500 text-sm mb-4">BUILT BY CYBERSECURITY PROFESSIONALS</p>
          <div className="flex items-center justify-center gap-8 text-gray-400 text-sm flex-wrap">
            <span>🛡️ NIST Framework Aligned</span>
            <span>📋 SOC 2 Ready</span>
            <span>🏥 HIPAA Aware</span>
            <span>💳 PCI DSS Mapped</span>
          </div>
          <div className="mt-6 text-gray-500 text-sm">
            Powered by{" "}
            <a href="https://dmdtechnologies.net" target="_blank" rel="noopener" className="text-titan-cyan hover:underline">
              DMD Technologies
            </a>
            {" "}— Nashville's AI-Powered Cybersecurity Firm
          </div>
        </div>
      </div>
    </div>
  );
}
