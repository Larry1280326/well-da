import { sourcePage } from "./rfq-source";

declare global {
  interface Window {
    // Set by the site's consent manager only after analytics consent; false/absent is opt-out.
    wellDaAnalyticsConsent?: boolean;
    gtag?: (command: "event", event: string, params: Record<string, string>) => void;
  }
}

// Called only for a persisted RFQ response. No contact details, drawings or RFQ identifiers.
export function trackRfqSuccess(source: string, lang: string) {
  if (typeof window === "undefined" || window.wellDaAnalyticsConsent !== true) return;
  const path = sourcePage(source);
  if (!path) return;
  try {
    window.gtag?.("event", "generate_lead", { source_page: path, language: lang === "zh" ? "zh" : "en", page_location: `${window.location.origin}/${lang === "zh" ? "zh" : "en"}/quotation`, page_referrer: "" });
  } catch {
    // Analytics failure must never change the submission result.
  }
}
