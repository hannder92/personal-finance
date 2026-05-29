# Tasks: Planificación financiera integrada

> [Spec](./1-spec.md) · [Plan](./2-plan.md) · [Test plan](./3-test-plan.md) · Mode: `solo` · Generated: `2026-05-29`

## Legend

| Symbol               | Meaning                                         |
| -------------------- | ----------------------------------------------- |
| **Type**             | `setup` · `test` · `impl` · `refactor` · `docs` |
| **Layer**            | `domain` · `app` · `infra` · `cross`            |
| **Size**             | `S` (<2h) · `M` (<1d) · **`L` PROHIBITED**      |
| **Risk** (impl only) | `H` · `M` · `L`                                 |

## Summary

- **36 tasks** — 2 setup · 16 test · 17 impl · 1 regression (`T-LAST`)
- **23/23 AC** · **26 TC** referenciados
- **Merge gate:** `20260515-fix-calculos-financieros` (+ recomendado `20260529-ux-clarity-phase1`)
- **Primer task ejecutable:** `T-001`

---

## Phase 1 — Setup

### T-001 — Scaffolding archivos nuevos + claves i18n

- Type: setup · Layer: cross · Deps: — · Size: S
- Covers: (infra)
- DoD:
  - [x] `src/lib/calculations/savings-feasibility.ts` y `financial-freedom.ts` (exports stub)
  - [x] `src/composables/useSavingsFeasibility.ts`, `useCashFlowProjection.ts`, `useDebtPayoffPlan.ts`, `useFinancialFreedom.ts` (stubs)
  - [x] SFC mínimos: `SavingsGapCard.vue`, `FinancialFreedomCompact.vue`, `DebtPayoffSummary.vue`, `DebtPayoffSimulator.vue`, `DebtPriorityList.vue`, `FinancialFreedomView.vue`
  - [x] Claves placeholder en `es.json` / `en.json`: `dashboard.savingsGap.*`, `dashboard.insight.flow`, `fi.*`, `debts.payoff.*`, `nav.financialFreedom`
  - [x] `npm run typecheck` pasa con stubs

### T-002 — Stubs de archivos de test

- Type: setup · Layer: infra · Deps: T-001 · Size: S
- Covers: (infra)
- DoD:
  - [x] Creados (vacíos o `.skip`): `savings-feasibility.test.ts`, `financial-freedom.test.ts`, `useCashFlowProjection.test.ts`, `useSavingsFeasibility.test.ts`, `useDebtPayoffPlan.test.ts`, `SavingsGapCard.test.ts`, `DashboardViewPlanning.test.ts`, `DebtPayoffSummary.test.ts`, `DebtPayoffSimulator.test.ts`, `DebtPriorityList.test.ts`, `FinancialFreedomView.test.ts`, `FinancialFreedomCompact.test.ts`, `e2e/savings-gap.spec.ts`, `e2e/cashflow-projection-prima.spec.ts`, `e2e/debt-payoff-plan.spec.ts`, `e2e/financial-freedom-nav.spec.ts`
  - [x] Ampliaciones planificadas documentadas en cabecera de `AllocationPanel.test.ts`, `useDashboardInsights.test.ts`, `SavingsProjectionChart.test.ts`, `SettingsPanel.test.ts`, `GoalList.test.ts`, `nav-config.test.ts`
  - [x] `npm test` termina sin error de import

---

## Phase 2 — Tests

### T-010 — RED: unit `calcSavingsFeasibility` (TC-U-001)

- Type: test · Layer: domain · Deps: T-002 · Size: S
- Covers: AC-1.1, AC-1.2, AC-1.3 · TC-U-001
- DoD:
  - [ ] Caso 10M neto, 20%, gastos 8M, deuda 1.2M → objective 2M, feasible 800k, gap 1.2M, `isRuleViable: false`
  - [ ] Caso free ≤ 0 → feasible 0, sin gap positivo engañoso
  - [ ] Prefijo `TC-U-001 (AC-X.Y):` en cada `it`
  - [ ] `npm test -- savings-feasibility` RED

