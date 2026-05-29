# Tasks: UX claridad — fase 1

> Ordered · T-LAST = regression gate · Spec: [1-spec.md](./1-spec.md) · Test plan: [3-test-plan.md](./3-test-plan.md)

## Phase 1 — Setup

### T-001 — Scaffolding `nav-config` + claves i18n

- Type: setup · Layer: cross · Deps: — · Size: S · Risk: L
- Covers: AC-3.1, AC-5.2 (parcial)
- DoD:
  - [ ] `src/lib/navigation/nav-config.ts` exporta 4 grupos y hijos con `routeName`, `path`, `icon`, `i18nKey`
  - [ ] Claves `nav.groups.*`, `nav.sheet.*`, `dashboard.*` añadidas en `es.json` y `en.json` (valores placeholder OK)
  - [ ] `npm run typecheck` sin errores en archivos nuevos

### T-002 — Stubs de archivos de test

- Type: setup · Layer: infra · Deps: T-001 · Size: S · Risk: L
- Covers: (infra para todos los TC)
- DoD:
  - [ ] Archivos `describe` vacíos o `.skip` creados: `nav-config.test.ts`, `dashboard-keys-parity.test.ts`, `useDashboardInsights.test.ts`, `DashboardHero.test.ts`, `KpiStrip.test.ts`, `DesktopNav.test.ts`, `useNavActive.test.ts`, `MobileBottomNav.test.ts`, `NavBottomSheet.test.ts`, `AppShell.test.ts`, `e2e/nav-groups.spec.ts`, `e2e/dashboard-hero-mobile.spec.ts`
  - [ ] `npm test` ejecuta sin error de import (tests skip o vacíos pasan)

## Phase 2 — Tests

### T-010 — RED: unit `nav-config` (TC-U-001)

- Type: test · Layer: cross · Deps: T-002 · Size: S · Risk: L
- Covers: AC-3.1, AC-3.2 · TC-U-001
- DoD:
  - [ ] Test falla: valida 4 grupos, hijos y coincidencia con nombres de ruta del router
  - [ ] `npm test -- nav-config` RED

### T-011 — RED: unit paridad i18n dashboard (TC-U-002)

- Type: test · Layer: infra · Deps: T-001 · Size: S · Risk: L
- Covers: AC-5.2 · TC-U-002
- DoD:
  - [ ] Test falla: recorre claves `dashboard.*` en es vs en
  - [ ] `npm test -- dashboard-keys-parity` RED

### T-012 — RED: unit `useDashboardInsights` (TC-U-010, TC-U-011, TC-U-012)

- Type: test · Layer: app · Deps: T-002 · Size: M · Risk: M
- Covers: AC-6.1, AC-6.2, AC-6.3 · TC-U-010, TC-U-011, TC-U-012
- DoD:
  - [ ] Tests fallan con fixtures Pinia (donut con monto, proyección M12, vacío sin cifras)
  - [ ] `npm test -- useDashboardInsights` RED

### T-013 — RED: component `DashboardHero` (TC-C-001 … TC-C-005)

- Type: test · Layer: app · Deps: T-002, T-011 · Size: M · Risk: M
- Covers: AC-1.1, AC-1.2, AC-1.3, AC-1.4, AC-1.5 · TC-C-001, TC-C-003, TC-C-004, TC-C-005
- DoD:
  - [ ] Tests fallan: viewport 390×844, jerarquía tipográfica, empty income, comparison badge, CTA allocation
  - [ ] `data-testid` acordados en tests (`hero-available`, `hero-health-score`, `cta-allocation`)
  - [ ] `npm test -- DashboardHero` RED

### T-014 — RED: component `KpiStrip` (TC-C-006, TC-C-007)

- Type: test · Layer: app · Deps: T-002 · Size: S · Risk: L
- Covers: AC-2.1, AC-2.2 · TC-C-006, TC-C-007
- DoD:
  - [ ] Tests fallan: orden bajo hero, `overflow-x-auto`, sin tarjeta `type=free`
  - [ ] `npm test -- KpiStrip` RED

