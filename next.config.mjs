import nextEnv from '@next/env';
import { withSentryConfig } from '@sentry/nextjs';
import createNextIntlPlugin from 'next-intl/plugin';

import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

nextEnv.loadEnvConfig(__dirname);

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const allowedDevOriginsEnv = process.env.NEXT_ALLOWED_DEV_ORIGINS;
const allowedDevOrigins =
  allowedDevOriginsEnv === undefined
    ? undefined
    : allowedDevOriginsEnv
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(allowedDevOrigins?.length ? { allowedDevOrigins } : {}),
  experimental: {
    mcpServer: true,
    scrollRestoration: true,
  },
  images: {
    // 30 days in seconds (60 * 60 * 24 * 30)
    minimumCacheTTL: 2592000,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'munia-s3-bucket.s3.us-east-1.amazonaws.com',
        port: '',
      },
      // GitHub Avatars
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      // Facebook Profile Photos
      {
        protocol: 'https',
        hostname: 'platform-lookaside.fbsbx.com',
      },
      // Mock/Placeholder Profile Photos
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
    ],
  },
  env: {
    // Expose npm_config_loglevel to client for build-time evaluation only
    // This allows client logger to respect the same loglevel as server
    // Variable is evaluated at build time, then unused code is tree-shaken
    NEXT_PUBLIC_BUILDTIME_NPM_CONFIG_LOGLEVEL: process.env.npm_config_loglevel || '',
  },
  turbopack: {
    root: __dirname,
  },

  outputFileTracingRoot: __dirname,

};

export default withSentryConfig(withNextIntl(nextConfig), {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: 'ethan-kennerly',

  project: 'javascript-nextjs',

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: '/monitoring',

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