### T-011 — RED: unit `calcFinancialFreedom` (TC-U-002)

- Type: test · Layer: domain · Deps: T-002 · Size: S
- Covers: AC-5.1, AC-5.2, AC-5.3, AC-5.4 · TC-U-002
- DoD:
  - [ ] Living 4M, líquido 50M, feasible 500k → target = 4M×12×25, months finitos
  - [ ] `liquidAssets >= target` → `targetReached`, sin meses engañosos
  - [ ] Excluye tipos `property` / `vehicle` del líquido
  - [ ] `npm test -- financial-freedom` RED

### T-012 — RED: unit `useCashFlowProjection` (TC-U-003)

- Type: test · Layer: app · Deps: T-002 · Size: M
- Covers: AC-2.1, AC-2.2 · TC-U-003
- DoD:
  - [ ] Pinia real; mes 1 = net − fixed − debt sin streams
  - [ ] Stream semestral 6M → balance mes 6 > mes 5 y mes 12 > mes 11
  - [ ] `npm test -- useCashFlowProjection` RED

### T-013 — RED: unit `useSavingsFeasibility` (TC-U-004)

- Type: test · Layer: app · Deps: T-002 · Size: S
- Covers: AC-6.1, AC-6.2 · TC-U-004
- DoD:
  - [ ] Expone `objective`, `feasible`, `gap`, `effectiveGoalCap = min(objective, feasible)`
  - [ ] `npm test -- useSavingsFeasibility` RED

### T-014 — RED: unit insights separados (TC-U-005)

- Type: test · Layer: app · Deps: T-002 · Size: M
- Covers: AC-1.5, AC-2.3 · TC-U-005
- DoD:
  - [ ] Donut insight no contiene frase de flujo acumulado
  - [ ] Projection insight usa cola de `calcProjection`, no `freeForAllocation × 12`
  - [ ] Claves i18n distintas verificadas en test
  - [ ] `npm test -- useDashboardInsights` RED (casos nuevos)

### T-015 — RED: unit ruta FIRE en nav (TC-U-006)

- Type: test · Layer: infra · Deps: T-002 · Size: S
- Covers: AC-5.6 · TC-U-006
- DoD:
  - [ ] `nav-config` incluye item Plan → `/financial-freedom`
  - [ ] `ROUTE_NAMES` / router registra ruta
  - [ ] `npm test -- nav-config` RED

### T-016 — RED: unit deudas orden + pago extra (TC-U-007, TC-U-008)

- Type: test · Layer: domain · Deps: T-002 · Size: S
- Covers: AC-4.2, AC-4.4 · TC-U-007, TC-U-008
- DoD:
  - [ ] `payoff-strategy.test.ts`: avalanche por APR, snowball por balance
  - [ ] `useDebtPayoffPlan.test.ts`: `debtFreeDate` con dos deudas; simulator devuelve `monthsSaved > 0`
  - [ ] Tests RED o ampliados sobre código existente donde falte cobertura AC-4.4

### T-017 — RED: component `SavingsGapCard` (TC-C-040)

- Type: test · Layer: app · Deps: T-002 · Size: S
- Covers: AC-1.1, AC-1.2, AC-1.3 · TC-C-040
- DoD:
  - [ ] `data-testid` objective, feasible, gap; `role="alert"` si no viable
  - [ ] `npm test -- SavingsGapCard` RED

### T-018 — RED: component `AllocationPanel` neto (TC-C-041)

- Type: test · Layer: app · Deps: T-002 · Size: S
- Covers: AC-1.4 · TC-C-041
- DoD:
  - [ ] Bruto 12.1M, deducciones 8%, needs 50% → monto ~5.566M (no 6.05M)
  - [ ] `npm test -- AllocationPanel` RED

### T-019 — RED: component donut insight (TC-C-042)

