# Development Rules

- [implementation steps](implementation-steps.md)
- [TDD CI Standards](tdd-ci-standards.md)

## If Running Locally

    npm run dev

Production build locally:

    npm run start -- -p 3002

## Deploy Dry Run

    git config core.hooksPath git_hooks

Before deploying, run the following hooks.

    git push --dry-run

If a pre-push hook fails, the hook writes diagnostic logs into the repository `tmp/` directory. Check the relevant files (for example `tmp/test.log`, `tmp/test.error.log`, `tmp/lint.log`, `tmp/build.error.log`, `tmp/validate_build.error.log`) to see the failing output — for example:

    cat tmp/test.error.log
    tail -n 200 tmp/lint.error.log

After fixing the issue locally, re-run `./git_hooks/pre-push` to regenerate the logs and verify the fix.
