# Tasks: `Eliminar onboarding y compliance v4`

> Ordered · T-LAST = regression gate · Spec: [1-spec.md](./1-spec.md)

## Phase 1 — Docs & constitution

### T-001 — Amend constitution to v4 `[done]`

- Covers: AC-2.1, AC-2.2, AC-2.3
- DoD: Header v4, sin pino, AppStateSchemaV3, catálogo 9 stores, sin regla hide-nav onboarding

### T-009 — Update README `[done]`

- Covers: AC-2.1
- DoD: Spec activa correcta, Node 20+, sin referencia onboarding guard

### T-010 — Update AGENTS.md `[done]`

- Covers: AC-2.1
- DoD: Node 20+ en setup

## Phase 2 — Remove onboarding

### T-002 — Remove onboarding flow `[done]`

- Covers: AC-1.1, AC-1.2, AC-1.3
- Deps: T-001
- DoD: Sin ruta/guard/vista/wizard/composable; settingsStore sin onboarding; reset → `/`

### T-011 — Update migrate defaults `[done]`

- Covers: AC-2.3
- Deps: T-002
- DoD: v1 migrate siempre `onboarding.done=true`

## Phase 3 — i18n & icons

### T-003 — i18n nav + theme `[done]`

- Covers: AC-3.1, AC-3.2
- Deps: T-002

### T-004 — LucideIcon component `[done]`

- Covers: AC-4.1
- Deps: T-003

## Phase 4 — Toolchain

### T-005 — Pin npm public registry `[done]`

- Covers: AC-5.1
- DoD: `.npmrc` + lockfile con registry.npmjs.org

## Phase 5 — Tests

### T-006 — Update/remove onboarding tests `[done]`

- Covers: AC-1.1, AC-4.1
- Deps: T-002, T-004

### T-007 — Chart.js test stub `[done]`

- Covers: AC-6.1
- Deps: T-006

### T-008 — E2E fresh-user spec `[done]`

- Covers: AC-1.1
- Deps: T-002

### T-012 — Regression gate `[done]`

- Covers: AC-6.1
- DeD: `npm test` exit 0 · `npm run build` exit 0
- Deps: T-007

## Sign-off

- [x] Author: `Johann Medina` — `2026-05-29`
