# AI Studio Backend Contract — NUSA DESIGN

Status: database metadata foundation exists on the Neon development branch. The browser Studio currently creates prompts locally; image/video provider execution and persistent job submission are not yet connected.

## Scope

This contract defines the server boundary for the architecture concept, exterior render, interior render, walkthrough video, and presentation workflows. The browser must never call model providers with private credentials.

## Proposed endpoints

### `POST /api/design/jobs`

Authenticated request:
```json
{
  "projectId": "uuid-or-null",
  "workflowType": "architecture_concept",
  "title": "Konsep rumah tropis",
  "prompt": "Prompt final yang disetujui pengguna",
  "input": {
    "buildingType": "Rumah tinggal",
    "style": "Tropis modern",
    "location": "Bandung",
    "notes": "Eksplorasi awal"
  }
}
```

The server derives `organization_id` and `created_by` from the validated session, verifies active organization membership and project ownership, validates prompt length / allowed workflow, and inserts a `design_generation_jobs` row with `status='queued'`. Never accept tenant identity from the browser as authoritative.

Expected response: `202 Accepted` with `{ "id": "...", "status": "queued" }`.

### `GET /api/design/jobs/:id`

Returns the caller's tenant-scoped job state and safe error details. Never return provider credentials or internal stack traces.

### `GET /api/design/assets`

Returns tenant-scoped asset metadata. Asset bytes must be fetched through a short-lived, authorization-checked signed URL or a streaming endpoint.

## Job state machine

`draft -> queued -> running -> succeeded | failed | cancelled`

- Only the server/worker may move jobs into `running`, `succeeded`, or `failed`.
- Record `started_at`, `completed_at`, and `updated_at` on transitions.
- Use idempotency keys or a deduplication strategy before adding retries.
- Apply per-user/org rate limits, provider timeouts, payload limits, and cost controls before enabling paid providers.
- Provider errors should be normalized into `error_code` and a sanitized `error_message`.

## Data model

Migration `database/migrations/0003_ai_studio_jobs_assets.sql` creates:
- `design_generation_jobs`: prompt, workflow, status, provider job reference (non-secret), safe error fields and timestamps.
- `design_assets`: tenant-scoped metadata for images, videos, 3D models, documents and thumbnails.

The binary content does not belong in Postgres. `storage_key` must be an opaque private object key, not a public or signed URL. Provider API keys must live only in server-side secret configuration and must never be stored in these tables.

## Tenant security prerequisites

The baseline RLS policies depend on a trusted server setting transaction-local `app.user_id` and `app.organization_id` after authentication. Until an authenticated API is implemented and tested:
- do not expose a database connection string to the browser;
- do not enable direct browser SQL access;
- do not claim tenant isolation is production-verified;
- test cross-organization reads and writes, including guessed UUIDs;
- introduce role/capability checks for create, retry, cancel, delete and asset download operations.

## Architectural / construction safety

AI outputs are concept/concept-visualization aids, not stamped construction drawings. Never infer structural capacity, dimensions, BOQ, cost, building-code compliance or permit approval from an image. Such outputs require review by qualified professionals and validated project inputs.

## Next implementation gate

1. Select and configure an authentication provider for the internal company team.
2. Implement the server API and verified session-to-tenant mapping.
3. Add private asset storage and provider adapters behind the server.
4. Add queue/retry/rate-limit/cost controls and audit events.
5. Test authorization and failures end-to-end before connecting the UI.
