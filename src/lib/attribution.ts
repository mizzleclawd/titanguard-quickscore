export interface UtmAttribution {
  source: string;
  medium: string;
  campaign: string;
  term?: string;
  content?: string;
  landingPath: string;
  referrer?: string;
}

export function getUtmAttribution(): UtmAttribution {
  const params = new URLSearchParams(window.location.search);
  return {
    source: params.get("utm_source") || params.get("source") || "direct",
    medium: params.get("utm_medium") || params.get("medium") || "none",
    campaign: params.get("utm_campaign") || params.get("campaign") || "quickscore-default",
    term: params.get("utm_term") || undefined,
    content: params.get("utm_content") || undefined,
    landingPath: `${window.location.pathname}${window.location.search}`,
    referrer: document.referrer || undefined,
  };
}
