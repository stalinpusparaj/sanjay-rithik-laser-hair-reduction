import { useId, useRef, useState, type FormEvent } from "react";
import { ArrowRight, Check, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAttribution, track } from "@/lib/analytics";
import { deliverLead } from "@/lib/lead-delivery";
import type { AgeJourneySelection } from "./AgeJourney";

export function LeadForm({
  ageJourney,
  faceAreas = [],
  source = "consultation",
  onSuccess,
}: {
  ageJourney?: AgeJourneySelection | undefined;
  faceAreas?: string[] | undefined;
  source?: string;
  onSuccess?: (() => void) | undefined;
}) {
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const sending = useRef(false);
  const started = useRef(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current) return;
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const digits = phone.replace(/[\s()+-]/g, "");
    const next: Record<string, string> = {};
    if (name.length < 2 || name.length > 100)
      next["name"] = "Please enter your name (at least 2 characters).";
    if (!/^(?:91)?[6-9]\d{9}$/.test(digits))
      next["phone"] = "Enter a valid 10-digit Indian mobile number, with or without +91.";
    if (data.get("consent") !== "on")
      next["consent"] = "Please agree to be contacted about this enquiry.";
    setErrors(next);
    if (Object.keys(next).length) {
      track("booking_form_validation_failed", { source });
      formRef.current
        ?.querySelector<HTMLInputElement>('[name="' + Object.keys(next)[0] + '"]')
        ?.focus();
      return;
    }
    sending.current = true;
    setSubmitting(true);
    try {
      await deliverLead({
        lead_type: source === "age_preview" ? "age_transform_interest" : "consultation_booking",
        name,
        phone,
        primary_concern: String(data.get("concern") ?? "").trim(),
        face_areas: faceAreas,
        age_journey_selection: ageJourney ?? null,
        source,
        consent_status: true,
        photo_processing_consent: false,
        landing_page_identifier: "anti-aging-consultation-karur",
        timestamp: new Date().toISOString(),
        ...getAttribution(),
      });
      setSubmitted(true);
      track("booking_form_completed", { source });
      onSuccess?.();
    } catch {
      setErrors({
        form: "We couldn’t confirm delivery. Your appointment is not booked. Please retry, call or WhatsApp the clinic.",
      });
      track("booking_form_failed", { source });
    } finally {
      sending.current = false;
      setSubmitting(false);
    }
  }

  if (submitted)
    return (
      <div
        className="rounded-3xl border border-border bg-card p-7 text-foreground sm:p-9"
        role="status"
      >
        <Check className="size-9 text-foreground" />
        <h3 className="mt-5 text-3xl">Your enquiry has reached the clinic.</h3>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          The team will contact you to discuss the consultation fee and arrange a suitable
          appointment. Your appointment is confirmed separately.
        </p>
        <a className="mt-6 inline-flex items-center gap-2 underline" href="tel:+918903009723">
          <Phone className="size-4" /> Call +91 89030 09723
        </a>
      </div>
    );

  return (
    <form
      ref={formRef}
      onSubmit={submit}
      noValidate
      aria-busy={submitting}
      onInput={() => {
        if (!started.current) {
          started.current = true;
          track("booking_form_started", { source });
        }
      }}
      className="rounded-3xl border border-border bg-card p-6 text-foreground shadow-lift sm:p-8"
    >
      <p className="eyebrow text-muted-foreground">Let’s arrange your visit</p>
      <h3 className="mt-3 text-3xl">Request a consultation</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Just your name and mobile number to get started. The clinic will help you choose a date.
      </p>
      <div className="mt-6 grid gap-4">
        {(
          [
            ["name", "Your name", "text", "name", "Your full name"],
            ["phone", "Mobile / WhatsApp number", "tel", "tel", "10-digit mobile number"],
          ] as const
        ).map(([field, label, type, autoComplete, placeholder]) => (
          <div key={field}>
            <label htmlFor={id + "-" + field} className="text-sm font-medium">
              {label} <span className="text-muted-foreground">(required)</span>
            </label>
            <Input
              id={id + "-" + field}
              name={field}
              type={type}
              autoComplete={autoComplete}
              placeholder={placeholder}
              required
              maxLength={field === "phone" ? 20 : 100}
              aria-invalid={Boolean(errors[field])}
              aria-describedby={errors[field] ? id + "-" + field + "-error" : undefined}
              className="mt-2 h-12 rounded-xl bg-background"
            />
            {errors[field] && (
              <p id={id + "-" + field + "-error"} className="mt-2 text-xs text-destructive">
                {errors[field]}
              </p>
            )}
          </div>
        ))}
        <details className="rounded-xl border border-border px-4 py-3">
          <summary className="cursor-pointer text-sm">
            Add a skin concern <span className="text-muted-foreground">(optional)</span>
          </summary>
          <label htmlFor={id + "-concern"} className="mt-3 block text-xs text-muted-foreground">
            What would you like to discuss?
          </label>
          <Input
            id={id + "-concern"}
            name="concern"
            maxLength={300}
            placeholder="e.g. dark spots on my cheeks"
            className="mt-2 h-12 rounded-xl"
          />
        </details>
        {faceAreas.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Selected facial areas: {faceAreas.join(", ")}
          </p>
        )}
        <label className="flex items-start gap-3 text-xs leading-relaxed text-muted-foreground">
          <input
            name="consent"
            type="checkbox"
            required
            aria-invalid={Boolean(errors["consent"])}
            aria-describedby={errors["consent"] ? id + "-consent-error" : undefined}
            className="mt-0.5 size-4 shrink-0 accent-[var(--ink)]"
          />
          <span>
            I agree to Sanjay Rithik Hospital contacting me about this enquiry by phone or WhatsApp.
          </span>
        </label>
        {errors["consent"] && (
          <p id={id + "-consent-error"} className="text-xs text-destructive">
            {errors["consent"]}
          </p>
        )}
      </div>
      {errors["form"] && (
        <p role="alert" className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
          {errors["form"]}
        </p>
      )}
      <Button
        type="submit"
        variant="ink"
        size="xl"
        disabled={submitting}
        className="mt-5 h-auto min-h-14 w-full whitespace-normal px-3 py-3 text-sm"
      >
        {submitting
          ? "Sending your enquiry…"
          : source === "age_preview"
            ? "Send enquiry & continue"
            : "Request a Consultation"}
        <ArrowRight />
      </Button>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        No payment collected online. No treatment booked.
      </p>
      <a
        href="https://wa.me/918903009723?text=Hello%2C%20I%20would%20like%20to%20ask%20about%20a%20skin%20consultation."
        target="_blank"
        rel="noreferrer"
        onClick={() => track("whatsapp_clicked", { source })}
        className="mt-5 flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border text-sm font-medium"
      >
        <MessageCircle className="size-4" /> Prefer WhatsApp? Chat with us
      </a>
      <a
        href="tel:+918903009723"
        onClick={() => track("phone_clicked", { source })}
        className="mt-3 block text-center text-xs underline"
      >
        Or call +91 89030 09723
      </a>
    </form>
  );
}
