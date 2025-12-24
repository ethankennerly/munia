import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Validates that Prisma client can be generated and imported.
 * This test ensures the build configuration is correct for Vercel.
 */
describe('Prisma Client Generation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have Prisma in dependencies (not just devDependencies)', () => {
    const packageJsonPath = join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

    const isInDeps = packageJson.dependencies?.prisma !== undefined;
    const isInDevDeps = packageJson.devDependencies?.prisma !== undefined;

    // Prisma must be in dependencies for Vercel builds
    expect(isInDeps, 'Prisma must be in dependencies for Vercel builds').toBe(true);
  });

  it('should have postinstall or prebuild script that runs prisma generate', () => {
    const packageJsonPath = join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    const scripts = packageJson.scripts || {};

    const hasPostinstall = scripts.postinstall?.includes('prisma generate');
    const hasPrebuild = scripts.prebuild?.includes('prisma generate');

    expect(
      hasPostinstall || hasPrebuild,
      'Either postinstall or prebuild must run prisma generate',
    ).toBe(true);
  });

  it('should be able to import PrismaClient', () => {
    // This test verifies that @prisma/client can be imported
    // The actual client generation is tested by the build process
    expect(() => {
      // Dynamic import to avoid issues if client isn't generated
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('@prisma/client');
    }).not.toThrow();
  });

  it('should have matching versions of @prisma/client and prisma', () => {
    const packageJsonPath = join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

    const clientVersion = packageJson.dependencies?.['@prisma/client'];
    const cliVersion = packageJson.dependencies?.prisma;

    expect(clientVersion, '@prisma/client version should be defined').toBeDefined();
    expect(cliVersion, 'prisma CLI version should be defined').toBeDefined();

    // Extract major version
    const clientMajor = clientVersion?.split('.')[0];
    const cliMajor = cliVersion?.split('.')[0];

    expect(
      clientMajor === cliMajor,
      `@prisma/client (${clientVersion}) and prisma (${cliVersion}) should have matching major versions`,
    ).toBe(true);
  });
});

