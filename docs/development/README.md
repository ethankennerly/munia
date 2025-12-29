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
