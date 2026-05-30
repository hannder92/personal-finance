# Tasks: Métricas verificadas — runway, ingresos y cobertura

> [Spec](./1-spec.md) · [Plan](./2-plan.md) · [Test plan](./3-test-plan.md) · Mode: `solo` · Generated: `2026-05-29`

## Legend

| Symbol               | Meaning                                         |
| -------------------- | ----------------------------------------------- |
| **Type**             | `setup` · `test` · `impl` · `refactor` · `docs` |
| **Layer**            | `domain` · `app` · `infra` · `cross`            |
| **Size**             | `S` (<2h) · `M` (<1d) · **`L` PROHIBITED**      |
| **Risk** (impl only) | `H` · `M` · `L`                                 |

## Summary

- **31 tasks** — 2 setup · 13 test · 15 impl · 1 regression (`T-LAST`)
- **21/21 AC** · **22 TC** referenciados
- **Merge gate:** `20260529-planificacion-financiera-integrada` (rama base)
- **Primer task ejecutable:** `T-001`

---

## Phase 1 — Setup

### T-001 — Scaffolding archivos nuevos + claves i18n

- Type: setup · Layer: cross · Deps: — · Size: S
- Covers: (infra)
- DoD:
  - [ ] Stubs dominio: `liquid-metrics.ts`, `financial-runway.ts`, `passive-coverage.ts`, `income-mix.ts`
  - [ ] Stubs composables: `useLiquidMetrics.ts`, `useFinancialRunway.ts`, `useIncomeMix.ts`, `usePassiveCoverage.ts`
  - [ ] SFC mínimos: `RunwayCard.vue`, `PassiveCoverageCompact.vue`, `FlowCoverageBlock.vue`, `IncomeClassSelect.vue`, `IconButton.vue`
  - [ ] Claves placeholder `es.json` / `en.json`: `runway.*`, `flowCoverage.*`, `income.class.*`, `income.mix.*`, `common.delete`, `savings.projection.rateLabel`, `hintNeedRate`, `hintNeedAssets`, `dashboard.health.breakdown.emergencyHint`
  - [ ] `npm run typecheck` pasa con stubs

### T-002 — Stubs schema v4 + archivos de test

- Type: setup · Layer: infra · Deps: T-001 · Size: S
- Covers: (infra)
- DoD:
  - [ ] `AppStateSchemaV4` stub export + `migrateV3toV4` placeholder en `migrate.ts`
  - [ ] Creados (vacíos o `.skip`): `liquid-metrics.test.ts`, `financial-runway.test.ts`, `passive-coverage.test.ts`, `income-mix.test.ts`, `useLiquidMetrics.test.ts`, `useSavingsProjection.test.ts` (ampliar), `RunwayCard.test.ts`, `PassiveCoverageCompact.test.ts`, `FlowCoverageBlock.test.ts`, `IconButton.test.ts`, `CardCard.test.ts`, `DebtsView.test.ts`, `IncomeView.test.ts`, `e2e/runway-dashboard.spec.ts`, `e2e/income-class.spec.ts`, `e2e/debt-delete-card.spec.ts`, `e2e/projection-rate.spec.ts`
  - [ ] Cabeceras de ampliación en `HealthScore.test.ts`, `FinancialFreedomView.test.ts`, `SavingsProjectionChart.test.ts`, `incomeStore.test.ts`, `settingsStore.test.ts`, `migrate.test.ts`
  - [ ] `npm test` termina sin error de import

---

## Phase 2 — Tests

### T-010 — RED: unit `liquid-metrics` + `financial-runway` (TC-U-001, TC-U-002)

- Type: test · Layer: domain · Deps: T-002 · Size: S
- Covers: AC-1.2, AC-1.3, AC-1.4, AC-2.2, AC-6.6 · TC-U-001, TC-U-002
- DoD:
  - [ ] 30M/5M → 6 meses; ilíquidos excluidos; unavailable si numerador o denominador 0
  - [ ] `calcLiquidAssetsTotal` incluye cash/savings/investment
  - [ ] Prefijo `TC-U-001` / `TC-U-002` en cada `it`
  - [ ] `npm test -- liquid-metrics financial-runway` RED

### T-011 — RED: unit `passive-coverage` + `income-mix` (TC-U-003, TC-U-005)

