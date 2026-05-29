# Technical Plan: Planificación financiera integrada

> Spec: [1-spec.md](./1-spec.md) · Mode: `solo`
> Plan version: **v1** · Created: `2026-05-29`

## Summary

Unificamos la narrativa financiera del resumen y Plan: **brecha ahorro objetivo vs factible**, proyección de **flujo real** a 12 meses (con ingresos no mensuales), etiquetas claras para **ahorro hipotético vs compuesto**, **herramientas de deuda** (fecha libre, pago extra, avalanche/snowball en UI) y **libertad financiera** (bloque compacto en inicio + detalle en Plan). Reutilizamos `calcFreeForAllocation`, `calcProjection`, `calcHypotheticalSavings`, `calcCompoundGrowth`, `calcDebtFreeDate`, `calcExtraPaymentImpact` y `sortByAvalanche`/`sortBySnowball` ya existentes; el trabajo principal es composables + componentes + i18n + una ruta nueva bajo Plan.

**Dependencia:** feature `20260515-fix-calculos-financieros` (neto, proyección, savings-projection) y layout de inicio de `20260529-ux-clarity-phase1` (recomendado merge antes de implementar).

## Architecture

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ views/                                                                    │
│  DashboardView [MODIFY]     AllocationView [MODIFY]                       │
│  DebtsView [MODIFY]         GoalsView [MODIFY]                            │
│  FinancialFreedomView [NEW]  SettingsPanel [MODIFY: payoff method]         │
│         │                                                                 │
│         ▼ composables (views never import lib/calculations directly)      │
│  useSavingsFeasibility [NEW]   useCashFlowProjection [NEW]                │
│  useDashboardInsights [MODIFY] useDebtPayoffPlan [NEW]                    │
│  useFinancialFreedom [NEW]     useGoalsBudget [MODIFY]                      │
│  useNetIncome [EXIST]          useSavingsProjection [EXIST]               │
│         │                                                                 │
│         ▼                                                                 │
│ components/                                                               │
│  dashboard/SavingsGapCard [NEW]      dashboard/FinancialFreedomCompact    │
│  debts/DebtPayoffSummary [NEW]       debts/DebtPayoffSimulator [NEW]      │
│  debts/DebtPriorityList [NEW]        allocation/AllocationPanel [MODIFY]  │
│  dashboard/SavingsProjectionChart [MODIFY: i18n labels]                   │
│         │                                                                 │
│         ▼ lib/calculations (pure)                                         │
│  savings-feasibility.ts [NEW]    financial-freedom.ts [NEW]               │
│  projection.ts [EXIST]           dti.ts [EXIST]                           │
│  amortization.ts [EXIST]         payoff-strategy.ts [EXIST]                 │
│  allocation.ts [EXIST]           savings-projection.ts [EXIST]              │
│         │                                                                 │
│  cross: nav-config.ts + router [MODIFY: route financial-freedom]          │
│         i18n es/en [MODIFY: dashboard.savingsGap, fi.*, insights]         │
└──────────────────────────────────────────────────────────────────────────┘
```

### Components

| Component                                         | Responsibility                                                                     | Layer                        | Covers                 |
| ------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------- | ---------------------- |
| `calcSavingsFeasibility`                          | `objective`, `feasible`, `gap`, `isViable` from net, allocation%, free cash        | `lib/calculations`           | AC-1.1, AC-1.2, AC-1.3 |
| `useSavingsFeasibility`                           | Bridge stores + `useNetIncome` → reactive feasibility                              | `composables`                | AC-1.1–AC-1.3          |
| `SavingsGapCard`                                  | UI tres cifras + alerta brecha                                                     | `components/dashboard`       | AC-1.1, AC-1.2, AC-1.3 |
| `AllocationView` + `AllocationPanel`              | `totalIncome` from `useNetIncome().netIncome` not gross                            | `views` + `components`       | AC-1.4                 |
| `useDashboardInsights`                            | Donut insight = objetivo; projection insight = flujo M12 vía `calcProjection` tail | `composables`                | AC-1.5, AC-2.3         |
| `useCashFlowProjection`                           | Builds `ProjectionInputs` from stores; calls `calcProjection(12)`                  | `composables`                | AC-2.1, AC-2.2         |
| `DashboardView`                                   | Replaces `freeForAllocation * month` stub with `useCashFlowProjection` months      | `views`                      | AC-2.1, AC-2.2         |
| `ProjectionChart` + i18n `dashboard.insight.flow` | Distinct copy from hypothetical/compound                                           | `components` + `i18n`        | AC-2.3                 |
| `SavingsProjectionChart`                          | Series labels from i18n (`hypothetical` / `compoundGrowth`)                        | `components/dashboard`       | AC-3.1, AC-3.2, AC-3.3 |
| `calcDebtFreeDate`                                | Max payoff months across debts (existing)                                          | `lib/calculations`           | AC-4.1                 |
| `calcExtraPaymentImpact`                          | Months/interest saved vs extra payment (existing)                                  | `lib/calculations`           | AC-4.2                 |
| `sortByAvalanche` / `sortBySnowball`              | Order debts for UI (existing)                                                      | `lib/calculations`           | AC-4.4                 |
| `useDebtPayoffPlan`                               | `debtFreeDate`, sorted debts, simulator result                                     | `composables`                | AC-4.1–AC-4.4          |
| `DebtPayoffSummary`                               | Global debt-free date display                                                      | `components/debts`           | AC-4.1                 |
| `DebtPayoffSimulator`                             | Extra payment input + impact                                                       | `components/debts`           | AC-4.2                 |
| `DebtPriorityList`                                | Ordered list reflecting strategy                                                   | `components/debts`           | AC-4.4                 |
| `SettingsPanel`                                   | Radio/select avalanche vs snowball → `settingsStore`                               | `components/settings`        | AC-4.3                 |
| `calcFinancialFreedom`                            | Living expense, liquid total, target 25×, months to target                         | `lib/calculations`           | AC-5.1–AC-5.4          |
| `useFinancialFreedom`                             | Bridge expenses, assets, feasibility → FI metrics                                  | `composables`                | AC-5.1–AC-5.4          |
| `FinancialFreedomCompact`                         | Compact block on dashboard + link                                                  | `components/dashboard`       | AC-5.5, AC-5.6         |
| `FinancialFreedomView`                            | Full detail screen under Plan                                                      | `views`                      | AC-5.1–AC-5.4          |
| `router` + `nav-config`                           | Route `/financial-freedom`, item under Plan group                                  | `infra`                      | AC-5.6                 |
| `useGoalsBudget` + `GoalList`                     | `effectiveCap = min(goalCap, feasible)`; show both references                      | `composables` + `components` | AC-6.1, AC-6.2         |

## Data Model

No schema version bump. Reuses existing stores:

| Store / field                | Use in this feature                                                    |
| ---------------------------- | ---------------------------------------------------------------------- |
| `incomeStore`                | Net via `useNetIncome`; streams for `calcProjection`                   |
| `expensesStore`              | Fixed sum → living expense; housing unchanged for health               |
| `variableExpensesStore`      | Optional add to living expense when items exist for current month      |
| `cardsStore`                 | Debt payoff, simulator, ordering                                       |
| `assetsStore`                | Liquid types `cash`, `savings`, `investment`; rates for compound chart |
| `allocationStore`            | Objective savings %                                                    |
| `settingsStore.payoffMethod` | Already persisted; expose in UI                                        |

## Contracts

No external APIs. Internal pure-function contracts:

```typescript
// lib/calculations/savings-feasibility.ts (illustrative)
interface SavingsFeasibilityResult {
  objective: number // net * savings% / 100
  feasible: number // max(0, freeForAllocation)
  gap: number // max(0, objective - feasible)
  isRuleViable: boolean // feasible >= objective
}

