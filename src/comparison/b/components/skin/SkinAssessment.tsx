import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  Waves,
  ArrowLeft,
  ArrowRight,
  Check,
  CircleDot,
  Droplets,
  Feather,
  HelpCircle,
  Lock,
  Sparkles,
  Sun,
  type LucideIcon,
} from "lucide-react";
import { setSkinCheck } from "@/comparison/skinCheckStore";
import { getAttribution, track } from "@/comparison/b/lib/analytics";
import { cn } from "@/comparison/b/lib/utils";

export type Answers = Record<string, string>;

export type ResultProfile = { name: string; dims: Record<string, number> };

/**
 * The skin check is a short game: two taps (plus an optional "when"), then a useful
 * result with the booking form right beside it. Fewer questions and no gate before the
 * result means more visitors reach the form; answers still flow to the CRM and score.
 */
type Concern = {
  value: string;
  /** Short phrase used in the result: "You want help with <short>…" */
  short: string;
  hint: string;
  icon: LucideIcon;
  profile: ResultProfile;
};

const LASER_DIMS = { "Fine Lines": 10, Firmness: 10, Texture: 35, Pigmentation: 30 };

// Step 1: which area. Names describe areas only; nothing here infers a health condition.
const CONCERNS: Concern[] = [
  { value: "Face / upper lip / chin", short: "facial hair", hint: "Upper lip, chin or face", icon: Feather, profile: { name: "Laser · Face", dims: LASER_DIMS } },
  { value: "Underarms", short: "underarm hair", hint: "Underarm area", icon: CircleDot, profile: { name: "Laser · Underarms", dims: LASER_DIMS } },
  { value: "Arms / legs", short: "arm or leg hair", hint: "Arms, legs or both", icon: Waves, profile: { name: "Laser · Arms and legs", dims: LASER_DIMS } },
  { value: "Several areas", short: "hair on several areas", hint: "More than one area", icon: Sun, profile: { name: "Laser · Several areas", dims: LASER_DIMS } },
  { value: "Another area", short: "another area", hint: "An area not listed here", icon: Droplets, profile: { name: "Laser · Another area", dims: LASER_DIMS } },
  { value: "I'd prefer to discuss privately", short: "an area you'd like to discuss privately", hint: "Tell the doctor in person", icon: HelpCircle, profile: { name: "Laser · Discuss privately", dims: LASER_DIMS } },
];

// Step 2: what bothers them about the routine.
const PRIORITIES = [
  "It takes too much time",
  "Hair keeps coming back",
  "I dislike my current method",
  "I keep planning appointments",
  "I just want to explore options",
];

// Step 3: what they want answered first, with a short checklist to take to the consultation.
const WORRIES: Array<[string, string, string[]]> = [
  ["Will it suit my skin?", "whether it will suit your skin", ["Will laser suit my skin and hair type?", "Is there anything I should avoid before a visit?"]],
  ["Will it hurt?", "how it will feel", ["What will I feel during a visit?", "How does the team manage discomfort?"]],
  ["How many visits?", "how many visits you may need", ["How many visits may I need for this area?", "Will I need maintenance visits later?"]],
  ["What could it cost?", "cost", ["What could the full plan cost?", "What does the quote include?"]],
  ["Can I discuss this privately?", "discussing it privately", ["Can I talk about this area with the doctor in private?", "Who will be present during treatment?"]],
  ["I am not sure", "where to start", ["What may suit me?", "What should I expect at the first visit?"]],
];

/** Reflect the visitor's own choices back; never a diagnosis or a promised result. */
function resultFor(answers: Answers): [string, string] {
  const area = concernFor(answers["concern"]).short;
  const question = WORRIES.find(([value]) => value === answers["worry"])?.[1];
  return [
    question
      ? `You want help with ${area}, and ${question} is your main question.`
      : `You want help with ${area}.`,
    "At your consultation, ask what plan may suit your skin, how many visits may be needed, and what the full quote includes.",
  ];
}

function checklistFor(answers: Answers): string[] {
  return (
    WORRIES.find(([value]) => value === answers["worry"])?.[2] ?? [
      "Will laser suit my skin and hair type?",
      "How many visits may I need, and what could it cost?",
    ]
  );
}

const STEPS = ["concern", "priority", "worry"] as const;

type Stage = "quiz" | "result" | "done";

function concernFor(value?: string) {
  return CONCERNS.find((item) => item.value === value) ?? CONCERNS[CONCERNS.length - 1]!;
}

const WHATSAPP =
  "https://wa.me/918903009723?text=" +
  encodeURIComponent("Hello, I have a question about laser hair reduction.");

