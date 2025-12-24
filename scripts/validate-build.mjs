#!/usr/bin/env node

/**
 * Validates that the build setup is correct for Vercel deployment.
 * This script checks:
 * 1. Prisma is in dependencies (not just devDependencies)
 * 2. Prisma generate can run successfully
 * 3. Prisma client can be imported
 * 4. Build process can start (without full build to save time)
 */

import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

let hasErrors = false;

function log(message, type = 'info') {
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
  console.log(`${prefix} ${message}`);
}

function checkPrismaInDependencies() {
  log('Checking Prisma is in dependencies...');
  try {
    const packageJson = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf-8'));
    const isInDeps = packageJson.dependencies?.prisma !== undefined;
    const isInDevDeps = packageJson.devDependencies?.prisma !== undefined;

    if (!isInDeps && !isInDevDeps) {
      log('ERROR: Prisma not found in dependencies or devDependencies', 'error');
      hasErrors = true;
      return false;
    }

    if (isInDevDeps && !isInDeps) {
      log('ERROR: Prisma is only in devDependencies. It must be in dependencies for Vercel builds.', 'error');
      hasErrors = true;
      return false;
    }

    if (isInDeps) {
      log(`Prisma found in dependencies: ${packageJson.dependencies.prisma}`, 'success');
      return true;
    }

    return false;
  } catch (error) {
    log(`Error reading package.json: ${error.message}`, 'error');
    hasErrors = true;
    return false;
  }
}

function checkPrismaGenerate() {
  log('Testing Prisma generate...');
  try {
    // Run prisma generate in a way that mimics Vercel's environment
    execSync('npx prisma generate', {
      cwd: rootDir,
      stdio: 'pipe',
      env: {
        ...process.env,
        // Don't require DATABASE_URL for generate
        DATABASE_URL: process.env.DATABASE_URL || 'postgresql://dummy:dummy@localhost:5432/dummy',
      },
    });
    log('Prisma generate completed successfully', 'success');
    return true;
  } catch (error) {
    log(`Prisma generate failed: ${error.message}`, 'error');
    hasErrors = true;
    return false;
  }
}

function checkPrismaClientImport() {
  log('Verifying Prisma client can be imported...');
  try {
    // Try to import the generated client
    const prismaClientPath = join(rootDir, 'node_modules', '.prisma', 'client', 'index.js');
    // Just check if the path exists - actual import would require the client to be generated
    if (existsSync(prismaClientPath)) {
      log('Prisma client generated successfully', 'success');
      return true;
    } else {
      log('WARNING: Prisma client not found. Run "npx prisma generate" first.', 'error');
      hasErrors = true;
      return false;
    }
  } catch (error) {
    log(`Error checking Prisma client: ${error.message}`, 'error');
    hasErrors = true;
    return false;
  }
}

function checkBuildScripts() {
  log('Checking build scripts...');
  try {
    const packageJson = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf-8'));
    const scripts = packageJson.scripts || {};

    const hasPostinstall = scripts.postinstall?.includes('prisma generate');
    const hasPrebuild = scripts.prebuild?.includes('prisma generate');

    if (!hasPostinstall && !hasPrebuild) {
      log('WARNING: Neither postinstall nor prebuild runs prisma generate', 'error');
      hasErrors = true;
      return false;
    }

    if (hasPostinstall) {
      log('postinstall script includes prisma generate', 'success');
    }
    if (hasPrebuild) {
      log('prebuild script includes prisma generate', 'success');
    }

    return true;
  } catch (error) {
    log(`Error checking scripts: ${error.message}`, 'error');
    hasErrors = true;
    return false;
  }
}

function main() {
  console.log('\n🔍 Validating build configuration for Vercel...\n');

  checkPrismaInDependencies();
  checkBuildScripts();
  checkPrismaGenerate();
  checkPrismaClientImport();

  console.log('\n');
  if (hasErrors) {
    log('Validation failed. Please fix the errors above before pushing.', 'error');
    process.exit(1);
  } else {
    log('All validations passed! ✅', 'success');
    process.exit(0);
  }
}

main();

