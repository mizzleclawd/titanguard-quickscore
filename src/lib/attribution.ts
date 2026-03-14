export interface UtmAttribution {
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmTerm?: string;
  utmContent?: string;
  landingPath: string;
  referrer?: string;
}

export function getUtmAttribution(): UtmAttribution {
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get("utm_source") || params.get("source") || "direct",
    utmMedium: params.get("utm_medium") || params.get("medium") || "none",
    utmCampaign: params.get("utm_campaign") || params.get("campaign") || "quickscore-default",
    utmTerm: params.get("utm_term") || undefined,
    utmContent: params.get("utm_content") || undefined,
    landingPath: `${window.location.pathname}${window.location.search}`,
    referrer: document.referrer || undefined,
  };
}
