import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    scrollRestoration: true,
  },
  turbopack: {
    root: process.cwd(),
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
    ],
  },
  env: {
    // Expose npm_config_loglevel to client for build-time evaluation only
    // This allows client logger to respect the same loglevel as server
    // Variable is evaluated at build time, then unused code is tree-shaken
    NEXT_PUBLIC_BUILDTIME_NPM_CONFIG_LOGLEVEL: process.env.npm_config_loglevel || '',
  },
};

export default withNextIntl(nextConfig);