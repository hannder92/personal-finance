# .claude/rules — Finance Dashboard

Rules for Claude Code when working in this **Vue 3.5 + Pinia + TypeScript** project.

| File                                                 | Lines | Topic                                                                   |
| ---------------------------------------------------- | ----- | ----------------------------------------------------------------------- |
| [vue-architecture.md](vue-architecture.md)           | ~200  | Layers, store pattern, App.vue shell, CRUD completeness, CSS grid forms |
| [vue-testing.md](vue-testing.md)                     | ~170  | Vitest unit / store / component / E2E patterns                          |
| [node-colombia-payroll.md](node-colombia-payroll.md) | ~60   | Colombian payroll/tax constants (ARL, retención Art.383 ET, UVT 2025)   |

## Critical conventions (always apply)

- **Navigation shell**: `App.vue` MUST have sticky top bar + `RouterLink` mobile nav + `ThemeToggle` + `LanguageToggle`. Never leave it as a bare `<RouterView>`.
- **CRUD completeness**: every view whose domain store has `add()` / `addCard()` MUST expose a CTA + inline form. A list-only view is incomplete.
- **Lib purity**: `lib/` has zero Vue/Pinia imports. Composables bridge stores ↔ lib.
- **Store access**: `store.state.field` — no need for `storeToRefs()` on the nested `state` reactive object.
- **IDs**: always `globalThis.crypto.randomUUID()`.
- **Zod**: required at storage boundaries (`loadAppState`, `importFromFile`); SHOULD on UI forms (store guards are the minimum).
- **Hydration**: `hydrateStores()` runs synchronously in `main.ts` before `app.use(router)`.

## Colombian payroll (always apply when currency = COP)

See `node-colombia-payroll.md`. Key: ARL is employer-only, retención base = gross − salud(4%) − pensión(4%), renta exenta cap = 240 UVT.

## Recent changes

| Date       | Change                                                                                  |
| ---------- | --------------------------------------------------------------------------------------- |
| 2026-05-15 | Bootstrap: generated `vue-architecture.md` + `vue-testing.md` from session signals      |
| 2026-05-15 | Session signal: App.vue navigation shell missing → rule added to vue-architecture.md    |
| 2026-05-15 | Session signal: CRUD completeness gap in DebtsView/GoalsView → rule added               |
| 2026-05-15 | Memory signal: CSS grid alignment → invisible spacers rule added to vue-architecture.md |
