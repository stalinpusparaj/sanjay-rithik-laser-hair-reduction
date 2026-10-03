import { createFileRoute } from "@tanstack/react-router";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const stagePrompts = {
  baby: "Create a respectful age-regression preview of this same person at approximately age 3. Preserve recognizable facial identity, expression, pose, camera angle, lighting, clothing style, and background. Keep the result photorealistic and natural.",
  child:
    "Create a respectful age-regression preview of this same person at approximately age 9. Preserve recognizable facial identity, expression, pose, camera angle, lighting, clothing style, and background. Keep the result photorealistic and natural.",
  teen: "Create a respectful age-regression preview of this same person at approximately age 16. Preserve recognizable facial identity, expression, pose, camera angle, lighting, clothing style, and background. Keep the result photorealistic and natural.",
  adult:
    "Create a respectful age-transformation preview of this same person at approximately age 28. Preserve recognizable facial identity, expression, pose, camera angle, lighting, clothing style, and background. Keep natural skin texture and a photorealistic result.",
  middle:
    "Create a respectful age-progression preview of this same person at approximately age 48. Preserve recognizable facial identity, expression, pose, camera angle, lighting, clothing style, and background. Keep natural skin texture and a photorealistic result.",
  elderly:
    "Create a respectful age-progression preview of this same person at approximately age 72. Preserve recognizable facial identity, expression, pose, camera angle, lighting, clothing style, and background. Keep natural skin texture and a photorealistic result.",
} as const;

type Stage = keyof typeof stagePrompts;

function json(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  const chunks: string[] = [];
  for (let offset = 0; offset < bytes.length; offset += 32_768) {
    chunks.push(String.fromCharCode(...bytes.subarray(offset, offset + 32_768)));
  }
  return btoa(chunks.join(""));
}

export const Route = createFileRoute("/api/age-transform")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const falKey = process.env["FAL_KEY"];
        if (!falKey) {
          return json({ error: "Age transformation is not configured on the server." }, 503);
        }

        let formData: FormData;
        try {
          formData = await request.formData();
        } catch {
          return json({ error: "Invalid form submission." }, 400);
        }

        const image = formData.get("image");
        const targetStage = formData.get("targetStage");

        if (!(image instanceof File)) {
          return json({ error: "A portrait image is required." }, 400);
        }
        if (!ALLOWED_IMAGE_TYPES.has(image.type)) {
          return json({ error: "Use a JPG, PNG, or WebP image." }, 415);
        }
        if (image.size === 0 || image.size > MAX_IMAGE_BYTES) {
          return json({ error: "Image must be smaller than 8 MB." }, 413);
        }
        if (typeof targetStage !== "string" || !(targetStage in stagePrompts)) {
          return json({ error: "Invalid target age stage." }, 400);
        }

        const stage = targetStage as Stage;
        const imageData = arrayBufferToBase64(await image.arrayBuffer());

        try {
          const falResponse = await fetch("https://fal.run/fal-ai/image-editing/age-progression", {
            method: "POST",
            headers: {
              Authorization: `Key ${falKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              image_url: `data:${image.type};base64,${imageData}`,
              prompt: stagePrompts[stage],
              output_format: "jpeg",
              safety_tolerance: "2",
            }),
          });

          if (!falResponse.ok) {
            const providerError = await falResponse.text();
            console.error("fal age transformation failed", {
              status: falResponse.status,
              detail: providerError.slice(0, 500),
            });
            return json({ error: "The preview could not be generated." }, 502);
          }

          const result = (await falResponse.json()) as {
            images?: Array<{ url?: string }>;
          };
          const imageUrl = result.images?.[0]?.url;
          if (!imageUrl) {
            return json({ error: "The provider returned no image." }, 502);
          }

          return json({ imageUrl });
        } catch (error) {
          console.error("fal age transformation request failed", error);
          return json({ error: "The preview service is temporarily unavailable." }, 502);
        }
      },
    },
  },
});
