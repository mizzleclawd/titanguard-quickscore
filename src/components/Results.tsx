import { useEffect, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { categories, getScoreColor, getRiskColor, getRecommendations } from "../lib/questions";
import type { UtmAttribution } from "../lib/attribution";

interface AssessmentData {
  _id: string;
  companyName: string;
  contactName: string;
  contactEmail?: string;
  overallScore: number;
  categoryScores: Record<string, number>;
  riskLevel: string;
  completedAt: number;
}

interface Props {
  data: AssessmentData;
  onReset: () => void;
  attribution: UtmAttribution;
}

function ScoreCircle({ score, size = 180 }: { score: number; size?: number }) {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getScoreColor(score);
  const canvasRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.style.strokeDashoffset = String(circumference);
      requestAnimationFrame(() => {
        if (canvasRef.current) {
          canvasRef.current.style.transition = "stroke-dashoffset 1.5s ease-out";
          canvasRef.current.style.strokeDashoffset = String(offset);
        }
      });
    }
  }, [circumference, offset]);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#334155" strokeWidth="10" />
        <circle
          ref={canvasRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-4xl font-bold text-white">{score}</div>
        <div className="text-sm text-gray-400">out of 100</div>
      </div>
    </div>
  );
}

function CategoryBar({ name, icon, score }: { name: string; icon: string; score: number }) {
  const color = getScoreColor(score);
  return (
    <div className="flex items-center gap-3">
      <span className="text-xl w-8">{icon}</span>
      <div className="flex-1">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-300">{name}</span>
          <span className="font-bold" style={{ color }}>
            {score}%
          </span>
        </div>
        <div className="w-full bg-titan-slate/30 rounded-full h-2.5">
          <div className="h-2.5 rounded-full progress-fill" style={{ width: `${score}%`, backgroundColor: color }} />
        </div>
      </div>
    </div>
  );
}

