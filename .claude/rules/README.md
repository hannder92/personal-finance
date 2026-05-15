# .claude/rules — Finance Dashboard

Rules for Claude Code when working in this **Vue 3.5 + Pinia + TypeScript** project.

| File                                                 | Topic                                                                 |
| ---------------------------------------------------- | --------------------------------------------------------------------- |
| [node-colombia-payroll.md](node-colombia-payroll.md) | Colombian payroll/tax constants (ARL, retención Art.383 ET, UVT 2025) |

## Key conventions (Vue 3 stack)

- **State lives in Pinia stores** (`src/stores/`). Never in component `ref`/`reactive` beyond local UI state.
- **`lib/` is pure** — zero Vue or Pinia imports. Testable with plain Vitest.
- **Currency formatting** via `formatCurrency(amount, code)` in `lib/currency/format.ts`.
- **i18n**: all user-visible strings via `$t('key')` in templates or `useI18n().t('key')` in `<script setup>`.
- **Stores validate inputs** at action boundaries; formal Zod validation runs at storage load (`loadAppState()`).
- **Hydration** runs synchronously in `main.ts` before `app.use(router)` so the onboarding guard sees correct state on first load.

See `CLAUDE.md` in the project root for full architecture and key function reference.
