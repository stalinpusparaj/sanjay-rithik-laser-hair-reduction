# Anti-Aging Conversion Audit

## Section journey

| Section | Emotion entering | Question or objection | What the section resolves | Emotion leaving |
| --- | --- | --- | --- | --- |
| Hero | Concern | “Why does my face look different?” | Names visible changes without shame and offers one clear first step | Recognition |
| Pain mirror | Self-doubt | “Am I imagining this?” | Reflects four familiar moments without attacking appearance | Validation |
| Ageing reframe | Anxiety | “Have I done something wrong?” | Normalises collagen, elasticity, hydration, pigment and volume changes | Relief |
| Face explorer | Curiosity | “Where am I noticing change?” | Lets visitors organise facial areas without diagnosing | Personal relevance |
| Skin assessment | Uncertainty | “Is this about my skin?” | Carries face selections into six short questions | Personalisation |
| Personalised result | Information-seeking | “What should I focus on?” | Returns three priorities, a preference and a saveable summary | Clarity |
| Hope | Caution | “Are they promising to make me young?” | Defines the goal as freshness, comfort and confidence | Realistic hope |
| Age journey | Curiosity | “What might age change look like?” | Provides a clearly labelled simulation and routes interest into consultation | Safe engagement |
| Concern explorer | Confusion | “Why might this be happening, and what options exist?” | Combines simple education and verified treatment categories in one selectable panel | Informed hope |
| Doctor | Vulnerability | “Who will guide me?” | Introduces Dr. S. Kiruthika with official portrait and assessment-first philosophy | Trust |
| Consultation process | Uncertainty | “What happens when I book?” | Shows the five-step, no-pressure path from concern to decision | Safety |
| Patient journey | Skepticism | “Has someone like me gone through this?” | Provides the complete editorial case-study experience while visibly withholding unverified evidence | Safe anticipation, pending verified case |
| FAQ | Hesitation | “Will it hurt, look unnatural, take time or cost too much?” | Answers nine high-intent questions and offers conversation first | Relief |
| Hospital credibility | Due diligence | “Is this a real local clinic I can contact?” | Shows published experience, services, address and contact details | Practical trust |
| Emotional close and booking | Decision tension | “Do I have to choose a treatment now?” | Reframes consultation as the smallest safe next step | Confidence to act |

## Scores after refinement

| Dimension | Score | Notes |
| --- | ---: | --- |
| Hero clarity | 9.5/10 | One dominant promise, concise support copy and a clear primary action. |
| Pain recognition | 9.2/10 | Specific, non-shaming mirror moments appear directly after the hero. |
| Emotional resonance | 9.1/10 | The visitor’s uncertainty and identity remain central throughout. |
| Hope | 9.0/10 | Aspirational without promising youth or dramatic transformation. |
| Personalisation | 9.3/10 | Face areas feed into the assessment and a saveable result. |
| Treatment clarity | 9.2/10 | One concern explorer connects symptoms, simple education and conditional options. |
| Doctor credibility | 8.7/10 | The doctor now anchors treatment choice and guidance; credentials remain flagged. |
| Proof experience | 9.2/10 | Reusable case model, timeline and verified-image mode are ready; genuine evidence remains a launch dependency. |
| Objection handling | 9.1/10 | Nine FAQs cover choice, naturalness, pain, downtime, sessions, timing, combinations, price and contact. |
| Trust | 8.8/10 | Verified contact details, source links, disclaimers and restrained claims reduce risk. |
| CTA clarity | 9.3/10 | Hierarchy remains skin check → options → consultation, with WhatsApp secondary. |
| Mobile UX | 9.3/10 | Verified at 320, 375, 390, 430, 768 and 1280px with no overflow and 44px controls. |
| Performance | 8.5/10 | Hero media is compressed; the 2.6 MB below-fold video uses `preload="none"`. |
| Booking friction | 9.3/10 | A two-step flow asks for mobile, concern and preferred time before secondary details. |
| Overall conversion journey | 9.2/10 | The compressed 15-section path moves from concern to clarity, trust and action. |

## Remaining clinic data needed

- Dr. S. Kiruthika’s verified qualifications, medical registration number and approved biography
- Consented before/after images with concern, treatment, timeline and session count
- Hospital registration details and privacy-policy URL
- Consultation fee or approved pricing guidance
- Final CRM endpoint and authentication details if `VITE_LEAD_ENDPOINT` is not connected

## Technical risks

- The Fal transform remains unavailable while its account is locked or out of credits; sample mode and enquiry fallback continue to work.
- The treatment video is approximately 2.6 MB. It is below the fold and does not preload, but production hosting should use caching or a media CDN.
- The 4.5/440 Google rating is a supplied snapshot and can change; periodically reverify it.

## A/B test hypotheses

1. Test “Find My Anti-Aging Plan” against “Check What My Skin Needs”; measure assessment starts and consultation submissions.
2. Test the face explorer before the relief section versus its current position after relief; measure selections, assessment completion and exits.
3. Test the consultation-process section immediately after the personalised result versus after the doctor; measure doctor engagement and booking starts.
