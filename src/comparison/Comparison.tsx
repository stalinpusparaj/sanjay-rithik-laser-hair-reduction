import { useState, type ReactNode } from "react";
import type { AgeJourneySelection } from "./a/components/skin/AgeJourney";
import { VersionA } from "./a/Page";
import { VersionB } from "./b/Page";

// Booking-first order: offer + form in the hero, then one concern picker, the doctor,
// one treatment explorer, proof, process, objections, and the closing form.
const groups = [
  ["navigation", "Landing page header"],
  ["hero", "Hero"],
  ["offer-form", "Free Offer + Booking Form"],
  ["clinic-facts", "Trust / Quick Facts Strip"],
  ["assessment", "Skin Assessment / Skin Check"],
  ["doctor", "Meet Your Dermatologist"],
  ["doctor-video", "Doctor Video"],
  ["advanced-treatments", "Advanced Treatments"],
  ["laser-areas", "Laser Hair Removal / Who Is This For"],
  ["laser-benefits", "Laser Hair Removal / Benefits"],
  ["treatments-before-age", "Treatment Options by Concern"],
  ["testimonials", "Patient Testimonials"],
  ["video-testimonials", "Video Testimonials"],
  ["before-after", "Before & After Gallery"],
  ["benefits", "Benefits / The Skin You'll Love"],
  ["video", "Consultation Journey / How It Works"],
  ["why-choose", "Why Choose Sanjay Rithik Hospital"],
  ["questions", "FAQ / Questions & Concerns"],
  ["clinic", "Visit Sanjay Rithik Hospital"],
  ["consultation", "Consultation / Appointment"],
  ["age", "Interactive Age Preview"],
  ["footer", "Footer"],
  ["sticky", "Mobile booking bar"],
] as const;

const hiddenSections: Record<"a" | "b", readonly string[]> = {
  a: ["pain", "treatments", "video", "testimonials", "questions", "consultation", "footer"],
  b: ["navigation", "hero", "doctor", "treatments", "age", "sticky"],
} as const;

function Sections({ a, b }: { a: Record<string, ReactNode>; b: Record<string, ReactNode> }) {
  return (
    <div className="enhanced-site">
    <a className="skip-link" href="#main-content">Skip to content</a>
    <main id="main-content" className="comparison-page">
      {a["schema"]}
      {groups.map(([key]) => (
        <div key={key} id={`compare-${key}`} className="comparison-group">
          {([['a', a], ['b', b]] as const).map(([version, sections]) => sections[key] && !hiddenSections[version].includes(key) ? (
            <div key={version} className={`version-${version} comparison-version`} data-section={key} data-version={version}>
              <div className={`comparison-content comparison-${key}`}>{sections[key]}</div>
            </div>
          ) : null)}
        </div>
      ))}
    </main>
    </div>
  );
}

export function Comparison() {
  const [ageSelection, setAgeSelection] = useState<AgeJourneySelection>();
  return <div id="review-top"><VersionA onAgeSelection={setAgeSelection} render={(a) => <VersionB sharedAgeSelection={ageSelection} render={(b) => <Sections a={a} b={b} />} />} /></div>;
}

