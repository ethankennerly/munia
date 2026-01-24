---
description: Implementation step requirements for incremental development
globs: **/*.{ts,tsx,js,jsx}
---

# Implementation Step Requirements

## Rule: End-User-Testable Steps

Each implementation step MUST be:
- **End-user-testable**: Can be manually tested by a user in the browser/app
- **Fully debuggable**: Can be debugged with standard tools (browser devtools, server logs)
- **Perfected**: Complete, working, and polished (not half-baked)
- **Time-bound**: Achievable within **one hour of effort**

## Process

1. **Plan the Step**: Identify the smallest end-user-testable increment
2. **Environment Variables**: When using `NEXT_PUBLIC_*` variables:
   - Access directly: `process.env.NEXT_PUBLIC_MY_VAR` (not through helper functions)
   - Use try-catch pattern for safe access
   - Verify in browser console after restarting dev server
   - Document in `.env.local.example` if public-facing
3. **Add Diagnostic Logging**: Before implementing, add structured logging at each critical step to isolate failures:
   - Log inputs (what data is received)
   - Log transformations (what data is processed)
   - Log outputs (what data is returned/saved)
   - Use consistent log keys (e.g., `profile_update_request`, `profile_update_db_save`)
   - Log both server-side (`logger.info`) and client-side (`logging-client.log` with `[component]` prefix)
   - Log critical fields with their types to catch serialization issues
4. **Implement**: Build the complete feature for that step. Name code that is self-documenting. Do not add comments to code.
5. **Test**: Manually test as an end-user would
6. **Debug**: Fix any issues until it works perfectly (use logs to isolate the first failing step)
7. **Verify**: Confirm it's debuggable and testable. Disable diagnostic logging when diagnosing.
8. **Document**: Create or update test documentation (see Domain Documentation Driven Development)
9. **Commit & Push**: Code quality checks (linting, tests, build) are automatically enforced by the pre-push hook. Only commit when the step is complete and working. Delete unused files.
10. **Prevention**: After fixing a bug, update rules to prevent similar high-risk issues in the future. Keep rules brief and actionable.

## Domain Documentation Driven Development

### Requirements

- **Minimize scope**. Conserve tokens.
- **Be concise**. Short responses. Under 100 words. Minimize tokens.
- **Public-Facing**: Documentation must be accessible to anyone with the git repo
- **Reproducible**: Steps must allow anyone to verify the feature works
- **Brief**: Keep instructions concise and actionable and under 400 words per doc
- **Fast Verification**: Each feature should be manually-verifiable within **60 seconds**
- **Quality Verification**: Include verification features when needed:
  - **Preferred**: Integrated into end-user experience
  - **Fallback**: Safe verification mode for end-users
  - **Constraints**: Maintain security, stability, and performance
- **Organization**: Store testing in a section of the **same** tech spec document in `docs/specs`.
- **Linking**: Link from README.md
- **Format**: Markdown only with Mermaid diagrams (GitHub/GitLab compatible)
- **Completion**: When a step is complete, mention the documentation file path

### Tech Spec Documentation Structure

Each feature tech spec document should include:
1. **Acceptance Criteria**: Brief checklist
1. **Preconditions**: Required setup/environment
1. **Steps to Reproduce**: Manual instructions to verify in less than 60 seconds
1. **Expected Results**: What should happen
1. **Architecture Diagram**: Mermaid sequence diagram showing the feature flow