# Copilot / AI Agent Instructions for Munia

Short & focused guidance to help an AI coding agent be productive quickly.

## Quick start & common commands ✅
- Start dev server: `npm install` (runs `postinstall` → Prisma generate) then `npm run dev` (Next.js on port 3002).
- Tests: `npm run test` (`vitest run`). For TDD use `vitest --watch` or `vitest watch`.
- Build & production: `npm run build` then `npm run start` (or `npm run pm2` for the PM2 recipe).
- DB: `npm run prisma:deploy`, seed: `npm run prisma:seed`.
- Utility scripts: see `scripts/` (e.g. `scripts/replay.mjs` — `npm run replay:list`, `npm run replay:show`).

## High-level architecture (big picture) 🏗️
- Next.js app using **React Server Components** broadly; interactive flows use `'use client'` components.
- Most data fetching/mutations are client-side and handled with **React Query** for caching/optimistic updates.
- Database: **Prisma** models live in `prisma/schema.prisma` (single source of truth for DB schema).
- Auth: Auth config split across `src/auth.config.ts` and `src/auth.ts`. **Guardrail**: don't change provider registrations lightly (see `docs/specs/archive/spec-authentication.md`).

## Project-specific conventions & patterns 🧭
- TDD-first workflow: tests colocated with code (`*.spec.ts`, `*.spec.tsx`) and **write failing test first** — see `docs/development/tdd-ci-standards.md` for exact rules.
- Test performance constraints: feature tests < 1s; full suite < 10s. Avoid network I/O in tests; use MSW or mocks.
- Date handling: **Always use date-only helpers** in `src/lib/utils/dateOnly.ts` (`extractDateOnly`, `parseDateOnly`) for birthdates and other date-only values (prevents timezone bugs).
- Environment variables: prefer direct access to `process.env.NEXT_PUBLIC_*` (Next replaces at build time) — see `src/lib/replay/config.ts` for examples.
- Logging: structured JSON logs via `src/lib/logging.ts` (levels: error/warn/info/debug). Tests rely on debug mode detection (`NODE_ENV === 'test'` or `VITEST_WORKER_ID`).

## Integration points & environment notes 🔗
- External services: AWS S3 (media), AWS SES (email), OAuth providers (Github/Google/Facebook). Configure client IDs/secrets in `.env` / `.env.local`.
- Session replay envs: `NEXT_PUBLIC_REPLAY_ENABLED`, `NEXT_PUBLIC_REPLAY_PRIVATE_SELECTORS`, `NEXT_PUBLIC_REPLAY_RETENTION_DAYS`, `NEXT_PUBLIC_REPLAY_SCROLL_THRESHOLD`.
- Deploy notes: follow Deployment steps in README; set `git config core.hooksPath git_hooks` to enable the repo's pre-push checks.

## Tests, CI & pre-push hooks ⚙️
- Pre-push hook enforces lint/test/build/validate (see `git_hooks/pre-push`). **Must run locally**: always run `./git_hooks/pre-push` and ensure it completes successfully before creating a PR or pushing a branch. If the hook fails, fix tests/lint/build issues or add tests as needed — do not push commits that fail the pre-push hook.
- Use `git push --dry-run` for dry-run validation if desired.
- CI expectations mirror the local rules in `docs/development/tdd-ci-standards.md` (strict typing, deterministic tests, limited runtime).

## What to watch out for (pitfalls) ⚠️
- Timezone/date bugs: don't use `new Date(iso)` for date-only fields — use the provided helpers.
- Auth & provider changes: avoid modifying `src/auth.ts` & `src/auth.config.ts` without explicit tests & review.
- Large test loops or network-dependent tests will fail local pre-push rules and CI time constraints.
- Session replay privacy: mask selectors via `NEXT_PUBLIC_REPLAY_PRIVATE_SELECTORS` and be conservative with replay enablement.

## Examples & quick file references 📁
- TDD rules & CI: `docs/development/tdd-ci-standards.md`
- Date helpers: `src/lib/utils/dateOnly.ts` (+ tests `*.spec.ts`)
- Logging: `src/lib/logging.ts`
- Replay config: `src/lib/replay/config.ts`, player/recorders in `src/lib/replay/*`
- Auth: `src/auth.ts`, `src/auth.config.ts`
- Prisma schema: `prisma/schema.prisma`
- Scripts: `scripts/*.mjs` (replay, createMockUsers, validate-build)

## How to proceed when making changes (short checklist) ✅
1. Add/Update a failing test first (colocate it next to the implementation).
2. Ensure tests are deterministic (seeds, fake timers where needed).
3. Run `git_hooks/pre-push` to verify implementation.
4. Keep PRs small and include a short description referencing relevant docs/files.

---
If you'd like, I can prune or expand any section or add short examples for common tasks (e.g., adding a new route handler, adding a Replay private selector). Please point out any missing details you'd like included.