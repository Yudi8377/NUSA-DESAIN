# NUSA DESIGN AI API

Cloudflare Worker backend for image generation and optional video generation. Provider keys are server-side secrets and must never be added to Vite variables or committed files.

## Required GitHub Actions secrets

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN` — Workers Scripts:Edit for the intended Cloudflare account.

## Required Cloudflare Worker secrets

After the first deploy, set these through Cloudflare Dashboard → Workers & Pages → `nusa-design-ai-api` → Settings → Variables and Secrets:

- `AI_STUDIO_ACCESS_CODE` (Secret): long random access code used by the internal Studio UI.
- `OPENAI_API_KEY` (Secret): enables image generation.
- `FAL_KEY` (Secret): enables video provider calls.
- `FAL_VIDEO_MODEL` (Text): exact supported fal.ai text-to-video model identifier. Do not set until the chosen model is confirmed.

The UI must send `VITE_AI_API_URL` at build time. Set it to `https://nusa-design-ai-api.<your-workers.dev-subdomain>` in GitHub Actions repository Variables. Do not set provider credentials in GitHub Variables or any `VITE_*` variable.

## Endpoints

- `GET /api/health` — provider configuration readiness (no secret values).
- `POST /api/generate` — generate a concept image or enqueue a video. Requires `x-ai-studio-code`.
- `GET /api/generate/status?id=...` — poll a video job. Requires `x-ai-studio-code`.

The Worker limits requests per isolate and restricts browser CORS to the GitHub Pages origin. CORS is not authentication; keep the access code private, configure provider spend limits, and add durable rate limiting plus company authentication before production use. Generated files are returned as previews; durable asset storage and tenant authorization are not implemented by this Worker yet.
