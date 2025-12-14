# Session Replay (MVP)

Enable lightweight, privacy-conscious session replay to aid debugging and understanding real user behavior, with minimal code changes and small scope.

## Scope
- Record minimal client-side interactions (DOM changes, inputs, clicks, viewport, navigation) and timings.
- Store captured event streams; replay them in an internal admin UI for selected sessions.
- Accept visual fidelity limits for shared/dynamic feeds. Do not attempt to reconstruct personalized data beyond what was captured.

## Non-Goals
- Full state rehydration across users/devices.
- Recording network payload bodies or sensitive fields by default.
- End-user facing replay UI.

## Requirements
- Use standard, battle‑tested tooling for capture/playback (e.g., rrweb/rrweb-player or similar).
- Keep code changes minimal: a small capture initializer, a redaction/masking config, and an admin replay page.
- Recording enabled for authenticated users; toggle via env/feature flag.
- Performance budget: <2% CPU overhead and <50KB/s average upload under typical usage (batching is allowed).
- Replay controls: play/pause, seek, speeds 1x, 2x, 4x, 8x, 16x.
- Admin-only access: server determines admins; only admins can list/view sessions.

## Privacy & Security
- Do not record PII in production by default. Mask/redact inputs such as email, names, phone, address, tokens, passwords.
- Treat elements with `data-private` (and configured CSS selectors) as masked.
- Do not store raw request/response bodies; if needed, keep only timing and redacted URLs.
- Apply retention (default 7–14 days) and honor deletion requests. Prefer encrypted storage and signed URLs for access.

## Data Model (minimal)
- Session: `id, userId, startedAt, endedAt, bytes, meta{ ua, viewport }, storageKey`
- Chunks: stored in object storage (e.g., S3) referenced by `storageKey`.

## Admin UX (internal)
- List: `/admin/sessions` shows `userId`, time range, size, status; filter by user/date.
- Detail: `/admin/sessions/[id]` embeds the player with speed controls.

## Ops
- Env: `REPLAY_ENABLED`, `REPLAY_PRIVATE_SELECTORS`, `REPLAY_RETENTION_DAYS`.
- Guards: server‑only admin APIs; verify admin role on access.
- Observability: basic metrics (events/min, capture failures) and error logs.

## Implementation Outline
- Client: initialize recorder with masking rules; throttle and batch uploads to `/api/replay/upload`.
- Server: accept chunk uploads, validate auth, persist to object storage, index metadata in DB.
- Replay: admin page fetches metadata and streams chunks to the player.

## Risks / Possible Bugs
- PII leakage from incomplete masking.
- Performance regressions on low‑end devices.
- Unbounded storage growth due to large sessions. Omit the beginning of long sessions. Only record the last 10 minutes of sessions.
- Replay drift on dynamic/shared feeds.
- Upload failures causing gaps in recordings.

Note: Testing guidance is defined globally in `docs/specs/spec-automated-testing.md` and applies to this feature.