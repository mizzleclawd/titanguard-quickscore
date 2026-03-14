import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { LandingPage } from "./components/LandingPage";
import { IntakeForm } from "./components/IntakeForm";
import { Assessment } from "./components/Assessment";
import { Results } from "./components/Results";
import { getUtmAttribution, type UtmAttribution } from "./lib/attribution";

type Step = "landing" | "intake" | "assessment" | "results";

interface CompanyInfo {
  companyName: string;
  contactName: string;
  contactEmail: string;
  industry: string;
  employeeCount: string;
}

function App() {
  const [step, setStep] = useState<Step>("landing");
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [assessmentId, setAssessmentId] = useState<Id<"assessments"> | null>(null);
  const attribution: UtmAttribution = useMemo(() => getUtmAttribution(), []);

  const submitAssessment = useMutation(api.assessments.submit);
  const logEvent = useMutation(api.assessments.logEvent);
  const result = useQuery(api.assessments.get, assessmentId ? { id: assessmentId } : "skip");

  const handleIntakeSubmit = async (info: CompanyInfo) => {
    setCompanyInfo(info);
    await logEvent({
      companyName: info.companyName,
      contactEmail: info.contactEmail,
      contactName: info.contactName,
      eventType: "contact_captured",
      eventLabel: info.industry,
      ...attribution,
      meta: {
        employeeCount: info.employeeCount,
      },
    });
    setStep("assessment");
  };

  const handleAssessmentComplete = async (responses: Record<string, Record<string, number>>) => {
    if (!companyInfo) return;

    try {
      const id = await submitAssessment({
        ...companyInfo,
        responses,
        ...attribution,
      });
      setAssessmentId(id);
      setStep("results");
    } catch (err) {
      console.error("Failed to submit assessment:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  const handleReset = () => {
    setStep("landing");
    setCompanyInfo(null);
    setAssessmentId(null);
  };

  switch (step) {
    case "landing":
      return <LandingPage onStart={() => setStep("intake")} />;
    case "intake":
      return <IntakeForm onSubmit={handleIntakeSubmit} onBack={() => setStep("landing")} />;
    case "assessment":
      return <Assessment onComplete={handleAssessmentComplete} onBack={() => setStep("intake")} />;
    case "results":
      if (!result) {
        return (
          <div className="min-h-screen bg-titan-dark flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-titan-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Calculating your security score...</p>
            </div>
          </div>
        );
      }
      return <Results data={result as any} onReset={handleReset} attribution={attribution} />;
    default:
      return <LandingPage onStart={() => setStep("intake")} />;
  }
}

export default App;
