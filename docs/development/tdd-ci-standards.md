---
description: Enforce TDD workflow and CI-ready code for React/Next.js
globs: **/*.{ts,tsx}
---

# TDD & CI Development Protocol

## 1. TDD Workflow (Red-Green-Refactor)

- **Rule**: You SHOULD create or update a test file (`*.spec.tsx` or `*.spec.ts`) before modifying implementation logic.
- **Exceptions**:
  - Exploratory/spike work (mark with `// TODO: Add tests`)
  - Refactoring existing code (tests should already exist)
  - Critical bug fixes (can fix first, add test immediately after)
- **Process**:
  1. **Red**: Write a failing test that defines the expected behavior/API.
  2. **Green**: Write the MINIMAL code necessary to pass the test.
  3. **Refactor**: Clean up the code (dryness, naming) while ensuring tests stay green.
  4. **Optimize**: After manual testing has confirmed and all prior steps pass only then optimize the web browser experience.
- **Colocation**: Keep test files in the same directory as the source file (e.g., `components/Button.tsx` and `components/Button.spec.tsx`).

## 2. Test Performance Requirements

- **Feature Tests**: Tests for a single feature must complete in **1 second or less**.
- **Full Suite**: All tests must complete in **10 seconds or less**.
- **No Network**: Tests must not require network access. Mock all external APIs and network requests.
- **Deterministic**: Tests must produce the same results every run. No random data, no time-dependent logic, no race conditions.
- **Implementation**:
  - Use `vi.useFakeTimers()` for time-dependent code
  - Use fixed seeds for random data generators
  - Avoid `Math.random()` - use deterministic test data
  - Mock `Date.now()` if testing time-sensitive logic

## 3. Test Strategy & Coverage

- **Prevent Frequent Bugs**: Focus tests on code paths that commonly cause bugs:
  - Edge cases (empty arrays, null values, boundary conditions)
  - Error handling (API failures, validation errors)
  - State transitions (loading → success → error)
  - User input validation
- **High-Risk Code Coverage**: For each line of code edited, ensure coverage where there's high risk of bugs:
  - Business logic (calculations, transformations)
  - Data validation (Zod schemas, form validation)
  - State management (Redux, React Query mutations)
  - API integrations (request/response handling)
- **Low-Maintenance Tests**: Prefer practical, critical tests that are easy to maintain:
  - Test behavior, not implementation details
  - Avoid testing third-party library internals
  - Use stable selectors (`getByRole`, `getByLabelText`)
  - Avoid brittle selectors (CSS classes, DOM structure)
- **Coverage Targets**:
  - Business logic: 80%+ coverage
  - UI components: 60%+ coverage
  - Utilities/helpers: 90%+ coverage
  - Skip: Trivial getters/setters, pure presentational components

## 4. Test Types & Organization

- **Unit Tests**: Test individual functions/components in isolation.
  - Fast (< 100ms per test)
  - Simple mocking (prefer `vi.fn()` over complex mocks)
  - Focus on single responsibility
- **Integration Tests**: Test component interactions, API routes, data flow.
  - Prefer end-to-end coverage over unit-level detail
  - Test real integrations (database, file system) when possible
  - Mock only external services (third-party APIs)
- **Test Organization**:
  - Colocate test files: `Component.tsx` → `Component.test.tsx`
  - Shared utilities: `__tests__/utils/` directory
  - Test fixtures: `__fixtures__/` directory
  - Custom render wrapper: `__tests__/utils/render.tsx` (for providers)

## 5. Mocking Strategy

- **Unit Test Level**: Prefer simple, isolated mocks.
  - Use `vi.fn()` for function mocks
  - Use `vi.mock()` for module mocking (e.g., `next/navigation`, external libs)
  - Mock at the boundary (API calls, external services)
  - Avoid over-mocking (prefer real implementations when fast)
- **Integration Test Level**: Prefer end-to-end coverage with minimal mocking.
  - Use `msw` (Mock Service Worker) for API route testing
  - Test real database operations (use test database)
  - Mock only external services (third-party APIs, file system if slow)
  - Prefer real React Query, real router, real context providers
- **Mocking Guidelines**:
  - Mock external dependencies (APIs, file system, network)
  - Don't mock code you own (test real implementations)
  - Use `vi.clearAllMocks()` in `beforeEach` to prevent test pollution
  - Reset mocks between tests for isolation

## 6. CI-Ready Standards

- **Strict Typing**: Avoid `any` types. Use `unknown` for truly dynamic data.
  - **Exceptions**: Third-party library types, legacy code migration (with `// @ts-expect-error` comment)
  - Use interfaces for component props
  - Use Zod for API/Server Action validation
- **Test Independence**: Tests must be isolated and not depend on:
  - Global state
  - Execution order
  - Shared variables
  - Previous test results
- **Code Quality Checks**: All checks (linting, tests, build) are enforced by the pre-push hook. The hook automatically fixes linting issues where possible.

## 7. Component Architecture for Testability

- **Principles**:
  - Architect a SOLID class.
  - Unit tests minimize mocks.
  - Class minimizes context to debug.
  - Each class minimizes integration API.
- **Server vs Client**: Favor React Server Components (RSC) for data fetching. Only use `'use client'` for interactivity.
- **Atomic Design**: Structure UI hierarchically for granular testing:
  - **Atoms**: Basic building blocks (Button, Input) - test in isolation
  - **Molecules**: Simple combinations (SearchBar = Input + Button) - test interactions
  - **Organisms**: Complex components (Header, PostCard) - test integration
  - **Templates**: Page layouts - test structure
  - **Pages**: Full page implementations - test critical flows
- **Early Returns**: Use early returns for error/loading states to simplify test branching.
- **Accessibility**: Use Testing Library queries in priority order:
  1. `getByRole` (preferred - most accessible)
  2. `getByLabelText` (for form inputs)
  3. `getByText` (fallback for text content)
  4. `getByTestId` (last resort, avoid if possible)
- **Testing Libraries**: Use `@testing-library/react` for component tests.
  - Create custom `render` wrapper for providers (React Query, Auth, Theme, etc.)
  - Use `screen` object for queries (better error messages)
- **Standard UI**: Use consistent, legible UI components for all users (end-users and admins).
  - **Consistency**: Apply consistent styling patterns across the application
  - **Legibility**: Ensure sufficient color contrast (WCAG AA minimum):
    - Text on background: minimum 4.5:1 contrast ratio
    - Large text: minimum 3:1 contrast ratio
    - Test in both light and dark themes
  - **Styling**: Use Tailwind CSS with theme-aware classes (`dark:` variants)
  - **Code Display**: Use high-contrast backgrounds for code/logs (e.g., `bg-gray-50 dark:bg-gray-800` with appropriate text colors)

## 8. Error Testing

- **Error Cases**: Always test error scenarios:
  - API failures (network errors, 4xx/5xx responses)
  - Validation errors (invalid input, missing required fields)
  - Edge cases (empty data, null values, boundary conditions)
  - Error boundaries (React error boundaries)
- **Async Error Handling**: Test async operations properly:
  - Use `waitFor` for async state updates
  - Test error states in React Query mutations
  - Test loading states and transitions
- **Error Messages**: Verify error messages are user-friendly and actionable.

## 9. Automated Commands

- **Development**: Use `vitest watch` for TDD workflow (auto-rerun on changes).
- **CI**: Use `vitest run` for one-time execution.
- **Pre-Push Hook**: Automatically runs and enforces:
  1. `npm run lint -- --fix` (autofixes formatting issues)
  2. `npm run lint` (verifies all linting passes)
  3. `npm run test` (must complete in < 10 seconds)
  4. `npm run build` (catches TypeScript and build issues)

## 9. Environment Variables & Configuration

- **NEXT_PUBLIC_* Variables**: Next.js replaces `NEXT_PUBLIC_*` environment variables at build time. Access them directly, not through helper functions:
  ```typescript
  // ✅ CORRECT: Direct access (Next.js replaces at build time)
  const value = process.env.NEXT_PUBLIC_MY_VAR;
  
  // ❌ WRONG: Using helper function may fail silently
  const value = readEnv('NEXT_PUBLIC_MY_VAR'); // May return undefined
  ```
- **Pattern for NEXT_PUBLIC_* Access**: Use try-catch with direct access:
  ```typescript
  let myVar: string | undefined;
  try {
    myVar = typeof process !== 'undefined' && process.env
      ? process.env.NEXT_PUBLIC_MY_VAR ?? process.env.MY_VAR
      : undefined;
  } catch {
    myVar = undefined;
  }
  ```
- **Why Direct Access**: Next.js replaces `NEXT_PUBLIC_*` vars at build time. Helper functions that access `process.env` dynamically may not work correctly in the browser.
- **Server-Only Variables**: For server-only env vars (without `NEXT_PUBLIC_`), helper functions are acceptable.
- **Testing**: When adding new `NEXT_PUBLIC_*` variables, verify they're accessible in the browser console after restarting the dev server.

## 10. Observability & Logging

- **Transparent User Feedback**: A user can recognize the internal state of the application by looking at the UI. 
  - When failures occur, a user can see a brief audit of the failure.
- **Diagnostic Logging for Bug Isolation**: When implementing features that involve data flow (API → DB → Cache → UI), add logging at each step:
  - API routes: Log incoming request data, DB operations, and response data
  - Mutations: Log data sent, received, and cache updates
  - Server Components: Log data fetched from DB and returned to components
  - Client Components: Log data received and displayed
  - Use consistent prefixes: `[component]` for client-side, structured keys for server-side
  - Log critical fields (e.g., `birthDate`, `userId`) with their types to catch serialization issues

- **Date Handling**: Always use date-only utilities (`@/lib/utils/dateOnly`) when displaying or parsing date-only values:
  - **Rule**: Never use `new Date(isoString)` directly for date-only values (e.g., birthdates, event dates)
  - **Use**: `parseDateOnly()` for creating local Date objects from ISO strings or Date objects
  - **Use**: `extractDateOnly()` for getting YYYY-MM-DD strings from dates
  - **Why**: Prevents timezone conversion bugs where UTC dates shift backward in US timezones
  - **Example**: `format(parseDateOnly(birthDate), 'MMMM d, yyyy')` instead of `format(new Date(birthDate), 'MMMM d, yyyy')`

- **Structured Logging**: Use consistent JSON format for all logs:
  ```typescript
  logger.info({
    msg: 'feature_action',
    feature: 'session_replay', // Feature name/channel
    action: 'session_started',
    userId: '...',
    sessionId: '...',
    // ... other context
  });
  ```
- **Logging Levels**: Use appropriate levels:
  - **Error**: Full error context, stack traces, user impact
  - **Warn**: Deprecated API usage, performance issues, recoverable errors
  - **Info**: Feature checkpoints (user actions, API calls, state changes)
  - **Debug**: Detailed execution flow (only in development, disabled in production)
- **What to Log**:
  - Feature checkpoints (session started, action completed)
  - API calls (endpoint, method, status, duration)
  - State changes (user logged in, data updated)
  - Errors (with full context for debugging)
- **What NOT to Log**:
  - PII (passwords, tokens, credit cards)
  - Full request/response bodies (log summaries only)
  - Sensitive user data (emails, addresses - use hashed IDs)
- **Log Channel**: Logs should only show when relevant to current bug.
  - Set a log channel for a system.
  - Channel name is ALL CAPS. Example: `SCROLL`
  - Channel name is abridged 2 to 6 characters long.
  - If that channel is not enabled, do not log and do not allocate garbage for the log message formatting.
  - Prefix `[{channel}]` to each log message. Example `[SCROLL] {message}`.
  - Note that logging may be on [server](../../src/lib/logging.ts) or on [client](../../src/lib/logging-client.ts)
- **Log Format**: JSON Lines (JSONL) format for easy database import:
  - Each line is a valid JSON object
  - Easy to import into PostgreSQL JSONB column
  - Example: `{"level":"info","msg":"session_started","timestamp":1234567890,"userId":"..."}\n`
- **Performance**: Logging should have minimal overhead (< 1% performance impact).
  - Use log level checks to avoid expensive operations when disabled
  - Example: `if (logger.isInfoEnabled()) { logger.info({ data: expensiveComputation() }); }`
- **Correlation**: Include request/session IDs in logs for tracing:
  - Pass context through async operations
  - Use AsyncLocalStorage or context propagation
  - Example: `{ msg: 'api_call', requestId: '...', userId: '...', endpoint: '...' }`
- **Zero Overhead When Disabled**: Log level checks prevent string interpolation and object creation when logging is disabled.

## 11. Test Data Management

- **Test Data**: Use factories (e.g., `@faker-js/faker`) for realistic test data.
  - Use fixed seeds for deterministic tests: `faker.seed(123)`
  - Create reusable factory functions: `createUser()`, `createPost()`
- **Fixtures**: Store complex test data in `__fixtures__/` directories.
  - JSON fixtures for API responses
  - Image fixtures for media tests
- **Cleanup**: Ensure test data doesn't leak between tests:
  - Use `afterEach` to clean up
  - Reset database state between tests
  - Clear caches (React Query, etc.)

## 12. Pre-Push Hook Integration

- **Pre-Push Hook**: All code quality checks are enforced automatically before push:
  - Linting (with autofix)
  - Testing (must pass, < 10 seconds)
  - Build (TypeScript validation and production build)
  - Run `git_hooks/pre-push`. This script verifies all of the above.
- **Fast Feedback**: Keep test suite fast for developer productivity:
  - Unit tests: < 100ms each
  - Integration tests: < 500ms each
  - Full suite: < 10 seconds total
- **Flaky Tests**: Flaky tests are worse than no tests. Fix or remove immediately.
