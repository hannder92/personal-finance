# Tasks: Dashboard progressive disclosure (mobile hierarchy)

> [Spec](./1-spec.md) · [Plan](./2-plan.md) · [Test plan](./3-test-plan.md) · Mode: `solo` · Generated: `2026-06-04`

## Legend

| Symbol               | Meaning                                         |
| -------------------- | ----------------------------------------------- |
| **Type**             | `setup` · `test` · `impl` · `refactor` · `docs` |
| **Layer**            | `domain` · `app` · `infra` · `cross`            |
| **Size**             | `S` (<2h) · `M` (<1d) · **L PROHIBITED**        |
| **Risk** (impl only) | `H` · `M` · `L`                                 |

## Summary

- **14 tasks** — 2 setup · 5 test · 6 impl · 1 regression (`T-LAST`)
- **12/12 AC** · **28 TC** referenciados
- **Primer task ejecutable:** `T-001`
- **Orden impl:** M (storage + composable) → M (DashboardView) → L (toggle + i18n) → M (E2E)

---

## Phase 1 — Setup

### T-001 — Scaffolding tier 2 + i18n keys

- Type: setup · Layer: cross · Deps: — · Size: S
- Covers: AC-2.1, AC-1.3 (infra)
- DoD:
  - [ ] Stub `src/lib/dashboard-tier2-storage.ts` — exports `DASHBOARD_TIER2_SESSION_KEY`, `readTier2Expanded`, `writeTier2Expanded`, `computeTier2State` (pure)
  - [ ] Stub `src/composables/useDashboardTier2.ts` — exports composable con refs placeholder
  - [ ] Stub `src/components/dashboard/DashboardTier2Toggle.vue` — botón placeholder + hint
  - [ ] Claves en `es.json` + `en.json`: `dashboard.tier2.expand`, `dashboard.tier2.collapse`, `dashboard.tier2.hint`
  - [ ] `data-testid`: `dashboard-tier-2`, `dashboard-tier2-toggle` documentados en plan
  - [ ] `npm run typecheck` pasa

### T-002 — Stubs archivos de test + E2E

- Type: setup · Layer: cross · Deps: T-001 · Size: S
- Covers: (infra)
- DoD:
  - [ ] `tests/unit/lib/dashboard-tier2-storage.test.ts` (describe vacío)
  - [ ] `tests/unit/composables/useDashboardTier2.test.ts`
  - [ ] `tests/component/DashboardTier2Toggle.test.ts`
  - [ ] Ampliar `tests/component/DashboardView.test.ts` (bloque tier 2)
  - [ ] `e2e/dashboard-tier2.spec.ts` stub
  - [ ] `npm test` sin error de import de paths nuevos

---

## Phase 2 — Tests

### T-010 — RED: unit `dashboard-tier2-storage` (TC-U-020 … TC-U-027)

- Type: test · Layer: domain · Deps: T-002 · Size: M
- Covers: AC-1.1, AC-3.1, AC-3.2, AC-4.1, AC-4.2, AC-5.1 · TC-U-020–027 · EC-1, EC-2
- DoD:
  - [ ] `readTier2Expanded` / `writeTier2Expanded` con MockStorage
  - [ ] `computeTier2State({ isDesktop, hasIncome, isExpanded })` → `{ tier2Visible, canToggle }` — todos los casos del test plan
  - [ ] TC-U-026: write no toca `localStorage` finance key
  - [ ] Cada `it` cita `TC-U-NNN (AC-X.Y)` en el nombre
  - [ ] `npm test -- dashboard-tier2-storage` RED

### T-011 — RED: composable `useDashboardTier2` (TC-U-022, TC-U-023)

- Type: test · Layer: app · Deps: T-002, T-010 · Size: S
- Covers: AC-3.1, AC-3.2 · TC-U-022, TC-U-023
- DoD:
  - [ ] Mock `@vueuse/core` `useMediaQuery` → mobile/desktop
  - [ ] Mock `sessionStorage`; `createTestingPinia` con `grossSalary`
  - [ ] `toggle()` escribe session key; init lee collapsed
  - [ ] `npm test -- useDashboardTier2` RED

### T-012 — RED: component `DashboardTier2Toggle` (TC-C-082 … TC-C-087, TC-C-091)

- Type: test · Layer: app · Deps: T-002 · Size: M
- Covers: AC-1.3, AC-2.1, AC-2.3, AC-2.4 · TC-C-082–087, TC-C-091
- DoD:
  - [ ] Hint visible collapsed; copy es/en expand/collapse
  - [ ] `aria-expanded` correcto; touch target ≥44px
  - [ ] grep: sin `v-html` en SFC
  - [ ] `npm test -- DashboardTier2Toggle` RED

### T-013 — RED: `DashboardView` tier 2 (TC-C-080, TC-C-081, TC-C-085, TC-C-086, TC-C-088, TC-C-089, TC-C-090)

- Type: test · Layer: app · Deps: T-002 · Size: M
- Covers: AC-1.1, AC-1.2, AC-2.2, AC-2.3, AC-4.1, AC-4.2, AC-5.1 · TC-C-080–081, TC-C-085–086, TC-C-088–090
- DoD:
  - [ ] Mock `useDashboardTier2` o `useMediaQuery` para mobile/desktop
  - [ ] Mobile collapsed: `queryByTestId('dashboard-tier-2')` null
  - [ ] Orden: day-overview → hero → toggle → tier2
  - [ ] Click expand/collapse cycle
  - [ ] Desktop: tier2 visible, toggle absent
  - [ ] `grossSalary=0`: no tier2, no toggle
  - [ ] `npm test -- DashboardView` RED (nuevos casos)