- Type: test · Layer: app · Deps: T-014 · Size: S
- Covers: AC-1.5 · TC-C-042
- DoD:
  - [ ] `BudgetDonut` muestra insight objetivo sin “disponible este mes”
  - [ ] `npm test -- BudgetDonut` RED

### T-020 — RED: component dashboard flujo (TC-C-043, TC-C-044)

- Type: test · Layer: app · Deps: T-012 · Size: M
- Covers: AC-2.1, AC-2.2, AC-2.3 · TC-C-043, TC-C-044
- DoD:
  - [ ] `DashboardViewPlanning.test.ts`: `data-base` mes 1 correcto; prima en mes 6
  - [ ] `ProjectionChart.test.ts`: insight de flujo distinto de hipotético
  - [ ] `npm test -- DashboardViewPlanning ProjectionChart` RED

### T-021 — RED: component etiquetas ahorro (TC-C-045)

- Type: test · Layer: app · Deps: T-002 · Size: S
- Covers: AC-3.1, AC-3.2, AC-3.3 · TC-C-045
- DoD:
  - [ ] Leyendas i18n para hipotética y compuesto; `savings-no-rate-empty` sin tasa
  - [ ] `npm test -- SavingsProjectionChart` RED

### T-022 — RED: component deudas (TC-C-046 … TC-C-049)

- Type: test · Layer: app · Deps: T-016 · Size: M
- Covers: AC-4.1, AC-4.2, AC-4.3, AC-4.4 · TC-C-046, TC-C-047, TC-C-048, TC-C-049
- DoD:
  - [ ] Summary fecha libre; simulator extra 200k → meses/interés; Settings payoff; lista ordenada
  - [ ] `npm test -- DebtPayoff SettingsPanel` RED

### T-023 — RED: component FIRE (TC-C-050, TC-C-051)

- Type: test · Layer: app · Deps: T-015 · Size: M
- Covers: AC-5.1, AC-5.2, AC-5.3, AC-5.4, AC-5.5, AC-5.6 · TC-C-050, TC-C-051
- DoD:
  - [ ] Vista detalle: gasto vida, líquido, meta 25×, horizonte
  - [ ] Compact: progreso + `RouterLink` `/financial-freedom`
  - [ ] `npm test -- FinancialFreedom` RED

### T-024 — RED: component metas (TC-C-052)

- Type: test · Layer: app · Deps: T-013 · Size: S
- Covers: AC-6.1, AC-6.2 · TC-C-052
- DoD:
  - [ ] Alerta si aportes > min(objetivo, factible); cupo regla y tope factible visibles
  - [ ] `npm test -- GoalList` RED

### T-025 — RED: E2E (TC-E-010 … TC-E-013)

- Type: test · Layer: cross · Deps: T-002 · Size: M
- Covers: AC-1.1, AC-1.2, AC-2.2, AC-4.1, AC-4.2, AC-5.5, AC-5.6 · TC-E-010, TC-E-011, TC-E-012, TC-E-013
- DoD:
  - [ ] 4 specs con seed `e2e/fixtures.ts`; viewport móvil donde aplique
  - [ ] `npm run e2e` RED hasta impl (skip documentado si Chromium no instalado en CI)

---

## Phase 3 — Implementation

> Orden de riesgo: **H → M → L**. Cada impl depende de sus tests RED.

### T-030 — Impl: `calcSavingsFeasibility`

- Type: impl · Layer: domain · Deps: T-010 · Size: S · Risk: H
- Covers: AC-1.1, AC-1.2, AC-1.3 · TC-U-001
- DoD:
  - [ ] Función pura usa `calcFreeForAllocation` + % ahorro sobre neto
  - [ ] T-010 GREEN

### T-031 — Impl: `useSavingsFeasibility`

- Type: impl · Layer: app · Deps: T-013, T-030 · Size: S · Risk: H
- Covers: AC-1.1, AC-1.2, AC-1.3, AC-6.1, AC-6.2 · TC-U-004
- DoD:
  - [ ] Conecta stores + `useNetIncome`; exporta `effectiveGoalCap`
  - [ ] T-013 GREEN