export function SkinAssessment({
  initialAreas = [],
  onComplete,
  onProfile,
}: {
  initialAreas?: string[];
  onComplete: (answers: Answers) => void;
  onProfile?: (profile: ResultProfile) => void;
}) {
  const [step, setStep] = useState(0);
  const [stage, setStage] = useState<Stage>("quiz");
  const [answers, setAnswers] = useState<Answers>({});
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);

  useEffect(() => {
    if (moved.current) headingRef.current?.focus();
  }, [step, stage]);

  function finish(next: Answers) {
    const withAreas = initialAreas.length ? { ...next, area: initialAreas.join(", ") } : next;
    const profile = concernFor(withAreas["concern"]).profile;
    setAnswers(withAreas);
    onComplete(withAreas);
    onProfile?.(profile);
    setSkinCheck({ answers: withAreas, profile });
    // Skin answers stay out of analytics; only progress through the quiz is tracked.
    track("assessment_completed");
    setStage("result");
  }

  function pick(value: string) {
    moved.current = true;
    const id = STEPS[step]!;
    if (step === 0) {
      track("assessment_started");
    }
    track("assessment_question_answered", { question: id, question_number: step + 1 });
    const next = { ...answers, [id]: value };
    setAnswers(next);
    if (step === STEPS.length - 1) finish(next);
    else setStep(step + 1);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (name.trim().length < 2 || phone.replace(/\D/g, "").length < 10) {
      setError("Please add your name and 10-digit mobile number.");
      return;
    }
    setError("");
    setSending(true);
    const concern = concernFor(answers["concern"]);
    const endpoint =
      (import.meta.env["VITE_LEAD_ENDPOINT"] as string | undefined)?.trim() || "/api/lead-capture";
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          lead_type: "skin_profile_result",
          source: "skin_check",
          name: name.trim(),
          phone: phone.trim(),
          primary_concern: answers["concern"] ?? "",
          result_profile: concern.profile.name,
          result_dimensions: concern.profile.dims,
          assessment_responses: answers,
          consent_status: true,
          consent_whatsapp: true,
          landing_page_identifier: "laser-hair-reduction-karur",
          timestamp: new Date().toISOString(),
          ...getAttribution(),
        }),
        signal: AbortSignal.timeout(15000),
      });
      const receipt = response.ok ? await response.json() : null;
      if (receipt?.ok !== true) throw new Error("Lead not confirmed");
    } catch {
      setError("We couldn't save your details. Please try again, or message us on WhatsApp.");
      setSending(false);
      return;
    }
    track("skin_profile_lead_captured");
    setSending(false);
    setStage("done");
  }

  function restart() {
    moved.current = true;
    setAnswers({});
    setStep(0);
    setStage("quiz");
    setError("");
  }

  const dots = (
    <div className="skin-game-progress" aria-hidden="true">
      {[0, 1, 2, 3].map((index) => (
        <i key={index} className={cn((stage !== "quiz" || index <= step) && "on")} />
      ))}
    </div>
  );

  if (stage === "done") {
    return (
      <div className="skin-game skin-game-done" aria-live="polite">
        <span className="skin-game-done-check" aria-hidden="true">
          <Check />
        </span>
        <h3 ref={headingRef} tabIndex={-1} className="skin-game-heading">
          You've taken the right first step.
        </h3>
        <p className="skin-game-sub">
          The clinic will call or WhatsApp you to arrange your free consultation with Dr. S.
          Kiruthika. Want to pick a time now?
        </p>
        <a
          className="skin-game-btn"
          href={WHATSAPP}
          target="_blank"
          rel="noreferrer"
          onClick={() => track("whatsapp_clicked", { source: "skin_check_done" })}
        >
          Ask a Question on WhatsApp <ArrowRight />
        </a>
        <p className="skin-game-fine">
          77A, Sengunthapuram Main Road, Karur · Open daily 10 am–2:30 pm and 6–9:30 pm
        </p>
      </div>
    );
  }

  if (stage === "result") {
    const concern = concernFor(answers["concern"]);
    const Icon = concern.icon;
    const result = resultFor(answers);
    return (
      <div className="skin-game" aria-live="polite">
        {dots}
        <p className="skin-game-step">Your result</p>
        <h3 ref={headingRef} tabIndex={-1} className="skin-game-heading">
          Your calm next step
        </h3>
        <div className="skin-game-result">
          <div className="skin-game-result-card">
            <span className="skin-game-result-icon" aria-hidden="true">
              <Icon />
            </span>
            <p className="skin-game-kicker">What you could ask the doctor</p>
            <p className="skin-game-result-title">{result[0]}</p>
            <p className="skin-game-result-copy">{result[1]}</p>
            <p className="skin-game-kicker">Questions to ask</p>
            <ul className="skin-game-checklist">
              {checklistFor(answers).map((item) => (
                <li key={item}>
                  <Check aria-hidden="true" /> {item}
                </li>
              ))}
            </ul>
            <ul className="skin-game-tags" aria-label="Your answers">
              <li>{concern.value}</li>
              {answers["priority"] && <li>{answers["priority"]}</li>}
              {answers["worry"] && <li>First question: {answers["worry"]}</li>}
            </ul>
            <p className="skin-game-note">
              A consultation doesn't commit you to treatment. You'll hear suitable options,
              sessions, downtime and cost before you decide.
            </p>
          </div>

          <form className="skin-game-form" method="post" action="/api/lead-capture" onSubmit={submit} noValidate>
            <p className="skin-game-offer">
              <Sparkles aria-hidden="true" /> Free consultation · Karur
            </p>
            <p className="skin-game-form-title">Want to ask Dr. Kiruthika?</p>
            <p className="skin-game-form-sub">
              Leave your name and WhatsApp number. The clinic will arrange a time that suits you.
            </p>
            <label className="skin-game-field">
              <span>Your name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                autoComplete="name"
              />
            </label>
            <label className="skin-game-field">
              <span>Mobile / WhatsApp number</span>
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="10-digit number"
                inputMode="tel"
                autoComplete="tel"
              />
            </label>
            {error && <p className="skin-game-error">{error}</p>}
            <button type="submit" className="skin-game-btn skin-game-btn-full" disabled={sending}>
              {sending ? "Sending…" : "Ask the Doctor About My Concern"} {!sending && <ArrowRight />}
            </button>
            <p className="skin-game-fine">
              <Lock aria-hidden="true" /> No payment online. By booking you agree to be contacted
              about this consultation.
            </p>
          </form>
        </div>
        <button type="button" className="skin-game-back" onClick={restart}>
          <ArrowLeft /> Change answers
        </button>
      </div>
    );
  }

  const id = STEPS[step]!;
  return (
    <div className="skin-game">
      {dots}
      <p className="skin-game-step">
        Step {step + 1} of 3{id === "worry" && " · optional"}
      </p>
      {id === "concern" && (
        <>
          <h3 ref={headingRef} tabIndex={-1} className="skin-game-heading">
            Which area would you like help with?
          </h3>
          <p className="skin-game-sub">
            Pick one. You can talk about any other areas with the doctor.
          </p>
          <div className="skin-game-choices">
            {CONCERNS.map(({ value, hint, icon: Icon }) => (
              <button
                key={value}
                type="button"
                aria-pressed={answers["concern"] === value}
                className={cn("skin-game-choice", answers["concern"] === value && "selected")}
                onClick={() => pick(value)}
              >
                <span className="skin-game-choice-icon" aria-hidden="true">
                  <Icon />
                </span>
                <strong>{value}</strong>
                <span className="skin-game-choice-hint">{hint}</span>
              </button>
            ))}
          </div>
        </>
      )}
      {id !== "concern" && (
        <>
          <h3 ref={headingRef} tabIndex={-1} className="skin-game-heading">
            {id === "priority" ? "What bothers you most about your routine?" : "What would you like answered first?"}
          </h3>
          <p className="skin-game-sub">
            {id === "priority"
              ? "There is no right answer. Pick the one closest to you."
              : "Pick the question you most want the doctor to answer."}
          </p>
          <div className="skin-game-answers skin-game-answers-two">
            {(id === "priority" ? PRIORITIES : WORRIES.map(([value]) => value)).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={answers[id] === option}
                className={cn("skin-game-answer", answers[id] === option && "selected")}
                onClick={() => pick(option)}
              >
                {option} <ArrowRight aria-hidden="true" />
              </button>
            ))}
          </div>
          {id === "worry" && (
            <button type="button" className="skin-game-skip" onClick={() => finish(answers)}>
              Skip and see my result
            </button>
          )}
        </>
      )}
      <div className="skin-game-actions">
        {step > 0 ? (
          <button
            type="button"
            className="skin-game-back"
            onClick={() => {
              moved.current = true;
              setStep(step - 1);
            }}
          >
            <ArrowLeft /> Back
          </button>
        ) : (
          <span className="skin-game-fine">About 30 seconds · no photos needed · not a diagnosis</span>
        )}
      </div>
    </div>
  );
}
