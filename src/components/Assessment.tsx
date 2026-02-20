import { useState } from "react";
import { categories, totalQuestions } from "../lib/questions";

interface Props {
  onComplete: (responses: Record<string, Record<string, number>>) => void;
  onBack: () => void;
}

export function Assessment({ onComplete, onBack }: Props) {
  const [currentCategory, setCurrentCategory] = useState(0);
  const [responses, setResponses] = useState<Record<string, Record<string, number>>>({});

  const category = categories[currentCategory];
  const answeredInCategory = Object.keys(responses[category.id] || {}).length;
  const allAnsweredInCategory = answeredInCategory === category.questions.length;

  // Total answered across all categories
  const totalAnswered = Object.values(responses).reduce(
    (sum, cat) => sum + Object.keys(cat).length,
    0
  );

  const progress = Math.round((totalAnswered / totalQuestions) * 100);

  const setAnswer = (questionId: string, value: number) => {
    setResponses((prev) => ({
      ...prev,
      [category.id]: {
        ...(prev[category.id] || {}),
        [questionId]: value,
      },
    }));
  };

  const nextCategory = () => {
    if (currentCategory < categories.length - 1) {
      setCurrentCategory(currentCategory + 1);
    } else {
      onComplete(responses);
    }
  };

  const prevCategory = () => {
    if (currentCategory > 0) {
      setCurrentCategory(currentCategory - 1);
    } else {
      onBack();
    }
  };

  return (
    <div className="min-h-screen bg-titan-dark">
      {/* Progress bar */}
      <div className="sticky top-0 z-10 bg-titan-dark/95 backdrop-blur border-b border-titan-slate/30">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
            <span>
              Category {currentCategory + 1} of {categories.length}: {category.icon} {category.name}
            </span>
            <span>{progress}% complete</span>
          </div>
          <div className="w-full bg-titan-slate/30 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-titan-cyan to-titan-green h-2 rounded-full progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Category dots */}
          <div className="flex gap-1.5 mt-3">
            {categories.map((cat, i) => {
              const catAnswered = Object.keys(responses[cat.id] || {}).length;
              const catTotal = cat.questions.length;
              const isComplete = catAnswered === catTotal;
              const isCurrent = i === currentCategory;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCurrentCategory(i)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer flex-1 ${
                    isCurrent
                      ? "bg-titan-cyan"
                      : isComplete
                        ? "bg-titan-green"
                        : catAnswered > 0
                          ? "bg-titan-yellow/50"
                          : "bg-titan-slate/30"
                  }`}
                  title={`${cat.name} (${catAnswered}/${catTotal})`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="max-w-3xl mx-auto px-6 py-8 fade-in" key={category.id}>
        <h2 className="text-2xl font-bold text-white mb-2">
          {category.icon} {category.name}
        </h2>
        <p className="text-gray-400 mb-8">{category.description}</p>

        <div className="space-y-6">
          {category.questions.map((q, qIdx) => {
            const selected = responses[category.id]?.[q.id];
            return (
              <div
                key={q.id}
                className="bg-titan-navy rounded-xl p-5 border border-titan-slate/20"
              >
                <p className="text-white font-medium mb-4">
                  <span className="text-titan-cyan mr-2">{qIdx + 1}.</span>
                  {q.text}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {q.options.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setAnswer(q.id, opt.value)}
                      className={`text-left px-3 py-2 rounded-lg text-sm cursor-pointer transition-all ${
                        selected === opt.value
                          ? "bg-titan-cyan text-titan-dark font-medium"
                          : "bg-titan-dark border border-titan-slate/30 text-gray-300 hover:border-titan-cyan/40"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-10 pb-8">
          <button
            onClick={prevCategory}
            className="px-6 py-3 rounded-xl border border-titan-slate/50 text-gray-300 hover:border-titan-cyan/50 transition-colors cursor-pointer"
          >
            ← {currentCategory === 0 ? "Back" : "Previous"}
          </button>
          <button
            onClick={nextCategory}
            disabled={!allAnsweredInCategory}
            className={`px-8 py-3 rounded-xl font-bold transition-all cursor-pointer ${
              allAnsweredInCategory
                ? "bg-gradient-to-r from-titan-cyan to-titan-green text-titan-dark hover:opacity-90"
                : "bg-titan-slate/30 text-gray-500 cursor-not-allowed"
            }`}
          >
            {currentCategory === categories.length - 1 ? "Get My Score →" : "Next Category →"}
          </button>
        </div>
      </div>
    </div>
  );
}