### T-032 — Impl: `SavingsGapCard` + dashboard

- Type: impl · Layer: app · Deps: T-017, T-031 · Size: M · Risk: H
- Covers: AC-1.1, AC-1.2, AC-1.3 · TC-C-040
- DoD:
  - [ ] Card bajo héroe en `DashboardView`; i18n `dashboard.savingsGap.*`
  - [ ] T-017 GREEN

### T-033 — Impl: `AllocationView` ingreso neto

- Type: impl · Layer: app · Deps: T-018 · Size: S · Risk: M
- Covers: AC-1.4 · TC-C-041
- DoD:
  - [ ] `AllocationView` pasa `useNetIncome().netIncome` a `AllocationPanel`
  - [ ] T-018 GREEN

### T-034 — Impl: `calcFinancialFreedom`

- Type: impl · Layer: domain · Deps: T-011 · Size: S · Risk: H
- Covers: AC-5.1, AC-5.2, AC-5.3, AC-5.4 · TC-U-002
- DoD:
  - [ ] Living = fijos (+ variables mes si A-002); líquido cash/savings/investment; horizonte con feasible
  - [ ] T-011 GREEN

### T-035 — Impl: `useFinancialFreedom`

- Type: impl · Layer: app · Deps: T-034, T-031 · Size: S · Risk: H
- Covers: AC-5.1, AC-5.2, AC-5.3, AC-5.4 · TC-U-002
- DoD:
  - [ ] Bridge stores → `calcFinancialFreedom`
  - [ ] Listo para vistas FIRE

### T-036 — Impl: `useCashFlowProjection`

- Type: impl · Layer: app · Deps: T-012 · Size: M · Risk: H
- Covers: AC-2.1, AC-2.2 · TC-U-003
- DoD:
  - [ ] Arma `ProjectionInputs` desde stores; `calcProjection(12)`
  - [ ] T-012 GREEN

### T-037 — Impl: `useDashboardInsights` + i18n insights

- Type: impl · Layer: app · Deps: T-014, T-036, T-031 · Size: M · Risk: H
- Covers: AC-1.5, AC-2.3 · TC-U-005, TC-C-042
- DoD:
  - [ ] Donut = objetivo; proyección = flujo M12 desde `calcProjection`
  - [ ] T-014, T-019 GREEN

### T-038 — Impl: `DashboardView` proyección real

- Type: impl · Layer: app · Deps: T-020, T-036, T-037 · Size: M · Risk: H
- Covers: AC-2.1, AC-2.2, AC-2.3 · TC-C-043, TC-C-044
- DoD:
  - [ ] Reemplaza stub `freeForAllocation × month` por meses de `useCashFlowProjection`
  - [ ] T-020 GREEN

### T-039 — Impl: etiquetas `SavingsProjectionChart`

- Type: impl · Layer: app · Deps: T-021 · Size: S · Risk: M
- Covers: AC-3.1, AC-3.2, AC-3.3 · TC-C-045
- DoD:
  - [ ] Labels desde i18n; mensaje sin tasa intacto
  - [ ] T-021 GREEN

### T-040 — Impl: `useDebtPayoffPlan`

- Type: impl · Layer: app · Deps: T-016 · Size: M · Risk: M
- Covers: AC-4.1, AC-4.2, AC-4.4 · TC-U-007, TC-U-008
- DoD:
  - [ ] `debtFreeDate`, orden según `settings.payoffMethod`, wrapper simulator
  - [ ] T-016 (plan composable) GREEN

### T-041 — Impl: componentes deudas + `DebtsView`

- Type: impl · Layer: app · Deps: T-022, T-040 · Size: M · Risk: M
- Covers: AC-4.1, AC-4.2, AC-4.4 · TC-C-046, TC-C-047, TC-C-049
- DoD:
  - [ ] Summary, PriorityList, Simulator (tarjetas; copy si préstamo)
  - [ ] T-022 (debt components) GREEN

