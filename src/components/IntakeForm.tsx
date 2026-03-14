import { useState } from "react";

interface CompanyInfo {
  companyName: string;
  contactName: string;
  contactEmail: string;
  industry: string;
  employeeCount: string;
  trackingConsent: boolean;
}

interface Props {
  onSubmit: (info: CompanyInfo) => void;
  onBack: () => void;
}

const industries = [
  "Healthcare",
  "Financial Services",
  "Technology",
  "Manufacturing",
  "Retail / E-Commerce",
  "Legal",
  "Education",
  "Government",
  "Construction / Trades",
  "Real Estate",
  "Nonprofit",
  "Other",
];

const employeeCounts = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1000+",
];

export function IntakeForm({ onSubmit, onBack }: Props) {
  const [form, setForm] = useState<CompanyInfo>({
    companyName: "",
    contactName: "",
    contactEmail: "",
    industry: "",
    employeeCount: "",
    trackingConsent: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CompanyInfo, string>>>({});

  const validate = (): boolean => {
    const errs: Partial<Record<keyof CompanyInfo, string>> = {};
    if (!form.companyName.trim()) errs.companyName = "Required";
    if (!form.contactName.trim()) errs.contactName = "Required";
    if (!form.contactEmail.trim() || !/\S+@\S+\.\S+/.test(form.contactEmail)) {
      errs.contactEmail = "Valid email required";
    }
    if (!form.industry) errs.industry = "Select an industry";
    if (!form.employeeCount) errs.employeeCount = "Select a size";
    if (!form.trackingConsent) errs.trackingConsent = "Consent required to continue";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSubmit(form);
  };

  const inputClass = (field: keyof CompanyInfo) =>
    `w-full bg-titan-dark border ${errors[field] ? "border-titan-red" : "border-titan-slate/50"} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-titan-cyan transition-colors`;

  return (
    <div className="min-h-screen bg-titan-dark flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <button onClick={onBack} className="text-gray-400 hover:text-white mb-6 text-sm cursor-pointer">
          ← Back
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">Before we start</h2>
        <p className="text-gray-400 mb-8">Tell us about your organization so we can tailor the assessment.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm text-gray-300 mb-1 block">Company Name</label>
            <input
              type="text"
              className={inputClass("companyName")}
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              placeholder="Acme Corp"
              autoComplete="organization"
              maxLength={120}
            />
            {errors.companyName && <p className="text-titan-red text-xs mt-1">{errors.companyName}</p>}
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-1 block">Your Name</label>
            <input
              type="text"
              className={inputClass("contactName")}
              value={form.contactName}
              onChange={(e) => setForm({ ...form, contactName: e.target.value })}
              placeholder="Jane Smith"
              autoComplete="name"
              maxLength={120}
            />
            {errors.contactName && <p className="text-titan-red text-xs mt-1">{errors.contactName}</p>}
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-1 block">Email</label>
            <input
              type="email"
              className={inputClass("contactEmail")}
              value={form.contactEmail}
              onChange={(e) => setForm({ ...form, contactEmail: e.target.value.trim() })}
              placeholder="jane@acme.com"
              autoComplete="email"
              inputMode="email"
              maxLength={254}
            />
            {errors.contactEmail && <p className="text-titan-red text-xs mt-1">{errors.contactEmail}</p>}
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-1 block">Industry</label>
            <select
              className={inputClass("industry")}
              value={form.industry}
              onChange={(e) => setForm({ ...form, industry: e.target.value })}
            >
              <option value="">Select industry...</option>
              {industries.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
            {errors.industry && <p className="text-titan-red text-xs mt-1">{errors.industry}</p>}
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-1 block">Number of Employees</label>
            <div className="grid grid-cols-3 gap-2">
              {employeeCounts.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setForm({ ...form, employeeCount: size })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
                    form.employeeCount === size
                      ? "bg-titan-cyan text-titan-dark"
                      : "bg-titan-navy border border-titan-slate/50 text-gray-300 hover:border-titan-cyan/50"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            {errors.employeeCount && <p className="text-titan-red text-xs mt-1">{errors.employeeCount}</p>}
          </div>

          <div className="rounded-xl border border-titan-slate/50 bg-titan-navy/40 p-4 text-sm text-gray-300">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.trackingConsent}
                onChange={(e) => setForm({ ...form, trackingConsent: e.target.checked })}
                className="mt-1 h-4 w-4 accent-cyan-400"
              />
              <span>
                I agree that TitanGuard QuickScore may store my contact details and assessment attribution data for follow-up on this request. No sensitive assessment payload is shared with ad platforms.
              </span>
            </label>
            <p className="mt-3 text-xs text-gray-400">
              Required fields only: company name, contact name, contact email, industry, employee count, and campaign attribution used to measure requested follow-up.
            </p>
            {errors.trackingConsent && <p className="text-titan-red text-xs mt-2">{errors.trackingConsent}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-titan-cyan to-titan-green text-titan-dark font-bold py-3 rounded-xl hover:opacity-90 transition-opacity cursor-pointer mt-4"
          >
            Begin Assessment →
          </button>
        </form>
      </div>
    </div>
  );
}
