# Vercel Build Validation

> **Verification time**: ~10 seconds  
> **Purpose**: Validate build configuration to prevent Vercel deployment failures

This document describes how to validate that your build configuration is correct for Vercel deployment, preventing the common Prisma generation failures.

## Quick Validation

Run the validation script before pushing:

```bash
npm run validate:build
```

This checks:
- ✅ Prisma is in `dependencies` (not just `devDependencies`)
- ✅ `postinstall` or `prebuild` scripts run `prisma generate`
- ✅ Prisma can generate successfully
- ✅ Prisma client is generated and can be imported

## Automated Testing

Run the Prisma validation tests:

```bash
npm test -- src/lib/prisma/prisma.spec.ts
```

These tests verify:
- Prisma is correctly placed in dependencies
- Build scripts are configured correctly
- Prisma client can be imported
- Version matching between `@prisma/client` and `prisma`

## Pre-Push Hook

A pre-push git hook is included at `.git/hooks/pre-push` that automatically runs validation before pushing.

**Note**: Git hooks are not tracked by git. If you clone the repo fresh, you'll need to make the hook executable:
```bash
chmod +x .git/hooks/pre-push
```

Or set it up manually:
```bash
cp .git/hooks/pre-push .git/hooks/pre-push.bak  # backup if exists
# The hook is already created, just ensure it's executable
chmod +x .git/hooks/pre-push
```

## Manual Validation Checklist

Before pushing, you can manually verify:

1. **Check package.json**:
   ```bash
   grep -A 1 '"prisma"' package.json
   ```
   Should show `prisma` in `dependencies`, not `devDependencies`.

2. **Check scripts**:
   ```bash
   grep -E "(postinstall|prebuild)" package.json
   ```
   Should include `prisma generate`.

3. **Test Prisma generation**:
   ```bash
   npx prisma generate
   ```
   Should complete without errors.

4. **Test build**:
   ```bash
   npm run build
   ```
   Should complete successfully (this also runs `prebuild` which includes `prisma generate`).

## Why This Matters

Vercel builds fail if:
- `prisma` is only in `devDependencies` (Vercel may not install devDeps in production builds)
- `prisma generate` fails during `postinstall` or `prebuild`
- Prisma client cannot be imported

The validation script and tests catch these issues locally before they cause deployment failures.

## Integration with CI/CD

The validation script can also be added to your CI/CD pipeline:

```yaml
# Example GitHub Actions
- name: Validate build configuration
  run: npm run validate:build
```

