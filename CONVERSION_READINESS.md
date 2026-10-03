# Conversion update — 16 September 2026

Implemented: two required contact fields plus consent, optional concern, consistent consultation CTAs, direct WhatsApp/call links, early doctor evidence, shorter page, keyboard-accessible concern tabs, optional lazy-loaded age preview, and explicit lead receipts. The removed quiz source is recoverable in git history.

## Reference material

- Doctor name/specialty: https://sanjayrithikhospital.com/ (Our Doctors).
- Clinic history (established April 2013): https://sanjayrithikhospital.com/about-us/.
- Address and telephone numbers: https://sanjayrithikhospital.com/contact-us/.
- Hospital exterior: https://sanjayrithikhospital.com/wp-content/uploads/2025/08/BKPM2966-scaled.jpg → src/assets/clinic-official.jpg.
- Skin-care photograph: https://sanjayrithikhospital.com/wp-content/uploads/2025/06/BKPM3187-scaled.jpg → src/assets/skin-care-official.jpg.
- Existing doctor portrait corresponds to the hospital's doctor listing. Existing project review quotations are preserved; the count, rating aggregate and relative review dates are no longer asserted.
- Lifestyle facial-area portrait and generated age samples are illustrative; neither is presented as a treatment result.

No consultation fee, registration number, callback SLA, or full privacy policy was verified on the reference pages. The public page directs visitors to ask the clinic about fees/availability and explains the actual enquiry/photo flow without placeholders or invented credentials.

## Delivery and measurement

Both forms use VITE_LEAD_ENDPOINT, falling back to /api/lead-capture. Success requires HTTP success and JSON {"ok":true}. Other responses, network failures and timeouts show an error with phone/WhatsApp alternatives. The existing Twenty CRM route returns this receipt after person/note linkage completes. Third-party webhook replacements must implement the same contract.

Events distinguish CTA clicks, form starts, validation failures, confirmed lead delivery and failures. Enquiries are not labelled confirmed appointments. Existing dataLayer hooks still require an analytics consumer; a dataLayer event alone does not prove GA/advertising collection. Track attended consultations and qualified leads in the clinic workflow to measure effectiveness.

Before paid launch, confirm the deployed environment's CRM connectivity and an authorised end-to-end enquiry receipt; confirm callback operations, current fees, review provenance and image reuse permissions with the clinic. No synthetic patient enquiry was sent to the live CRM during development.

Readiness is an editorial assessment, not a conversion guarantee. Run a controlled comparison using qualified enquiries and attended consultations, rather than age-preview clicks alone.

## Verification performed

- Production build and TypeScript checks pass. ESLint has zero errors and six existing shared-UI refresh warnings.
- Desktop and mobile preview inspected; the photo-enquiry form fits the 320px viewport override. Fixed nested padding that previously clipped the form.
- Empty-form validation, unique field IDs, all section-link targets, age-preview opening/custom mode, and keyboard concern-tab navigation verified.
- Isolated delivery checks pass for confirmed receipt, service error, HTML response, missing/negative receipt and network failure. No actual enquiry was sent.
- Read-only connection check of the configured local Twenty service failed because it was unreachable. Live CRM receipt remains unverified; this is a launch dependency, not a passing check.