### T-042 — Impl: `SettingsPanel` estrategia payoff

- Type: impl · Layer: app · Deps: T-022 · Size: S · Risk: L
- Covers: AC-4.3 · TC-C-048
- DoD:
  - [ ] Radio avalanche/snowball → `settingsStore.payoffMethod` persistido
  - [ ] T-022 (settings) GREEN

### T-043 — Impl: ruta + `FinancialFreedomView`

- Type: impl · Layer: infra · Deps: T-015, T-023, T-035 · Size: M · Risk: M
- Covers: AC-5.1, AC-5.2, AC-5.3, AC-5.4, AC-5.6 · TC-C-050, TC-U-006
- DoD:
  - [ ] Router `/financial-freedom`, `nav-config`, vista detalle completa
  - [ ] T-015, T-023 (view) GREEN

### T-044 — Impl: `FinancialFreedomCompact` en dashboard

- Type: impl · Layer: app · Deps: T-043 · Size: S · Risk: M
- Covers: AC-5.5, AC-5.6 · TC-C-051
- DoD:
  - [ ] Bloque compacto + enlace “ver detalle”
  - [ ] T-023 (compact) GREEN

### T-045 — Impl: metas `useGoalsBudget` + `GoalList`

- Type: impl · Layer: app · Deps: T-024, T-031 · Size: M · Risk: M
- Covers: AC-6.1, AC-6.2 · TC-C-052
- DoD:
  - [ ] Cap y alertas usan `useSavingsFeasibility`
  - [ ] T-024 GREEN

### T-046 — Impl: barrido i18n es/en

- Type: impl · Layer: cross · Deps: T-032, T-037, T-038, T-039, T-041, T-043, T-044, T-045 · Size: S · Risk: L
- Covers: AC-1.5, AC-2.3, AC-3.1, AC-3.2 (copy)
- DoD:
  - [ ] Todas las claves nuevas con traducción en `en.json`
  - [ ] Test paridad claves `planning-keys-parity` opcional o extensión `dashboard-keys-parity`

---

## Phase 4 — Regression

### T-LAST — Regression gate (TC-I-002)

- Type: test · Layer: cross · Deps: T-030, T-031, T-032, T-033, T-034, T-035, T-036, T-037, T-038, T-039, T-040, T-041, T-042, T-043, T-044, T-045, T-046, T-025 · Size: S
- Covers: ALL ACs · TC-I-002
- DoD:
  - [x] `npm run typecheck` · `npm run lint` · `npm test` verde
  - [x] `npm run build` verde
  - [x] `npm run e2e` — **skip documentado:** Chromium no instalable en ubuntu26.04-x64 (`npx playwright install` → "Playwright does not support chromium on ubuntu26.04-x64"); 26/26 specs fallan por binario ausente, no por regresión de app
  - [x] Smoke manual: `/`, `/allocation`, `/debts`, `/goals`, `/financial-freedom`, `/settings` → HTTP 200 en preview `:4173`
  - [x] Sin regresión en `useNetIncome` / `calcProjection` (A-001): `net-income.test.ts` 11/11, `projection.test.ts` 6/6, `useCashFlowProjection.test.ts` 2/2

---

## Dependency graph (high level)

```text
T-001 → T-002
         ├── T-010 … T-025 (tests, paralelo tras T-002)
         │
Wave H:  T-030 → T-031 → T-032
         T-034 → T-035 → T-043 → T-044
         T-036 → T-037 → T-038
         T-033, T-039, T-040 → T-041 → T-042
         T-045, T-046
         │
T-LAST ← todos los impl + T-025
```

## Effort estimate

| Fase       | Tasks  | ~horas                         |
| ---------- | ------ | ------------------------------ |
| Setup      | 2      | 3                              |
| Tests      | 16     | 20                             |
| Impl       | 17     | 28                             |
| Regression | 1      | 2                              |
| **Total**  | **36** | **~53h** (~1.5 semanas al 50%) |

## Sign-off

- [x] Johann Medina — 2026-05-29
