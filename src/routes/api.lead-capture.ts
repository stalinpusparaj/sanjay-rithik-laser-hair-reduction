import { createFileRoute } from "@tanstack/react-router";

type LeadPayload = {
  lead_type?: string;
  name?: string;
  phone?: string;
  email?: string;
  primary_concern?: string;
  [key: string]: unknown;
};

function json(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim().replace(/\s+/g, " ");
  const spaceIndex = trimmed.indexOf(" ");
  if (spaceIndex === -1) return { firstName: trimmed, lastName: "" };
  return { firstName: trimmed.slice(0, spaceIndex), lastName: trimmed.slice(spaceIndex + 1) };
}

function normalizePhone(raw: string): {
  primaryPhoneNumber: string;
  primaryPhoneCallingCode: string;
  primaryPhoneCountryCode: string;
} {
  const trimmed = raw.trim();
  if (trimmed.startsWith("+91")) {
    return {
      primaryPhoneNumber: trimmed.slice(3).replace(/\D/g, ""),
      primaryPhoneCallingCode: "+91",
      primaryPhoneCountryCode: "IN",
    };
  }
  if (trimmed.startsWith("+")) {
    return {
      primaryPhoneNumber: trimmed,
      primaryPhoneCallingCode: "",
      primaryPhoneCountryCode: "",
    };
  }
  return {
    primaryPhoneNumber: trimmed.replace(/\D/g, ""),
    primaryPhoneCallingCode: "+91",
    primaryPhoneCountryCode: "IN",
  };
}

function toMarkdown(payload: LeadPayload): string {
  const lines: string[] = [];
  for (const [key, value] of Object.entries(payload)) {
    if (
      value === undefined ||
      value === null ||
      value === "" ||
      key === "name" ||
      key === "phone"
    ) {
      continue;
    }
    const label = key.replace(/_/g, " ");
    const rendered =
      typeof value === "object"
        ? "```\n" + JSON.stringify(value, null, 2) + "\n```"
        : String(value);
    lines.push(`**${label}:** ${rendered}`);
  }
  return lines.join("\n\n");
}

const LEAD_SOURCE = "Sanjay Rithik laser hair reduction landing page";
// Same Twenty workspace as the main skin page; these labels keep the campaigns apart.
// Industry still contains "Dermatology", so the shared dashboard counts these leads too.
const LEAD_CAMPAIGN = "Laser hair reduction";
const LEAD_INDUSTRY = "Dermatology clinic · Laser hair reduction";

