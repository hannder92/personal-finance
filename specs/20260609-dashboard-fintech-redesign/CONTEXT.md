# Context manifest — 20260609-dashboard-fintech-redesign

> ≤20 lines. Pointers only — not a spec substitute.

## Always (this repo)

- `constitution.md`
- `docs/PRODUCT-UX-FLOW.md`
- Benchmark visual: `assets/benchmark-fintech-dashboard.png`

## Phase 0.5 — Discovery

- Benchmark: imagen fintech (cuentas, cash flow, transacciones, % vs mes anterior)
- Estado actual: `src/views/DashboardView.vue` + `src/components/dashboard/`
- Spec previo relacionado: `specs/20260604-dashboard-progressive-disclosure/1-spec.md`

## Phase 2 — Plan

- `1-spec.md` + `_ids.yaml` (ac, oq)
- Reuse grep: `src/stores/` (income, expenses, variableExpenses, snapshots, cards, assets)

## Phase 5 — Implement

- `.cursor/rules/` (vue-architecture, testing)
- Task block only from `4-tasks.md`
