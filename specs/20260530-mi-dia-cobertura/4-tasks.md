# Tasks: Mi Día — cobertura y vencimientos

> [Spec](./1-spec.md) · [Plan](./2-plan.md) · [Test plan](./3-test-plan.md) · Mode: `solo` · Generated: `2026-06-04`

## Legend

| Symbol               | Meaning                                         |
| -------------------- | ----------------------------------------------- |
| **Type**             | `setup` · `test` · `impl` · `refactor` · `docs` |
| **Layer**            | `domain` · `app` · `infra` · `cross`            |
| **Size**             | `S` (<2h) · `M` (<1d) · **L PROHIBITED**        |
| **Risk** (impl only) | `H` · `M` · `L`                                 |

## Summary

- **18 tasks** — 2 setup · 7 test · 8 impl · 1 regression (`T-LAST`)
- **12/12 AC** · **17 TC** referenciados
- **Primer task ejecutable:** `T-001`
- **Orden impl:** H (dominio) → M (composable + coverage + dashboard) → L (payments + agenda + i18n)

---

## Phase 1 — Setup

### T-001 — Scaffolding Mi Día + i18n keys

- Type: setup · Layer: cross · Deps: — · Size: S
- Covers: AC-4.2 (infra)
- DoD:
  - [ ] Carpeta `src/components/dashboard/day/` creada
  - [ ] SFC mínimos export: `DayOverview.vue`, `DayCoverageCard.vue`, `DayPaymentsCard.vue`, `DayAgendaCard.vue` (template placeholder)
  - [ ] Stub `src/lib/calculations/day-obligations.ts` (exports vacíos o throw)
  - [ ] Stub `src/composables/useDayOverview.ts`
  - [ ] Claves en `es.json` + `en.json`: `day.coverage.ok`, `day.coverage.shortfall`, `day.coverage.context`, `day.coverage.noDue`, `day.payments.title`, `day.payments.empty`, `day.payments.viewDebts`, `day.agenda.title`, `day.agenda.none`, `day.agenda.day0`…`day2` (o equivalente)
  - [ ] `data-testid` acordados en plan: `data-day-overview`, `data-dashboard-hero`, `data-coverage-status`, `data-payment-item`, `data-agenda-row`, `data-link-debts`, `data-cta-patrimonio`
  - [ ] `npm run typecheck` pasa

### T-002 — Stubs archivos de test + E2E

- Type: setup · Layer: cross · Deps: T-001 · Size: S
- Covers: (infra)
- DoD:
  - [ ] `tests/unit/calculations/day-obligations.test.ts` (describe vacío o skip)
  - [ ] `tests/unit/composables/useDayOverview.test.ts`
  - [ ] `tests/component/DayCoverageCard.test.ts`, `DayPaymentsCard.test.ts`, `DayAgendaCard.test.ts`, `DayOverview.test.ts`
  - [ ] Ampliar `tests/component/DashboardView.test.ts` (bloque orden Mi Día)
  - [ ] `e2e/day-overview.spec.ts` stub
  - [ ] `npm test` sin error de import de paths nuevos

---

## Phase 2 — Tests

### T-010 — RED: unit `day-obligations` (TC-U-010 … TC-U-014)

- Type: test · Layer: domain · Deps: T-002 · Size: M
- Covers: AC-1.1, AC-1.2, AC-1.3, AC-1.5, AC-2.1, AC-3.1, AC-3.2 · TC-U-010, TC-U-011, TC-U-012, TC-U-013, TC-U-014 · EC-1, EC-3
- DoD:
  - [ ] `isDueOnLocalDay` medianoche local (EC-1)
  - [ ] `calcDayCoverage`: covered, shortfall 200k, no_due_today, equal liquid (EC-3)
  - [ ] `listDebtsDueOnDay` excluye mañana; loans excluidos (TC-U-014)
  - [ ] `buildAgendaThreeDays` → 3 filas, conteo/monto
  - [ ] Cada `it` cita `TC-U-NNN (AC-X.Y)` en el nombre
  - [ ] `npm test -- day-obligations` RED