function enquirySummary(
  payload: LeadPayload,
  name: string,
  phone: string,
  isRepeat: boolean,
  scored?: { score: number; band: string },
) {
  const concern =
    typeof payload.primary_concern === "string" && payload.primary_concern
      ? payload.primary_concern
      : "Not given";
  const source = payload["source"];
  const form = typeof source === "string" && source ? source : "website";
  return [
    `${isRepeat ? "Repeat enquiry" : "New enquiry"} · ${LEAD_SOURCE}`,
    `Received ${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC via the ${form} form.`,
    "",
    "**Contact (as submitted)**",
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Concern: ${concern}`,
    ...(scored ? [`Lead score: ${scored.score} / 100 (${scored.band})`] : []),
    "",
    "**All submitted details**",
    toMarkdown(payload),
  ].join("\n");
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

const HIGH_VALUE_TREATMENTS =
  /laser|hair removal|botox|filler|prp|hydra|hifu|mnrf|booster|tattoo|scar|pigment|peel|anti.?ag/i;
const PAID_SOURCES = /^(facebook|fb|instagram|ig|meta|google|youtube)$/i;
const PAID_MEDIUMS = /^(cpc|ppc|paid|paid_social|paidsocial|ads|display)$/i;

type LeadTemperature = "HOT" | "WARM" | "COLD";

/**
 * Score an enquiry 0–100 from what the visitor told us, and band it:
 * Hot ≥ 70 · Warm 45–69 · Cold < 45. A plain consultation request starts Warm;
 * detail, buying signals and repeat enquiries push it towards Hot.
 */
const QUIZ_LABELS: Record<string, string> = {
  concern: "Main concern",
  impact: "How it affects them",
  timing: "Wants to start",
  priority: "What bothers them about their routine",
  worry: "Wants answered first",
  area: "Area noticed most",
  duration: "Noticed since",
  tried: "Already tried",
  goal: "Desired result",
  comfort: "Comfortable with",
};

/** Skin-check answers as a plain string map (empty when the visitor skipped the quiz). */
function quizAnswers(payload: LeadPayload): Record<string, string> {
  const raw = payload["assessment_responses"];
  if (!raw || typeof raw !== "object") return {};
  const answers: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (text(value)) answers[key] = text(value);
  }
  return answers;
}

function scoreLead(payload: LeadPayload, submissions: number) {
  const concern = text(payload.primary_concern);
  const answers = payload["assessment_responses"];
  let score = payload.lead_type === "age_transform_interest" ? 25 : 45;
  if (concern && !/not sure/i.test(concern)) score += 10;
  const intentText = [concern, JSON.stringify(answers ?? ""), text(payload["result_profile"])].join(" ");
  if (HIGH_VALUE_TREATMENTS.test(intentText)) score += 10;
  if (text(payload["preferred_time"])) score += 10;
  if (
    (answers && typeof answers === "object" && Object.keys(answers).length > 0) ||
    text(payload["result_profile"])
  )
    score += 10;
  if (
    PAID_SOURCES.test(text(payload["utm_source"])) ||
    PAID_MEDIUMS.test(text(payload["utm_medium"]))
  )
    score += 5;
  if (text(payload.email)) score += 5;
  // Skin-check signals: has already paid for clinic treatment, or is open to whatever
  // the dermatologist recommends — both convert better than "just browsing".
  const quiz = quizAnswers(payload);
  if (/previous clinical/i.test(quiz["tried"] ?? "")) score += 5;
  if (/open to dermatologist/i.test(quiz["comfort"] ?? "")) score += 5;
  // Skin-check game signals: urgency and "products keep failing" are the strongest intent.
  if (/this week/i.test(quiz["timing"] ?? "")) score += 10;
  else if (/month/i.test(quiz["timing"] ?? "")) score += 5;
  if (/keeps coming back|confidence/i.test(quiz["impact"] ?? "")) score += 5;
  // Laser quiz: routine frustration and price/visit questions signal readiness to book.
  if (/keeps coming back|too much time|planning appointments/i.test(quiz["priority"] ?? "")) score += 5;
  if (/cost|how many visits/i.test(quiz["worry"] ?? "")) score += 5;
  if (submissions > 1) score += 20;
  score = Math.min(100, score);
  const temperature: LeadTemperature = score >= 70 ? "HOT" : score >= 45 ? "WARM" : "COLD";
  const band = temperature === "HOT" ? "Hot" : temperature === "WARM" ? "Warm" : "Cold";
  return { score, temperature, band };
}

function scoreFields(payload: LeadPayload, submissions: number) {
  const { score, temperature, band } = scoreLead(payload, submissions);
  return { leadScore: score, leadTemperature: temperature, leadBand: band };
}

/** Map a landing-page enquiry onto the workspace's existing custom Opportunity lead fields. */
function opportunityFields(
  payload: LeadPayload,
  name: string,
  phone: string,
  referer: string | null,
): Record<string, unknown> {
  const quiz = quizAnswers(payload);
  const concern = text(payload.primary_concern) || quiz["concern"] || "";
  const preferredTime = text(payload["preferred_time"]);
  const quizLines = Object.entries(QUIZ_LABELS)
    .filter(([key]) => quiz[key])
    .map(([key, label]) => `  • ${label}: ${quiz[key]}`);
  const goals = [concern, quiz["goal"] && `wants: ${quiz["goal"]}`].filter(Boolean).join(" · ");
  const notes = [
    concern && `Concern: ${concern}`,
    preferredTime && `Preferred time: ${preferredTime}`,
    text(payload["result_profile"]) && `Skin-check result: ${text(payload["result_profile"])}`,
    quizLines.length > 0 && `Skin-check answers:\n${quizLines.join("\n")}`,
    text(payload["device"]) && `Device: ${text(payload["device"])}`,
    text(payload["referrer"]) && `Referrer: ${text(payload["referrer"])}`,
  ].filter(Boolean);
  const fields: Record<string, unknown> = {
    stage: "NEW",
    leadContactName: name,
    leadPhone: phone,
    leadForm: `${LEAD_CAMPAIGN} · ${text(payload["source"]) || text(payload.lead_type) || "website"}`,
    leadLandingPage: referer ?? LEAD_SOURCE,
    leadIndustry: LEAD_INDUSTRY,
    leadPreferredChannel: "Phone / WhatsApp",
    leadWantsCall: true,
    leadConsentContact: payload["consent_status"] === true,
    leadConsentWhatsapp: payload["consent_whatsapp"] === true,
    leadSubmissions: 1,
  };
  const optional: Record<string, string> = {
    leadEmail: text(payload.email),
    leadGoals: goals,
    leadTimeline: preferredTime,
    leadUtmSource: text(payload["utm_source"]),
    leadUtmMedium: text(payload["utm_medium"]),
    leadUtmCampaign: text(payload["utm_campaign"]),
    leadNotes: notes.join("\n"),
  };
  for (const [key, value] of Object.entries(optional)) if (value) fields[key] = value;
  return fields;
}

async function twentyFetch<T>(
  baseUrl: string,
  apiKey: string,
  path: string,
  init: RequestInit,
): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Twenty API ${path} responded ${response.status}: ${detail.slice(0, 300)}`);
  }
  return (await response.json()) as T;
}

