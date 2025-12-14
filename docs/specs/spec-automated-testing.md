# Automated Testing

- Tests should be written for each specified feature.
- Tests should validate each requirement and acceptance criterion, including auth/permission guards and recent‑auth edge cases where applicable.
- Tests should execute in less than 1 second.
- Tests should not require network requests (use in-memory or mocked dependencies for DB/storage and logging).
- Tests should not require user interaction.

## Clarifications

- Use a conventional headless testing harness favored by professional React developers: Vitest is the default for this repo. Place unit tests under `src` using `*.spec.ts(x)` naming or a `__tests__` folder.
- Do not spin up a Next.js dev server in tests. Import route handlers and library functions directly and mock external modules (e.g., Prisma, S3, SES, logging).
- Make tests deterministic and isolated: reset all mocks/Module state between tests; avoid relying on wall‑clock time—use fake timers for time‑based logic (e.g., recent‑auth windows).
- Keep per‑suite runtime under 1s on a typical laptop; prefer unit/integration tests with mocked boundaries over end‑to‑end flows.
- Ensure no PII is asserted or printed in test logs.