### T-015 — RED: component `DesktopNav` + `useNavActive` (TC-C-010 … TC-C-014)

- Type: test · Layer: app · Deps: T-010 · Size: M · Risk: M
- Covers: AC-3.1, AC-3.2, AC-3.3, AC-3.4, AC-3.5, AC-3.6 · TC-C-010, TC-C-011, TC-C-012, TC-C-013, TC-C-014
- DoD:
  - [ ] Tests fallan: 4 grupos, Inicio sin dropdown, dropdown al clic, cierre, estado activo
  - [ ] `npm test -- DesktopNav` RED

### T-016 — RED: component `MobileBottomNav` + `NavBottomSheet` (TC-C-020 … TC-C-027)

- Type: test · Layer: app · Deps: T-010 · Size: M · Risk: M
- Covers: AC-4.1, AC-4.2, AC-4.3, AC-4.4, AC-4.6, AC-4.7, AC-4.8 · TC-C-020 … TC-C-027
- DoD:
  - [ ] Tests fallan: 4 tabs con icono, listas por grupo, Inicio sin sheet, abrir/cerrar sheet
  - [ ] `npm test -- MobileBottomNav NavBottomSheet` RED

### T-017 — RED: component `AppShell` layout (TC-C-024)

- Type: test · Layer: app · Deps: T-002 · Size: S · Risk: L
- Covers: AC-4.5 · TC-C-024
- DoD:
  - [ ] Test falla: `main` con `pb-16 md:pb-0` en render de App
  - [ ] `npm test -- AppShell` RED

### T-018 — RED: dashboard i18n + chart insights (TC-C-030, TC-C-031, TC-C-032)

- Type: test · Layer: app · Deps: T-011, T-012 · Size: M · Risk: M
- Covers: AC-5.1, AC-6.1, AC-6.2, AC-6.3 · TC-C-030, TC-C-031, TC-C-032
- DoD:
  - [ ] Ampliar `DashboardViewReactive.test.ts` — locale en → sin español
  - [ ] `BudgetDonut` / `ProjectionChart` tests exigen prop `insight` o empty message
  - [ ] `npm test -- DashboardViewReactive BudgetDonut ProjectionChart` RED

### T-019 — RED: E2E navegación y héroe móvil (TC-E-001, TC-E-002)

- Type: test · Layer: infra · Deps: T-002 · Size: M · Risk: M
- Covers: AC-1.1, AC-3.2, AC-4.2, AC-4.3, AC-4.4, AC-4.5 · TC-E-001, TC-E-002
- DoD:
  - [ ] `e2e/nav-groups.spec.ts` — Plan → Metas en ≤2 toques (viewport móvil)
  - [ ] `e2e/dashboard-hero-mobile.spec.ts` — héroe visible sin scroll
  - [ ] `npm run e2e` RED (specs presentes, app sin implementar)

## Phase 3 — Implementation

> Orden: H → M → L. Cada impl depende de sus tests RED.

### T-020 — Impl: `nav-config` + `useNavActive`

- Type: impl · Layer: cross · Deps: T-010 · Size: S · Risk: H
- Covers: AC-3.1, AC-3.2, AC-3.3 · TC-U-001, TC-C-011
- DoD:
  - [ ] `nav-config.ts` completo según contrato del plan
  - [ ] `useNavActive.ts` expone `activeGroupId`, `activeItemId`
  - [ ] T-010 GREEN

### T-021 — Impl: `DesktopNav` + `NavDropdownMenu` (radix-vue)

- Type: impl · Layer: app · Deps: T-015, T-020 · Size: M · Risk: H
- Covers: AC-3.1, AC-3.3, AC-3.4, AC-3.5, AC-3.6 · TC-C-010, TC-C-012, TC-C-013, TC-C-014
- DoD:
  - [ ] Patrón híbrido OQ-1: Inicio `RouterLink`; Dinero/Plan/Más `DropdownMenu` al clic
  - [ ] A-003 verificada (imports radix estables)
  - [ ] T-015 GREEN

### T-022 — Impl: `MobileBottomNav` + `NavBottomSheet`

