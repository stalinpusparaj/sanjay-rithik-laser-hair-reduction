
import { lazy, Suspense, useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import {
  ArrowRight,
  CalendarCheck,
  Check,
  Clock3,
  Crosshair,
  Droplets,
  MapPin,
  ScanFace,
  Sparkles,
  Stethoscope,
  Syringe,
  TestTube,
  Waves,
  Zap,
  Play,
  ShieldCheck,
  HeartHandshake,
  Star,
} from "lucide-react";
import { Button } from "@/comparison/a/components/ui/button";
import { Reveal } from "@/comparison/a/components/skin/Reveal";
import type { AgeJourneySelection } from "@/comparison/a/components/skin/AgeJourney";
import { LeadForm } from "@/comparison/a/components/skin/LeadForm";
import { TestimonialGrid } from "@/comparison/a/components/skin/TestimonialGrid";
import { BeforeAfterGallery } from "@/comparison/a/components/skin/BeforeAfterGallery";
import { track, useSectionView } from "@/comparison/a/lib/analytics";
import { cn } from "@/comparison/a/lib/utils";
import heroImage from "@/comparison/a/assets/hero-portrait.jpg";
import heroPortrait from "@/comparison/b/assets/anti-aging-hero-v2.jpg";
import { TreatmentPhoto } from "../TreatmentPhoto";
import { WhatsAppIcon } from "../SiteChrome";
import heroSkinTowel from "@/assets/hero-skin-towel.webp";
import mirrorImage from "@/comparison/a/assets/mirror.jpeg";
import hospitalLogo from "@/assets/hospital-logo.png";
import doctorKiruthika from "@/comparison/a/assets/doctor-kiruthika.jpg";
import clinicImage from "@/comparison/a/assets/clinic-official.jpg";
import doctorSectionImage from "@/assets/skin-care-official.jpg";
import spaRoomTreatment from "@/assets/luxury-glow/spa-room-treatment.png";
import pinkLaserTreatment from "@/assets/luxury-glow/pink-laser-treatment.png";
import pinkTreatmentRoom from "@/assets/luxury-glow/pink-treatment-room.png";
import legSkincareGlow from "@/assets/luxury-glow/leg-skincare-glow.png";
import headerTreatmentRoom from "@/assets/luxury-glow/header-treatment-room-teal.png";
import drKiruthikaIntroVideo from "@/comparison/a/assets/videos/dr-kiruthika-intro.mp4?url";
import drKiruthikaIntroPoster from "@/comparison/a/assets/dr-kiruthika-intro-poster.jpg";
import antiAgingReelVideo from "@/comparison/a/assets/videos/anti-aging-treatment-reel.mp4?url";

const AgeJourney = lazy(() =>
  import("@/comparison/a/components/skin/AgeJourney").then((module) => ({ default: module.AgeJourney })),
);
const MAPS =
  "https://www.google.com/maps/search/?api=1&query=Sanjay+Rithik+Baby+Care+and+Skin+Laser+Cosmetology+Hospital+Karur";


function Section({
  id,
  children,
  className,
  tone = "paper",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  tone?: "paper" | "ink" | "sand" | "warm";
}) {
  return (
    <section
      id={id}
      className={cn(
        "section-shell",
        tone === "ink" && "bg-ink text-ink-foreground",
        tone === "sand" && "bg-sand",
        tone === "warm" && "bg-warm",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </section>
  );
}
function Eyebrow({ children, muted = false }: { children: ReactNode; muted?: boolean }) {
  return (
    <p className={cn("eyebrow", muted ? "text-ink-foreground/70" : "text-muted-foreground")}>
      {children}
    </p>
  );
}
function TrackedLink({
  href,
  event,
  source,
  className,
  children,
}: {
  href: string;
  event: string;
  source: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a href={href} className={className} onClick={() => track(event, { source })}>
      {children}
    </a>
  );
}

const heroGridImages = [
  pinkTreatmentRoom,
  pinkLaserTreatment,
  spaRoomTreatment,
  clinicImage,
  legSkincareGlow,
  heroPortrait,
];

function HeroHeaderGrid({ pointer }: { pointer: { x: number; y: number; active: boolean } }) {
  return (
    <div className={`hero-header-grid ${pointer.active ? "has-pointer" : ""}`} aria-hidden="true">
      {heroGridImages.map((image, index) => (
        <img
          key={image}
          src={image}
          alt=""
          className={`hero-grid-tile hero-grid-tile-follower hero-grid-tile-${index + 1}`}
          style={{
            left: `${50 + pointer.x * 30 + (index - 2.5) * 8}%`,
            top: `${38 + pointer.y * 18 + (index % 2 ? 10 : -8)}%`,
            transform: `translate(-50%, -50%) rotate(${pointer.x * 5 + (index - 2.5) * 3}deg)`,
            transitionDelay: `${index * 130}ms`,
          }}
          draggable={false}
        />
      ))}
    </div>
  );
}

export function VersionA({ render, onAgeSelection }: { render: (sections: Record<string, ReactNode>) => ReactNode; onAgeSelection?: (selection: AgeJourneySelection) => void }) {
  const [faceAreas, setFaceAreas] = useState<string[]>([]);
  const [ageJourney, setAgeJourney] = useState<AgeJourneySelection | undefined>();
  const [showSticky, setShowSticky] = useState(false);
  useEffect(() => {
    // GA4 already sends page_view automatically; this only records which landing page loaded.
    track("landing_page_viewed", { landing_page: "laser-hair-reduction-karur" });
    const depths = new Set<number>();
    const onScroll = () => {
      const progress =
        (window.scrollY / Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)) *
        100;
      for (const depth of [25, 50, 75, 90])
        if (progress >= depth && !depths.has(depth)) {
          depths.add(depth);
          track("scroll_depth", { depth });
        }
      const formVisible = ["a-hero-form", "b-consultation"].some((id) => {
        const rect = document.getElementById(id)?.getBoundingClientRect();
        return (
          rect && rect.top < window.innerHeight * 0.8 && rect.bottom > window.innerHeight * 0.2
        );
      });
      setShowSticky(window.scrollY > 250 && !formVisible);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const schema = {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    name: "Sanjay Rithik Hospital",
    telephone: "+918903009723",
    address: {
      "@type": "PostalAddress",
      streetAddress: "77A, Sengunthapuram Main Road",
      addressLocality: "Karur",
      postalCode: "639002",
      addressCountry: "IN",
    },
    medicalSpecialty: "Dermatology",
  };
  return render({
"schema": <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />,
"skip": <a
        href="#b-consultation"
        className="sr-only focus:not-sr-only focus:block focus:bg-card focus:p-4"
      >
        Skip to consultation request
      </a>,
"navigation": <header className="premium-nav">
        <div className="premium-nav-inner">
          <div className="premium-brand-group">
          <a href="#a-top" className="premium-brand" aria-label="Sanjay Rithik Hospital home">
            <img
              src={hospitalLogo}
              alt="Sanjay Rithik Hospital logo"
              width={48}
              height={48}
            />
            <span>
              <strong>Sanjay Rithik Hospital</strong>
              <small>Skin Laser · Cosmetology</small>
            </span>
          </a>
          <div
            className="nav-google-badge"
            aria-label="Sanjay Rithik Hospital, Karur: rated 4.5 from 447 reviews"
          >
            <MapPin className="nav-google-icon" aria-hidden="true" />
            <span className="nav-google-place">Karur</span>
            <span className="nav-google-rating">
              4.5 <Star className="size-3 fill-current" />
            </span>
          </div>
          </div>
          <TrackedLink
            href="#a-hero-form"
            event="consultation_cta_clicked"
            source="navigation"
            className="premium-nav-cta"
          >
            <span className="nav-cta-long">Request Free Consultation</span>
            <span className="nav-cta-short">Request</span> <ArrowRight />
          </TrackedLink>
        </div>
      </header>,
"hero": <section
        id="a-top"
        className="premium-hero hero-card-layout relative isolate overflow-hidden"
        style={{ width: "100vw", maxWidth: "none", marginLeft: "calc(50% - 50vw)" }}
      >
        <HeroParticles />
        <div className="hero-inner premium-hero-inner hero-card-inner">
          <div className="hero-copy premium-hero-copy">
            <p className="premium-kicker">Laser hair reduction · Karur</p>
            <h1 className="hero-split-title">
              Tired of waxing, shaving,
              <span className="hero-title-sub">
                or threading <em>again and again?</em>
              </span>
            </h1>
            <p className="premium-hero-text">
              Wish hair removal took up less of your time? Explore laser hair reduction with Dr. S.
              Kiruthika at Sanjay Rithik Hospital, Karur. Ask what may suit your skin, how many
              visits may be needed, and what it could cost.
            </p>
            <div className="premium-hero-actions">
              <Button variant="clay" size="xl" asChild>
                <TrackedLink href="#a-hero-form" event="consultation_cta_clicked" source="hero">
                  Request My Free Consultation <ArrowRight />
                </TrackedLink>
              </Button>
              <Button variant="outline" size="xl" className="premium-secondary-cta" asChild>
                <TrackedLink href="#b-skin-check" event="assessment_cta_clicked" source="hero">
                  Explore My Hair Removal Concerns
                </TrackedLink>
              </Button>
            </div>
            <p className="hero-reassure">
              No payment online. No need to choose a treatment today.
            </p>
            <p className="hero-hours">
              <Clock3 className="size-4" /> Open daily 10 am–2:30 pm · 6–9:30 pm
            </p>
          </div>
          <figure className="hero-card">
            <div className="hero-card-frame">
              <img
                src={heroSkinTowel}
                alt="Illustration of a relaxed woman with smooth skin (not a patient result)"
                className="hero-card-image"
                fetchPriority="high"
                draggable={false}
              />
            </div>
            <div className="hero-card-badge hero-card-badge-main">
              <strong>1 Lakh+ patients at the hospital</strong>
              <span>13+ years of experience</span>
            </div>
            <div className="hero-card-badge hero-card-badge-rating">
              <strong>4.5★</strong>
              <span>447 Google reviews</span>
            </div>
          </figure>
        </div>
      </section>,
"offer-form": <Section id="a-offer" tone="sand" className="offer-form-section">
        <div className="offer-form-grid">
          <Reveal>
            <p className="section-pill">Free consultation</p>
            <h2 className="mt-5 text-4xl leading-[1.08] sm:text-5xl">
              Want to ask a skin doctor in Karur first?
            </h2>
            <p className="mt-5 leading-relaxed text-muted-foreground">
              Tell Dr. Kiruthika what you would like help with. Discuss what may suit you, possible
              risks, the visits involved, and the cost before deciding.
            </p>
            <ul className="offer-includes mt-7">
              {[
                "Ask whether laser hair reduction may suit your skin and hair",
                "Hear how many visits may be needed and what it could cost",
                "No payment online, and no need to choose a treatment today",
              ].map((item) => (
                <li key={item}>
                  <Check className="offer-includes-icon" aria-hidden="true" /> {item}
                </li>
              ))}
            </ul>
            <div className="offer-contact mt-7">
              <TrackedLink href="https://wa.me/918903009723?text=Hello%2C%20I%20have%20a%20question%20about%20laser%20hair%20reduction." event="whatsapp_clicked" source="a-offer">
                <WhatsAppIcon size={16} /> Ask a Question on WhatsApp
              </TrackedLink>
              <span>
                <MapPin className="size-4" /> 77A, Sengunthapuram Main Road, Karur
              </span>
            </div>
          </Reveal>
          <div id="a-hero-form" className="offer-form-card">
            <LeadForm source="hero" />
          </div>
        </div>
      </Section>,
"clinic-facts": <div className="border-b border-border bg-sand px-5 py-5">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-x-8 gap-y-3 text-sm">
          <span className="flex items-center gap-2">
            <Star className="size-4 fill-current" /> 4.5 · 447 Google reviews
          </span>
          <span className="flex items-center gap-2">
            <ShieldCheck className="size-4" /> Dr. S. Kiruthika, MBBS, DDVL
          </span>
          <span className="flex items-center gap-2">
            <HeartHandshake className="size-4" /> Free consultation · 13 years’ experience
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="size-4" /> 77A, Sengunthapuram Main Road, Karur
          </span>
        </div>
      </div>,
"trust": <TrustStrip />,
"pain": <PainMirror />,
"relief": <Relief />,
"doctor": <DoctorSection />,
"doctor-video": <DoctorVideoSection />,
"advanced-treatments": <AdvancedTreatmentsSection />,
"laser-areas": <LaserAreasSection />,
"laser-benefits": <LaserBenefitsSection />,
"video-testimonials": <VideoTestimonialsSection />,
"benefits": <BenefitsSection />,
"why-choose": <WhyChooseSection />,
"testimonials": <TestimonialGrid />,
"before-after": <BeforeAfterGallery />,
"face": <FaceExplorer selected={faceAreas} onChange={setFaceAreas} />,
"treatments": <TreatmentExplorer />,
"age": <Section id="a-age-journey" tone="sand">
        <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
          <div>
            <Eyebrow muted>Separate educational tool · not about laser results</Eyebrow>
            <h2 className="mt-4 text-4xl">Curious about how faces change with age?</h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-ink-foreground/75">
              Explore natural age-related facial changes with the sample or your own photo.
              This educational visual simulation is not a prediction of ageing or treatment results.
            </p>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-relaxed">
              This is a visual illustration. It does not predict how you will age or show what
              treatment will do.
            </p>
          </div>
        </div>
          <div id="a-age-preview-panel" className="mt-8">
            <Suspense fallback={<p role="status">Loading age preview…</p>}>
              <AgeJourney onSelection={(selection) => { setAgeJourney(selection); onAgeSelection?.(selection); }} />
            </Suspense>
          </div>
      </Section>,
"video": <CinematicInterlude />,
"questions": <Questions />,
"proof": <Proof />,
"clinic": <Section id="a-clinic" tone="sand">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <figure>
            <img
              src={clinicImage}
              alt="Sanjay Rithik Hospital in Karur, Tamil Nadu"
              width={1280}
              height={854}
              loading="lazy"
              className="aspect-[3/2] w-full rounded-3xl object-cover"
            />
            <figcaption className="mt-3 text-xs text-muted-foreground">
              Hospital photograph from the official website.
            </figcaption>
          </figure>
          <div>
            <Eyebrow>Visit us</Eyebrow>
            <h2 className="mt-4 text-4xl">
              Where can you find us in Karur?
            </h2>
            <p className="mt-5 leading-relaxed">
              <strong>Sanjay Rithik Hospital</strong><br />77A, Sengunthapuram Main Road,
              <br />
              Karur 639002.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Open daily 10 am–2:30 pm and 6–9:30 pm. Contact the clinic to confirm the doctor’s
              availability and arrange your consultation.
            </p>
          </div>
        </div>
      </Section>,
"close": <FinalClose />,
"consultation": <Section id="a-consultation" tone="ink">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <Eyebrow muted>Your next step</Eyebrow>
            <h2 className="mt-4 text-5xl">
              Let’s talk about
              <br />
              your skin.
            </h2>
            <p className="mt-5 max-w-md leading-relaxed text-ink-foreground/75">
              You don’t need to choose a procedure first. Start with a consultation and ask the
              questions that matter to you.
            </p>
            <ol className="mt-7 space-y-4 text-sm">
              {[
                "Send your name and mobile number.",
                "Arrange your free consultation with the clinic.",
                "Meet the dermatologist and understand your options.",
              ].map((step, i) => (
                <li key={step} className="flex gap-3">
                  <span className="text-clay">0{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
          <div id="a-final-consultation">
            <LeadForm source="final" ageJourney={ageJourney} faceAreas={faceAreas} />
          </div>
        </div>
      </Section>,
"footer": <footer className="bg-ink px-5 py-8 text-ink-foreground/75 sm:px-8">
        <div className="mx-auto max-w-6xl border-t border-white/15 pt-6 text-xs leading-relaxed">
          <div className="flex flex-wrap justify-between gap-4">
            <p>Sanjay Rithik Hospital · Dermatology · Karur</p>
            <div className="flex flex-wrap gap-5">
              <a
                href="tel:+918903009723"
                onClick={() => track("phone_clicked", { source: "footer" })}
              >
                +91 89030 09723
              </a>
              <a
                href="mailto:info@sanjayrithikhospital.com"
                onClick={() => track("email_clicked", { source: "footer" })}
              >
                info@sanjayrithikhospital.com
              </a>
              <a
                href="https://sanjayrithikhospital.com/"
                target="_blank"
                rel="noreferrer"
                onClick={() => track("hospital_website_clicked", { source: "footer" })}
                className="underline"
              >
                Hospital website
              </a>
            </div>
          </div>
          <p className="mt-4">
            Educational information. Treatment suitability and results vary and are discussed at
            consultation.
          </p>
          <details className="mt-4 max-w-3xl">
            <summary className="cursor-pointer underline">About your enquiry and photos</summary>
            <p className="mt-3">
              The enquiry form sends your contact details, optional skin concern and any selected
              facial areas or age-preview interest to the clinic’s enquiry system. Campaign and
              device information are included to understand where enquiries come from. Photos are
              processed separately only when you consent and select Generate. For questions about
              your information, contact the hospital using the details above.
            </p>
          </details>
        </div>
      </footer>,
"sticky": <>
        {showSticky && (
        <div className="fixed inset-x-0 bottom-0 z-50 flex gap-2 border-t border-border bg-card/95 px-4 pb-[max(.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur md:hidden">
          <Button variant="outline" size="pill" className="w-12 flex-none px-0" asChild>
            <TrackedLink href="https://wa.me/918903009723?text=Hello%2C%20I%20would%20like%20to%20book%20a%20free%20skin%20consultation." event="whatsapp_clicked" source="sticky">
              <WhatsAppIcon /> <span className="sr-only">WhatsApp the clinic</span>
            </TrackedLink>
          </Button>
          <Button variant="ink" size="pill" className="flex-1 whitespace-nowrap" asChild>
            <TrackedLink href="#a-hero-form" event="consultation_cta_clicked" source="sticky">
              Free Consultation
            </TrackedLink>
          </Button>
        </div>
        )}
        <a
          href="https://wa.me/918903009723?text=Hello%2C%20I%20would%20like%20to%20book%20a%20free%20skin%20consultation."
          target="_blank"
          rel="noreferrer"
          onClick={() => track("whatsapp_clicked", { source: "floating" })}
          className="floating-whatsapp"
          aria-label="WhatsApp Sanjay Rithik Hospital"
        >
          <WhatsAppIcon size={26} />
          <span>WhatsApp us</span>
        </a>
      </>
});
}

function TrustStrip() {
  return (
    <section className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-5 py-5 text-center text-xs text-muted-foreground sm:px-8 sm:text-sm">
        <span className="flex items-center gap-2 font-medium text-foreground">
          <ShieldCheck className="size-4 shrink-0 text-clay" aria-hidden="true" />
          Dr. S. Kiruthika · Dermatologist
        </span>
        <span className="flex items-center gap-2">
          <MapPin className="size-4 shrink-0 text-clay" aria-hidden="true" />
          Sanjay Rithik Hospital, Karur
        </span>
        <span>13 years experience · 1 Lakh+ satisfied patients</span>
        <a
          href={MAPS}
          target="_blank"
          rel="noreferrer"
          onClick={() => track("clinic_rating_clicked", { source: "trust_strip" })}
          className="flex items-center gap-2 text-clay hover:underline"
        >
          <Star className="size-4 shrink-0 fill-current" aria-hidden="true" />
          4.5 · 447 Google reviews
        </a>
      </div>
    </section>
  );
}

const MIRROR_MOMENTS = [
  ["The mirror", "You notice your skin looks different under certain lighting."],
  [
    "The photograph",
    "You zoom in and notice lines or texture you hadn't paid attention to before.",
  ],
  ["The tired look", "People ask whether you're tired—even when you're feeling fine."],
  [
    "The skincare shelf",
    "Creams, serums and recommendations have accumulated, but clarity hasn't.",
  ],
];

function PainMirror() {
  const ref = useSectionView<HTMLDivElement>("pain_mirror_viewed");
  return (
    <div ref={ref}>
      <Section tone="paper">
        <div className="grid gap-12 lg:grid-cols-[.88fr_1.12fr] lg:items-center lg:gap-20">
          <Reveal>
            <img
              src={mirrorImage}
              alt="Woman quietly noticing changes in her reflection"
              loading="lazy"
              width={1200}
              height={800}
              className="h-[28rem] w-full rounded-3xl object-cover shadow-lift sm:h-[36rem]"
            />
          </Reveal>
          <Reveal delay={100}>
            <Eyebrow>Recognition</Eyebrow>
            <h2 className="mt-5 text-4xl leading-[1.04] sm:text-5xl">
              Sometimes the first thing you notice isn't a wrinkle.
            </h2>
            <div className="mt-8">
              {MIRROR_MOMENTS.map(([title, body]) => (
                <div key={title} className="border-t border-border py-4">
                  <p className="font-medium">{title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
                </div>
              ))}
            </div>
            <blockquote className="mt-8 border-l-2 border-clay pl-5 text-lg leading-relaxed">
              The frustrating part isn't simply seeing change.{" "}
              <span className="block text-clay">It's not knowing what to do about it.</span>
            </blockquote>
            <p className="mt-6 text-sm font-medium">That's where clarity begins.</p>
          </Reveal>
        </div>
      </Section>
    </div>
  );
}

function Relief() {
  return (
    <Section tone="ink" className="relative overflow-hidden">
      <div className="absolute -right-20 top-10 size-80 rounded-full bg-clay/10 blur-3xl" />
      <Reveal className="relative mx-auto max-w-4xl text-center">
        <Eyebrow muted>Relief before treatment</Eyebrow>
        <h2 className="mt-5 text-5xl leading-[1.02] sm:text-[4.5rem]">
          Ageing isn't a skin failure.
        </h2>
        <p className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-ink-foreground/66">
          Collagen, elasticity, hydration, pigmentation and facial volume can all change over time.
          None of that means you've done something wrong.
        </p>
        <div className="mx-auto mt-10 max-w-2xl rounded-3xl border border-white/10 bg-white/[0.04] p-7 text-left sm:p-9">
          <p className="text-sm text-ink-foreground/50">The question isn't:</p>
          <p className="mt-2 font-display text-3xl">“How do I stop ageing?”</p>
          <p className="mt-6 text-sm text-ink-foreground/50">A better question is:</p>
          <p className="mt-2 font-display text-3xl text-clay">
            “What can I realistically improve—and what is appropriate for my skin?”
          </p>
        </div>
        <Button variant="clay" size="xl" className="mt-9" asChild>
          <TrackedLink href="#a-face-explorer" event="hero_assessment_click" source="relief">
            Check My Skin <ArrowRight />
          </TrackedLink>
        </Button>
      </Reveal>
    </Section>
  );
}

function CinematicInterlude() {
  const videos = [
    {
      label: "Anti-aging treatment options",
      src: antiAgingReelVideo,
      caption: "From the clinic's Instagram — not every concern needs the same treatment.",
    },
  ];
  const [activeVideo, setActiveVideo] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const selectedVideo = videos[activeVideo]!;
  const steps = [
    "Tell us what concerns you",
    "Meet the dermatologist",
    "Your skin and priorities are assessed",
    "Appropriate options and expectations are explained",
    "You decide what feels right",
  ];
  const viewRef = useSectionView<HTMLDivElement>("cinematic_interlude_viewed");
  return (
    <div ref={viewRef}>
      <Section tone="ink" className="relative overflow-hidden">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-16">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-white/10">
              <video
                ref={videoRef}
                key={selectedVideo.src}
                src={selectedVideo.src}
                muted
                playsInline
                controls
                preload="none"
                poster={heroImage}
                aria-label={selectedVideo.label}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                className="aspect-[9/16] w-full object-cover"
              />
              {!isPlaying && (
                <button
                  type="button"
                  onClick={() => {
                    videoRef.current?.play();
                    track("cinematic_video_played", { video: selectedVideo.label });
                  }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink/15 text-white transition-colors hover:bg-ink/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-clay"
                  aria-label={`Play ${selectedVideo.label} video`}
                >
                  <span className="flex size-16 items-center justify-center rounded-full border border-white/40 bg-ink/75 shadow-xl backdrop-blur">
                    <Play className="ml-1 size-6 fill-current" />
                  </span>
                  <span className="rounded-full bg-ink/70 px-4 py-2 text-xs font-medium backdrop-blur">
                    Play video
                  </span>
                </button>
              )}
            </div>
            {videos.length > 1 && (
              <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {videos.map((video, index) => (
                  <button
                    key={video.label}
                    type="button"
                    aria-pressed={activeVideo === index}
                    onClick={() => {
                      setActiveVideo(index);
                      setIsPlaying(false);
                      track("cinematic_video_selected", { video: video.label });
                    }}
                    className={cn(
                      "min-h-11 shrink-0 rounded-full border px-4 py-2 text-xs transition-colors",
                      activeVideo === index
                        ? "border-clay bg-clay text-clay-foreground"
                        : "border-white/15 text-ink-foreground/60 hover:border-white/35",
                    )}
                  >
                    {video.label}
                  </button>
                ))}
              </div>
            )}
            <p className="mt-3 text-center text-[0.65rem] leading-relaxed text-ink-foreground/40">
              {selectedVideo.caption}
            </p>
          </Reveal>
          <Reveal delay={100}>
            <Eyebrow muted>A clear, low-pressure next step</Eyebrow>
            <h2 className="mt-5 text-5xl leading-[1.02] sm:text-6xl">
              What happens when you book?
            </h2>
            <div className="mt-10 space-y-0">
              {steps.map((step, index) => (
                <div
                  key={step}
                  className="grid grid-cols-[2.5rem_1fr] gap-4 border-t border-white/10 py-4"
                >
                  <span className="font-display text-clay">0{index + 1}</span>
                  <span
                    className={cn(
                      "text-sm",
                      index > 1 ? "text-ink-foreground" : "text-ink-foreground/55",
                    )}
                  >
                    {step}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-8 rounded-3xl border border-clay/25 bg-clay/10 p-6">
              <p className="font-display text-3xl text-clay">
                A consultation is not a commitment to treatment.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink-foreground/60">
                It is a conversation to understand your skin, your options and what you may—or may
                not—want to do next.
              </p>
            </div>
          </Reveal>
        </div>
      </Section>
    </div>
  );
}

function Proof() {
  const ref = useSectionView<HTMLDivElement>("proof_section_viewed");
  return (
    <div ref={ref}>
      <Section id="a-why-hospital" tone="paper">
        <Reveal className="max-w-3xl">
          <Eyebrow>Why Sanjay Rithik Hospital</Eyebrow>
          <h2 className="mt-5 text-4xl leading-[1.04] sm:text-5xl">
            Local care, clear information and a real team you can reach.
          </h2>
          <p className="mt-5 leading-relaxed text-muted-foreground">
            Credibility here is based on the hospital's published information and supplied clinic
            materials. Clinical outcome claims remain separate until consented evidence is
            available.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          <Reveal>
            <article className="verification-card">
              <div className="flex size-11 items-center justify-center rounded-full bg-sand text-clay">
                <ShieldCheck className="size-5" />
              </div>
              <h3 className="mt-5 text-3xl">Clinic context</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                The official website describes Sanjay Rithik Hospital as a 24×7 Karur hospital with
                skin care, anti-aging solutions and cosmetology services.
              </p>
              <p className="mt-5 text-xs text-muted-foreground">
                Source: official hospital website
              </p>
            </article>
          </Reveal>
          <Reveal delay={80}>
            <article className="verification-card">
              <div className="flex size-11 items-center justify-center rounded-full bg-sand text-clay">
                <Check className="size-5" />
              </div>
              <h3 className="mt-5 text-3xl">Published experience</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                The site currently states 13 years of skin-treatment experience and 1 Lakh+ satisfied patients.
                These are clinic-published claims, not independent outcome measures.
              </p>
              <p className="mt-5 text-xs text-muted-foreground">
                Source: official hospital website
              </p>
            </article>
          </Reveal>
          <Reveal delay={140}>
            <article className="verification-card">
              <div className="flex size-11 items-center justify-center rounded-full bg-sand text-clay">
                <MapPin className="size-5" />
              </div>
              <h3 className="mt-5 text-3xl">Karur contact</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                77A, Sengunthapuram Main Road, Karur 639002.
              </p>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                +91 89030 09723
                <br />
                info@sanjayrithikhospital.com
              </p>
            </article>
          </Reveal>
        </div>
        <Reveal className="mt-8">
          <div className="flex flex-wrap gap-3">
            {[
              "Dermatology care",
              "Anti-aging solutions",
              "Cosmetology services",
              "Karur location",
              "24×7 hospital",
            ].map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs"
              >
                <Check className="size-3 text-clay" />
                {item}
              </span>
            ))}
          </div>
        </Reveal>
        <Reveal className="mt-8">
          <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-sand text-clay">
                <Star className="size-5 fill-current" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-medium">4.5 · 447 Google reviews</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Supplied clinic-listing snapshot—not clinical outcome evidence.
                </p>
              </div>
            </div>
            <span className="inline-flex min-h-11 items-center justify-center rounded-full border border-clay/30 px-5 text-sm font-medium text-clay">
              Verified on Google
            </span>
          </div>
        </Reveal>
      </Section>
    </div>
  );
}

function FinalClose() {
  const ref = useSectionView<HTMLDivElement>("final_close_viewed");
  return (
    <div ref={ref}>
      <Section tone="sand" className="text-center">
        <Reveal className="mx-auto max-w-4xl">
          <Eyebrow>Your safest next step</Eyebrow>
          <h2 className="mt-5 text-5xl leading-[1.02] sm:text-[4.6rem]">
            You don't have to decide on a treatment today.
          </h2>
          <p className="mt-8 font-display text-4xl text-clay sm:text-5xl">Start with clarity.</p>
          <div className="mx-auto mt-9 grid max-w-3xl gap-3 sm:grid-cols-2">
            {[
              "Meet the dermatologist.",
              "Understand your options.",
              "Ask your questions.",
              "Decide what feels right for you.",
            ].map((item) => (
              <p key={item} className="rounded-2xl border border-border bg-card px-5 py-4 text-sm">
                {item}
              </p>
            ))}
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            The booking form below requests a consultation—not a treatment.
          </p>
        </Reveal>
      </Section>
    </div>
  );
}

function DoctorSection() {
  return (
    <Section id="a-doctor" tone="warm">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <figure>
          <img
            src={doctorSectionImage}
            alt="Dr. S. Kiruthika, dermatologist at Sanjay Rithik Hospital in Karur"
            width={1280}
            height={854}
            loading="lazy"
            className="aspect-[4/3] w-full rounded-3xl object-cover"
          />
          <figcaption className="mt-3 text-xs text-muted-foreground">
            Dr. S. Kiruthika · Sanjay Rithik Hospital, Karur
          </figcaption>
        </figure>
        <div>
          <Eyebrow muted>Your dermatologist</Eyebrow>
          <h2 className="mt-4 text-4xl sm:text-5xl">Who can answer your questions in Karur?</h2>
          <p className="mt-3 text-sm font-medium">MBBS, DDVL · Dermatologist &amp; Cosmetologist · 13 years’ experience</p>
          <p className="mt-5 leading-relaxed text-muted-foreground">
            Dr. S. Kiruthika has treated skin, hair and nail conditions for 13 years at Sanjay Rithik
            Hospital, Karur. She provides laser hair reduction and checks your skin and hair before
            recommending anything. The hospital also offers care for acne, pigmentation, hair fall
            and other skin concerns.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              "Assessment", "Options", "Expectations", "Your decision",
            ].map((text, index) => (
              <li key={text} className="flex gap-3">
                <span className="text-clay">0{index + 1}</span>
                {text}
              </li>
            ))}
          </ul>
          <Button variant="clay" size="xl" className="mt-7" asChild>
            <TrackedLink href="#a-hero-form" event="consultation_cta_clicked" source="a-doctor">
              Request My Free Consultation <ArrowRight />
            </TrackedLink>
          </Button>
        </div>
      </div>
    </Section>
  );
}
function Questions() {
  const questions = [
    [
      "How much does a consultation cost?",
      "The dermatologist consultation is free. Treatment costs depend on your concern and the number of sessions, and are explained before anything begins. This page does not collect payment.",
    ],
    [
      "Do I need to know which treatment I want?",
      "No. Tell the dermatologist what you’ve noticed and what you would like to discuss. You can ask about suitable options during your visit.",
    ],
    [
      "Does sending an enquiry confirm my appointment?",
      "No. The clinic will contact you to arrange a suitable date and confirm the appointment. You can also call or WhatsApp directly.",
    ],
    [
      "Will I need time off after treatment?",
      "Recovery depends on the procedure and your skin. Discuss expected downtime and aftercare with the dermatologist before deciding.",
    ],
    [
      "Do I have to upload a photo?",
      "No. You can request a consultation without using either interactive tool. The optional age preview asks for separate permission before processing your photo.",
    ],
    [
      "Does the age preview show my treatment result?",
      "No. It is a visual simulation for exploration, not a medical assessment or a prediction of your treatment outcome.",
    ],
  ];
  return (
    <Section id="a-questions">
      <div className="mx-auto max-w-3xl">
        <Eyebrow>Before you visit</Eyebrow>
        <h2 className="mt-4 text-4xl">Your consultation questions, answered.</h2>
        <div className="mt-8">
          {questions.map(([question, answer]) => (
            <details
              key={question}
              className="border-t border-border py-5"
              onToggle={(event) => {
                if (event.currentTarget.open) track("faq_opened", { question });
              }}
            >
              <summary className="cursor-pointer pr-5 text-base font-medium">{question}</summary>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}

const FACE_AREAS = [
  {
    id: "forehead",
    label: "Forehead",
    concern: "Forehead — fine lines when you raise your eyebrows",
    explanation:
      "Fine lines may become more noticeable as collagen, hydration and repeated expression patterns change.",
    hotspot: "left-[42%] top-[24%]",
  },
  {
    id: "around-eyes",
    label: "Around eyes",
    concern: "Eye area — fine lines and a tired look",
    explanation:
      "The eye area is delicate. Fine lines may become more visible as hydration and elasticity change over time.",
    hotspot: "left-[58%] top-[36%]",
  },
  {
    id: "cheeks",
    label: "Cheeks",
    concern: "Cheeks — rough skin, dark spots or less fullness",
    explanation:
      "Changes in texture, pigmentation, firmness or facial volume can affect how light reflects from the cheeks.",
    hotspot: "left-[54%] top-[47%]",
  },
  {
    id: "around-mouth",
    label: "Around mouth",
    concern: "Mouth area — fine lines and less fullness",
    explanation:
      "Repeated movement, skin quality and structural changes can all influence lines around the mouth.",
    hotspot: "left-[43%] top-[56%]",
  },
  {
    id: "jawline",
    label: "Jawline",
    concern: "Jawline — loose skin and a softer outline",
    explanation:
      "Changes in elasticity and facial support may gradually soften the definition of the jawline.",
    hotspot: "left-[53%] top-[64%]",
  },
  {
    id: "overall-face",
    label: "Overall face",
    concern: "Whole face — dullness and uneven skin texture",
    explanation:
      "Dullness, pores, uneven tone and hydration can combine to make skin look more tired.",
    hotspot: "left-[48%] top-[43%]",
  },
] as const;

function SkinAreaPhoto({ area }: { area: string }) {
  const positions: Record<string, string> = {
    Forehead: "42% 23%",
    "Around eyes": "40% 34%",
    Cheeks: "57% 47%",
    "Around mouth": "30% 57%",
    Jawline: "65% 67%",
    "Overall face": "45% 43%",
  };
  return (
    <span
      aria-hidden="true"
      className="brand-photo block size-12 shrink-0 rounded-xl bg-cover ring-1 ring-current/15"
      style={{
        backgroundImage: `url(${heroImage})`,
        backgroundSize: area === "Overall face" ? "140%" : "300%",
        backgroundPosition: positions[area] ?? "center",
      }}
    />
  );
}

function FaceExplorer({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (areas: string[]) => void;
}) {
  const [activeId, setActiveId] = useState<string>(selected[0] ?? "around-eyes");
  const active = FACE_AREAS.find((area) => area.id === activeId) ?? FACE_AREAS[1];
  const photoFocus: Record<string, { x: number; y: number; zoom: number }> = {
    forehead: { x: 42, y: 24, zoom: 260 },
    "around-eyes": { x: 48, y: 36, zoom: 260 },
    cheeks: { x: 54, y: 47, zoom: 280 },
    "around-mouth": { x: 43, y: 56, zoom: 300 },
    jawline: { x: 53, y: 64, zoom: 240 },
    "overall-face": { x: 50, y: 42, zoom: 115 },
  };
  const focus = photoFocus[active.id]!;

  function toggleArea(id: string, label: string) {
    const exists = selected.includes(label);
    const next = exists ? selected.filter((item) => item !== label) : [...selected, label];
    if (selected.length === 0) track("face_explorer_started");
    onChange(next);
    setActiveId(id);
    track("face_area_selected");
    track("concern_selected");
  }

  return (
    <Section id="a-face-explorer" tone="sand">
      <div className="grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:gap-20">
        <Reveal>
          <Eyebrow>Make it personal</Eyebrow>
          <h2 className="mt-5 text-4xl leading-[1.04] sm:text-5xl">
            Facial skin — where are you noticing changes?
          </h2>
          <p className="mt-5 leading-relaxed text-muted-foreground">
            Choose every area that feels relevant. This does not diagnose your skin—it simply helps
            you organise what you would like to discuss at consultation.
          </p>
          <div className="mt-7 grid grid-cols-2 gap-2 lg:hidden">
            {FACE_AREAS.map((area) => (
              <button
                key={area.id}
                type="button"
                aria-pressed={selected.includes(area.label)}
                onClick={() => toggleArea(area.id, area.label)}
                className={cn(
                  "min-h-14 rounded-2xl border px-4 py-3 text-left text-sm transition-colors",
                  selected.includes(area.label)
                    ? "border-clay bg-clay text-clay-foreground"
                    : "border-border bg-card",
                )}
              >
                <span className="flex items-center gap-3">
                  <SkinAreaPhoto area={area.label} />
                  {area.label}
                </span>
              </button>
            ))}
          </div>
          <figure className="mt-7 overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
            <div className="relative aspect-[2/1] overflow-hidden bg-ink">
              <img
                src={heroImage}
                alt={`Close-up of ${active.label.toLowerCase()} — illustrative facial area`}
                width={1200}
                height={1504}
                loading="lazy"
                className="brand-photo absolute left-1/2 top-1/2 h-auto max-w-none"
                style={{ width: `${focus.zoom}%`, transform: `translate(-${focus.x}%, -${focus.y}%)` }}
              />
            </div>
            <figcaption className="px-4 py-2 text-xs text-muted-foreground">
              {active.label} · Illustrative close-up, not a treatment result.
            </figcaption>
          </figure>
          <div className="mt-4 min-h-40 rounded-3xl border border-border bg-card p-6 shadow-soft" aria-live="polite">
            <p className="eyebrow text-clay">{active.label}</p>
            <p className="mt-2 font-display text-2xl">{active.concern}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {active.explanation}
            </p>
          </div>
          {selected.length > 0 && (
            <div className="mt-5 rounded-2xl bg-ink p-5 text-ink-foreground" aria-live="polite">
              <p className="text-sm font-medium">We’ll share these with the consultation team.</p>
              <p className="mt-2 text-xs leading-relaxed text-ink-foreground/60">
                {selected.join(" · ")}
              </p>
            </div>
          )}
          <Button variant="ink" size="xl" className="mt-7" asChild>
            <TrackedLink
              href="#b-treatment-options"
              event="treatment_options_click"
              source="face_explorer"
            >
              Explore Options <ArrowRight />
            </TrackedLink>
          </Button>
        </Reveal>
        <Reveal delay={100} className="ml-auto hidden w-full max-w-[30rem] lg:block">
          <div className="relative aspect-[1200/1504] w-full overflow-hidden rounded-[2rem] border border-border bg-card shadow-lift">
            <img
              src={heroImage}
              alt="Portrait with selectable forehead, eye, cheek, mouth and jawline areas"
              loading="lazy"
              width={1200}
              height={1504}
              className="brand-photo absolute inset-0 h-full w-full object-cover"
            />
            <div>
              {FACE_AREAS.filter((area) => area.id !== "overall-face").map((area) => (
                <button
                  key={area.id}
                  type="button"
                  aria-label={`${area.label}: ${area.concern}`}
                  title={area.label}
                  aria-pressed={selected.includes(area.label)}
                  onClick={() => toggleArea(area.id, area.label)}
                  className={cn(
                    "absolute flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 shadow-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white",
                    area.hotspot,
                    selected.includes(area.label)
                      ? "border-white bg-clay text-clay-foreground"
                      : "border-white bg-ink/75 text-white hover:bg-clay hover:text-clay-foreground",
                  )}
                >
                  <span className="size-2 rounded-full bg-current" />
                </button>
              ))}
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Select a hotspot to explore that facial area.
          </p>
          <button
            type="button"
            aria-pressed={selected.includes("Overall face")}
            onClick={() => toggleArea("overall-face", "Overall face")}
            className={cn(
              "mx-auto mt-4 flex min-h-11 items-center gap-2 rounded-full border px-5 py-3 text-sm transition-colors",
              selected.includes("Overall face")
                ? "border-ink bg-ink text-ink-foreground"
                : "border-border bg-card hover:border-ink",
            )}
          >
            {selected.includes("Overall face") && <Check className="size-4" />}
            Overall face
          </button>
        </Reveal>
      </div>
    </Section>
  );
}

const TREATMENTS = [
  {
    concern: "Fine Lines",
    title: "Forehead & eyes — fine lines",
    area: "Around eyes",
    noticing: "Lines that remain visible around the eyes, forehead or mouth—even when relaxed.",
    why: "Skin hydration, collagen and elasticity can change over time, while repeated facial movement can make some lines more noticeable.",
    options: ["MNRF", "PRP-based approaches", "Mesotherapy", "Chemical peels"],
  },
  {
    concern: "Firmness",
    title: "Cheeks & jawline — loose skin",
    area: "Jawline",
    noticing:
      "A softer-looking jawline, reduced bounce or skin that does not feel as firm as before.",
    why: "Elasticity, collagen and deeper facial support can all influence firmness—not only the skin surface.",
    options: ["Non-surgical facelift approaches", "MNRF", "PRP-based approaches"],
  },
  {
    concern: "Pigmentation",
    title: "Facial skin — dark spots & uneven colour",
    area: "Cheeks",
    noticing: "Uneven patches, spots or areas of colour that make the complexion look less even.",
    why: "Melanin activity can be influenced by sun exposure, inflammation, hormones and individual skin factors.",
    options: ["Chemical peels", "Medifacials", "Microdermabrasion"],
  },
  {
    concern: "Texture",
    title: "Cheeks & nose — rough skin & visible pores",
    area: "Cheeks",
    noticing:
      "Visible pores, roughness or skin that looks less smooth in photographs and certain lighting.",
    why: "Texture can reflect pores, dehydration, collagen change, congestion or a combination of factors.",
    options: ["MNRF", "Microdermabrasion", "Chemical peels", "Medifacials"],
  },
  {
    concern: "Tired / Dull Appearance",
    title: "Facial skin — dull or tired-looking skin",
    area: "Overall face",
    noticing: "Skin that appears tired, flat or less fresh even when you feel well-rested.",
    why: "Hydration, surface build-up, pigmentation, skin turnover and lifestyle factors can all affect how light reflects from the face.",
    options: ["Medifacials", "Aqua facial", "Microdermabrasion", "Chemical peels"],
  },
  {
    concern: "Overall Rejuvenation",
    title: "Whole face — several signs of ageing",
    area: "Overall face",
    noticing:
      "Several subtle changes in freshness, firmness, tone or texture rather than one main concern.",
    why: "Visible ageing often involves more than one layer, so a balanced plan may prioritise several small improvements.",
    options: ["PRP-based approaches", "Mesotherapy", "MNRF", "Aqua facial"],
  },
];

function TreatmentExplorer() {
  const [active, setActive] = useState(0);
  const selected = TREATMENTS[active]!;
  return (
    <Section id="a-treatment-options" tone="sand">
      <Reveal className="max-w-3xl">
        <Eyebrow>Explore by concern</Eyebrow>
        <h2 className="mt-5 text-4xl leading-[1.04] sm:text-5xl">
          Facial skin concerns - explore your treatment options.
        </h2>
        <p className="mt-5 leading-relaxed text-muted-foreground">
          The dermatologist can explain which options are suitable for your skin, along with their
          cost, recovery and expected results.
        </p>
      </Reveal>
      <Reveal delay={80} className="mt-10">
        <div className="grid gap-5 lg:grid-cols-[.72fr_1.28fr]">
          <div
            className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible"
            role="tablist"
            aria-label="Anti-aging concerns"
          >
            {TREATMENTS.map((item, index) => (
              <button
                key={item.concern}
                type="button"
                role="tab"
                aria-selected={active === index}
                id={`concern-tab-${index}`}
                aria-controls="a-concern-detail"
                tabIndex={active === index ? 0 : -1}
                onKeyDown={(event) => {
                  const change = (
                    { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 } as Record<
                      string,
                      number
                    >
                  )[event.key];
                  if (change !== undefined || event.key === "Home" || event.key === "End") {
                    event.preventDefault();
                    const next =
                      event.key === "Home"
                        ? 0
                        : event.key === "End"
                          ? TREATMENTS.length - 1
                          : (active + (change ?? 0) + TREATMENTS.length) % TREATMENTS.length;
                    setActive(next);
                    document.getElementById(`concern-tab-${next}`)?.focus();
                  }
                }}
                onClick={() => {
                  setActive(index);
                  track("treatment_explored", { concern: item.concern });
                  track("concern_explored", { concern: item.concern });
                }}
                className={cn(
                  "min-h-12 shrink-0 rounded-2xl border px-5 py-3 text-left text-sm font-medium transition-colors lg:w-full",
                  active === index
                    ? "border-ink bg-ink text-ink-foreground"
                    : "border-border bg-card hover:border-clay",
                )}
              >
                <span className="flex max-w-[17rem] items-center gap-3">
                  <SkinAreaPhoto area={item.area} />
                  <span>{item.title}</span>
                </span>
              </button>
            ))}
          </div>
          <article
            id="a-concern-detail"
            role="tabpanel"
            aria-labelledby={`concern-tab-${active}`}
            className="rounded-3xl border border-border bg-card p-7 shadow-soft sm:p-10"
            aria-live="polite"
          >
            <p className="eyebrow text-clay">Your selected concern</p>
            <h3 className="mt-3 text-3xl sm:text-4xl">{selected.title}</h3>
            <TreatmentPhoto concern={selected.concern} />
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium">What you may be noticing</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {selected.noticing}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Why this may happen</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{selected.why}</p>
              </div>
            </div>
            <div className="mt-8 border-t border-border pt-7">
              <p className="text-sm font-medium">Options a dermatologist may discuss</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {selected.options.map((option) => (
                  <span key={option} className="rounded-full bg-sand px-4 py-2 text-xs">
                    {option}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                Suitability, experience and downtime depend on professional assessment and
                individual factors.
              </p>
            </div>
            <Button variant="ink" size="xl" className="mt-7" asChild>
              <TrackedLink
                href="#b-consultation"
                event="consultation_cta_clicked"
                source={`treatment:${selected.concern}`}
              >
                Discuss This Skin Concern <ArrowRight />
              </TrackedLink>
            </Button>
          </article>
        </div>
      </Reveal>
    </Section>
  );
}

const VIDEO_TOPICS = [
  "Anti-ageing",
  "Botox",
  "Fillers",
  "Skin boosters",
  "HIFU",
  "MNRF",
  "PDRN & PN",
  "Acne",
  "Pigmentation",
  "Hair fall",
  "Psoriasis",
  "Vitiligo",
];

function BookFreeConsultationButton({ source }: { source: string }) {
  return (
    <Button variant="clay" size="xl" className="clinic-cta" asChild>
      <TrackedLink href="#a-hero-form" event="consultation_cta_clicked" source={source}>
        <CalendarCheck /> Request My Free Consultation
      </TrackedLink>
    </Button>
  );
}

function DoctorVideoSection() {
  return (
    <Section id="a-doctor-video" tone="paper" className="clinic-video-section">
      <Reveal className="mx-auto max-w-3xl text-center">
        <Eyebrow>1-minute video · Tamil</Eyebrow>
        <h2 className="mt-4 text-4xl leading-[1.08] sm:text-5xl">
          Want the doctor to explain it in simple words?
        </h2>
        <p className="mt-5 leading-relaxed text-muted-foreground">
          In this short video in Tamil, Dr. S. Kiruthika talks about the care offered at Sanjay
          Rithik Hospital, Karur, including laser hair reduction.
        </p>
      </Reveal>
      <Reveal className="mt-10">
        <div className="clinic-video-frame">
          <video
            src={drKiruthikaIntroVideo}
            poster={drKiruthikaIntroPoster}
            controls
            playsInline
            preload="none"
            onPlay={() => track("doctor_video_played", { source: "a-doctor-video" })}
          >
            Your browser does not support video playback.
          </video>
        </div>
        <ul className="clinic-video-topics" aria-label="Topics Dr. Kiruthika covers in the video">
          {VIDEO_TOPICS.map((topic) => (
            <li key={topic}>{topic}</li>
          ))}
        </ul>
      </Reveal>
      <div className="mt-10 flex justify-center">
        <BookFreeConsultationButton source="a-doctor-video" />
      </div>
    </Section>
  );
}

const WHY_CHOOSE = [
  [
    "Experienced dermatologist",
    "Dr. S. Kiruthika, MBBS, DDVL, has treated skin, hair and nail conditions for 13 years.",
  ],
  [
    "Dedicated procedure and laser rooms",
    "Treatments are carried out in separate procedure and laser rooms inside the hospital.",
  ],
  [
    "In-house pharmacy",
    "Prescribed medicines and skincare are available at the hospital pharmacy, so you leave with everything you need.",
  ],
  [
    "Advanced anti-ageing care",
    "HIFU, fillers, skin boosters, PN and PDRN alongside treatment for acne, pigmentation, hair fall, psoriasis and vitiligo.",
  ],
  [
    "Trusted in Karur",
    "Rated 4.5★ from 447 Google reviews, and open every day from 10 am–2:30 pm and 6–9:30 pm.",
  ],
] as const;

function WhyChooseSection() {
  return (
    <Section id="a-why-choose" tone="paper" className="clinic-list-section">
      <Reveal className="mx-auto max-w-4xl">
        <h2 className="text-center text-4xl leading-[1.08] sm:text-5xl">
          <span aria-hidden="true">🏥 </span>Why visit Sanjay Rithik Hospital in Karur?
        </h2>
        <ul className="clinic-list mt-10">
          {WHY_CHOOSE.map(([title, text]) => (
            <li key={title}>
              <ArrowRight className="clinic-list-icon" aria-hidden="true" />
              <p>
                <strong>{title}</strong> – {text}
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-10 flex justify-center">
          <BookFreeConsultationButton source="a-why-choose" />
        </div>
      </Reveal>
    </Section>
  );
}

const BENEFITS = [
  ["🌸", "Clearer, calmer skin", "fewer breakouts and marks with a plan made for your skin type."],
  ["✨", "Even, brighter tone", "pigmentation and dark patches treated at the cause."],
  ["💇", "Stronger, fuller hair", "the reasons behind your hair fall identified and treated."],
  ["🕰️", "Graceful, natural ageing", "firmer, fresher-looking skin without an overdone look."],
  ["🚀", "Boosted confidence", "feel at ease in photos, at work and at family functions."],
] as const;

function BenefitsSection() {
  return (
    <Section id="a-benefits" tone="sand" className="clinic-list-section">
      <Reveal className="mx-auto max-w-4xl">
        <h2 className="text-center text-4xl leading-[1.08] sm:text-5xl">
          Looking for help with another skin concern?
        </h2>
        <ul className="clinic-list clinic-list-emoji mt-10">
          {BENEFITS.map(([emoji, title, text]) => (
            <li key={title}>
              <span className="clinic-list-emoji-icon" aria-hidden="true">
                {emoji}
              </span>
              <p>
                <strong>{title}</strong> – {text}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Results vary from person to person. Dr. Kiruthika explains what to realistically expect
          at your consultation.
        </p>
        <div className="mt-8 flex justify-center">
          <BookFreeConsultationButton source="a-benefits" />
        </div>
      </Reveal>
    </Section>
  );
}

const ADVANCED_TREATMENTS = [
  { icon: Zap, title: "Triple Wave Laser Hair Reduction", text: "Laser used to reduce hair growth over several visits. Ask whether it may suit your skin and hair, and how many visits may be needed." },
  { icon: Crosshair, title: "Q-Switched Nd:YAG Laser", text: "Other care at the hospital: pigmentation, acne marks and tattoo removal." },
  { icon: Waves, title: "MNRF", text: "Other care at the hospital: microneedle radiofrequency to tighten loose skin and refine texture." },
  { icon: ScanFace, title: "Microneedling", text: "Other care at the hospital: softens acne scars and stimulates collagen." },
  { icon: TestTube, title: "PRP Therapy", text: "Other care at the hospital: your own platelet-rich plasma for natural face rejuvenation and hair fall." },
  { icon: Sparkles, title: "Botox", text: "Other care at the hospital: softens fine lines for a natural, refreshed look." },
  { icon: Syringe, title: "Skin Boosters", text: "Other care at the hospital: immediate glow and deep hydration." },
  { icon: Droplets, title: "HydraFacial", text: "Other care at the hospital: instant glow before events; reduces dullness and dryness." },
  { icon: Stethoscope, title: "Medical Dermatology", text: "Other care at the hospital: acne, psoriasis, vitiligo, nail lichen planus, sweating and body odour." },
] as const;

function AdvancedTreatmentsSection() {
  return (
    <Section id="a-advanced-treatments" tone="sand" className="clinic-cards-section">
      <Reveal className="mx-auto max-w-3xl text-center">
        <Eyebrow>Treatments at Sanjay Rithik Hospital</Eyebrow>
        <h2 className="mt-4 text-4xl leading-[1.08] sm:text-5xl">Could laser help you spend less time removing hair?</h2>
        <p className="mt-5 leading-relaxed text-muted-foreground">
          The hospital uses a Triple Wave laser for laser hair reduction. Ask Dr. S. Kiruthika
          whether it may suit your skin and hair. The other cards are other care offered at the
          hospital.
        </p>
      </Reveal>
      <ul className="treatment-card-grid mt-12">
        {ADVANCED_TREATMENTS.map(({ icon: Icon, title, text }) => (
          <li key={title} className="treatment-card">
            <span className="treatment-card-icon" aria-hidden="true">
              <Icon />
            </span>
            <h3>{title}</h3>
            <p>
              <Check className="treatment-card-check" aria-hidden="true" /> {text}
            </p>
          </li>
        ))}
      </ul>
      <div className="mt-10 flex justify-center">
        <BookFreeConsultationButton source="a-advanced-treatments" />
      </div>
    </Section>
  );
}

const LASER_AREAS = [
  "Women",
  "Men",
  "PCOS patients",
  "Face",
  "Upper lip",
  "Chin",
  "Underarms",
  "Hands & arms",
  "Legs",
  "Back",
  "Chest",
  "Beard shaping",
  "Bikini line",
  "Full body",
];

const LASER_WHATSAPP =
  "https://wa.me/918903009723?text=Hello%2C%20I%27d%20like%20to%20ask%20about%20laser%20hair%20removal%20for%20my%20";

function LaserAreasSection() {
  return (
    <Section id="a-laser-areas" tone="paper">
      <div className="laser-areas">
        <Reveal>
          <p className="section-pill">Treatment areas</p>
          <h2 className="mt-5 text-4xl leading-[1.08] sm:text-5xl">
            Which area would you like to ask about?
          </h2>
          <p className="mt-5 leading-relaxed text-muted-foreground">
            From upper lip and chin to arms, legs and underarms. Tell the doctor which area you would
            like help with, and ask what may suit your skin and hair.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="clay" size="xl" asChild>
              <TrackedLink href={LASER_WHATSAPP} event="whatsapp_clicked" source="a-laser-areas">
                <WhatsAppIcon /> Ask About My Area
              </TrackedLink>
            </Button>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <ul className="laser-area-chips" aria-label="Areas and people we treat">
            {LASER_AREAS.map((area) => (
              <li key={area}>{area}</li>
            ))}
          </ul>
        </Reveal>
      </div>
    </Section>
  );
}

// Visitor goals to discuss, not promised results.
const LASER_BENEFITS = [
  "Less planning around waxing: ask whether laser could reduce how often you need to remove hair",
  "Less time with a razor: discuss what change may be realistic for your area",
  "Fewer unanswered questions: understand the visits, cost and aftercare before deciding",
  "More control over your choice: start with a conversation and ask before agreeing",
];

function LaserBenefitsSection() {
  return (
    <Section id="a-laser-benefits" tone="sand">
      <Reveal>
        <p className="section-pill">Your goals</p>
        <h2 className="mt-5 text-4xl leading-[1.08] sm:text-5xl">
          What would you like to spend less time doing?
        </h2>
      </Reveal>
      <ul className="laser-benefit-grid mt-10">
        {LASER_BENEFITS.map((benefit) => (
          <li key={benefit}>
            <Sparkles className="laser-benefit-icon" aria-hidden="true" />
            {benefit}
          </li>
        ))}
      </ul>
      <p className="mt-6 text-xs text-muted-foreground">
        These are goals to discuss, not promised results. Laser reduces hair growth over several
        visits; how many you may need depends on your skin and hair, which the doctor checks first.
      </p>
      <div className="mt-8 flex justify-center">
        <BookFreeConsultationButton source="a-laser-benefits" />
      </div>
    </Section>
  );
}

/**
 * Consented patient video stories. Add entries here (video file, first name, treatment) once
 * the clinic has recorded them with written consent; the section stays hidden while empty so
 * no placeholder or invented testimonial is ever shown.
 */
const VIDEO_TESTIMONIALS: ReadonlyArray<{ src: string; poster?: string; name: string; treatment: string }> = [];

const VIDEO_STORY_TOPICS = [
  "PCOS facial hair",
  "Acne & acne scars",
  "Laser hair removal · full body",
];

function VideoTestimonialsSection() {
  const hasVideos = VIDEO_TESTIMONIALS.length > 0;
  return (
    <Section id="a-video-testimonials" tone="paper" className="video-stories-section">
      <h2 className="sr-only">What was the visit like for other patients?</h2>
      {hasVideos ? (
        <ul className="video-testimonial-grid">
          {VIDEO_TESTIMONIALS.map((item) => (
            <li key={item.src}>
              <video src={item.src} poster={item.poster} controls playsInline preload="none" />
              <p>
                Video testimonial · {item.name} – {item.treatment}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="video-story-grid">
          {VIDEO_STORY_TOPICS.map((topic) => (
            <li key={topic}>
              <div className="video-story-card" aria-label={`Patient video not available on this page: ${topic}`}>
                <span className="video-story-play" aria-hidden="true">
                  <Play className="size-5 fill-current" />
                </span>
                <strong>Patient video · {topic}</strong>
                <span>Not available to watch on this page. Ask the clinic on WhatsApp.</span>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-8 text-center text-xs leading-relaxed text-muted-foreground">
        <strong>Individual results vary.</strong> Treatment suitability, sessions, recovery and
        outcomes depend on individual factors and are confirmed at consultation.
      </p>
      <div className="mt-8 flex justify-center">
        <BookFreeConsultationButton source="a-video-testimonials" />
      </div>
    </Section>
  );
}

/**
 * Mild ambient particles for the hero: a fixed set of soft dots that drift upward and
 * twinkle. Positions are deterministic so server and client render the same markup.
 */
const HERO_PARTICLES = Array.from({ length: 26 }, (_, index) => ({
  left: (index * 37) % 100,
  top: (index * 53) % 100,
  size: 3 + (index % 4) * 1.5,
  delay: (index % 9) * -1.7,
  duration: 12 + (index % 5) * 3,
  tone: index % 3,
}));

function HeroParticles() {
  return (
    <div className="hero-particles" aria-hidden="true">
      {HERO_PARTICLES.map((particle, index) => (
        <span
          key={index}
          className={`hero-particle hero-particle-${particle.tone}`}
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            width: particle.size,
            height: particle.size,
            animationDelay: `${particle.delay}s, ${particle.delay / 2}s`,
            animationDuration: `${particle.duration}s, ${particle.duration / 3}s`,
          }}
        />
      ))}
    </div>
  );
}
