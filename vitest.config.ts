import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./tests/setup.ts'],
      include: ['tests/unit/**/*.test.ts', 'tests/component/**/*.test.ts'],
      passWithNoTests: true,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html', 'lcov'],
        include: ['src/**/*.{ts,vue}'],
        exclude: ['src/**/*.d.ts', 'src/main.ts', 'src/router/**', 'src/i18n/**'],
        thresholds: {
          // Constitution v2: financial logic must not regress.
          'src/lib/calculations/**': {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
          },
          'src/lib/tax/**': {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
          },
          // Constitution v2: overall coverage floor.
          branches: 60,
          functions: 60,
          lines: 60,
          statements: 60,
        },
      },
    },
  })
)
