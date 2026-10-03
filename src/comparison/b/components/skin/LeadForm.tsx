import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { ArrowRight, CalendarCheck, Check, ShieldCheck } from "lucide-react";
import { WhatsAppIcon as MessageCircle } from "../../../SiteChrome";
import { toast } from "sonner";
import { Button } from "@/comparison/b/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAttribution, track } from "@/comparison/b/lib/analytics";
import type { Answers, ResultProfile } from "./SkinAssessment";
import type { AgeJourneySelection } from "./AgeJourney";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid mobile number")
    .max(20)
    .regex(/^[0-9+\-\s()]+$/, "Please enter a valid mobile number")
    .refine((value) => value.replace(/\D/g, "").length >= 10 && value.replace(/\D/g, "").length <= 15, "Please enter a valid mobile number"),
  concern: z.string().trim().min(1, "Please select your primary concern"),
  time: z.string().trim().min(1, "Please choose a preferred time"),
  consent: z.literal("on", {
    errorMap: () => ({ message: "Please consent to being contacted about this request" }),
  }),
});


const CONCERNS = [
  "Acne", "Hair loss", "Scars", "Sensitive skin", "Dark circles", "Something else",
  "Fine lines",
  "Wrinkles",
  "Loss of firmness",
  "Dullness",
  "Pigmentation",
  "Texture / pores",
  "Loss of facial volume",
  "Overall ageing",
  "I'm not sure",
];
const TIMES = ["Morning", "Afternoon", "Evening", "Please call me to arrange"];

