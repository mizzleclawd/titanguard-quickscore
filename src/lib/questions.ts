export interface Question {
  id: string;
  text: string;
  options: { label: string; value: number }[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  questions: Question[];
}

const standardOptions = [
  { label: "Not implemented", value: 0 },
  { label: "Partially implemented", value: 1 },
  { label: "Implemented but not enforced", value: 2 },
  { label: "Implemented and enforced", value: 3 },
  { label: "Mature and regularly reviewed", value: 4 },
];

export const categories: Category[] = [
  {
    id: "access",
    name: "Access Control",
    icon: "🔐",
    description: "How well do you control who gets in?",
    questions: [
      { id: "access_mfa", text: "Multi-factor authentication is enabled for all user accounts", options: standardOptions },
      { id: "access_rbac", text: "Role-based access control (RBAC) is implemented with least-privilege principles", options: standardOptions },
      { id: "access_review", text: "User access rights are reviewed at least quarterly", options: standardOptions },
      { id: "access_offboard", text: "There is a documented offboarding process that revokes access within 24 hours", options: standardOptions },
      { id: "access_admin", text: "Privileged/admin accounts are separated from regular user accounts", options: standardOptions },
    ],
  },
  {
    id: "network",
    name: "Network Security",
    icon: "🌐",
    description: "How protected is your perimeter?",
    questions: [
      { id: "net_firewall", text: "Firewalls are configured and regularly updated with documented rules", options: standardOptions },
      { id: "net_segment", text: "Network segmentation separates critical systems from general traffic", options: standardOptions },
      { id: "net_vpn", text: "Remote access requires VPN or zero-trust network access", options: standardOptions },
      { id: "net_monitor", text: "Network traffic is monitored for anomalies and suspicious activity", options: standardOptions },
      { id: "net_wifi", text: "Wireless networks use WPA3/enterprise auth with guest network isolation", options: standardOptions },
    ],
  },
  {
    id: "data",
    name: "Data Protection",
    icon: "💾",
    description: "Is your data safe at rest and in transit?",
    questions: [
      { id: "data_encrypt", text: "Sensitive data is encrypted at rest and in transit", options: standardOptions },
      { id: "data_backup", text: "Backups follow the 3-2-1 rule (3 copies, 2 media types, 1 offsite)", options: standardOptions },
      { id: "data_classify", text: "Data classification policy exists (public, internal, confidential, restricted)", options: standardOptions },
      { id: "data_dlp", text: "Data loss prevention (DLP) controls are in place", options: standardOptions },
      { id: "data_retention", text: "Data retention and disposal policies are documented and followed", options: standardOptions },
    ],
  },
  {
    id: "endpoint",
    name: "Endpoint Security",
    icon: "💻",
    description: "Are your devices locked down?",
    questions: [
      { id: "end_edr", text: "EDR/antivirus is deployed on all endpoints with centralized management", options: standardOptions },
      { id: "end_patch", text: "Operating systems and applications are patched within 30 days of release", options: standardOptions },
      { id: "end_mdm", text: "Mobile device management (MDM) is enforced on company devices", options: standardOptions },
      { id: "end_usb", text: "Removable media (USB) usage is restricted or monitored", options: standardOptions },
    ],
  },
  {
    id: "incident",
    name: "Incident Response",
    icon: "🚨",
    description: "Can you respond when things go wrong?",
    questions: [
      { id: "ir_plan", text: "A documented incident response plan exists and is tested annually", options: standardOptions },
      { id: "ir_team", text: "An incident response team with defined roles is established", options: standardOptions },
      { id: "ir_detect", text: "Security events are logged centrally and reviewed within 24 hours", options: standardOptions },
      { id: "ir_comm", text: "Communication procedures for breach notification are documented", options: standardOptions },
    ],
  },
  {
    id: "awareness",
    name: "Security Awareness",
    icon: "🧠",
    description: "Do your people know what to watch for?",
    questions: [
      { id: "aware_train", text: "Security awareness training is mandatory for all employees annually", options: standardOptions },
      { id: "aware_phish", text: "Phishing simulations are conducted at least quarterly", options: standardOptions },
      { id: "aware_policy", text: "Acceptable use policies are signed by all employees", options: standardOptions },
    ],
  },
  {
    id: "governance",
    name: "Governance & Compliance",
    icon: "📋",
    description: "Is security built into your business processes?",
    questions: [
      { id: "gov_policy", text: "Information security policies are documented and reviewed annually", options: standardOptions },
      { id: "gov_risk", text: "Risk assessments are performed at least annually", options: standardOptions },
      { id: "gov_vendor", text: "Third-party/vendor security is assessed before onboarding", options: standardOptions },
      { id: "gov_compliance", text: "Compliance requirements (HIPAA, SOC 2, PCI, etc.) are identified and tracked", options: standardOptions },
    ],
  },
];

export const totalQuestions = categories.reduce((sum, cat) => sum + cat.questions.length, 0);

export function getRiskColor(level: string): string {
  switch (level) {
    case "critical": return "#dc2626";
    case "high": return "#ea580c";
    case "medium": return "#eab308";
    case "low": return "#16a34a";
    default: return "#6b7280";
  }
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "#16a34a";
  if (score >= 60) return "#eab308";
  if (score >= 40) return "#ea580c";
  return "#dc2626";
}

export function getRecommendations(categoryScores: Record<string, number>): { category: string; priority: string; recommendation: string }[] {
  const recs: { category: string; priority: string; recommendation: string }[] = [];
  
  const recMap: Record<string, { name: string; recs: string[] }> = {
    access: {
      name: "Access Control",
      recs: [
        "Implement MFA across all systems immediately — this is the #1 defense against credential theft",
        "Establish quarterly access reviews and automate offboarding workflows",
        "Separate admin accounts from daily-use accounts for all IT staff",
      ],
    },
    network: {
      name: "Network Security",
      recs: [
        "Implement network segmentation to isolate critical systems and reduce blast radius",
        "Deploy network monitoring with alerting for anomalous traffic patterns",
        "Require VPN or ZTNA for all remote access — no exceptions",
      ],
    },
    data: {
      name: "Data Protection",
      recs: [
        "Encrypt all sensitive data at rest (AES-256) and in transit (TLS 1.2+)",
        "Implement 3-2-1 backup strategy with tested restore procedures",
        "Create and enforce a data classification policy across the organization",
      ],
    },
    endpoint: {
      name: "Endpoint Security",
      recs: [
        "Deploy EDR solution with centralized management on ALL endpoints",
        "Establish a 30-day patching cadence for critical and high severity vulnerabilities",
        "Implement MDM for all company-owned and BYOD devices accessing company data",
      ],
    },
    incident: {
      name: "Incident Response",
      recs: [
        "Create and test an incident response plan — tabletop exercises quarterly",
        "Establish centralized logging (SIEM) with 24-hour review SLA",
        "Document breach notification procedures per applicable regulations",
      ],
    },
    awareness: {
      name: "Security Awareness",
      recs: [
        "Launch mandatory security awareness training with completion tracking",
        "Start quarterly phishing simulations and track click rates over time",
        "Get signed acceptable use policies from every employee",
      ],
    },
    governance: {
      name: "Governance & Compliance",
      recs: [
        "Document and formalize information security policies with annual review dates",
        "Conduct annual risk assessments using a recognized framework (NIST, ISO 27001)",
        "Implement vendor security assessment process before onboarding third parties",
      ],
    },
  };

  // Sort categories by score (lowest first = highest priority)
  const sorted = Object.entries(categoryScores).sort(([, a], [, b]) => a - b);

  for (const [catId, score] of sorted) {
    const catInfo = recMap[catId];
    if (!catInfo) continue;
    
    let priority: string;
    if (score < 40) priority = "Critical";
    else if (score < 60) priority = "High";
    else if (score < 80) priority = "Medium";
    else priority = "Low";

    // Give more recommendations for weaker categories
    const numRecs = score < 40 ? 3 : score < 60 ? 2 : 1;
    for (let i = 0; i < Math.min(numRecs, catInfo.recs.length); i++) {
      recs.push({
        category: catInfo.name,
        priority,
        recommendation: catInfo.recs[i],
      });
    }
  }

  return recs;
}
