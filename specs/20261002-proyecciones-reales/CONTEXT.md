# Context manifest — 20261002-proyecciones-reales

> ≤20 lines. Pointers only — not a spec substitute.

## Always (this repo)

- `constitution.md`
- `docs/PRODUCT-UX-FLOW.md`
- Benchmark: https://escenariosdeinversion.lovable.app (valor real vs nominal, vivir de inversiones, meta financiera)

## Phase 0.5 — Discovery

- Estado actual: `src/views/FinancialFreedomView.vue`, `src/views/GoalsView.vue`, `src/views/SettingsView.vue`
- Cálculos: `src/lib/calculations/{financial-freedom,goals,savings-projection,projection}.ts`

## Phase 2 — Plan

- `1-spec.md` + `_ids.yaml` (ac, oq)
- Persistencia: `src/lib/storage/schema.ts` (V6 → V7) + `src/lib/storage/migrate.ts`
- Reuse grep: `settingsStore`, `assetsStore.annualRatePercent`, `settings.projectionAnnualRatePercent`

## Phase 5 — Implement

- `.agents/skills/vue-engineering/SKILL.md`, `.agents/skills/finance-ux/SKILL.md`
- Task block only from `4-tasks.md`
