// vitest.setup.ts
import { vi } from 'vitest';

vi.mock('next-intl', async () => {
  const actual = await vi.importActual('next-intl');
  return {
    ...actual,
    useTranslations: () => (key: string) => key, // Simply returns the key string
  };
});

// Global test timeout: stop all tests after 10 seconds
const MAX_TEST_TIME = 10000; // 10 seconds
const startTime = Date.now();

// Check timeout before each test
beforeEach(() => {
  const elapsed = Date.now() - startTime;
  if (elapsed > MAX_TEST_TIME) {
    throw new Error(`Test suite exceeded ${MAX_TEST_TIME}ms limit. Stopping tests.`);
  }
});
