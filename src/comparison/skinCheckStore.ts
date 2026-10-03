/**
 * The 60-second skin check lives in one section of the page, but visitors usually book
 * through a different form (the offer form near the top). This tiny store hands the
 * latest completed skin check to whichever lead form is submitted, so the clinic and
 * the CRM score always see the quiz answers.
 */
export type SkinCheckResult = {
  answers: Record<string, string>;
  profile?: { name: string; dims: Record<string, number> } | undefined;
};

const STORAGE_KEY = "srh-skin-check";
let latest: SkinCheckResult | null = null;

export function setSkinCheck(result: SkinCheckResult) {
  latest = result;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(result));
  } catch {
    // Storage can be unavailable (private mode); the in-memory copy still works.
  }
}

export function getSkinCheck(): SkinCheckResult | null {
  if (latest) return latest;
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    latest = stored ? (JSON.parse(stored) as SkinCheckResult) : null;
  } catch {
    latest = null;
  }
  return latest;
}

/** Fields to merge into any lead payload when a skin check has been completed. */
export function skinCheckPayload() {
  const check = getSkinCheck();
  if (!check || Object.keys(check.answers).length === 0) return {};
  return {
    assessment_responses: check.answers,
    result_profile: check.profile?.name ?? null,
    result_dimensions: check.profile?.dims ?? null,
  };
}
