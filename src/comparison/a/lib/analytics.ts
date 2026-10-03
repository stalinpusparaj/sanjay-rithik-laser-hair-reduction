import { useEffect, useRef } from "react";

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

/**
 * Fires a one-time "viewed" event when the attached element first scrolls into view.
 * Lets sections with no clickable CTA (reassurance/credibility copy) still show up in the
 * funnel, so drop-off before the booking form can be measured instead of only inferred.
 */
export function useSectionView<T extends HTMLElement = HTMLElement>(
  event: string,
  payload: Payload = {},
) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          track(event, payload);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);
  return ref;
}
