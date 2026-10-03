import { useRef, useState, type ChangeEvent, type DragEvent, type PointerEvent } from "react";
import {
  ArrowRight,
  CalendarCheck,
  ImageIcon,
  LockKeyhole,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  UploadCloud,
  WandSparkles,
  X,
} from "lucide-react";
import { Button } from "@/comparison/a/components/ui/button";
import { track } from "@/comparison/a/lib/analytics";
import { LeadForm } from "./LeadForm";
import { cn } from "@/comparison/a/lib/utils";
import babyImage from "@/assets/luxury-glow/age-demo-baby-teal.jpg";
import childImage from "@/assets/luxury-glow/age-demo-child-teal.jpg";
import teenImage from "@/assets/luxury-glow/age-demo-teen-teal.jpg";
import adultImage from "@/assets/luxury-glow/age-demo-adult-teal.jpg";
import middleAgeImage from "@/assets/luxury-glow/age-demo-middle-teal.jpg";
import elderlyImage from "@/assets/luxury-glow/age-demo-elderly-teal.jpg";

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const AGE_STAGES = [
  { key: "baby", label: "Baby", age: "2–3", image: babyImage },
  { key: "child", label: "Child", age: "8–12", image: childImage },
  { key: "teen", label: "Teen", age: "15–18", image: teenImage },
  { key: "adult", label: "Adult", age: "25–35", image: adultImage },
  { key: "middle", label: "Middle age", age: "45–55", image: middleAgeImage },
  { key: "elderly", label: "Elderly", age: "70+", image: elderlyImage },
] as const;

export type AgeJourneySelection = {
  stage: string;
  label: string;
  ageRange: string;
  mode: "sample" | "custom";
};

