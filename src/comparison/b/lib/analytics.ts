type Payload = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: Payload[];
    gtag?: (...args: unknown[]) => void;
  }
}

function computeAttribution() {
  const p = new URLSearchParams(window.location.search);
  return {
    landing_page: window.location.pathname,
    referrer: document.referrer || "direct",
    utm_source: p.get("utm_source") ?? "",
    utm_medium: p.get("utm_medium") ?? "",
    utm_campaign: p.get("utm_campaign") ?? "",
    utm_content: p.get("utm_content") ?? "",
    device: window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop",
  };
}

type Attribution = ReturnType<typeof computeAttribution>;
let cachedAttribution: Attribution | null = null;

/**
 * Attribution captured once per page load, not re-read on every call. UTM params can
 * disappear from the URL after client-side navigation, so a fresh read later in the
 * session would silently lose the source that actually brought the visitor in.
 */
export function getAttribution(): Attribution | Record<string, never> {
  if (typeof window === "undefined") return {};
  cachedAttribution ??= computeAttribution();
  return cachedAttribution;
}

/**
 * Lightweight event bus: pushes to dataLayer when present, no-op safe on SSR.
 * Every event automatically carries device + UTM source so funnel drop-off can be
 * segmented by traffic source, not just completed leads.
 */
export function track(event: string, payload: Payload = {}) {
  if (typeof window === "undefined") return;
  const attribution = getAttribution();
  const entry = {
    event,
    device: attribution.device,
    utm_source: attribution.utm_source,
    utm_medium: attribution.utm_medium,
    utm_campaign: attribution.utm_campaign,
    ...payload,
    ts: new Date().toISOString(),
  };
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(entry);
  window.gtag?.("event", event, {
    ...payload,
    device: attribution.device,
    utm_source: attribution.utm_source,
    utm_medium: attribution.utm_medium,
    utm_campaign: attribution.utm_campaign,
  });
}