- Type: test · Layer: domain · Deps: T-002 · Size: S
- Covers: AC-3.1, AC-3.3, AC-4.1, AC-4.2, AC-4.3 · TC-U-003, TC-U-005
- DoD:
  - [ ] Cobertura 30%, 120% cubierto, brecha 7M; mix lineal/residual/pasivo con stream semestral
  - [ ] `npm test -- passive-coverage income-mix` RED

### T-012 — RED: unit `useLiquidMetrics` (TC-U-004)

- Type: test · Layer: app · Deps: T-002 · Size: S
- Covers: AC-1.2, AC-2.2 · TC-U-004
- DoD:
  - [ ] Pinia real; living = fijos + variables; liquid coherente con dominio
  - [ ] `npm test -- useLiquidMetrics` RED

### T-013 — RED: unit schema v4 stores + migrate (TC-U-006, TC-U-007, TC-U-008)

- Type: test · Layer: infra · Deps: T-002 · Size: M
- Covers: AC-3.2, AC-3.4, AC-6.2 · TC-U-006, TC-U-007, TC-U-008
- DoD:
  - [ ] `setProjectionAnnualRatePercent` boundary [0,100]; stream `incomeClass` persist
  - [ ] Fixture v3 → v4: `incomeClass: linear`, `projectionAnnualRatePercent: 0`
  - [ ] `npm test -- settingsStore incomeStore migrate` RED (casos nuevos)

### T-014 — RED: unit `useSavingsProjection` settings rate (TC-U-009)

- Type: test · Layer: app · Deps: T-002 · Size: M
- Covers: AC-6.3, AC-6.6 · TC-U-009
- DoD:
  - [ ] Compound crece con TEA 12 vs 0; base = líquido total; settings rate gana sobre asset rate (OQ-3)
  - [ ] `npm test -- useSavingsProjection` RED (ampliar archivo existente)

### T-015 — RED: unit `useFinancialFreedom` líquido compartido (TC-C-061)

- Type: test · Layer: app · Deps: T-012 · Size: S
- Covers: AC-2.1, AC-2.2 · TC-C-061
- DoD:
  - [ ] `liquidAssets` composable = mismo valor que `useLiquidMetrics`
  - [ ] `npm test -- useFinancialFreedom` RED (casos nuevos)

### T-016 — RED: component `RunwayCard` (TC-C-060)

- Type: test · Layer: app · Deps: T-002 · Size: S
- Covers: AC-1.1, AC-1.4 · TC-C-060
- DoD:
  - [ ] `data-testid="runway-months"` / `runway-unavailable`; etiqueta i18n
  - [ ] `npm test -- RunwayCard` RED

### T-017 — RED: component `HealthScore` labels (TC-C-062)

- Type: test · Layer: app · Deps: T-002 · Size: S
- Covers: AC-2.3 · TC-C-062
- DoD:
  - [ ] Emergency label ≠ runway.title; hint presente si aplica
  - [ ] `npm test -- HealthScore` RED (casos nuevos)

### T-018 — RED: component `IncomeView` mix (TC-C-063)

- Type: test · Layer: app · Deps: T-011 · Size: M
- Covers: AC-3.1, AC-3.2, AC-3.3 · TC-C-063
- DoD:
  - [ ] Salario lineal visible; `income-mix-*` totales; select clase en stream
  - [ ] `npm test -- IncomeView` RED

### T-019 — RED: component cobertura flujo (TC-C-064)

- Type: test · Layer: app · Deps: T-011 · Size: M
- Covers: AC-4.1, AC-4.2, AC-4.3, AC-4.4 · TC-C-064
- DoD:
  - [ ] PassiveCoverageCompact + FlowCoverageBlock: 30%, cubierto, brecha; claves `flowCoverage.*`
  - [ ] `npm test -- PassiveCoverage FlowCoverage` RED

### T-020 — RED: component deudas delete in-card (TC-C-065, TC-C-066)

- Type: test · Layer: app · Deps: T-002 · Size: M
- Covers: AC-5.1, AC-5.2, AC-5.3, AC-5.4 · TC-C-065, TC-C-066
- DoD:
  - [ ] IconButton aria-label; delete dentro card; DebtsView confirm; sin botón externo
  - [ ] `npm test -- IconButton CardCard DebtsView` RED