- Type: impl · Layer: app · Deps: T-016, T-020 · Size: M · Risk: M
- Covers: AC-4.1, AC-4.2, AC-4.3, AC-4.4, AC-4.6, AC-4.7, AC-4.8 · TC-C-020 … TC-C-027
- DoD:
  - [ ] 4 tabs con `LucideIcon`; sheet `Dialog` inferior (OQ-2)
  - [ ] Inicio navega sin abrir sheet
  - [ ] T-016 GREEN

### T-023 — Impl: integrar shell en `App.vue`

- Type: impl · Layer: app · Deps: T-021, T-022, T-017 · Size: M · Risk: M
- Covers: AC-3.2, AC-4.5 · TC-C-024, TC-C-011
- DoD:
  - [ ] Eliminar `ALL_NAV` / `MOBILE_NAV` planos; usar `DesktopNav` + `MobileBottomNav`
  - [ ] `main` con padding inferior móvil
  - [ ] T-017 GREEN; rutas legacy siguen funcionando

### T-024 — Impl: `useDashboardInsights`

- Type: impl · Layer: app · Deps: T-012 · Size: M · Risk: M
- Covers: AC-6.1, AC-6.2, AC-6.3 · TC-U-010, TC-U-011, TC-U-012
- DoD:
  - [ ] Composable puro de lectura sobre stores/composables existentes
  - [ ] T-012 GREEN

### T-025 — Impl: `DashboardHero`

- Type: impl · Layer: app · Deps: T-013, T-024 · Size: M · Risk: M
- Covers: AC-1.1, AC-1.2, AC-1.3, AC-1.4, AC-1.5 · TC-C-001 … TC-C-005
- DoD:
  - [ ] Héroe con `freeForAllocation` (A-001), `ComparisonBadge`, CTA `/allocation`, empty → `/income`
  - [ ] `HealthScore` en modo compacto en héroe
  - [ ] T-013 GREEN

### T-026 — Impl: `KpiStrip` + `HealthScore` variant

- Type: impl · Layer: app · Deps: T-014, T-025 · Size: S · Risk: L
- Covers: AC-2.1, AC-2.2, AC-1.2 · TC-C-006, TC-C-007, TC-C-002
- DoD:
  - [ ] Strip horizontal; sin duplicar Disponible (A-005)
  - [ ] Prop `variant="compact"` en `HealthScore` si aplica
  - [ ] T-014 GREEN

### T-027 — Impl: `DashboardView` orquestación + i18n

- Type: impl · Layer: app · Deps: T-018, T-025, T-026 · Size: M · Risk: L
- Covers: AC-5.1, AC-2.1 · TC-C-030
- DoD:
  - [ ] Layout: hero → strip → charts; cero strings hardcodeadas
  - [ ] Claves `dashboard.*` completas en es/en
  - [ ] T-018 (DashboardView parte) GREEN

### T-028 — Impl: insights en `BudgetDonut` y `ProjectionChart`

- Type: impl · Layer: app · Deps: T-018, T-024, T-027 · Size: S · Risk: L
- Covers: AC-6.1, AC-6.2, AC-6.3 · TC-C-031, TC-C-032
- DoD:
  - [ ] Props/slots `insight` / `emptyMessage` conectados a `useDashboardInsights`
  - [ ] T-018 (chart parte) GREEN

## Phase 4 — Regression

### T-LAST — Regression gate

- Type: test · Layer: infra · Deps: T-023, T-027, T-028, T-019 · Size: S · Risk: L
- Covers: AC-1.1 … AC-6.3 (todos) · TC-I-001, TC-E-001, TC-E-002
- DoD:
  - [ ] `npm test` exit 0
  - [ ] `npm run build` exit 0
  - [ ] `npm run e2e` exit 0
  - [ ] `npm run lint` y `npm run typecheck` sin errores
  - [ ] Asunciones A-001 … A-005 marcadas `verified` en `_ids.yaml` si tests pasan

## Sign-off

- [x] Author: `Johann Medina` — `2026-05-29`