### T-011 — RED: composable `useDayOverview` (TC-I-010)

- Type: test · Layer: app · Deps: T-002 · Size: S
- Covers: AC-1.1, AC-2.1, AC-3.1 · TC-I-010
- DoD:
  - [ ] `createTestingPinia`; `today` fijo inyectado
  - [ ] Fixture: card due today + cash asset → `coverage.status === 'covered'`
  - [ ] `npm test -- useDayOverview` RED

### T-012 — RED: component `DayCoverageCard` (TC-C-068 … TC-C-071)

- Type: test · Layer: app · Deps: T-002 · Size: M
- Covers: AC-1.1, AC-1.2, AC-1.3, AC-1.4, AC-1.5 · TC-C-068, TC-C-069, TC-C-070, TC-C-071
- DoD:
  - [ ] Mount con props o Pinia: covered, shortfall, no due, no liquid + CTA patrimonio
  - [ ] Wrapper 390×844 donde aplique; badge antes que liquidez en DOM
  - [ ] Copy i18n `day.coverage.*` / `day.payments.empty` según estado
  - [ ] `npm test -- DayCoverageCard` RED

### T-013 — RED: component `DayPaymentsCard` (TC-C-072, TC-C-073, TC-C-077)

- Type: test · Layer: app · Deps: T-002 · Size: S
- Covers: AC-2.1, AC-2.2, AC-2.3 · TC-C-072, TC-C-073, TC-C-077
- DoD:
  - [ ] Dos ítems `data-payment-item`; `rounded-xl` + `data-section-icon`
  - [ ] Click `data-link-debts` → ruta `/debts`
  - [ ] Nombre XSS escapado; sin `v-html` en SFC (grep)
  - [ ] `npm test -- DayPaymentsCard` RED

### T-014 — RED: component `DayAgendaCard` (TC-C-074)

- Type: test · Layer: app · Deps: T-002 · Size: S
- Covers: AC-3.1, AC-3.2 · TC-C-074
- DoD:
  - [ ] Exactamente 3× `data-agenda-row`; fila cero con `day.agenda.none`
  - [ ] `npm test -- DayAgendaCard` RED

### T-015 — RED: `DayOverview` + `DashboardView` orden (TC-C-075, TC-C-076)

- Type: test · Layer: app · Deps: T-002 · Size: S
- Covers: AC-4.1, AC-4.2 · TC-C-075, TC-C-076
- DoD:
  - [ ] `DayOverview`: locale `en` sin español crudo en HTML
  - [ ] `DashboardView`: `[data-day-overview]` precede `[data-dashboard-hero]` (stub DayOverview si hace falta)
  - [ ] `npm test -- DayOverview DashboardView` RED

### T-016 — RED: E2E `day-overview` (TC-E-024)

- Type: test · Layer: cross · Deps: T-002 · Size: S
- Covers: AC-1.1, AC-2.2, AC-4.1 · TC-E-024
- DoD:
  - [ ] Playwright: viewport 390×844; seed localStorage con card due today + liquid asset
  - [ ] Badge cobertura visible sin scroll hasta charts
  - [ ] Opcional: click ver deudas → `/debts`
  - [ ] `npm run e2e -- day-overview` RED

---

## Phase 3 — Implementation

### T-020 — Impl: `day-obligations.ts`

- Type: impl · Layer: domain · Deps: T-010 · Size: M · Risk: **H**
- Covers: AC-1.1, AC-1.2, AC-1.3, AC-2.1, AC-3.1, AC-3.2 · TC-U-010–014
- DoD:
  - [ ] Implementar contratos del plan (`isDueOnLocalDay`, `listDebtsDueOnDay`, `calcDayCoverage`, `buildAgendaThreeDays`)
  - [ ] Solo `type === 'card'` con `dueDate` no null
  - [ ] `npm test -- day-obligations` GREEN

### T-021 — Impl: `useDayOverview`