async function syncGrowthOsLead(input: {
  payload: LeadPayload;
  name: string;
  phone: string;
  personId: string;
  opportunityId?: string;
  score?: ReturnType<typeof scoreLead>;
  isRepeat: boolean;
}) {
  const webhookUrl =
    process.env["GROWTHOS_TWENTY_WEBHOOK_URL"] ??
    "https://growthos.169.58.3.64.sslip.io/api/webhooks/twenty/demo-clinic";
  const webhookSecret = process.env["GROWTHOS_TWENTY_WEBHOOK_SECRET"];
  if (!webhookUrl || !webhookSecret) return;

  const event = input.isRepeat ? "opportunity.updated" : "opportunity.created";
  const timestamp = new Date().toISOString();
  // Twenty-style signing uses epoch milliseconds in the header and the signed string.
  const signedAt = Date.now().toString();
  const record = {
    id: input.opportunityId,
    name: `${input.name} · ${LEAD_SOURCE}`,
    pointOfContactId: input.personId,
    leadScore: input.score?.score,
    leadBand: input.score?.band,
    leadTemperature: input.score?.temperature,
    ...input.payload,
  };
  // Keep the envelope compatible with both GrowthOS' compact lead projection and
  // Twenty-style webhook consumers that read the changed record from `data`.
  const body = JSON.stringify({
    event,
    data: {
      ...record,
      // Same GrowthOS app as the main skin page; these labels separate this campaign there.
      source: "sanjay-rithik-laser-hair-reduction",
      campaign: "laser-hair-reduction",
      campaign_name: "Laser hair reduction",
      experience: "laser-hair-reduction",
      page: "laser-hair-reduction",
      landing_page_identifier: "laser-hair-reduction-karur",
      person: { id: input.personId, name: input.name, phone: input.phone },
      lead: input.payload,
    },
    timestamp,
  });
  const signingKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(webhookSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = Buffer.from(
    await crypto.subtle.sign(
      "HMAC",
      signingKey,
      new TextEncoder().encode(`${signedAt}:${body}`),
    ),
  ).toString("hex");
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-GrowthOS-Signature": signature,
      "X-Webhook-Signature": signature,
      "X-Twenty-Webhook-Signature": signature,
      // GrowthOS verifies like Twenty: HMAC over "<timestamp>:<body>", timestamp sent here.
      "X-Twenty-Webhook-Timestamp": signedAt,
    },
    body,
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`GrowthOS webhook responded ${response.status}: ${detail.slice(0, 240)}`);
  }
}

