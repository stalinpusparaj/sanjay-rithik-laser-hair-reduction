import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from "web-vitals";
import { track } from "./analytics";

function report(metric: Metric) {
  track("web_vital", {
    metric_name: metric.name,
    // CLS is a small unitless score (e.g. 0.05); scale it up so it reads sensibly
    // alongside the other metrics, which are all in milliseconds.
    value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
    rating: metric.rating,
  });
}

/** Reports Core Web Vitals (page load speed / stability) into the same event stream as everything else. */
export function reportWebVitals() {
  onCLS(report);
  onFCP(report);
  onINP(report);
  onLCP(report);
  onTTFB(report);
}