export function LeadForm({
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [started, setStarted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    const select = formRef.current?.elements.namedItem("concern") as HTMLSelectElement | null;
    if (select && answers["concern"]) select.value = answers["concern"];
  }, [answers["concern"]]);

  function onFirstInput() {
    if (!started) {
      setStarted(true);
      track("booking_form_started");
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const raw = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>;
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        next[String(issue.path[0])] = issue.message;
      });
      setErrors(next);
      formRef.current?.querySelector<HTMLElement>(`[name="${Object.keys(next)[0]}"]`)?.focus();
      return;
    }

    setErrors({});
    setSubmitting(true);
    const payload = {
      lead_type: "consultation_booking",
      name: parsed.data.name,
      phone: parsed.data.phone,
      primary_concern: parsed.data.concern,
      preferred_time: parsed.data.time,
      assessment_responses: answers,
      result_profile: profile?.name ?? null,
      result_dimensions: profile?.dims ?? null,
      face_areas: faceAreas ?? [],
      age_journey_selection: ageJourney ?? null,
      treatment_interests: [],
      consent_status: true,
      landing_page_identifier: "laser-hair-reduction-karur",
      timestamp: new Date().toISOString(),
      ...getAttribution(),
    };

    try {
      const endpoint =
        (import.meta.env["VITE_LEAD_ENDPOINT"] as string | undefined) ?? "/api/lead-capture";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const receipt = response.ok ? await response.json().catch(() => null) : null;
      // Only show success once the server confirms the lead was stored.
      if (receipt?.ok !== true) throw new Error("Lead endpoint rejected the request");
      // Skin details stay out of analytics; only the fact of a submission is tracked.
      track("booking_form_submitted", { ...getAttribution() });
      track("booking_form_completed", { ...getAttribution() });
      setSubmitted(true);
      toast.success("Your consultation request has been received.");
    } catch {
      setErrors({
        form: "We couldn't send your request. Please try again or contact the clinic directly.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div
        className="rounded-3xl border border-border bg-card p-8 shadow-lift sm:p-10"
        aria-live="polite"
      >
        <div className="flex size-12 items-center justify-center rounded-full bg-sand text-clay">
          <Check className="size-5" />
        </div>
        <h3 className="mt-6 text-3xl sm:text-4xl">You're one step closer to clarity.</h3>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          We've received your consultation request. The clinic will contact you to confirm your
          appointment.
        </p>
        <div className="mt-7 rounded-2xl bg-sand p-5">
          <p className="eyebrow text-clay">What happens next</p>
          <ol className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            {[
              "Appointment confirmation",
              "Visit the clinic",
              "Discuss your concerns",
              "Understand suitable options",
              "Decide your next step",
            ].map((item, index) => (
              <li key={item} className="flex gap-3">
                <span className="text-clay">0{index + 1}</span>
                {item}
              </li>
            ))}
          </ol>
        </div>
        <a
          href="https://wa.me/918903009723"
          target="_blank"
          rel="noreferrer"
          onClick={() => track("whatsapp_clicked", { source: "confirmation" })}
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-clay underline-offset-4 hover:underline"
        >
          <MessageCircle className="size-4" /> Have a question while you wait? Talk to us on
          WhatsApp.
        </a>
      </div>
    );
  }

  const field = (name: string, label: string, type = "text", placeholder = "") => (
    <div>
      <Label htmlFor={"b-consultation-" + name} className="form-label">
        {label}
      </Label>
      <Input
        id={"b-consultation-" + name}
        name={name}
        type={type}
        autoComplete={name === "phone" ? "tel" : name === "name" ? "name" : undefined}
        aria-invalid={!!errors[name]}
        aria-describedby={errors[name] ? `b-error-${name}` : undefined}
        placeholder={placeholder}
        onInput={onFirstInput}
        maxLength={255}
        className="mt-2 h-12 rounded-xl border-border bg-background"
      />
      {errors[name] && <p id={`b-error-${name}`} role="alert" className="mt-1.5 text-xs text-destructive">{errors[name]}</p>}
    </div>
  );

  const selectField = (name: string, label: string, options: string[], defaultValue = "") => (
    <div>
      <Label htmlFor={"b-consultation-" + name} className="form-label">
        {label}
      </Label>
      <select
        id={"b-consultation-" + name}
        name={name}
        defaultValue={defaultValue}
        aria-invalid={!!errors[name]}
        aria-describedby={errors[name] ? `b-error-${name}` : undefined}
        onInput={onFirstInput}
        className="mt-2 h-12 w-full rounded-xl border border-border bg-background px-3 text-sm"
      >
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {errors[name] && <p id={`b-error-${name}`} role="alert" className="mt-1.5 text-xs text-destructive">{errors[name]}</p>}
    </div>
  );

  return (
    <form
      ref={formRef}
      method="post"
      action="/api/lead-capture"
      onSubmit={handleSubmit}
      noValidate
      className="rounded-3xl border border-border bg-card p-7 shadow-lift sm:p-10"
    >
      <div className="mb-7 flex items-center justify-between gap-3 border-b border-border pb-5">
        <span className="flex items-center gap-3">
          <CalendarCheck className="size-5 text-clay" />
          <span className="text-sm font-medium">Request your free consultation</span>
        </span>
      </div>
      {ageJourney && (
        <div className="mb-6 rounded-2xl bg-sand p-4">
          <p className="eyebrow text-clay">Your age-preview interest</p>
          <p className="mt-2 text-sm">
            {ageJourney.label} · visual age range {ageJourney.ageRange}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            This will be shared as a conversation preference—not as a treatment goal or expected
            result.
          </p>
        </div>
      )}
      <div>
        <h3 className="text-3xl">Let's start with the essentials.</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          A few details help the clinic understand how to contact you and what you would like
          to discuss.
        </p>
        <div className="mt-7 grid gap-5">
          {field("name", "Your name", "text", "Your name")}
          {field("phone", "Mobile number", "tel", "+91")}
          {selectField("concern", "Primary concern", CONCERNS, answers["concern"] ?? "")}
          {selectField("time", "Preferred consultation time", TIMES)}
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          No treatment is booked at this stage.
        </p>
      </div>
      <div>
        <label className="mt-6 flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-muted-foreground">
          <input
            type="checkbox"
            name="consent"
            aria-invalid={!!errors["consent"]}
            aria-describedby={errors["consent"] ? "b-error-consent" : undefined}
            onInput={onFirstInput}
            className="mt-0.5 size-4 rounded border-border accent-[var(--clay)]"
          />
          <span>
            I consent to Sanjay Rithik Hospital contacting me about this consultation request. No
            treatment is booked by submitting this form.
          </span>
        </label>
        {errors["consent"] && <p id="b-error-consent" role="alert" className="mt-2 text-xs text-destructive">{errors["consent"]}</p>}
        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row">
          <Button type="submit" variant="clay" size="xl" className="flex-1" disabled={submitting}>
            {submitting ? "Sending request…" : "Request My Free Consultation"} <ArrowRight />
          </Button>
        </div>
      </div>
      {errors["form"] && (
        <p role="alert" className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
          {errors["form"]}
        </p>
      )}
      <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
        The clinic will contact you to confirm your appointment. No treatment is booked at this stage.
      </p>
    </form>
  );
}