### T-014 — RED: E2E `dashboard-tier2` (TC-E-030 … TC-E-036)

- Type: test · Layer: cross · Deps: T-002 · Size: M
- Covers: AC-1.1, AC-2.2, AC-2.3, AC-3.1, AC-3.2, AC-4.1, AC-4.2 · TC-E-030–036
- DoD:
  - [ ] Playwright mobile 390×844: tier2 hidden default (`returningPage`)
  - [ ] Expand → tier2 visible; collapse → hidden
  - [ ] Nav `/income` → `/` persiste expanded
  - [ ] `freshPage` sin session: collapsed
  - [ ] Desktop 1280×720: tier2 visible, sin botón expand
  - [ ] `npm run e2e -- dashboard-tier2` RED

---

## Phase 3 — Implementation

### T-020 — Impl: `dashboard-tier2-storage.ts`

- Type: impl · Layer: domain · Deps: T-010 · Size: S · Risk: **M**
- Covers: AC-1.1, AC-3.1, AC-3.2, AC-4.1, AC-4.2, AC-5.1 · TC-U-020–027
- DoD:
  - [ ] Pure functions según contrato del plan
  - [ ] `computeTier2State`: desktop → always visible; no income → forced collapse
  - [ ] `npm test -- dashboard-tier2-storage` GREEN

### T-021 — Impl: `useDashboardTier2`

- Type: impl · Layer: app · Deps: T-010, T-011, T-020 · Size: M · Risk: **M**
- Covers: AC-3.1, AC-3.2, AC-4.1, AC-4.2, AC-5.1 · TC-U-022, TC-U-023
- DoD:
  - [ ] `useMediaQuery('(min-width: 768px)')` para `isDesktop`
  - [ ] Lee/escribe `pf_dashboard_tier2_expanded` en toggle
  - [ ] `hasIncome` desde `incomeStore.state.grossSalary > 0`
  - [ ] Expone `tier2Visible`, `canToggle`, `isExpanded`, `toggle`
  - [ ] `npm test -- useDashboardTier2` GREEN

### T-022 — Impl: `DashboardTier2Toggle`

- Type: impl · Layer: app · Deps: T-012, T-021 · Size: S · Risk: **L**
- Covers: AC-1.3, AC-2.1, AC-2.3, AC-2.4 · TC-C-082–087, TC-C-091
- DoD:
  - [ ] Botón outline `min-h-11 w-full`; hint `text-sm text-slate-500`
  - [ ] Props/emits o inject composable; `aria-expanded`
  - [ ] Solo `t('dashboard.tier2.*')`
  - [ ] `npm test -- DashboardTier2Toggle` GREEN

### T-023 — Impl: `DashboardView` restructure

- Type: impl · Layer: app · Deps: T-013, T-021, T-022 · Size: M · Risk: **M**
- Covers: AC-1.1, AC-1.2, AC-2.2, AC-2.3, AC-4.1, AC-4.2, AC-5.1 · TC-C-080–090
- DoD:
  - [ ] Tier 1: `DayOverview` → `DashboardHero` → `DashboardTier2Toggle` (`v-if="canToggle"`)
  - [ ] Tier 2: wrapper `data-testid="dashboard-tier-2"` con `v-if="tier2Visible"` — mover cards L55–92 actuales
  - [ ] Orden interno tier 2 sin cambio
  - [ ] `npm test -- DashboardView` GREEN (incl. regresión Mi Día orden)

### T-024 — Impl: i18n polish

- Type: impl · Layer: infra · Deps: T-001, T-022 · Size: S · Risk: **L**
- Covers: AC-2.1, AC-1.3 · TC-C-083, TC-C-084
- DoD:
  - [ ] es: "Ver análisis del mes", "Ocultar análisis", hint descriptivo
  - [ ] en: equivalentes en `en.json`
  - [ ] Paridad completa claves `dashboard.tier2.*`

### T-025 — Impl: E2E green `dashboard-tier2`

- Type: impl · Layer: cross · Deps: T-014, T-023 · Size: M · Risk: **M**
- Covers: AC-1.1, AC-2.2, AC-2.3, AC-3.1, AC-3.2, AC-4.1, AC-4.2 · TC-E-030–036
- DoD:
  - [ ] Reutilizar `fixtures.ts` `returningPage` / `freshPage`
  - [ ] Selectors por `data-testid` y i18n es
  - [ ] `npm run e2e -- dashboard-tier2` GREEN

---

## Phase 4 — Regression

### T-LAST — Regression gate + verify prep

- Type: test · Layer: cross · Deps: T-020, T-021, T-022, T-023, T-024, T-025 · Size: S
- Covers: ALL AC · TC-I-020, TC-E-031
- DoD:
  - [ ] `npm test` full suite GREEN
  - [ ] `npm run lint` 0 errors
  - [ ] `npm run typecheck` clean
  - [ ] `npm run e2e` GREEN (incl. `day-overview` + `dashboard-tier2`)
  - [ ] Regresión AC-1.2: `day-overview.spec.ts` sigue verde
  - [ ] Listo para `/sdd-verify` y `/sdd-review`

---

## Sign-off

- [x] Author — Johann Medina — 2026-06-04

## Next

`/sdd-signoff tasks` → `/sdd-implement phase 2` (RED tests) o `/sdd-implement`
