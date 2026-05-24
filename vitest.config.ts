import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      include: ['lib/**/*.ts'],
      exclude: ['lib/utils/**'],
      thresholds: {
        'lib/calculator/**': { lines: 90, functions: 90, branches: 90, statements: 90 },
      },
    },
  },
});