- Type: impl · Layer: app · Deps: T-010, T-011, T-020 · Size: M · Risk: **M**
- Covers: AC-1.x, AC-2.1, AC-3.x · TC-I-010
- DoD:
  - [ ] Usa `useLiquidMetrics` + `useCardsStore`; `today` opcional en options
  - [ ] No importar `lib/calculations` desde views
  - [ ] `npm test -- useDayOverview` GREEN

### T-022 — Impl: `DayCoverageCard` + copy beneficio

- Type: impl · Layer: app · Deps: T-012, T-021 · Size: M · Risk: **M**
- Covers: AC-1.1–AC-1.5 · TC-C-068–071
- DoD:
  - [ ] Badge semántico emerald/amber/rose; shortfall con gap formateado
  - [ ] Empty aliviado; CTA patrimonio → ruta assets existente
  - [ ] Liquidez secundaria + context line; tipografía héroe en badge
  - [ ] `npm test -- DayCoverageCard` GREEN

### T-023 — Impl: `DayPaymentsCard`

- Type: impl · Layer: app · Deps: T-013, T-021 · Size: S · Risk: **L**
- Covers: AC-2.1, AC-2.2, AC-2.3 · TC-C-072, TC-C-073, TC-C-077
- DoD:
  - [ ] Lista + empty state; `RouterLink` ver deudas
  - [ ] Card cálida (rounded-xl, padding, lucide icon)
  - [ ] `npm test -- DayPaymentsCard` GREEN

### T-024 — Impl: `DayAgendaCard`

- Type: impl · Layer: app · Deps: T-014, T-021 · Size: S · Risk: **L**
- Covers: AC-3.1, AC-3.2 · TC-C-074
- DoD:
  - [ ] Tres filas con conteo y monto; copy neutro día vacío
  - [ ] `npm test -- DayAgendaCard` GREEN

### T-025 — Impl: `DayOverview` + `DashboardView`

- Type: impl · Layer: app · Deps: T-015, T-022, T-023, T-024 · Size: M · Risk: **M**
- Covers: AC-4.1, AC-4.2 · TC-C-075, TC-C-076
- DoD:
  - [ ] `DayOverview` compone las 3 cards con `gap-6`
  - [ ] `DashboardView`: `<DayOverview />` antes de `<DashboardHero />`; `data-dashboard-hero` en hero si falta
  - [ ] Todos los strings vía `t('day.*')`
  - [ ] `npm test -- DayOverview DashboardView` GREEN

### T-026 — Impl: i18n polish + empty copy tone

- Type: impl · Layer: infra · Deps: T-001, T-025 · Size: S · Risk: **L**
- Covers: AC-4.2, AC-1.3, AC-3.2 · PC-4
- DoD:
  - [ ] Revisar tono aliviado es/en (no “Sin datos” seco)
  - [ ] Paridad completa claves `day.*` en ambos idiomas
  - [ ] `npm run typecheck` OK

### T-027 — Impl: E2E green `day-overview`

- Type: impl · Layer: cross · Deps: T-016, T-025 · Size: S · Risk: **M**
- Covers: AC-1.1, AC-2.2, AC-4.1 · TC-E-024
- DoD:
  - [ ] Seed helpers reutilizables o inline en spec
  - [ ] `npm run e2e -- day-overview` GREEN

---

## Phase 4 — Regression

### T-LAST — Regression gate + verify prep

- Type: test · Layer: cross · Deps: T-020, T-021, T-022, T-023, T-024, T-025, T-026, T-027 · Size: S
- Covers: ALL AC · TC-I-010
- DoD:
  - [ ] `npm test` full suite GREEN (0 regresiones dashboard)
  - [ ] `npm run lint` 0 errors
  - [ ] `npm run typecheck` clean
  - [ ] `npm run test:coverage` — `lib/calculations` ≥80%, global ≥60%
  - [ ] `npm run e2e` GREEN (incl. `day-overview`)
  - [ ] Listo para `/sdd-verify` y `/sdd-review`

---

## Sign-off

- [x] Author — Johann Medina — 2026-06-04

## Next

`/sdd-signoff tasks` → `/sdd-implement` o `/sdd-implement phase 2` (solo tests RED)
