import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./src/engine/__tests__/setup.ts'],
  },
});
