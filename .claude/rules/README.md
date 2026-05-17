# .claude/rules — Finance Dashboard

Rules for Claude Code when working in this **Vue 3.5 + Pinia + TypeScript** project.

| File                                       | Lines | Load | Topic                                                                   |
| ------------------------------------------ | ----- | ---- | ----------------------------------------------------------------------- |
| [vue-architecture.md](vue-architecture.md) | 200   | always | Layers, store pattern, composables bridge, App.vue shell, CRUD completeness |
| [vue-testing.md](vue-testing.md)           | 198   | always | Vitest unit / store / component / E2E patterns, TC-ID naming, coverage gates |
| [colombia-payroll.md](colombia-payroll.md) | 85    | contextual (`paths:`) | ARL, retención Art.383 ET, UVT 2025, prima |

## Critical conventions (always apply)

- **Composables bridge**: views call composables; composables call stores + lib. Views MUST NOT import from `lib/calculations` directly.
- **Navigation shell**: `App.vue` MUST have sticky top bar + `RouterLink` mobile nav + `ThemeToggle` + `LanguageToggle`.
- **CRUD completeness**: every view whose domain store has `add()` MUST expose a CTA + inline form.
- **Lib purity**: `lib/` has zero Vue/Pinia imports.
- **Store access**: `store.state.field` — no `storeToRefs()` on nested reactive state object.
- **IDs**: always `globalThis.crypto.randomUUID()` (exception: `__prima__` reserved slug documented in ADR-6).
- **Zod**: required at storage boundaries (`loadAppState`, `saveAppState`); SHOULD on UI forms.
- **Schema evolution**: every persisted field change MUST update `AppStateSchemaV3` AND add a `migrations[N]` step.

## Colombian payroll (paths-scoped — loads when relevant files open)

See `colombia-payroll.md`. Key: ARL is employer-only, retención base = gross − salud(4%) − pensión(4%), renta exenta cap = 240 UVT, APR = TEA.

## Recent changes

| Date       | Change                                                                                   |
| ---------- | ---------------------------------------------------------------------------------------- |
| 2026-05-16 | ENRICH vue-architecture.md: composables bridge bilateral example (useNetIncome pattern)  |
| 2026-05-16 | ENRICH vue-testing.md: full initialState seed + TC-ID naming + test locations section   |
| 2026-05-16 | TRIM CLAUDE.md: 319→254 lines; removed Router table, Known Bugs, stale feature sections |
| 2026-05-15 | Bootstrap: generated `vue-architecture.md` + `vue-testing.md` from session signals      |
| 2026-05-15 | RENAME: node-colombia-payroll.md → colombia-payroll.md (node- prefix misleading)        |
