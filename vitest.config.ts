import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    globals: true,
    include: ['src/**/*.spec.{ts,tsx}'],
    environment: 'jsdom', // Use jsdom for React component tests
    testTimeout: 1000, // 1 second per test (auto-fail if slower)
    hookTimeout: 1000, // 1 second for hooks
    teardownTimeout: 1000, // 1 second for teardown
    maxConcurrency: 1, // Run tests sequentially to identify slow ones
    setupFiles: ['./vitest.setup.ts'], // Global timeout enforcement
    server: {
      deps: {
        inline: ['next-intl']
      }
    }
  },
});