// lib/calculations/financial-freedom.ts (illustrative)
interface FinancialFreedomResult {
  monthlyLivingExpense: number
  liquidAssets: number
  targetPatrimony: number // 25 * monthlyLiving * 12 ... = 25 * annual living
  progressPercent: number
  monthsToTarget: number | null // null if feasible <= 0
  targetReached: boolean
}
```

## ADRs

### ADR-1: Composable único `useSavingsFeasibility` para brecha y metas

- **Context:** Objetivo, factible y brecha alimentan resumen, insights y metas (AC-1.x, AC-6.x).
- **Options:**
  1. **Composable `useSavingsFeasibility`** — single source; pros: DRY, tests once; cons: small new file.
  2. **Duplicate formulas in each view** — pros: none; cons: drift (current problem).
  3. **Extend `useNetIncome` only** — pros: one import; cons: mixes cash-flow with normative savings.
- **Decision:** Option 1.
- **Consequences:** `useGoalsBudget` consumes `feasible` from same composable.
- **Covers:** AC-1.1–AC-1.3, AC-6.1, AC-6.2

### ADR-2: Dashboard flujo vía `calcProjection` existente

- **Context:** Dashboard today uses `freeForAllocation * (i+1)`; spec requires net base + non-monthly spikes (AC-2.1, AC-2.2).
- **Options:**
  1. **Wire `calcProjection` through `useCashFlowProjection`** — pros: meets AC-2.2; code exists; cons: replaces simple stub.
  2. **Keep linear stub, patch prima manually** — pros: smaller diff; cons: duplicates `projection.ts` logic.
  3. **New projection module** — pros: none; cons: violates YAGNI.
- **Decision:** Option 1.
- **Consequences:** `ProjectionChart` months prop shape unchanged; insight text updated.
- **Covers:** AC-2.1, AC-2.2, AC-2.3

### ADR-3: Libertad financiera — ruta `/financial-freedom` bajo Plan

- **Context:** OQ-1 resolved: compact on dashboard + detail in Plan (AC-5.5, AC-5.6).
- **Options:**
  1. **New route + nav item in Plan group** — pros: clear IA, deep link; cons: third Plan item.
  2. **Section inside GoalsView** — pros: no new route; cons: conflates goals with FIRE.
  3. **Only dashboard block, no detail page** — pros: less work; cons: fails AC-5.1–AC-5.4 detail.
- **Decision:** Option 1 (`FinancialFreedomView` at `/financial-freedom`, nav label i18n `nav.financialFreedom`).
- **Consequences:** Update `nav-config`, `ROUTE_NAMES`, unit test nav-config parity.
- **Covers:** AC-5.1–AC-5.6

### ADR-4: Simulador de pago extra por deuda en `DebtsView`

- **Context:** `calcExtraPaymentImpact` exists but has no UI (AC-4.2).
- **Options:**
  1. **Inline panel per selected card in DebtsView** — pros: contextual; cons: more UI on busy page.
  2. **Modal from card row** — pros: focused; cons: extra interaction.
  3. **Separate `/debt-simulator` route** — pros: room; cons: scope creep.
- **Decision:** Option 1 — collapsible `DebtPayoffSimulator` under each `CardCard` or one global simulator with debt selector.
- **Consequences:** Card debts only for extra payment (loans use installment model); document in plan risks.
- **Covers:** AC-4.2

## Assumption Register

| ID    | Assumption                                                                                | Impact if wrong                             | Verify by                  | Status     |
| ----- | ----------------------------------------------------------------------------------------- | ------------------------------------------- | -------------------------- | ---------- |
| A-001 | `useNetIncome` y `calcProjection` de fix-calculos están en la rama base de implementación | H — sin neto, fallan AC-1.x y AC-2.x        | merge gate / smoke test    | unverified |
| A-002 | Gasto de vida = suma gastos fijos (+ variables del mes si hay datos)                      | M — FIRE target distinto                    | AC-5.1, review con usuario | unverified |
| A-003 | Patrimonio líquido = tipos `cash`, `savings`, `investment` en assetsStore                 | M — FIRE progreso incorrecto                | AC-5.2                     | unverified |
| A-004 | Horizonte FIRE usa ahorro factible mensual, no objetivo 20%                               | M — mensaje demasiado optimista             | AC-5.4                     | unverified |
| A-005 | Simulador pago extra aplica a deudas tipo `card` con amortización estándar                | L — préstamos con cuotas fijas usan otro UX | AC-4.2 edge copy           | unverified |

## Dependencies

| Dependency                                 | Reason                                                                 |
| ------------------------------------------ | ---------------------------------------------------------------------- |
| `20260515-fix-calculos-financieros`        | `useNetIncome`, `calcProjection`, savings projection, TEA amortization |
| `20260529-ux-clarity-phase1` (recommended) | Dashboard layout slots for new cards without re-layout                 |

## Rollout / Rollback

- **Feature flag:** none (local-first app).
- **Rollout:** merge branch → users see new blocks on dashboard and Plan route on next load.
- **Rollback:** revert branch; persisted `payoffMethod` remains valid; no schema migration.

## Risks

| Risk                                            | Impact | Mitigation                                       |
| ----------------------------------------------- | ------ | ------------------------------------------------ |
| Dashboard vertical growth (brecha + FI compact) | M      | Place brecha below hero; FI compact collapsible  |
| `calcProjection` performance with many streams  | L      | Cap streams; memoize composable                  |
| User confusion: three projection concepts       | M      | i18n labels + spec-mandated distinct insights    |
| Extra payment simulator on loans                | L      | Disable or show “solo tarjetas” for loan type    |
| Merge conflict with ux-clarity                  | M      | Implement after ux branch merged or rebase early |

## AC coverage matrix (sanity)

| AC         | Primary owner                           |
| ---------- | --------------------------------------- |
| AC-1.1–1.3 | SavingsGapCard + calcSavingsFeasibility |
| AC-1.4     | AllocationView                          |
| AC-1.5     | useDashboardInsights + i18n             |
| AC-2.1–2.2 | useCashFlowProjection                   |
| AC-2.3     | i18n insight.flow                       |
| AC-3.1–3.3 | SavingsProjectionChart + i18n           |
| AC-4.1–4.4 | DebtsView + useDebtPayoffPlan           |
| AC-4.3     | SettingsPanel                           |
| AC-5.1–5.4 | FinancialFreedomView                    |
| AC-5.5–5.6 | FinancialFreedomCompact + router        |
| AC-6.1–6.2 | GoalList + useSavingsFeasibility        |

## Sign-off

- [x] Author: Johann Medina — 2026-05-29
