/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    scrollRestoration: true,
  },
  images: {
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

module.exports = nextConfig;
