# Tasks: Proyecciones reales

> Spec: [1-spec.md](./1-spec.md) · Plan: [2-plan.md](./2-plan.md) · Test plan: [3-test-plan.md](./3-test-plan.md)

## Phase 1 — Domain (pure calculations)

### T-001 — test: real-projection unit tests (RED)

- Type: test · Size: S · Layer: domain · Covers: AC-1.4, AC-3.2–3.4, TC-U-001…004

### T-002 — impl: `lib/calculations/real-projection.ts` + `assumptions-reference.ts`

- Type: impl · Size: S · Layer: domain · Risk: M · Deps: T-001 · Covers: AC-1.2, AC-1.4, AC-3.2–3.4

### T-003 — test: financial-freedom + goals extended tests (RED)

- Type: test · Size: S · Layer: domain · Covers: AC-2.1–2.6, AC-3.3–3.6, TC-U-005, 006, 010…014

### T-004 — impl: extend `financial-freedom.ts` and `goals.ts`

- Type: impl · Size: M · Layer: domain · Risk: M · Deps: T-002, T-003 · Covers: AC-2.1–2.6, AC-3.3–3.6

## Phase 2 — Persistence and state

### T-005 — test: migrate V6→V7, schema V7, stores (RED)

- Type: test · Size: S · Layer: infra · Covers: AC-1.1, AC-1.3, AC-1.6, AC-3.1, TC-U-020…022, 030…033

### T-006 — impl: schema V7, `migrateV6toV7`, `useAppStorage`, `main.ts`, settings/goals stores

- Type: impl · Size: M · Layer: infra · Risk: H · Deps: T-005 · Covers: AC-1.1, AC-1.2, AC-1.3, AC-1.6, AC-3.1

## Phase 3 — UI

### T-007 — test: component tests AssumptionsPanel, FinancialFreedomView, GoalCard/GoalList (RED)

- Type: test · Size: M · Layer: app · Covers: TC-C-001…024

### T-008 — impl: `useAssumptions`, composables, AssumptionsPanel, SettingsView

- Type: impl · Size: S · Layer: app · Risk: L · Deps: T-006, T-007 · Covers: AC-1.1–1.5

### T-009 — impl: FinancialFreedomView redesign

- Type: impl · Size: S · Layer: app · Risk: L · Deps: T-004, T-008 · Covers: AC-2.1–2.7

### T-010 — impl: GoalCard / GoalList

- Type: impl · Size: S · Layer: app · Risk: L · Deps: T-004, T-008 · Covers: AC-3.1–3.7

### T-011 — impl: i18n keys es/en

- Type: impl · Size: S · Layer: cross · Risk: L · Deps: T-008 · Covers: EC-7

## Phase 4 — Verification

### T-012 — test: e2e `real-projections.spec.ts` (reference values, FI mobile P0, goal toggle + persistence)

- Type: test · Size: S · Layer: app · Covers: TC-E-001…003

### T-LAST — regression gate

- `npm test && npm run typecheck && npm run lint && npm run test:coverage && npm run e2e`
- Deps: T-001…T-012
