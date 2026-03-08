import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.test.{ts,js}'],
    exclude: ['node_modules/**', 'dist/**', 'coverage/**', 'frontend/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,js}'], // only instrument your source files
      exclude: [
        '**/node_modules/**',
        'tests/**',
        'dist/**',
        'frontend/**',
        'vitest.config.*',
        'src/**/*.d.ts',
      ],
    },
  },
});
