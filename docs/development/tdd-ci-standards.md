---
description: Enforce TDD workflow and CI-ready code for React/Next.js
globs: **/*.{ts,tsx}
---

# TDD & CI Development Protocol

## 1. TDD Workflow (Red-Green-Refactor)

- **Rule**: Create or update test file before modifying implementation logic.
- **Exceptions**: Exploratory work (mark `// TODO: Add tests`), refactoring (tests exist), critical bugs (fix then test immediately).
- **Process**: Red (failing test) → Green (minimal code) → Refactor (clean up) → Optimize (after manual testing).
- **Colocation**: Keep test files with source (e.g., `Button.tsx` and `Button.spec.tsx`).

## 2. Test Performance Requirements

- **Feature Tests**: < 1 second per feature.
- **Full Suite**: < 10 seconds total (auto-stops at 10s in `vitest.setup.ts`).
- **Test Timeouts**: 1-second per test (auto-fail if exceeded).
- **No Network**: Mock all external APIs.
- **Deterministic**: Same results every run. No random data, no time-dependent logic.
- **Simplification**: Use simplest examples. Combine related assertions.
- **Code Optimization**: Pre-compile regex, use simple string checks, cache expensive computations.

## 3. Test Strategy & Coverage

- **Prevent Frequent Bugs**: Focus on edge cases, error handling, state transitions, input validation.
- **High-Risk Coverage**: Business logic (80%+), UI components (60%+), utilities (90%+).
- **Low-Maintenance**: Test behavior, not implementation. Use stable selectors (`getByRole`, `getByLabelText`).
- **Minimal Scope**: Validate known edge cases, not exhaustive coverage.
- **Code Reuse**: Scripts must import actual modules (not duplicate logic) to ensure test coverage applies.

## 4. Validation Before Completion

- **Requirement**: All acceptance criteria must be validated before marking complete.
- **For Extraction/Migration**: Run validation scripts and manually review output. Zero false positives required.
- **For Features**: Manual testing confirms behavior matches acceptance criteria.
- **No False Claims**: Do not mark work complete until validation passes and manual review confirms.

## 5. Test Organization & CI

- **Unit Tests**: < 100ms each. Simple mocks (`vi.fn()`). Colocate with source files.
- **Integration Tests**: Real integrations when possible. Mock only external services.
- **Strict Typing**: Avoid `any`. Use `unknown` for dynamic data.
- **Test Independence**: Tests must not depend on global state, execution order, or previous results.
- **Pre-Push Hook**: Automatically runs linting (with autofix), tests (< 10s), and build validation.
- **Component Architecture**: Favor React Server Components. Use `'use client'` only for interactivity. Use early returns for error/loading states.
- **Accessibility**: Use Testing Library queries: `getByRole` > `getByLabelText` > `getByText` > `getByTestId`.
- **Error Testing**: Always test API failures, validation errors, edge cases. Use `waitFor` for async state updates.