### T-021 — RED: component `SavingsProjectionChart` TEA (TC-C-067)

- Type: test · Layer: app · Deps: T-014 · Size: M
- Covers: AC-6.1, AC-6.3, AC-6.4, AC-6.5 · TC-C-067
- DoD:
  - [ ] `projection-rate-input`; hints; `data-series-count`; compound final > base
  - [ ] `npm test -- SavingsProjectionChart` RED (ampliar)

### T-022 — RED: E2E (TC-E-020 … TC-E-023)

- Type: test · Layer: cross · Deps: T-002 · Size: M
- Covers: AC-1.1, AC-3.2, AC-5.3, AC-6.2 · TC-E-020, TC-E-021, TC-E-022, TC-E-023
- DoD:
  - [ ] 4 specs con seed; skip documentado si Chromium no disponible
  - [ ] `npm run e2e` RED hasta impl

---

## Phase 3 — Implementation

> Orden de riesgo: **H → M → L**. Cada impl depende de sus tests RED.

### T-030 — Impl: `liquid-metrics` + `financial-runway`

- Type: impl · Layer: domain · Deps: T-010 · Size: S · Risk: H
- Covers: AC-1.2, AC-1.3, AC-1.4, AC-2.2, AC-6.6 · TC-U-001, TC-U-002
- DoD:
  - [ ] Funciones puras según contratos en `2-plan.md`
  - [ ] T-010 GREEN

### T-031 — Impl: schema v4 + `migrateV3toV4`

- Type: impl · Layer: infra · Deps: T-013 · Size: M · Risk: H
- Covers: AC-3.4, AC-6.2 · TC-U-008
- DoD:
  - [ ] `AppStateSchemaV4`, loader/saver apuntan v4; chain migrate
  - [ ] T-013 (migrate) GREEN

### T-032 — Impl: `settingsStore` + `incomeStore` incomeClass

- Type: impl · Layer: app · Deps: T-013, T-031 · Size: S · Risk: H
- Covers: AC-3.2, AC-6.2 · TC-U-006, TC-U-007
- DoD:
  - [ ] `projectionAnnualRatePercent`, `setProjectionAnnualRatePercent`, stream class en add/update
  - [ ] T-013 (stores) GREEN

### T-033 — Impl: `passive-coverage` + `income-mix`

- Type: impl · Layer: domain · Deps: T-011 · Size: S · Risk: H
- Covers: AC-3.1, AC-3.3, AC-4.1, AC-4.2, AC-4.3 · TC-U-003, TC-U-005
- DoD:
  - [ ] Usa `calcMonthlyEquivalent` de `frequency.ts`
  - [ ] T-011 GREEN

### T-034 — Impl: `useLiquidMetrics`

- Type: impl · Layer: app · Deps: T-012, T-030 · Size: S · Risk: H
- Covers: AC-1.2, AC-2.2 · TC-U-004
- DoD:
  - [ ] Bridge stores → dominio líquido/gasto
  - [ ] T-012 GREEN

### T-035 — Impl: `useFinancialRunway` + refactor `useFinancialFreedom`

- Type: impl · Layer: app · Deps: T-015, T-034, T-030 · Size: M · Risk: H
- Covers: AC-2.1, AC-2.2 · TC-C-061, TC-U-004
- DoD:
  - [ ] `useFinancialFreedom` consume `useLiquidMetrics`; sin Set duplicado
  - [ ] T-015 GREEN

### T-036 — Impl: `useIncomeMix` + `usePassiveCoverage`

- Type: impl · Layer: app · Deps: T-011, T-033, T-032, T-034 · Size: M · Risk: M
- Covers: AC-3.1, AC-3.3, AC-4.1, AC-4.2, AC-4.3 · TC-U-003, TC-U-005
- DoD:
  - [ ] Composables exportan mix y cobertura reactivos
  - [ ] Listos para vistas

### T-037 — Impl: `useSavingsProjection` settings rate

- Type: impl · Layer: app · Deps: T-014, T-030, T-032, T-034 · Size: M · Risk: H
- Covers: AC-6.3, AC-6.6 · TC-U-009
- DoD:
  - [ ] Compound = líquido × TEA settings; OQ-3 aplicado
  - [ ] T-014 GREEN

