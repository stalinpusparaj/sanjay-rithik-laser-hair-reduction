import portrait from "./a/assets/hero-portrait.jpg";

const photos: Record<string, { label: string; x: number; y: number; zoom: number }> = {
  "Fine Lines": { label: "Forehead and eye area", x: 44, y: 29, zoom: 230 },
  Firmness: { label: "Cheeks and jawline", x: 50, y: 61, zoom: 210 },
  Pigmentation: { label: "Cheek area", x: 54, y: 47, zoom: 280 },
  Texture: { label: "Cheek and nose area", x: 43, y: 46, zoom: 270 },
  "Tired / Dull Appearance": { label: "Facial skin", x: 47, y: 40, zoom: 150 },
  "Overall Rejuvenation": { label: "Overall face", x: 50, y: 42, zoom: 115 },
  "Acne & Breakouts": { label: "Cheek and chin area", x: 48, y: 53, zoom: 230 },
  "Hair & Scalp Concerns": { label: "Hairline and hair", x: 55, y: 14, zoom: 210 },
  "Scars & Texture": { label: "Cheek skin texture", x: 55, y: 48, zoom: 300 },
  "Sensitive Skin": { label: "Facial skin and cheek area", x: 53, y: 45, zoom: 220 },
};

export function TreatmentPhoto({ concern }: { concern: string }) {
  const photo = photos[concern] ?? photos["Overall Rejuvenation"]!;
  return (
    <figure className="mt-6 overflow-hidden rounded-2xl border border-border">
      <div className="relative aspect-[2/1] overflow-hidden bg-ink">
        <img
          src={portrait}
          alt={`${photo.label} — illustration for ${concern.toLowerCase()}`}
          width={1200}
          height={1504}
          loading="lazy"
          className="brand-photo absolute left-1/2 top-1/2 h-auto max-w-none"
          style={{ width: `${photo.zoom}%`, transform: `translate(-${photo.x}%, -${photo.y}%)` }}
        />
      </div>
      <figcaption className="bg-sand px-4 py-3 text-xs text-muted-foreground">
        {photo.label} · Area illustration, not a clinical example or treatment result.
      </figcaption>
    </figure>
  );
}
