
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  MapPin,
  Menu,
  Minus,
  Plus,
  Play,
  ShieldCheck,
  Star,
  Stethoscope,
  X,
} from "lucide-react";
import { Button } from "@/comparison/b/components/ui/button";
import { Reveal } from "@/comparison/b/components/skin/Reveal";
import { SkinAssessment, type Answers, type ResultProfile } from "@/comparison/b/components/skin/SkinAssessment";
import { AgeJourney, type AgeJourneySelection } from "@/comparison/b/components/skin/AgeJourney";
import { LeadForm } from "@/comparison/b/components/skin/LeadForm";
import { TestimonialGrid } from "@/comparison/b/components/skin/TestimonialGrid";
import { track } from "@/comparison/b/lib/analytics";
import { cn } from "@/comparison/b/lib/utils";
import heroImage from "@/comparison/b/assets/anti-aging-hero-v2.jpg";
import videoPosterImage from "@/assets/hero-portrait.jpg";
import { TreatmentPhoto } from "../TreatmentPhoto";
import premiumConcernMirror from "@/assets/premium-concern-mirror.png";
import headerTreatmentRoom from "@/assets/luxury-glow/header-treatment-room-teal.png";
import hairScalpConsultation from "@/assets/luxury-glow/hair-scalp-consultation.png";
import serviceAcneBreakouts from "@/assets/luxury-glow/service-acne-breakouts.png";
import serviceAntiAgingFirmness from "@/assets/luxury-glow/service-anti-aging-firmness.png";
import servicePigmentation from "@/assets/luxury-glow/service-pigmentation.png";
import serviceScarsTexture from "@/assets/luxury-glow/service-scars-texture.png";
import serviceSensitiveSkin from "@/assets/luxury-glow/service-sensitive-skin.png";
import serviceTiredDull from "@/assets/luxury-glow/service-tired-dull.png";
import antiAgingReelVideo from "@/assets/videos/anti-aging-treatment-reel.mp4?url";
import hospitalLogo from "@/comparison/b/assets/hospital-logo.png";
import doctorKiruthika from "@/comparison/b/assets/doctor-kiruthika.jpg";


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
    <p className={cn("eyebrow", muted ? "text-ink-foreground/55" : "text-clay")}>{children}</p>
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
    <a
      href={href}
      className={className}
      onClick={() => {
        track(event, { source });
        if (event === "hero_assessment_click") track("hero_cta_clicked", { source });
        if (href === "#b-consultation") track("consultation_cta_clicked", { source });
      }}
    >
      {children}
    </a>
  );
}

export function VersionB({ render, sharedAgeSelection }: { render: (sections: Record<string, ReactNode>) => ReactNode; sharedAgeSelection?: AgeJourneySelection | undefined }) {
  const [answers, setAnswers] = useState<Answers>({});
  const [exploredConcern, setExploredConcern] = useState<string>();
  const [profile, setProfile] = useState<ResultProfile | undefined>();
  const [ageJourney, setAgeJourney] = useState<AgeJourneySelection | undefined>();
  const [faceAreas, setFaceAreas] = useState<string[]>([]);
  const [stickyStage, setStickyStage] = useState<"hidden" | "skin" | "options" | "booking">(
    "hidden",
  );
  const [scrollProgress, setScrollProgress] = useState(0);
  const [navSolid, setNavSolid] = useState(false);

  useEffect(() => {
    const firedDepths = new Set<number>();
    const onScroll = () => {
      const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const percent = Math.min((window.scrollY / max) * 100, 100);
      setScrollProgress(percent);
      setNavSolid(window.scrollY > window.innerHeight * 0.5);
      for (const depth of [25, 50, 75, 90]) {
        if (percent >= depth && !firedDepths.has(depth)) {
          firedDepths.add(depth);
          track("scroll_depth", { depth });
        }
      }
      const assessment = document.getElementById("b-skin-check");
      const doctor = document.getElementById("b-doctor");
      const consultation = document.getElementById("b-consultation");
      if (
        window.scrollY <= window.innerHeight * 0.72 ||
        (consultation && consultation.getBoundingClientRect().top < window.innerHeight * 0.88)
      ) {
        setStickyStage("hidden");
      } else if (doctor && doctor.getBoundingClientRect().top < window.innerHeight * 0.55) {
        setStickyStage("booking");
      } else if (assessment && assessment.getBoundingClientRect().bottom < 180) {
        setStickyStage("options");
      } else {
        setStickyStage("skin");
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const clinicSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    name: "Sanjay Rithik Hospital",
    address: {
      "@type": "PostalAddress",
      streetAddress: "77A, Sengunthapuram Main Road",
      addressLocality: "Karur",
      postalCode: "639002",
      addressCountry: "IN",
    },
    telephone: "+91 89030 09723",
    medicalSpecialty: "Dermatology",
  };

  return render({
"schema": <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(clinicSchema) }}
      />,
"progress": <div className="fixed inset-x-0 top-0 z-[70] h-[3px] bg-clay/15">
        <div className="h-full bg-clay" style={{ width: `${scrollProgress}%` }} />
      </div>,
"navigation": <Nav solid={navSolid} />,
"hero": <Hero />,
"trust": <TrustStrip />,
"pain": <PainMirror />,
"relief": <Relief />,
"face": <FaceExplorer selected={faceAreas} onChange={setFaceAreas} />,
"assessment": <Assessment selectedAreas={faceAreas} onComplete={(next) => { setAnswers(next); setExploredConcern(next["concern"]); }} onProfile={setProfile} />,
"treatments": <TreatmentExplorer concern={exploredConcern} />,
"services": <Services onSelect={setExploredConcern} />,
"medical": <MedicalTrust />,
"doctor": <Doctor />,
"treatments-before-age": <TreatmentExplorer concern={exploredConcern} sectionId="b-treatment-options" variant="service" />,
"age": <AgeExperience onSelection={setAgeJourney} />,
"video": <CinematicInterlude />,
"testimonials": <TestimonialGrid />,
"questions": <Objections />,
"proof": <Proof />,
"close": <FinalClose />,
"consultation": <Consultation
        answers={answers}
        ageJourney={sharedAgeSelection ?? ageJourney}
        profile={profile}
        faceAreas={faceAreas}
      />,
"footer": <Footer />,
"sticky": <StickyBar stage={stickyStage} />
});
}

function Nav({ solid }: { solid: boolean }) {
  const [open, setOpen] = useState(false);
  const links = [
    { label: "Home", href: "#b-top" },
    { label: "About", href: "#b-doctor" },
    { label: "Dermatology", href: "#b-skin-check" },
    { label: "Treatments", href: "#b-treatment-options" },
    { label: "Doctors", href: "#b-doctor" },
    { label: "Blog", href: "https://sanjayrithikhospital.com/blog/", external: true },
    { label: "Contact", href: "#b-consultation" },
  ];
  return (
    <header
      className={cn(
        "absolute inset-x-0 top-0 z-40 transition-colors md:fixed",
        solid && "md:border-b md:border-white/10 md:bg-ink/92 md:shadow-sm md:backdrop-blur",
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <a href="#b-top" className="leading-tight text-ink-foreground">
          <span className="flex items-center gap-3">
            <img
              src={hospitalLogo}
              alt="Sanjay Rithik Hospital logo"
              className="size-12 object-contain"
            />
            <span>
              <span className="block font-display text-xl">Sanjay Rithik Hospital</span>
              <span className="text-[0.6rem] uppercase tracking-[0.24em] text-ink-foreground/55">
                Dermatology · Karur
              </span>
            </span>
          </span>
        </a>
        <nav className="hidden items-center gap-5 lg:flex" aria-label="Primary navigation">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              {...(link.external ? { target: "_blank", rel: "noreferrer" } : {})}
              className="text-xs font-medium text-ink-foreground/72 transition-colors hover:text-ink-foreground"
            >
              {link.label}
            </a>
          ))}
          <Button variant="clay" size="pill" asChild>
            <TrackedLink href="#b-consultation" event="hero_booking_click" source="navigation">
              Book Consultation
            </TrackedLink>
          </Button>
        </nav>
        <button
          type="button"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className="inline-flex size-11 items-center justify-center rounded-full border border-white/20 text-ink-foreground lg:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open && (
        <nav
          className="border-t border-white/10 bg-ink px-5 pb-5 pt-3 lg:hidden"
          aria-label="Mobile navigation"
        >
          <div className="mx-auto grid max-w-6xl gap-1">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                {...(link.external ? { target: "_blank", rel: "noreferrer" } : {})}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm text-ink-foreground/80 hover:bg-white/5"
              >
                {link.label}
              </a>
            ))}
            <Button variant="clay" size="xl" className="mt-2 w-full" asChild>
              <TrackedLink
                href="#b-consultation"
                event="hero_booking_click"
                source="mobile_navigation"
              >
                Book a Consultation <ArrowRight />
              </TrackedLink>
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}