### T-038 — Impl: `RunwayCard` + `DashboardView`

- Type: impl · Layer: app · Deps: T-016, T-035 · Size: S · Risk: M
- Covers: AC-1.1, AC-1.4 · TC-C-060
- DoD:
  - [ ] Card en dashboard bajo KPIs o junto FI compact
  - [ ] T-016 GREEN

### T-039 — Impl: cobertura flujo UI + `FinancialFreedomView`

- Type: impl · Layer: app · Deps: T-019, T-036 · Size: M · Risk: M
- Covers: AC-4.1, AC-4.2, AC-4.3, AC-4.4 · TC-C-064
- DoD:
  - [ ] PassiveCoverageCompact dashboard + FlowCoverageBlock detalle
  - [ ] T-019 GREEN

### T-040 — Impl: `IncomeClassSelect` + `IncomeView`

- Type: impl · Layer: app · Deps: T-018, T-036, T-032 · Size: M · Risk: M
- Covers: AC-3.1, AC-3.2, AC-3.3 · TC-C-063
- DoD:
  - [ ] Form stream con clase; totales por mix visibles
  - [ ] T-018 GREEN

### T-041 — Impl: `IconButton` + `CardCard` + `DebtsView`

- Type: impl · Layer: app · Deps: T-020 · Size: M · Risk: M
- Covers: AC-5.1, AC-5.2, AC-5.3, AC-5.4 · TC-C-065, TC-C-066
- DoD:
  - [ ] Delete in-card; ConfirmDialog; cards 100% width
  - [ ] T-020 GREEN

### T-042 — Impl: `SavingsProjectionChart` TEA input

- Type: impl · Layer: app · Deps: T-021, T-037 · Size: M · Risk: H
- Covers: AC-6.1, AC-6.4, AC-6.5 · TC-C-067
- DoD:
  - [ ] Input enlazado a settings; hints AC-6.5; título i18n
  - [ ] T-021 GREEN

### T-043 — Impl: `HealthScore` emergency labels

- Type: impl · Layer: app · Deps: T-017 · Size: S · Risk: L
- Covers: AC-2.3 · TC-C-062
- DoD:
  - [ ] i18n distinto runway vs emergency + hint
  - [ ] T-017 GREEN

### T-044 — Impl: barrido i18n + `assetsStore` cash type

- Type: impl · Layer: cross · Deps: T-038, T-039, T-040, T-041, T-042, T-043 · Size: S · Risk: L
- Covers: AC-2.3, AC-4.4, AC-5.4, AC-6.1 (copy)
- DoD:
  - [ ] Paridad es/en todas las claves nuevas
  - [ ] `assetsStore` ALLOWED_TYPES incluye `cash`

---

## Phase 4 — Regression

### T-LAST — Regression gate (TC-I-003)

- Type: test · Layer: cross · Deps: T-030, T-031, T-032, T-033, T-034, T-035, T-036, T-037, T-038, T-039, T-040, T-041, T-042, T-043, T-044, T-022 · Size: S
- Covers: ALL ACs · TC-I-003
- DoD:
  - [ ] `npm run typecheck` · `npm run lint` · `npm test` verde
  - [ ] `npm run build` verde
  - [ ] `npm run e2e` verde o skip documentado (Chromium)
  - [ ] Smoke: `/`, `/income`, `/debts`, `/financial-freedom` HTTP 200
  - [ ] Sin regresión `useNetIncome` / `calcFinancialFreedom` existentes

---

## Dependency graph (high level)

```text
T-001 → T-002
         ├── T-010 … T-022 (tests, paralelo tras T-002)
         │
Wave H:  T-030 → T-034 → T-035 → T-038
         T-031 → T-032 → T-036, T-037, T-040
         T-033 → T-036, T-039
         T-037 → T-042
         T-041, T-043, T-044
         │
T-LAST ← todos los impl + T-022
```

## Effort estimate

| Fase       | Tasks  | ~horas                         |
| ---------- | ------ | ------------------------------ |
| Setup      | 2      | 3                              |
| Tests      | 13     | 18                             |
| Impl       | 15     | 26                             |
| Regression | 1      | 2                              |
| **Total**  | **31** | **~49h** (~1.5 semanas al 50%) |

## Sign-off

- [x] Johann Medina — 2026-05-29
