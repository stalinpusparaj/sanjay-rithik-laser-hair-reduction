/** Both lead forms require an explicit server receipt before showing success. */
export async function deliverLead(payload: Record<string, unknown>) {
  const endpoint =
    (import.meta.env["VITE_LEAD_ENDPOINT"] as string | undefined)?.trim() || "/api/lead-capture";
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error("Lead delivery failed");
  const receipt = await response.json();
  if (receipt?.ok !== true) throw new Error("Lead receipt was not confirmed");
}