const FACE_AREAS = [
  {
    id: "forehead",
    label: "Forehead",
    concern: "Fine lines / expression lines",
    explanation:
      "Fine lines may become more noticeable as collagen, hydration and repeated expression patterns change.",
    hotspot: "left-[74%] top-[35%]",
  },
  {
    id: "around-eyes",
    label: "Around eyes",
    concern: "Fine lines / tired appearance",
    explanation:
      "The eye area is delicate. Fine lines may become more visible as hydration and elasticity change over time.",
    hotspot: "left-[67%] top-[40%]",
  },
  {
    id: "cheeks",
    label: "Cheeks",
    concern: "Texture / pigmentation / volume",
    explanation:
      "Changes in texture, pigmentation, firmness or facial volume can affect how light reflects from the cheeks.",
    hotspot: "left-[81%] top-[47%]",
  },
  {
    id: "around-mouth",
    label: "Around mouth",
    concern: "Fine lines / volume changes",
    explanation:
      "Repeated movement, skin quality and structural changes can all influence lines around the mouth.",
    hotspot: "left-[75%] top-[49%]",
  },
  {
    id: "jawline",
    label: "Jawline",
    concern: "Firmness / definition",
    explanation:
      "Changes in elasticity and facial support may gradually soften the definition of the jawline.",
    hotspot: "left-[79%] top-[55%]",
  },
  {
    id: "overall-face",
    label: "Overall face",
    concern: "Dullness / texture / general ageing",
    explanation:
      "Dullness, pores, uneven tone and hydration can combine to make skin look more tired.",
    hotspot: "left-[65%] top-[47%]",
  },
] as const;