export function Results({ data, onReset, attribution }: Props) {
  const riskColor = getRiskColor(data.riskLevel);
  const recommendations = getRecommendations(data.categoryScores);
  const logEvent = useMutation(api.assessments.logEvent);
  const markReportViewed = useMutation(api.assessments.markReportViewed);
  const [followUpRequested, setFollowUpRequested] = useState(false);
  const date = new Date(data.completedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    void markReportViewed({ id: data._id as never });
    void logEvent({
      assessmentId: data._id as never,
      companyName: data.companyName,
      contactEmail: data.contactEmail,
      contactName: data.contactName,
      eventType: "thank_you_viewed",
      eventLabel: data.riskLevel,
      ...attribution,
      meta: {
        overallScore: String(data.overallScore),
      },
    });
  }, [attribution, data.companyName, data.contactEmail, data.contactName, data._id, data.overallScore, data.riskLevel, logEvent, markReportViewed]);

  const handleBookCall = async () => {
    await logEvent({
      assessmentId: data._id as never,
      companyName: data.companyName,
      contactEmail: data.contactEmail,
      contactName: data.contactName,
      eventType: "book_call_clicked",
      eventLabel: data.riskLevel,
      ...attribution,
      meta: {
        destination: "https://book.dmdtechnologies.net",
      },
    });
    window.open("https://book.dmdtechnologies.net", "_blank", "noopener,noreferrer");
  };

  const handleFollowUp = async () => {
    await logEvent({
      assessmentId: data._id as never,
      companyName: data.companyName,
      contactEmail: data.contactEmail,
      contactName: data.contactName,
      eventType: "follow_up_requested",
      eventLabel: data.riskLevel,
      ...attribution,
      meta: {
        channel: "captured-lead-record",
      },
    });
    setFollowUpRequested(true);
  };

  return (
    <div className="min-h-screen bg-titan-dark">
      <div className="max-w-4xl mx-auto px-6 py-12 fade-in">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-titan-cyan to-titan-green flex items-center justify-center text-xl font-bold text-titan-dark">
              T
            </div>
            <span className="text-xl font-bold">
              <span className="text-titan-cyan">Titan</span>
              <span className="text-white">Guard</span>
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Security Assessment Results</h1>
          <p className="text-gray-400">
            {data.companyName} — Assessed {date}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-titan-navy rounded-2xl p-8 border border-titan-slate/20 text-center">
            <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-6">Overall Security Score</h3>
            <ScoreCircle score={data.overallScore} />
          </div>
          <div className="bg-titan-navy rounded-2xl p-8 border border-titan-slate/20 flex flex-col items-center justify-center">
            <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-4">Risk Level</h3>
            <div className="text-5xl font-black uppercase mb-3" style={{ color: riskColor }}>
              {data.riskLevel}
            </div>
            <p className="text-gray-400 text-sm text-center max-w-xs">
              {data.riskLevel === "critical" && "You have urgent security exposure that needs immediate executive attention."}
              {data.riskLevel === "high" && "You have meaningful control gaps that should move into a remediation plan now."}
              {data.riskLevel === "medium" && "Your baseline is forming, but audit and customer diligence gaps still need work."}
              {data.riskLevel === "low" && "Your posture is solid, but you should keep tightening controls as requirements grow."}
            </p>
          </div>
        </div>

        <div className="bg-titan-navy rounded-2xl p-8 border border-titan-slate/20 mb-10">
          <h3 className="text-white font-bold text-lg mb-6">Category Breakdown</h3>
          <div className="space-y-5">
            {categories.map((cat) => (
              <CategoryBar key={cat.id} name={cat.name} icon={cat.icon} score={data.categoryScores[cat.id] || 0} />
            ))}
          </div>
        </div>

        <div className="bg-titan-navy rounded-2xl p-8 border border-titan-slate/20 mb-10">
          <h3 className="text-white font-bold text-lg mb-6">Top Recommendations</h3>
          <div className="space-y-4">
            {recommendations.slice(0, 8).map((rec, i) => (
              <div key={i} className="flex gap-4 p-4 bg-titan-dark rounded-xl border border-titan-slate/20">
                <div className="flex-shrink-0">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase ${
                      rec.priority === "Critical"
                        ? "bg-red-500/20 text-red-400"
                        : rec.priority === "High"
                          ? "bg-orange-500/20 text-orange-400"
                          : rec.priority === "Medium"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-green-500/20 text-green-400"
                    }`}
                  >
                    {rec.priority}
                  </span>
                </div>
                <div>
                  <p className="text-gray-300 text-sm">{rec.recommendation}</p>
                  <p className="text-gray-500 text-xs mt-1">{rec.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-titan-cyan/10 to-titan-green/10 rounded-2xl p-8 border border-titan-cyan/20 text-center mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-titan-cyan/90 mb-3">Next step</p>
          <h3 className="text-2xl font-bold text-white mb-3">Book a remediation call while this assessment is still fresh</h3>
          <p className="text-gray-400 mb-6 max-w-lg mx-auto">
            We can translate this score into a HIPAA, SOC 2, or NAIC-focused action plan and help your team close the highest-risk gaps first.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-5">
            <button
              onClick={() => void handleBookCall()}
              className="bg-gradient-to-r from-titan-cyan to-titan-green text-titan-dark font-bold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity inline-block cursor-pointer"
            >
              Book Your Review Call
            </button>
            <button
              onClick={() => void handleFollowUp()}
              className="border border-titan-cyan/50 text-titan-cyan font-medium px-8 py-3 rounded-xl hover:bg-titan-cyan/10 transition-colors inline-block cursor-pointer"
            >
              Request Follow-Up
            </button>
          </div>
          <p className="text-sm text-gray-500">
            Contact capture is already attached to this assessment for follow-up routing.
          </p>
          {followUpRequested && (
            <p className="text-sm text-titan-cyan mt-3">Follow-up requested and thank-you event logged.</p>
          )}
        </div>

        <div className="flex justify-center gap-4 pb-8">
          <button onClick={onReset} className="text-gray-400 hover:text-white text-sm cursor-pointer">
            Take Another Assessment
          </button>
        </div>

        <div className="text-center text-gray-500 text-xs pb-8">
          <p>© {new Date().getFullYear()} DMD Technologies — Nashville, TN</p>
          <p className="mt-1">
            <a href="https://dmdtechnologies.net" target="_blank" rel="noopener" className="hover:text-titan-cyan">
              dmdtechnologies.net
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