export function AgeJourney({
  onSelection,
}: {
  onSelection: (selection: AgeJourneySelection) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"sample" | "custom">("sample");
  const [stageIndex, setStageIndex] = useState(2);
  const [compare, setCompare] = useState(55);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [resultCache, setResultCache] = useState<Record<string, string>>({});
  const [consent, setConsent] = useState(false);
  const [detailsSubmitted, setDetailsSubmitted] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [engaged, setEngaged] = useState(false);

  const selectedStage = AGE_STAGES[stageIndex]!;
  const sourceImage = mode === "sample" ? adultImage : uploadedUrl;
  const targetImage = mode === "sample" ? selectedStage.image : resultUrl || uploadedUrl;

  function selectStage(index: number) {
    const nextStage = AGE_STAGES[index]!;
    setStageIndex(index);
    setCompare(55);
    setEngaged(true);
    setError("");
    if (mode === "custom") setResultUrl(resultCache[nextStage.key] ?? "");
    track("age_stage_selected", { stage: nextStage.key, mode });
    onSelection({
      stage: nextStage.key,
      label: nextStage.label,
      ageRange: nextStage.age,
      mode,
    });
  }

  function acceptFile(file: File) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Please upload a JPG, PNG or WebP portrait.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("Please choose an image smaller than 8 MB.");
      return;
    }
    if (uploadedUrl) URL.revokeObjectURL(uploadedUrl);
    const objectUrl = URL.createObjectURL(file);
    setUploadedFile(file);
    setUploadedUrl(objectUrl);
    setResultUrl("");
    setResultCache({});
    setConsent(false);
    setMode("custom");
    setCompare(55);
    setError("");
    setEngaged(true);
    track("age_photo_uploaded", {
      file_type: file.type,
      file_size_kb: Math.round(file.size / 1024),
    });
    onSelection({
      stage: selectedStage.key,
      label: selectedStage.label,
      ageRange: selectedStage.age,
      mode: "custom",
    });
  }

  function handleInput(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) acceptFile(file);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) acceptFile(file);
  }

  function clearUpload() {
    if (uploadedUrl) URL.revokeObjectURL(uploadedUrl);
    Object.values(resultCache).forEach((url) => {
      if (url.startsWith("blob:")) URL.revokeObjectURL(url);
    });
    setUploadedFile(null);
    setUploadedUrl("");
    setResultUrl("");
    setResultCache({});
    setConsent(false);
    setDetailsSubmitted(false);
    setMode("sample");
    setError("");
  }

  function setCompareFromPointer(event: PointerEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const percentage = ((event.clientX - bounds.left) / bounds.width) * 100;
    setCompare(Math.min(100, Math.max(0, percentage)));
  }

  function startCompareDrag(event: PointerEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("input, button, label")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setCompareFromPointer(event);
  }

  async function generateCustomPreview() {
    if (!uploadedFile) {
      setError("Upload a clear portrait first.");
      return;
    }
    if (!consent) {
      setError("Please confirm photo-processing consent before generating a preview.");
      return;
    }

    const cached = resultCache[selectedStage.key];
    if (cached) {
      setResultUrl(cached);
      return;
    }

    const endpoint =
      (import.meta.env["VITE_AGE_TRANSFORM_ENDPOINT"] as string | undefined) ??
      "/api/age-transform";

    setProcessing(true);
    setError("");
    track("age_transform_requested", { target_stage: selectedStage.key });

    try {
      const formData = new FormData();
      formData.append("image", uploadedFile);
      formData.append("targetStage", selectedStage.key);
      formData.append("targetAgeRange", selectedStage.age);
      const response = await fetch(endpoint, { method: "POST", body: formData });
      if (!response.ok) throw new Error("Transformation request failed");

      const contentType = response.headers.get("content-type") ?? "";
      let nextUrl = "";
      if (contentType.startsWith("image/")) {
        nextUrl = URL.createObjectURL(await response.blob());
      } else {
        const result = (await response.json()) as { imageUrl?: string; url?: string };
        nextUrl = result.imageUrl ?? result.url ?? "";
      }
      if (!nextUrl) throw new Error("No transformed image was returned");

      setResultCache((current) => ({ ...current, [selectedStage.key]: nextUrl }));
      setResultUrl(nextUrl);
      setCompare(55);
      track("age_transform_completed", { target_stage: selectedStage.key });
    } catch {
      setError(
        "We couldn't create the preview right now. Don't worry—we have your enquiry and the clinic can connect with you through email. You can also try a clear, front-facing photo again.",
      );
      track("age_transform_failed", { reason: "request_failed" });
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="age-lab">
      <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="inline-flex rounded-full border border-white/10 bg-white/[0.04] p-1">
          <button
            type="button"
            onClick={() => {
              setMode("sample");
              setError("");
              track("age_mode_selected", { mode: "sample" });
            }}
            className={cn(
              "min-h-11 rounded-full px-5 py-2.5 text-xs font-medium transition-colors",
              mode === "sample" ? "bg-clay text-clay-foreground" : "text-ink-foreground/60",
            )}
          >
            Try sample
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("custom");
              setError("");
              track("age_mode_selected", { mode: "custom" });
            }}
            className={cn(
              "min-h-11 rounded-full px-5 py-2.5 text-xs font-medium transition-colors",
              mode === "custom" ? "bg-clay text-clay-foreground" : "text-ink-foreground/60",
            )}
          >
            Use my photo
          </button>
        </div>
        <p className="flex items-center gap-2 text-[0.68rem] text-ink-foreground/48">
          <LockKeyhole className="size-3.5" />
          {mode === "sample" ? "Try the sample freely. No photo upload needed." : "Your photo stays in this browser until Generate sends it to fal.ai for processing."}
        </p>
      </div>

      <div className="age-workspace grid min-w-0 lg:grid-cols-[1fr_1fr]">
        <div className="min-w-0 border-white/10 p-3 sm:p-6 lg:border-r">
          {mode === "custom" && !detailsSubmitted ? (
            <div className="flex min-w-0 flex-col justify-center">
              <LeadForm
                source="age_preview"
                ageJourney={{
                  stage: selectedStage.key,
                  label: selectedStage.label,
                  ageRange: selectedStage.age,
                  mode: "custom",
                }}
                onSuccess={() => {
                  setDetailsSubmitted(true);
                  track("age_details_submitted", { target_stage: selectedStage.key });
                }}
              />
            </div>
          ) : mode === "custom" && !uploadedUrl ? (
            <div
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
              className="flex min-h-[31rem] flex-col items-center justify-center rounded-3xl border border-dashed border-white/20 bg-white/[0.025] p-8 text-center"
            >
              <div className="flex size-16 items-center justify-center rounded-full bg-white/[0.06] text-clay">
                <UploadCloud className="size-7" />
              </div>
              <h3 className="mt-6 text-3xl">Now upload a clear portrait</h3>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-foreground/55">
                Front-facing images with one person and even lighting usually work best.
              </p>
              <Button
                variant="clay"
                size="pill"
                className="mt-7"
                onClick={() => inputRef.current?.click()}
              >
                Choose photo
              </Button>
              <p className="mt-4 text-xs text-ink-foreground/70">JPG, PNG or WebP · Up to 8 MB</p>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-3xl bg-black/20">
              <div
                className="age-comparison-portrait relative w-full select-none overflow-hidden [touch-action:none]"
                onPointerDown={startCompareDrag}
                onDragStart={(event) => event.preventDefault()}
                onPointerMove={(event) => {
                  if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                    setCompareFromPointer(event);
                  }
                }}
                onPointerUp={(event) => {
                  if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                    setCompareFromPointer(event);
                    event.currentTarget.releasePointerCapture(event.pointerId);
                    track("age_comparison_interacted", { stage: selectedStage.key });
                    track("before_after_interacted", { stage: selectedStage.key });
                  }
                }}
                onPointerCancel={(event) => {
                  if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                    event.currentTarget.releasePointerCapture(event.pointerId);
                  }
                }}
              >
                <img
                  src={sourceImage}
                  draggable={false}
                  loading="lazy"
                  width={1024}
                  height={1280}
                  alt={
                    mode === "sample"
                      ? `AI-generated ${selectedStage.label.toLowerCase()} sample portrait`
                      : "Your uploaded portrait"
                  }
                  className={`age-main-portrait absolute inset-0 size-full object-cover ${mode === "sample" ? "age-sample-portrait" : ""}`}
                />
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ clipPath: `inset(0 0 0 ${compare}%)` }}
                >
                  <img
                    src={targetImage}
                    draggable={false}
                    loading="lazy"
                    width={1024}
                    height={1280}
                    alt={`${selectedStage.label} visual simulation`}
                    className={`age-main-portrait absolute inset-0 size-full object-cover ${mode === "sample" ? "age-sample-portrait" : ""}`}
                  />
                </div>
                <div
                  className="pointer-events-none absolute inset-y-0 z-10 w-px bg-white shadow-[0_0_0_1px_rgba(0,0,0,.2)]"
                  style={{ left: `${compare}%` }}
                >
                  <span className="absolute left-1/2 top-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-ink/80 text-xs text-white">
                    ↔
                  </span>
                </div>
                <span className="absolute left-3 top-3 rounded-full bg-ink/75 px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.14em] text-white backdrop-blur">
                  {mode === "sample" ? "Adult · Age 25–35" : "Original"}
                </span>
                <span className="absolute right-3 top-3 rounded-full bg-clay px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.14em] text-clay-foreground">
                  {resultUrl || mode === "sample" ? selectedStage.label : "Preview"}
                </span>
                {processing && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-ink/82 text-center backdrop-blur">
                    <RefreshCw className="size-7 animate-spin text-clay" />
                    <p className="mt-4 font-display text-2xl">Creating your age preview…</p>
                    <p className="mt-2 text-xs text-ink-foreground/50">This may take a moment.</p>
                  </div>
                )}
              </div>
              <label className="absolute inset-x-5 bottom-5 z-20 rounded-full border border-white/15 bg-ink/75 px-4 py-3 backdrop-blur">
                <span className="sr-only">Move comparison slider</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={compare}
                  onChange={(event) => {
                    setCompare(Number(event.target.value));
                    track("age_comparison_interacted", { stage: selectedStage.key });
                    track("before_after_interacted", { stage: selectedStage.key });
                  }}
                  className="age-range w-full"
                />
              </label>
              {mode === "custom" && (
                <button
                  type="button"
                  onClick={clearUpload}
                  className="absolute bottom-20 right-4 z-20 flex size-10 items-center justify-center rounded-full border border-white/20 bg-ink/75 text-white backdrop-blur"
                  aria-label="Remove uploaded photo"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleInput}
            className="sr-only"
          />
        </div>

        <div className="flex flex-col p-4 sm:p-6">
          <div>
            <p className="eyebrow text-clay">Choose an age stage</p>
            <h3 className="mt-3 text-3xl">Explore a different age.</h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-foreground/52">
              Choose a stage, then move the slider to compare. An educational illustration, not a prediction.
            </p>
          </div>

          <div className="age-stage-grid mt-6 grid grid-cols-3 gap-2">
            {AGE_STAGES.map((stage, index) => (
              <button
                key={stage.key}
                type="button"
                onClick={() => selectStage(index)}
                aria-pressed={stageIndex === index}
                className={cn(
                  "group rounded-2xl border p-2 text-left transition-all",
                  stageIndex === index
                    ? "border-clay bg-clay/10"
                    : "border-white/10 bg-white/[0.025] hover:border-white/25",
                )}
              >
                <img
                  src={stage.image}
                  alt=""
                  loading="lazy"
                  className="aspect-square w-full rounded-xl object-cover object-[60%_28%]"
                />
                <span className="mt-2 block text-xs font-medium text-ink-foreground">
                  {stage.label}
                </span>
                <span className="mt-0.5 block text-[0.62rem] text-ink-foreground/38">
                  Age {stage.age}
                </span>
              </button>
            ))}
          </div>

          {mode === "custom" && uploadedUrl && (
            <div className="mt-6 border-t border-white/10 pt-6">
              <label className="flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-ink-foreground/52">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(event) => {
                    setConsent(event.target.checked);
                    setError("");
                  }}
                  className="mt-0.5 size-4 rounded border-white/20 accent-[var(--clay)]"
                />
                <span>
                  I consent to this photo being processed by the configured AI provider to create
                  the selected age simulation.
                </span>
              </label>
              <Button
                variant="clay"
                size="xl"
                className="mt-5 w-full"
                onClick={generateCustomPreview}
                disabled={processing}
              >
                <WandSparkles />
                Generate {selectedStage.label} Preview
              </Button>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full py-2 text-xs text-ink-foreground/48 hover:text-ink-foreground"
              >
                <ImageIcon className="size-3.5" />
                Choose a different photo
              </button>
            </div>
          )}

          {error && (
            <p
              className="mt-5 rounded-2xl border border-clay/25 bg-clay/10 p-4 text-xs leading-relaxed text-ink-foreground/72"
              role="alert"
            >
              {error}
              {detailsSubmitted && (
                <a
                  href="mailto:info@sanjayrithikhospital.com?subject=Help%20with%20my%20anti-aging%20preview"
                  className="mt-2 block font-medium text-clay underline-offset-4 hover:underline"
                >
                  Email the clinic about my preview
                </a>
              )}
            </p>
          )}

          {(engaged || mode === "sample") && (
            <div className="mt-auto pt-7">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <p className="flex items-center gap-2 text-xs font-medium text-clay">
                  <Sparkles className="size-3.5" />A preview can start the conversation.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-ink-foreground/58">
                  A dermatologist can help you understand what may realistically improve—without
                  trying to turn back time.
                </p>
                <Button variant="onink" size="pill" className="mt-5 w-full" asChild>
                  <a
                    href="#b-consultation"
                    onClick={() =>
                      track("age_preview_consultation_click", { stage: selectedStage.key, mode })
                    }
                  >
                    Discuss My Skin Goals <ArrowRight />
                  </a>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-white/10 px-5 py-4 text-[0.66rem] leading-relaxed text-ink-foreground/38 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>AI visual simulation only. It does not represent a treatment result or guarantee.</p>
        <p>
          For adults to upload their own photo. Do not upload another person without permission.
        </p>
      </div>
    </div>
  );
}