function Hero() {
  return (
    <section
      id="b-top"
      className="relative isolate min-h-[100svh] overflow-hidden bg-ink text-ink-foreground"
    >
      <div className="absolute inset-0 hero-glow" />
      <div className="relative mx-auto grid min-h-[100svh] max-w-6xl gap-10 px-5 pb-16 pt-32 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:pb-20 lg:pt-28">
        <Reveal className="relative z-10">
          <Eyebrow muted>Premium dermatology care · Karur</Eyebrow>
          <h1 className="mt-6 text-[2.85rem] leading-[0.97] sm:text-[4.7rem]">
            You've noticed changes in your skin.
            <span className="mt-3 block text-clay">Let's understand what they mean.</span>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-relaxed text-ink-foreground/72 sm:text-lg">
            Dermatologist-led care for acne, pigmentation, hair concerns, ageing skin and other skin
            conditions. Start with clarity, then discuss suitable options without pressure.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button variant="clay" size="xl" asChild>
              <TrackedLink href="#b-consultation" event="hero_booking_click" source="hero">
                Book a Consultation <ArrowRight />
              </TrackedLink>
            </Button>
            <Button variant="onink" size="xl" asChild>
              <TrackedLink href="#b-skin-check" event="hero_assessment_click" source="hero">
                Explore Skin Concerns <ArrowRight />
              </TrackedLink>
            </Button>
          </div>
          <p className="mt-7 text-xs font-medium tracking-wide text-ink-foreground/55">
            Dermatologist-led&nbsp; • &nbsp;Personalised consultation&nbsp; • &nbsp;Karur
          </p>
          <p className="mt-2 text-xs text-ink-foreground/45">
            Clear information&nbsp; • &nbsp;Realistic expectations&nbsp; • &nbsp;No treatment
            commitment
          </p>
        </Reveal>

        <Reveal delay={120} className="relative lg:pt-16">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl">
            <img
              src={heroImage}
              alt="Mature Indian woman looking calm and confident with natural skin texture"
              width={1024}
              height={1536}
              fetchPriority="high"
              className="h-[31rem] w-full object-cover object-[58%_36%] sm:h-[40rem]"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink via-ink/50 to-transparent px-5 pb-6 pt-28">
              <p className="font-display text-2xl">Comfortable. Confident. Still you.</p>
            </div>
          </div>
          <p className="mt-3 text-center text-[0.65rem] text-ink-foreground/38">
            Lifestyle image for illustration; not a patient result.
          </p>
        </Reveal>
      </div>
    </section>
  );
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
          href="https://www.google.com/maps/search/?api=1&query=Sanjay+Rithik+Baby+Care+and+Skin+Laser+Cosmetology+Hospital+Karur"
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

function FaceExplorer({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (areas: string[]) => void;
}) {
  const [activeId, setActiveId] = useState<string>(selected[0] ?? "around-eyes");
  const active = FACE_AREAS.find((area) => area.id === activeId) ?? FACE_AREAS[1];

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
    <Section id="b-face-explorer" tone="sand">
      <div className="grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:gap-20">
        <Reveal>
          <Eyebrow>Make it personal</Eyebrow>
          <h2 className="mt-5 text-4xl leading-[1.04] sm:text-5xl">
            Where are you noticing change?
          </h2>
          <p className="mt-5 leading-relaxed text-muted-foreground">
            Choose every area that feels relevant. This does not diagnose your skin—it simply
            carries your concerns into the Skin Assessment.
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
                {area.label}
              </button>
            ))}
          </div>
          <div className="mt-7 min-h-40 rounded-3xl border border-border bg-card p-6 shadow-soft">
            <p className="eyebrow text-clay">{active.label}</p>
            <p className="mt-2 font-display text-2xl">{active.concern}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {active.explanation}
            </p>
          </div>
          {selected.length > 0 && (
            <div className="mt-5 rounded-2xl bg-ink p-5 text-ink-foreground" aria-live="polite">
              <p className="text-sm font-medium">We've added these to your Skin Assessment.</p>
              <p className="mt-2 text-xs leading-relaxed text-ink-foreground/60">
                {selected.join(" · ")}
              </p>
            </div>
          )}
          <Button variant="ink" size="xl" className="mt-7" asChild>
            <TrackedLink href="#b-skin-check" event="hero_assessment_click" source="face_explorer">
              Check My Skin <ArrowRight />
            </TrackedLink>
          </Button>
        </Reveal>
        <Reveal delay={100} className="hidden lg:block">
          <div className="relative ml-auto aspect-[2/3] w-full max-w-[30rem] overflow-hidden rounded-[2rem] border border-border bg-card shadow-lift">
            <img
              src={heroImage}
              alt="Mature Indian woman used to explore facial areas"
              loading="lazy"
              width={1024}
              height={1536}
              className="brand-photo absolute inset-0 h-full w-full object-cover"
            />
            <div>
              {FACE_AREAS.map((area) => (
                <button
                  key={area.id}
                  type="button"
                  aria-label={`${area.label}: ${area.concern}`}
                  aria-pressed={selected.includes(area.label)}
                  onClick={() => toggleArea(area.id, area.label)}
                  className={cn(
                    "absolute flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 shadow-lg transition-all",
                    area.hotspot,
                    selected.includes(area.label)
                      ? "scale-110 border-white bg-clay text-clay-foreground"
                      : "border-white bg-ink/75 text-white hover:scale-110 hover:bg-clay hover:text-clay-foreground",
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
        </Reveal>
      </div>
    </Section>
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
  return (
    <Section id="skin-concerns" tone="paper">
      <div className="grid gap-12 lg:grid-cols-[.88fr_1.12fr] lg:items-center lg:gap-20">
        <Reveal>
          <img
            src={premiumConcernMirror}
            alt="Woman noticing her skin in a mirror"
            loading="lazy"
            width={1200}
            height={800}
            className="concern-premium-image h-[28rem] w-full rounded-3xl object-cover shadow-lift sm:h-[36rem]"
          />
        </Reveal>
        <Reveal delay={100}>
          <Eyebrow>Start with what you notice</Eyebrow>
          <h2 className="mt-5 text-4xl leading-[1.04] sm:text-5xl">
            What concerns you most?
          </h2>
          <p className="mt-5 text-muted-foreground">You don’t need to know what treatment you need. Simply tell us what you’ve noticed, and Dr. S. Kiruthika can help you understand your skin concern and the right next step.</p>
          <div className="concern-links mt-8">
            {["Acne & Breakouts", "Pigmentation", "Hair Loss", "Scars & Texture", "Sensitive Skin", "Fine Lines & Ageing", "Dark Circles", "Not Sure"].map((name) => <a key={name} href="#b-skin-check"><span>{name}</span><ArrowRight size={17} aria-hidden="true" /></a>)}
          </div>
          <a className="editorial-link" href="#b-skin-check">Take a quick Skin Check <ArrowRight size={18} /></a>
        </Reveal>
      </div>
    </Section>
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
          <TrackedLink href="#b-skin-check" event="hero_assessment_click" source="relief">
            Check My Skin <ArrowRight />
          </TrackedLink>
        </Button>
      </Reveal>
    </Section>
  );
}

function AgeExperience({ onSelection }: { onSelection: (selection: AgeJourneySelection) => void }) {
  return (
    <Section id="b-age-journey" tone="ink" className="relative overflow-hidden">
      <div className="absolute -left-32 top-16 size-96 rounded-full bg-clay/[0.07] blur-3xl" />
      <Reveal className="relative max-w-3xl">
        <Eyebrow muted>Interactive age journey</Eyebrow>
        <h2 className="mt-5 text-4xl leading-[1.04] sm:text-5xl">
          See how skin changes over time.
        </h2>
        <p className="mt-5 max-w-2xl leading-relaxed text-ink-foreground/58">
          Try the sample instantly, or upload your own portrait and choose an age stage. An
          educational visual simulation—not a prediction of how you will age.
        </p>
      </Reveal>
      <Reveal delay={100} className="relative mt-12">
        <AgeJourney onSelection={onSelection} />
      </Reveal>
    </Section>
  );
}

function Assessment({
  selectedAreas,
  onComplete,
  onProfile,
}: {
  selectedAreas: string[];
  onComplete: (answers: Answers) => void;
  onProfile: (profile: ResultProfile) => void;
}) {
  return (
    <Section id="b-skin-check" tone="paper">
      <Reveal className="max-w-3xl">
        <Eyebrow>Three quick questions</Eyebrow>
        <h2 className="mt-5 text-4xl leading-[1.04] sm:text-5xl">
          What would make hair removal easier for you?
        </h2>
        <p className="mt-5 max-w-2xl leading-relaxed text-muted-foreground">
          Tap your answers and see what you could ask the doctor. You will see your result before
          we ask for any contact details. It is not a diagnosis.
        </p>
      </Reveal>
      <Reveal delay={100} className="mt-12">
        <SkinAssessment
          initialAreas={selectedAreas}
          onComplete={onComplete}
          onProfile={onProfile}
        />
      </Reveal>
    </Section>
  );
}

const TREATMENTS = [
  {
    concern: "Acne & Breakouts",
    noticing:
      "Active breakouts, recurring acne, marks or changes that affect comfort and confidence.",
    why: "Acne can be influenced by hormones, inflammation, products, skin type and other individual factors.",
    options: [
      "Medical acne care",
      "Chemical peels",
      "PRP-based approaches",
      "Scar care discussion",
    ],
  },
  {
    concern: "Hair & Scalp Concerns",
    noticing:
      "Hair shedding, thinning, scalp changes or uncertainty about what is causing the concern.",
    why: "Hair changes can have several causes, so a specialist review helps organise the right questions and next steps.",
    options: ["Scalp assessment", "Hair-loss consultation", "PRP-based approaches"],
  },
  {
    concern: "Scars & Texture",
    noticing:
      "Acne scars, marks, enlarged pores or uneven texture that show more clearly in certain lighting.",
    why: "Scars and texture can vary in depth and type, so treatment discussions need to start with careful assessment.",
    options: ["MNRF", "Chemical peels", "Microdermabrasion", "Scar treatment discussion"],
  },
  {
    concern: "Sensitive Skin",
    noticing:
      "Skin that feels reactive, uncomfortable or difficult to manage with regular products.",
    why: "Sensitivity can be influenced by the skin barrier, irritation, allergies and underlying skin conditions.",
    options: ["Skin-barrier care", "Medical dermatology assessment", "Product guidance"],
  },
  {
    concern: "Fine Lines",
    noticing: "Lines that remain visible around the eyes, forehead or mouth—even when relaxed.",
    why: "Skin hydration, collagen and elasticity can change over time, while repeated facial movement can make some lines more noticeable.",
    options: ["MNRF", "PRP-based approaches", "Mesotherapy", "Chemical peels"],
  },
  {
    concern: "Firmness",
    noticing:
      "A softer-looking jawline, reduced bounce or skin that does not feel as firm as before.",
    why: "Elasticity, collagen and deeper facial support can all influence firmness—not only the skin surface.",
    options: ["Non-surgical facelift approaches", "MNRF", "PRP-based approaches"],
  },
  {
    concern: "Pigmentation",
    noticing: "Uneven patches, spots or areas of colour that make the complexion look less even.",
    why: "Melanin activity can be influenced by sun exposure, inflammation, hormones and individual skin factors.",
    options: ["Chemical peels", "Medifacials", "Microdermabrasion"],
  },
  {
    concern: "Texture",
    noticing:
      "Visible pores, roughness or skin that looks less smooth in photographs and certain lighting.",
    why: "Texture can reflect pores, dehydration, collagen change, congestion or a combination of factors.",
    options: ["MNRF", "Microdermabrasion", "Chemical peels", "Medifacials"],
  },
  {
    concern: "Tired / Dull Appearance",
    noticing: "Skin that appears tired, flat or less fresh even when you feel well-rested.",
    why: "Hydration, surface build-up, pigmentation, skin turnover and lifestyle factors can all affect how light reflects from the face.",
    options: ["Medifacials", "Aqua facial", "Microdermabrasion", "Chemical peels"],
  },
  {
    concern: "Overall Rejuvenation",
    noticing:
      "Several subtle changes in freshness, firmness, tone or texture rather than one main concern.",
    why: "Visible ageing often involves more than one layer, so a balanced plan may prioritise several small improvements.",
    options: ["PRP-based approaches", "Mesotherapy", "MNRF", "Aqua facial"],
  },
];

// Maps the concern already captured in the Skin Check (Assessment, Q1) onto a
// TREATMENTS entry, so this section doesn't ask "what's your concern" a second time.
const CONCERN_TO_TREATMENT: Record<string, string> = {
  Acne: "Acne & Breakouts",
  "Hair loss": "Hair & Scalp Concerns",
  "Dark circles": "Tired / Dull Appearance",
  Scars: "Scars & Texture",
  "Sensitive skin": "Sensitive Skin",
  "Fine lines": "Fine Lines",
  Wrinkles: "Fine Lines",
  "Loss of firmness": "Firmness",
  Dullness: "Tired / Dull Appearance",
  Pigmentation: "Pigmentation",
  "Texture / pores": "Texture",
  "Loss of facial volume": "Firmness",
  "Overall ageing": "Overall Rejuvenation",
};

const SERVICE_IMAGES: Record<string, string> = {
  "Acne & Breakouts": serviceAcneBreakouts,
  "Hair & Scalp Concerns": hairScalpConsultation,
  "Scars & Texture": serviceScarsTexture,
  "Sensitive Skin": serviceSensitiveSkin,
  "Fine Lines": serviceAntiAgingFirmness,
  Firmness: serviceAntiAgingFirmness,
  Pigmentation: servicePigmentation,
  Texture: serviceScarsTexture,
  "Tired / Dull Appearance": serviceTiredDull,
  "Overall Rejuvenation": serviceAntiAgingFirmness,
};

function treatmentIndexForConcern(concern?: string) {
  const label = concern ? CONCERN_TO_TREATMENT[concern] : undefined;
  if (!concern) return 0;
  const index = TREATMENTS.findIndex((item) => item.concern === (label ?? concern));
  return index === -1 ? 0 : index;
}

function TreatmentExplorer({
  concern,
  sectionId = "b-treatment-options",
  variant = "concern",
}: {
  concern?: string | undefined;
  sectionId?: string;
  variant?: "concern" | "service";
}) {
  const [active, setActive] = useState(() => treatmentIndexForConcern(concern));
  useEffect(() => {
    setActive(treatmentIndexForConcern(concern));
  }, [concern]);
  const carouselRef = useRef<HTMLDivElement>(null);
  const selected = TREATMENTS[active]!;
  const isService = variant === "service";
  const detailId = `${sectionId}-detail`;
  function scrollServices(direction: "left" | "right") {
    const element = carouselRef.current;
    if (!element) return;
    element.scrollBy({
      left: direction === "left" ? -420 : 420,
      behavior: "smooth",
    });
  }
  if (isService) {
    return (
      <Section id={sectionId} tone="sand" className="overflow-hidden">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal className="max-w-3xl">
            <Eyebrow>Other care at the hospital</Eyebrow>
            <h2 className="mt-5 text-4xl leading-[1.04] sm:text-5xl">
              What would you like help with?
            </h2>
            <p className="mt-5 leading-relaxed text-muted-foreground">
              Besides laser hair reduction, the hospital also sees other skin and hair concerns. Find
              the one closest to yours and ask the doctor.
            </p>
          </Reveal>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => scrollServices("left")}
              className="inline-flex size-12 items-center justify-center rounded-full border border-border bg-card text-hospital-blue shadow-soft transition-colors hover:border-clay hover:bg-warm hover:text-clay"
              aria-label="Show previous services"
            >
              <ArrowLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollServices("right")}
              className="inline-flex size-12 items-center justify-center rounded-full border border-border bg-card text-hospital-blue shadow-soft transition-colors hover:border-clay hover:bg-warm hover:text-clay"
              aria-label="Show next services"
            >
              <ArrowRight className="size-5" />
            </button>
          </div>
        </div>
        <Reveal delay={80} className="mt-10">
          <div
            ref={carouselRef}
            className="flex snap-x gap-5 overflow-hidden pb-5"
            role="list"
            aria-label="Skin services"
          >
            {TREATMENTS.map((item, index) => (
              <article
                key={item.concern}
                role="listitem"
                className="group w-[300px] shrink-0 snap-start overflow-hidden rounded-[1.35rem] border border-border bg-card shadow-soft transition-all hover:-translate-y-1 hover:border-clay/60 sm:w-[370px] lg:w-[410px]"
              >
                <div className="aspect-[1.34] overflow-hidden bg-warm">
                  <img
                    src={SERVICE_IMAGES[item.concern] ?? headerTreatmentRoom}
                    alt={item.concern}
                    loading="lazy"
                    draggable={false}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-7">
                  <h3 className="font-display text-3xl leading-none text-foreground">
                    {item.concern}
                  </h3>
                  <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {item.noticing}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setActive(index);
                      track("service_explored");
                    }}
                    className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-hospital-blue transition-colors hover:text-clay"
                  >
                    Learn More <ArrowRight className="size-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </Reveal>
      </Section>
    );
  }
  return (
    <Section id={sectionId} tone="sand">
      <Reveal className="max-w-3xl">
        <Eyebrow>Explore by concern</Eyebrow>
        <h2 className="mt-5 text-4xl leading-[1.04] sm:text-5xl">
          Facial skin concerns - explore your treatment options.
        </h2>
        <p className="mt-5 leading-relaxed text-muted-foreground">
          The dermatologist can explain which options are suitable for your skin, along with their cost, recovery and expected results.
        </p>
      </Reveal>
      <Reveal delay={80} className="mt-10">
        <p className="mb-3 flex items-center gap-2 text-xs text-muted-foreground md:hidden">
          Swipe to explore concerns <ArrowRight aria-hidden="true" className="size-4" />
        </p>
        <div className="treatment-layout grid gap-5 lg:grid-cols-[.72fr_1.28fr]">
          <div
            className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible"
            role="tablist"
            aria-label="Skin and hair concerns"
          >
            {TREATMENTS.map((item, index) => (
              <button
                key={item.concern}
                type="button"
                role="tab"
                id={`${sectionId}-tab-${index}`}
                tabIndex={active === index ? 0 : -1}
                onKeyDown={(event) => {
                  const offset = ["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : ["ArrowLeft", "ArrowUp"].includes(event.key) ? -1 : 0;
                  if (!offset && event.key !== "Home" && event.key !== "End") return;
                  event.preventDefault();
                  const next = event.key === "Home" ? 0 : event.key === "End" ? TREATMENTS.length - 1 : (index + offset + TREATMENTS.length) % TREATMENTS.length;
                  setActive(next);
                  document.getElementById(`${sectionId}-tab-${next}`)?.focus();
                }}
                aria-selected={active === index}
                aria-controls={detailId}
                onClick={() => {
                  setActive(index);
                  track("treatment_explored");
                }}
                className={cn(
                  "min-h-12 shrink-0 rounded-2xl border px-5 py-3 text-left text-sm font-medium transition-colors lg:w-full",
                  active === index
                    ? "border-ink bg-ink text-ink-foreground"
                    : "border-border bg-card hover:border-clay",
                )}
              >
                {item.concern}
              </button>
            ))}
          </div>
          <article
            id={detailId}
            role="tabpanel"
            aria-labelledby={`${sectionId}-tab-${active}`}
            className="rounded-3xl border border-border bg-card p-7 shadow-soft sm:p-10"
            aria-live="polite"
          >
            <p className="eyebrow text-clay">Your selected concern</p>
            <h3 className="mt-3 text-4xl">{selected.concern}</h3>
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
                individual factors. Costs and expected recovery are discussed during consultation.
              </p>
            </div>
            <Button variant="ink" size="xl" className="mt-7" asChild>
              <TrackedLink
                href="#b-consultation"
                event="booking_form_started"
                source={`treatment:${selected.concern}`}
              >
                Discuss My Concern <ArrowRight />
              </TrackedLink>
            </Button>
          </article>
        </div>
      </Reveal>
    </Section>
  );
}

const SERVICES = [
  ["Acne", "Clear guidance for active breakouts, marks and recurring concerns.", "acne-treatment"],
  [
    "Pigmentation",
    "Understand uneven tone, dark spots and treatment considerations.",
    "pigmentation-treatment",
  ],
  [
    "Hair Loss",
    "Discuss hair shedding and scalp concerns with a specialist.",
    "hair-loss-treatment",
  ],
  [
    "Eczema & Sensitive Skin",
    "Care plans built around your skin, history and comfort.",
    "dermatology",
  ],
  ["Psoriasis", "Specialist support for ongoing skin concerns and expectations.", "dermatology"],
  [
    "Laser Treatments",
    "Treatment suitability and downtime explained before deciding.",
    "laser-treatment",
  ],
  ["Cosmetic Dermatology", "Natural-looking options led by realistic expectations.", "cosmetology"],
  [
    "Anti-Aging",
    "Skin health, texture, firmness and facial ageing discussed calmly.",
    "anti-aging",
  ],
  ["Dermato Surgery", "Procedural care with clear clinical guidance.", "dermato-surgery"],
  [
    "Pediatric Dermatology",
    "Gentle specialist care for children's skin concerns.",
    "pediatric-dermatology",
  ],
] as const;

function Services({ onSelect }: { onSelect: (concern: string) => void }) {
  return (
    <Section id="b-services" tone="paper">
      <Reveal className="max-w-3xl">
        <Eyebrow>Dermatology care</Eyebrow>
        <h2 className="mt-5 text-4xl leading-[1.04] sm:text-5xl">
          Care that begins with the concern, not a procedure.
        </h2>
        <p className="mt-5 max-w-2xl leading-relaxed text-muted-foreground">
          From everyday skin conditions to cosmetic dermatology, the right next step depends on your
          skin, medical history and priorities.
        </p>
      </Reveal>
      <div className="service-grid mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {SERVICES.map(([title, description], index) => (
          <Reveal key={title} delay={index * 30}>
            <article className="group h-full border border-border bg-card p-5 transition-colors hover:border-clay">
              <Stethoscope className="size-4 text-hospital-blue" aria-hidden="true" />
              <h3 className="mt-6 text-2xl leading-tight">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
              <a
                href="#b-treatment-options"
                onClick={() => onSelect(({ Acne: "Acne", Pigmentation: "Pigmentation", "Hair Loss": "Hair loss", "Eczema & Sensitive Skin": "Sensitive skin", Psoriasis: "Sensitive skin", "Laser Treatments": "Scars & Texture", "Cosmetic Dermatology": "Overall Rejuvenation", "Anti-Aging": "Overall Rejuvenation" } as Record<string, string>)[title] ?? title)}
                className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-hospital-blue hover:underline"
              >
                Explore this concern <ArrowRight className="size-4" />
              </a>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function MedicalTrust() {
  const points = [
    "Dermatologist-led care",
    "19+ years of experience",
    "Personalised consultation",
    "Evidence-informed treatment",
    "Clear treatment expectations",
    "Karur-based specialist care",
  ];
  return (
    <Section tone="warm">
      <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-end lg:gap-20">
        <Reveal>
          <Eyebrow>Medical trust</Eyebrow>
          <h2 className="mt-5 text-4xl leading-[1.04] sm:text-5xl">
            Specialist care, clear information and a team you can reach.
          </h2>
          <p className="mt-5 max-w-xl leading-relaxed text-muted-foreground">
            You should understand what is appropriate for you, what to expect and what questions to
            ask before deciding on treatment.
          </p>
        </Reveal>
        <Reveal delay={100}>
          <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {points.map((point) => (
              <p
                key={point}
                className="flex items-start gap-3 border-t border-border pt-4 text-sm font-medium"
              >
                <ShieldCheck
                  className="mt-0.5 size-4 shrink-0 text-hospital-blue"
                  aria-hidden="true"
                />
                {point}
              </p>
            ))}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

function Doctor() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          track("doctor_section_viewed");
          observer.disconnect();
        }
      },
      { threshold: 0.45 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return (
    <Section id="b-doctor" tone="sand">
      <div ref={ref} className="grid gap-12 lg:grid-cols-[1.12fr_.88fr] lg:items-center lg:gap-20">
        <Reveal>
          <Eyebrow>Your dermatologist guide</Eyebrow>
          <h2 className="mt-5 text-4xl leading-[1.04] sm:text-5xl">Meet Your Dermatologist</h2>
          <p className="mt-4 font-display text-3xl leading-tight text-clay sm:text-4xl">
            That's what the consultation is for.
          </p>
          <h3 className="mt-10 text-5xl leading-none sm:text-6xl">Dr. S. Kiruthika</h3>
          <p className="mt-3 text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Dermatologist · Sanjay Rithik Hospital
          </p>
          <p className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-hospital-blue">
            <ShieldCheck className="size-4" /> 19+ years of experience in dermatology and skin care
          </p>
          <blockquote className="mt-8 border-l-2 border-clay pl-6 font-display text-3xl leading-[1.18]">
            Good dermatology care should begin by understanding what has changed, what concerns you
            most, and what kind of result you want—before choosing a procedure.
          </blockquote>
          <div className="mt-9 flex flex-wrap items-center gap-3 text-sm">
            {["Assessment", "Options", "Expectations", "Decision"].map((step, index) => (
              <span key={step} className="flex items-center gap-3">
                <span className="rounded-full border border-border bg-card px-4 py-2">{step}</span>
                {index < 3 && <ArrowRight className="size-4 text-clay" />}
              </span>
            ))}
          </div>
          <p className="mt-7 text-xs text-muted-foreground">
            The official hospital website identifies Dr. S. Kiruthika as a Dermatologist. Full
            qualifications, registration details and biography should be supplied by the clinic
            before publication.
          </p>
          <a
            href="https://sanjayrithikhospital.com/team/dr-s-kiruthika/"
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block text-xs text-clay underline-offset-4 hover:underline"
          >
            View the hospital's doctor page
          </a>
          <Button variant="ink" size="xl" className="mt-8" asChild>
            <TrackedLink href="#b-consultation" event="booking_form_started" source="b-doctor">
              Book a Consultation With Dr. Kiruthika <ArrowRight />
            </TrackedLink>
          </Button>
        </Reveal>
        <Reveal delay={100}>
          <div className="doctor-placeholder">
            <img
              src={doctorKiruthika}
              alt="Dr. S. Kiruthika, dermatologist at Sanjay Rithik Hospital in Karur"
              loading="lazy"
              className="h-full min-h-[30rem] w-full rounded-[1.75rem] object-cover object-[50%_25%]"
            />
            <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
              Official portrait supplied by the clinic.
              <br />
              Credentials and registration: [NEEDS VERIFIED CLINIC DATA]
            </p>
          </div>
        </Reveal>
      </div>
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
    "Tell us which area you would like help with",
    "Meet Dr. Kiruthika",
    "She checks your skin and hair, and listens to your questions",
    "She explains what may suit you, the visits, possible risks and the cost",
    "You decide later, after getting answers",
  ];
  return (
    <Section tone="paper" className="relative overflow-hidden">
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
              poster={videoPosterImage}
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
          <p className="mt-3 text-left text-[0.65rem] leading-relaxed text-ink-foreground/40">
            {selectedVideo.caption}
          </p>
        </Reveal>
        <Reveal delay={100}>
          <Eyebrow muted>A clear, low-pressure next step</Eyebrow>
          <h2 className="mt-5 text-5xl leading-[1.02] sm:text-6xl">What happens at your first visit?</h2>
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
  );
}

function Proof() {
  return (
    <Section id="b-why-hospital" tone="paper">
      <Reveal className="max-w-3xl">
        <Eyebrow>Why Sanjay Rithik Hospital</Eyebrow>
        <h2 className="mt-5 text-4xl leading-[1.04] sm:text-5xl">
          Local care, clear information and a real team you can reach.
        </h2>
        <p className="mt-5 leading-relaxed text-muted-foreground">
          Credibility here is based on the hospital's published information and supplied clinic
          materials. Clinical outcome claims remain separate until consented evidence is available.
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
            <p className="mt-5 text-xs text-muted-foreground">Source: official hospital website</p>
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
            <p className="mt-5 text-xs text-muted-foreground">Source: official hospital website</p>
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
  );
}

const FAQS = [
    ["Will laser suit my skin?", "The doctor needs to assess your skin and hair before advising you."],
    ["Will it hurt?", "Comfort varies. Ask what you may feel and how the team manages discomfort."],
    ["How many visits will I need?", "The doctor can discuss an expected plan after assessment. Ask whether later maintenance may be needed."],
    ["Will the hair stop growing forever?", "Do not expect a guarantee that every hair will disappear forever. Ask the doctor what reduction and ongoing care may be realistic."],
    ["What could laser hair reduction cost?", "The cost depends on the area and proposed plan. Ask for a clear quote and what it includes."],
    ["Can I ask about a private area?", "You can contact the clinic first to ask about consultation and treatment arrangements."],
    ["Can I start before a wedding or function?", "Tell the doctor your event date before deciding. Ask what timing and recovery are realistic."],
    ["Is my appointment confirmed after I send the form?", "No. The clinic will contact you to arrange and confirm a suitable time."],
    ["When is the clinic open?", "Every day, 10 am–2:30 pm and 6–9:30 pm, at 77A, Sengunthapuram Main Road, Karur. You can also message us on WhatsApp."],
  ];

function Objections() {
  const [open, setOpen] = useState(0);
  return (
    <Section tone="warm">
      <div className="grid gap-12 lg:grid-cols-[.82fr_1.18fr] lg:gap-20">
        <Reveal>
          <Eyebrow>Questions are normal</Eyebrow>
          <h2 className="mt-5 text-4xl leading-[1.04] sm:text-5xl">
            What would you like to know before deciding?
          </h2>
          <p className="mt-6 leading-relaxed text-muted-foreground">
            You don't need to decide on a treatment today.
          </p>
          <Button variant="ink" size="xl" className="mt-8" asChild>
            <TrackedLink href="#b-consultation" event="booking_form_started" source="objections">
              Start With a Conversation <ArrowRight />
            </TrackedLink>
          </Button>
        </Reveal>
        <Reveal delay={100}>
          <ul className="faq-grid">
            {FAQS.map(([question, answer], index) => {
              const isOpen = open === index;
              return (
                <li key={question} className="border-t border-border last:border-b">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${index}`}
                    onClick={() => {
                      setOpen(isOpen ? -1 : index);
                      if (!isOpen) track("faq_opened", { question });
                    }}
                    className="flex w-full items-center justify-between gap-6 py-5 text-left"
                  >
                    <span className="font-medium">{question}</span>
                    {isOpen ? (
                      <Minus className="size-4 shrink-0 text-clay" />
                    ) : (
                      <Plus className="size-4 shrink-0" />
                    )}
                  </button>
                  <div
                    id={`faq-answer-${index}`}
                    aria-hidden={!isOpen}
                    className={cn(
                      "grid transition-all duration-200",
                      isOpen ? "grid-rows-[1fr] pb-6" : "grid-rows-[0fr]",
                    )}
                  >
                    <p className="overflow-hidden text-sm leading-relaxed text-muted-foreground">
                      {answer}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </Section>
  );
}

function Consultation({
  answers,
  ageJourney,
  profile,
  faceAreas,
}: {
  answers: Answers;
  ageJourney?: AgeJourneySelection | undefined;
  profile?: ResultProfile | undefined;
  faceAreas?: string[] | undefined;
}) {
  return (
    <Section id="b-consultation" tone="sand">
      <div className="grid gap-12 lg:grid-cols-[.82fr_1.18fr] lg:gap-16">
        <Reveal>
          <Eyebrow muted>Free consultation</Eyebrow>
          <h2 className="mt-5 text-4xl leading-[1.04] sm:text-[3.4rem]">
            Ready to ask your questions in Karur?
          </h2>
          <p className="mt-6 leading-relaxed text-ink-foreground/65">
            Tell us what you would like help with. The team at Sanjay Rithik Hospital will contact
            you to arrange a consultation with Dr. Kiruthika.
          </p>
          <div className="mt-9 grid gap-3 text-sm text-ink-foreground/70 sm:grid-cols-2">
            {[
              "Will it suit my skin?",
              "Will it hurt?",
              "How many visits?",
              "What could it cost?",
              "Time to recover",
              "Ask every question you have",
            ].map((item) => (
              <p
                key={item}
                className="flex items-start gap-3 rounded-2xl border border-white/10 p-3"
              >
                <Check className="mt-0.5 size-4 shrink-0 text-clay" />
                {item}
              </p>
            ))}
          </div>
          <p className="mt-6 flex items-center gap-3 text-sm text-ink-foreground/70">
            <Clock3 className="size-4 text-clay" /> Open daily 10 am–2:30 pm · 6–9:30 pm. You are
            requesting a consultation, not agreeing to treatment.
          </p>
          <p className="mt-4 flex items-center gap-3 text-sm text-ink-foreground/70">
            <MapPin className="size-4 text-clay" /> 77A, Sengunthapuram Main Road, Karur 639002.
          </p>
          <a
            className="final-whatsapp-link mt-6"
            href="https://wa.me/918903009723?text=Hello%2C%20I%20have%20a%20question%20about%20laser%20hair%20reduction."
            target="_blank"
            rel="noreferrer"
            onClick={() => track("whatsapp_clicked", { source: "final-cta" })}
          >
            Ask a Question on WhatsApp <ArrowRight className="size-4" />
          </a>
        </Reveal>
        <Reveal delay={100} className="text-foreground">
          <LeadForm
            answers={answers}
            ageJourney={ageJourney}
            profile={profile}
            faceAreas={faceAreas}
          />
        </Reveal>
      </div>
    </Section>
  );
}

function FinalClose() {
  return (
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
  );
}

function Footer() {
  return (
    <footer className="site-footer-light px-5 pb-12 pt-10 sm:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 border-t border-white/10 pt-8 text-xs sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <div className="flex items-center gap-3">
            <img src={hospitalLogo} alt="" className="size-10 object-contain" />
            <p className="font-display text-lg text-ink-foreground">Sanjay Rithik Hospital</p>
          </div>
          <p className="mt-2">Dermatology - Karur</p>
        </div>
        <div className="sm:text-right">
          <p>77A, Sengunthapuram Main Road, Karur 639002.</p>
          <p className="mt-2">Educational information only—not medical advice or diagnosis.</p>
        </div>
      </div>
    </footer>
  );
}

function StickyBar({ stage }: { stage: "hidden" | "skin" | "options" | "booking" }) {
  const config = {
    hidden: { href: "#b-skin-check", label: "Check My Skin", event: "hero_assessment_click" },
    skin: { href: "#b-skin-check", label: "Check My Skin", event: "hero_assessment_click" },
    options: {
      href: "#b-treatment-options",
      label: "See My Options",
      event: "treatment_options_click",
    },
    booking: { href: "#b-consultation", label: "Book Consultation", event: "hero_booking_click" },
  }[stage];
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 px-4 py-3 backdrop-blur transition-transform duration-500 md:hidden",
        stage !== "hidden" ? "translate-y-0" : "translate-y-full",
      )}
    >
      <div className="flex items-center gap-2">
        <Button variant="clay" size="pill" className="flex-1" asChild>
          <TrackedLink href={config.href} event={config.event} source="sticky">
            {config.label}
          </TrackedLink>
        </Button>
      </div>
    </div>
  );
}

