# The Plan That Survives Tuesday

An interactive synthetic-health prototype that stress-tests a clinician-approved plan against a person’s actual calendar, budget, energy, pain, family demands, and cooking capacity.

The point is not to generate more advice. It is to preserve clinical intent while removing enough friction for the plan to survive an ordinary bad week.

## What the demo includes

- A single synthetic cardiometabolic-risk case with clinical, calendar, budget, and patient-values context.
- A whole-person map that separates clinical invariants from negotiable implementation details.
- Six concise Tuesday Test perspectives: clinical fidelity, behavior change, logistics, affordability, patient values, and safety skepticism.
- A constraint playground that visibly recompiles the week and states what was preserved, traded, and changed.
- A final seven-day calendar, three essential actions, bad-day fallbacks, an illustrative grocery list, a patient handout, and a clinician-facing summary.

## Run locally

Prerequisite: Node.js 22.13 or newer.

```bash
pnpm install
pnpm dev
pnpm build
pnpm test
```

## GPT-5.6 Sol integration

The browser sends only six allow-listed life-constraint controls for the bundled synthetic scenario to `POST /api/tuesday-test`.

When `OPENAI_API_KEY` is configured, the server calls `gpt-5.6-sol` through the OpenAI Responses API with the multi-agent beta enabled. Three focused subagents cover six paired perspectives; the root agent reconciles them into a strict Structured Output. The route extracts only the root final answer and applies semantic safety checks before returning it. The browser never receives an API key, a raw agent trace, chain-of-thought, or an unvalidated provider response.

When the key is absent, the same route returns an explicitly labeled deterministic demo synthesis with the identical contract. This makes the full interaction reviewable without credentials and avoids pretending scripted output came from a live model.

Create an ignored `.env.local` for a live request:

```env
OPENAI_API_KEY=
```

Never rename the secret to `NEXT_PUBLIC_OPENAI_API_KEY` or `VITE_OPENAI_API_KEY`. For deployment, configure it as an encrypted hosting secret.

Implementation choices follow the official OpenAI documentation for the [GPT-5.6 Sol model](https://developers.openai.com/api/docs/models/gpt-5.6-sol), [Responses multi-agent beta](https://developers.openai.com/api/docs/guides/responses-multi-agent), and [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs).

## Safety and privacy boundary

- Synthetic scenario only. Do not enter real patient information.
- The app translates an already clinician-approved plan into a draft routine. It does not diagnose, prescribe, alter medication, or replace medical care.
- All generated plans require clinician review.
- Missing facts, contradictions, and safety concerns are surfaced instead of guessed away.
- Clinical invariants remain fixed; life constraints may change implementation details, not medical authorization.
- Grocery prices are illustrative demo estimates and require local verification.
- OpenAI requests use `store: false`; the application does not return or display private reasoning.

This prototype is not designed for real-patient use. Any pilot would require privacy, security, legal/regulatory, and clinical validation work beyond this demonstration.

## Stack

Next.js-compatible React UI via Vinext, TypeScript, standard Web APIs, and Cloudflare-compatible server execution. No database, authentication, file upload, or real-patient persistence is used in this first version.