/**
 * Attach a note to a person or opportunity. Current Twenty versions name the relation
 * `personId` / `opportunityId`; older ones used `targetPersonId` / `targetOpportunityId`.
 * The lead is already stored by this point, so a failed link is logged, not fatal.
 */
async function linkNote(
  baseUrl: string,
  apiKey: string,
  noteId: string,
  target: "person" | "opportunity",
  targetId: string,
) {
  const legacyKey = target === "person" ? "targetPersonId" : "targetOpportunityId";
  for (const key of [`${target}Id`, legacyKey]) {
    try {
      await twentyFetch(baseUrl, apiKey, "/rest/noteTargets", {
        method: "POST",
        body: JSON.stringify({ noteId, [key]: targetId }),
      });
      return;
    } catch (error) {
      console.error(`Twenty CRM note link via ${key} failed`, error);
    }
  }
}

export const Route = createFileRoute("/api/lead-capture")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["TWENTY_API_KEY"];
        const baseUrl = (process.env["TWENTY_API_URL"] ?? "http://localhost:3000").replace(
          /\/$/,
          "",
        );
        // Forms post here directly (not as JSON) if the page's script hasn't loaded yet.
        // Those visitors are sent back to the page instead of seeing raw JSON.
        const isFormPost = !(request.headers.get("content-type") ?? "").includes("application/json");
        const respond = (body: Record<string, unknown>, status = 200) =>
          isFormPost
            ? new Response(null, {
                status: 303,
                headers: { Location: `/?enquiry=${status < 300 ? "received" : "failed"}#a-hero-form` },
              })
            : json(body, status);

        if (!apiKey) {
          return respond({ error: "CRM is not configured on the server." }, 503);
        }

        let payload: LeadPayload;
        try {
          if (isFormPost) {
            const form = await request.formData();
            const field = (key: string) => String(form.get(key) ?? "").trim();
            payload = {
              lead_type: "consultation_booking",
              source: "form_without_script",
              name: field("name"),
              phone: field("phone"),
              primary_concern: field("concern"),
              consent_status: form.get("consent") !== null,
              consent_whatsapp: form.get("consent") !== null,
            } as LeadPayload;
          } else {
            payload = await request.json();
          }
        } catch {
          return respond({ error: "Invalid request body." }, 400);
        }

        const name = typeof payload.name === "string" ? payload.name.trim() : "";
        const phone = typeof payload.phone === "string" ? payload.phone.trim() : "";
        if (!name || !phone) {
          return respond({ error: "name and phone are required." }, 400);
        }

        try {
          const phoneFields = normalizePhone(phone);

          const existing = await twentyFetch<{ data: { people: Array<{ id: string }> } }>(
            baseUrl,
            apiKey,
            `/rest/people?filter=phones.primaryPhoneNumber[eq]:${encodeURIComponent(
              phoneFields.primaryPhoneNumber,
            )}&limit=1`,
            { method: "GET" },
          );
          const existingPerson = existing.data.people[0];

          let personId: string;
          if (existingPerson?.id) {
            personId = existingPerson.id;
          } else {
            const email =
              typeof payload.email === "string" && payload.email ? payload.email : undefined;
            const created = await twentyFetch<{ data: { createPerson: { id: string } } }>(
              baseUrl,
              apiKey,
              "/rest/people",
              {
                method: "POST",
                body: JSON.stringify({
                  name: splitName(name),
                  phones: phoneFields,
                  ...(email ? { emails: { primaryEmail: email } } : {}),
                  jobTitle: [payload.lead_type, payload.primary_concern].filter(Boolean).join(": "),
                }),
              },
            );
            personId = created.data.createPerson.id;
          }

          // Mirror the CRM's existing website-form convention: one opportunity per person
          // ("Name · Source"), with a "New enquiry" / "Repeat enquiry" note on it.
          const isRepeat = Boolean(existingPerson?.id);
          let opportunityId: string | undefined;
          let leadScoreSummary: ReturnType<typeof scoreLead> | undefined;
          try {
            const openOpportunity = await twentyFetch<{
              data: { opportunities: Array<{ id: string; name?: string | null; leadSubmissions?: number | null }> };
            }>(
              baseUrl,
              apiKey,
              `/rest/opportunities?filter=pointOfContactId[eq]:${personId}&limit=20`,
              { method: "GET" },
            );
            // A person can enquire on several landing pages; only reuse this page's opportunity.
            const existingOpportunity = openOpportunity.data.opportunities.find((item) =>
              item.name?.endsWith(LEAD_SOURCE),
            );
            const fields = opportunityFields(payload, name, phone, request.headers.get("referer"));
            if (existingOpportunity?.id) {
              opportunityId = existingOpportunity.id;
              // Repeat enquiry: count it and refresh what the person told us this time.
              const { stage: _stage, leadSubmissions: _count, ...latest } = fields;
              const submissions = (existingOpportunity.leadSubmissions ?? 1) + 1;
              leadScoreSummary = scoreLead(payload, submissions);
              await twentyFetch(baseUrl, apiKey, `/rest/opportunities/${opportunityId}`, {
                method: "PATCH",
                body: JSON.stringify({
                  ...latest,
                  ...scoreFields(payload, submissions),
                  leadSubmissions: submissions,
                }),
              }).catch((error) => console.error("Twenty CRM opportunity update failed", error));
            } else {
              const base = { name: `${name} · ${LEAD_SOURCE}`, pointOfContactId: personId };
              const create = (body: Record<string, unknown>) =>
                twentyFetch<{ data: { createOpportunity: { id: string } } }>(
                  baseUrl,
                  apiKey,
                  "/rest/opportunities",
                  { method: "POST", body: JSON.stringify(body) },
                );
              // If the workspace's custom lead fields ever change, still record the opportunity.
              leadScoreSummary = scoreLead(payload, 1);
              const createdOpportunity = await create({
                ...base,
                ...fields,
                ...scoreFields(payload, 1),
              }).catch((error) => {
                console.error("Twenty CRM opportunity fields rejected; retrying without them", error);
                return create(base);
              });
              opportunityId = createdOpportunity.data.createOpportunity.id;
            }
          } catch (error) {
            // The lead is still recorded on the person if the opportunity step fails.
            console.error("Twenty CRM opportunity step failed", error);
          }

          const note = await twentyFetch<{ data: { createNote: { id: string } } }>(
            baseUrl,
            apiKey,
            "/rest/notes",
            {
              method: "POST",
              body: JSON.stringify({
                title: `${isRepeat ? "Repeat enquiry" : "New enquiry"}: ${name}${
                  leadScoreSummary ? ` (${leadScoreSummary.band} · ${leadScoreSummary.score})` : ""
                }`,
                bodyV2: { markdown: enquirySummary(payload, name, phone, isRepeat, leadScoreSummary) },
              }),
            },
          );

          const noteId = note.data.createNote.id;
          await linkNote(baseUrl, apiKey, noteId, "person", personId);
          if (opportunityId) await linkNote(baseUrl, apiKey, noteId, "opportunity", opportunityId);

          await syncGrowthOsLead({
            payload,
            name,
            phone,
            personId,
            opportunityId,
            score: leadScoreSummary,
            isRepeat,
          }).catch((error) => console.error("GrowthOS lead sync failed", error));

          return respond({ ok: true, personId, opportunityId });
        } catch (error) {
          console.error("Twenty CRM lead capture failed", error);
          return respond({ error: "The CRM could not be reached." }, 502);
        }
      },
    },
  },
});
