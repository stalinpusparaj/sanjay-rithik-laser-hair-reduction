import { ShieldCheck } from "lucide-react";

import beforeAfterFace from "@/assets/luxury-glow/before-after-face.png";
import beforeAfterKnee from "@/assets/luxury-glow/before-after-knee.png";
import beforeAfterLeg from "@/assets/luxury-glow/before-after-leg.png";
import headerTreatmentRoom from "@/assets/luxury-glow/header-treatment-room-teal.png";

const FEATURE = {
  image: headerTreatmentRoom,
  title: "A treatment room",
  detail: "Illustration only. This is not a photograph of the clinic.",
};

const CASES = [
  {
    image: beforeAfterFace,
    title: "Face: upper lip and chin",
    detail: "Illustration only. This is not a patient result.",
    note: "An area often asked about for laser hair reduction.",
    comparison: true,
  },
  {
    image: beforeAfterLeg,
    title: "Bikini area",
    detail: "Illustration only. This is not a patient result.",
    note: "An area often asked about for laser hair reduction.",
    comparison: true,
  },
  {
    image: beforeAfterKnee,
    title: "Legs",
    detail: "Illustration only. This is not a patient result.",
    note: "An area often asked about for laser hair reduction.",
    comparison: true,
  },
] as const;

type PremiumGalleryCardProps = {
  image: string;
  title: string;
  detail: string;
  note: string;
  comparison?: boolean;
};

function PremiumGalleryCard({
  image,
  title,
  detail,
  note,
  comparison = false,
}: PremiumGalleryCardProps) {
  return (
    <article className={comparison ? "premium-gallery-card is-comparison" : "premium-gallery-card"}>
      <div className="premium-gallery-photo">
        <img
          src={image}
          alt={`Illustration: ${title}`}
          loading="lazy"
          draggable="false"
        />
        {comparison && (
          <span className="premium-gallery-image-label before">Illustration</span>
        )}
      </div>
      <div className="premium-gallery-copy">

        <h3>{title}</h3>
        <strong>{detail}</strong>
        <p>{note}</p>
      </div>
    </article>
  );
}

export function BeforeAfterGallery() {
  return (
    <section
      id="a-before-after"
      className="premium-gallery-section"
    >
      <div className="premium-gallery-shell">
        <header className="premium-gallery-header">
          <p>Illustrations · treatment areas</p>
          <h2>What do these pictures show?</h2>
          <p>
            These are illustrations, not photos of real patients or of the clinic. They show areas
            people often ask about for laser hair reduction.
          </p>
          <div className="premium-gallery-points" aria-label="About these pictures">
            <span>Illustrations only</span>
            <span>Not patient results</span>
            <span>Ask the doctor about your skin</span>
          </div>
        </header>

        <figure className="premium-gallery-feature">
          <img src={FEATURE.image} alt={`Illustration: ${FEATURE.title}`} loading="lazy" draggable="false" />
          <figcaption>
            <span>Illustration</span>
            <strong>{FEATURE.title}</strong>
            <p>{FEATURE.detail}</p>
          </figcaption>
        </figure>

        <div className="premium-gallery-grid">
          {CASES.map((item) => (
            <PremiumGalleryCard
              key={item.title}
              image={item.image}
              title={item.title}
              detail={item.detail}
              note={item.note}
              comparison={item.comparison}
            />
          ))}
        </div>

        <div className="premium-gallery-note">
          <ShieldCheck />
          <p>
            Illustration only. These are not patient results. What may suit you, the number of
            visits, comfort and time to recover vary from person to person. Ask the doctor.
          </p>
        </div>
      </div>
    </section>
  );
}
