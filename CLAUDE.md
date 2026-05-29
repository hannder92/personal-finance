# CLAUDE.md — Personal Finances App

> Project memory for AI agents. **Enforceable rules:** `.cursor/rules/*.mdc` (Cursor) · **Policy:** `constitution.md` · **This file:** store/lib catalogs, boot cycle, pipelines (reference only — do not duplicate rules here).

---

## Commands

```bash
npm start              # dev server → http://localhost:5173
npm run build          # vue-tsc --noEmit + vite build → dist/
npm run preview        # serve dist/ → http://localhost:4173
npm test               # Vitest (unit + component + integration)
npm run test:coverage  # lcov report; gates: lib/calculations & lib/tax ≥80%, global ≥60%
npm run e2e            # Playwright (builds + boots preview server)
npm run lint           # ESLint Vue + TS rules
npm run typecheck      # vue-tsc --noEmit
```

---

## Stack

Vue 3.5 · Pinia 2 · TypeScript 5 · Vite 6 · Tailwind 4 · Zod 3 · Chart.js 4 · vue-i18n 9 · Radix-Vue · Vitest 2 · Playwright

---

## Directory Map

```
src/
├── main.ts                  # boot: createPinia → hydrateStores → mount → persistStores
├── App.vue                  # layout shell: sticky header + RouterView + mobile bottom nav
├── router/index.ts          # 11 routes + onboarding guard
├── i18n/                    # vue-i18n; es.json & en.json
├── stores/                  # 9 Pinia setup-stores (see Store Catalog below)
├── views/                   # 12 page-level SFCs
├── components/
│   ├── common/              # AppToast, ConfirmDialog, CurrencyInput, EmptyState, StorageErrorToast…
│   ├── dashboard/           # BudgetDonut, KpiCard, HealthScore, ProjectionChart, SavingsProjectionChart
│   ├── income/              # DeductionRow, IncomeStreamRow, PresetButtons, RetentionEstimator
│   ├── expenses/            # ExpenseForm, FixedExpenseList
│   ├── debts/               # CardCard, DueDateAlerts, InstallmentList
│   ├── goals/               # GoalCard, GoalList
│   ├── variable/            # VariableCategoryCard, VariableSummary, QuickAddFAB
│   ├── networth/            # AssetList, NetWorthBanner
│   ├── allocation/          # AllocationPanel
│   ├── history/             # SnapshotList
│   ├── onboarding/          # OnboardingWizard, StepIndicator
│   ├── settings/            # SettingsPanel
│   └── ui/                  # Radix-Vue primitive wrappers
├── composables/
│   ├── useTheme.ts          # dark/light/system + matchMedia
│   ├── useLocale.ts         # lang switch + vue-i18n sync
│   ├── useCurrencyFormat.ts # Intl.NumberFormat by currency code
│   ├── useChartTheme.ts     # Chart.js colors by isDark
│   ├── useNetIncome.ts      # bridge: income/expenses/cards stores → calcNetSalary
│   ├── useHealthScore.ts    # bridge: all stores → calcHealthScore (real data)
│   ├── useDTI.ts            # bridge: cards → calcCardObligation + calcDTI
│   ├── useGoalsBudget.ts    # goalCap = allocation.savings% × netIncome
│   ├── useSavingsProjection.ts # bridge: assets + allocation → savings-projection.ts
│   ├── useStorageError.ts   # module-level singleton for save failure toast
│   ├── useForm.ts           # Zod-powered form validation
│   └── useImportExport.ts   # JSON backup import/export
└── lib/                     # pure, 0 Vue/Pinia (see Lib Catalog below)
    ├── calculations/        # 15 financial calculation modules
    ├── tax/colombia/        # payroll & withholding (Art. 383 ET)
    ├── storage/             # Zod schema v3, load/save, migration, backup
    ├── currency/format.ts   # formatCurrency(amount, code)
    ├── date/month.ts        # detectMonthRollover, formatYearMonth
    ├── health/thresholds.ts # CFPB-aligned cutoffs
    └── charts/              # (empty — reserved)
```

---

## Boot Cycle (main.ts)

```
1. createPinia()
2. loadAppState()   →  Zod validate AppStateSchemaV3 → migrate v1→v2→v3 if needed
3. hydrateStores()  →  populate all 9 stores from validated state  [synchronous]
                       isHydrating = true during this step (suppresses persist watcher)
4. app.use(router)  →  guard reads settings.state.onboarding.done
5. app.mount('#app')
6. persistStores()  →  deep watch all 9 store states → saveAppState() on any change
                       if save fails → useStorageError.setError() → StorageErrorToast
7. nextTick → isHydrating = false
```

Storage key: `finance_app_data`. Backup keys: `finance_app_data_v1_backup`, `finance_app_data_v2_backup`.

---

## Store Catalog

Access state via `store.state.field` — never `storeToRefs()` on the nested reactive object.
Every action validates at boundary before mutating; invalid input is silently discarded.

| Store                     | State shape (key fields)                                                                     | Key actions                                                                                                                              |
| ------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **settingsStore**         | `lang`, `currency`, `theme`, `payoffMethod`, `lastMonthSeen`, `onboarding{done,currentStep}` | `setLang`, `setCurrency`, `setTheme`, `setPayoffMethod`, `setOnboardingDone`, `bumpOnboardingStep`, `relaunchOnboarding`                 |
| **incomeStore**           | `grossSalary`, `deductions[]`, `otherStreams[]`, `nonSalaryBenefits[]`                       | `setGrossSalary`, `addDeduction/remove/update`, `addStream/remove/update`, `addBenefit/remove`, `applyColombiaPresets`, `addPrimaPreset` |
| **expensesStore**         | `items: FixedExpense[]`                                                                      | `add`, `remove`, `update`                                                                                                                |
| **cardsStore**            | `items: (CardDebt\|LoanDebt)[]` — discriminated by `type`                                    | `addCard`, `addLoan`, `update`, `remove`, `addInstallment`, `updateInstallment`, `removeInstallment`, `incrementPaid`                    |
| **goalsStore**            | `items: Goal[]`                                                                              | `add`, `remove`, `update`, `reorder`                                                                                                     |
| **assetsStore**           | `items: Asset[]`                                                                             | `add`, `remove`, `update`                                                                                                                |
| **variableExpensesStore** | `items: VariableCategory[]`                                                                  | `add`, `remove`, `recordSpending`, `resetAllSpent`                                                                                       |
| **snapshotsStore**        | `items: Snapshot[]` (FIFO 24, sorted desc by month)                                          | `append`, `setAll`                                                                                                                       |
| **allocationStore**       | `needs%`, `wants%`, `savings%` (computed)                                                    | `setAllocation(needs, wants)` — validates sum ≤ 100                                                                                      |

---

## Lib Catalog — `src/lib/calculations/`

All exports are pure functions. Input/output types live in the same file.

| Module                  | Key export(s)                                                                                                                                                           |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `net-income.ts`         | `calcNetSalary({grossSalary, deductions[], nonSalaryBenefits[]})→number`                                                                                                |
| `amortization.ts`       | `calcDebtTimeline(debt)→{months,totalInterest}` · uses TEA: `(1+TEA)^(1/12)−1`                                                                                          |
| `dti.ts`                | `calcDTI(obligations, income)→%` · `calcDebtFreeDate(debts[])→Date\|null` · `calcFreeForAllocation(income,fixed,debt)→number`                                           |
| `health-score.ts`       | `calcHealthScore({dti,emergencyMonths,housingRatio,savingsRate})→{score,label,components,missing[]}`                                                                    |
| `allocation.ts`         | `calcAllocationAmounts(pct,income)→{needs,wants,savings}` · `calcSavingsRate` · `calcGoalExcess`                                                                        |
| `savings-projection.ts` | `calcHypotheticalSavings({netIncome,savingsRatePercent,months})→HypotheticalPoint[]` · `calcCompoundGrowth(assets[{balance,annualRatePercent}],months)→CompoundPoint[]` |
| `projection.ts`         | `calcProjection({monthlyIncome,streams[],fixedExpenses,debtObligation}, months)→{months[],negativeMonths[]}`                                                            |
| `goals.ts`              | `calcGoalETA(goal)→{months,estimatedDate,overdue}` · `calcRequiredMonthly(goal)→number`                                                                                 |
| `installments.ts`       | `calcInstallmentMonthly(inst)→number` · `calcCardObligation(card)→number`                                                                                               |
| `housing-ratio.ts`      | `calcHousingRatio(expenses[],income)→%` — accepts `'housing'` AND `'vivienda'` categories                                                                               |
| `payoff-strategy.ts`    | `sortByAvalanche(debts[])` · `sortBySnowball(debts[])`                                                                                                                  |
| `frequency.ts`          | `calcMonthlyEquivalent(stream)→number` · `getProjectionMonthsForStream(stream,start,count)→number[]`                                                                    |
| `snapshot.ts`           | `buildSnapshot(inputs,now)→Snapshot` · `applySnapshotCap(arr[],max=24)`                                                                                                 |
| `variable-expenses.ts`  | `calcSpendingStatus(cat)→'green'\|'amber'\|'red'`                                                                                                                       |
| `net-worth.ts`          | `calcNetWorth(assets[],cards[])→number`                                                                                                                                 |

### `src/lib/tax/colombia/`

| Module         | Key export(s)                                                                      |
| -------------- | ---------------------------------------------------------------------------------- |
| `constants.ts` | `UVT_2025=49799`, `APORTE_SALUD=0.04`, `APORTE_PENSION=0.04`, `ART_383_BRACKETS[]` |
| `retencion.ts` | `calcRetencion(grossSalary)→{amount,label,belowThreshold}`                         |
| `prima.ts`     | `calcPrimaServicios(grossSalary)→{amount,frequency:'semiannual'}`                  |
| `presets.ts`   | `applyColombiaPresets(deductions[],salary)→deductions[]` (idempotente)             |

---

## Domain Model (quick reference)

```
Income        grossSalary + deductions[] + otherStreams[] + nonSalaryBenefits[]
              nonSalaryBenefits: added AFTER deductions, never enter deduction base (Art. 128 CST)

Debt          CardDebt { balance, limit, apr(TEA), minPayment, dueDate: string|null, installments[] }
              LoanDebt { balance, apr(TEA), minPayment, remainingInstallments }
              APR field = TEA (Tasa Efectiva Anual), Superfinanciera Colombia standard

Asset         { name, value, type: savings|investment|property|vehicle|other,
                annualRatePercent: number (default 0, range [0,100]) }

IncomeStream  { id, label, amount, frequency, isPrima?: boolean }
              id === '__prima__' ⟺ isPrima === true (reserved for prima de servicios upsert)

Snapshot      { month(YYYY-MM), netIncome, fixedExpenses, debtPayments, dti, netWorth, healthScore }
              FIFO 24 meses, deduplicado por month

Allocation    needs% + wants% + savings% = 100 (Zod refinement enforced)
```

---

## Dashboard Calculation Pipeline

```
grossSalary + deductions[] + nonSalaryBenefits[]
  → calcNetSalary() → netIncome                          [useNetIncome]

netIncome
  → × allocation%              →  distribución (needs/wants/savings amounts)
  → - fixedExpenses - debtObligations  →  disponible libre
  → calcDTI()                  →  DTI%                  [useDTI]
  → calcHousingRatio()         →  housingRatio%          [useHealthScore]
  → sum(goal.monthlyContrib) / netIncome  →  savingsRate%
  → liquidAssets / (fixedExpenses + debtObligations)     →  emergencyMonths
  → calcHealthScore({dti, emergencyMonths, housingRatio, savingsRate})  →  score 0-100
                                                         [useHealthScore]
  Health weights: DTI 35% · Emergency 30% · Housing 20% · Savings 15%
  Catastrophic DTI cap: if DTI > 100% → score capped at 40 regardless

  → calcProjection(netIncome, streams[], fixedExpenses, debtObligation, 12)  →  chart data
  → calcNetWorth(assets[], cards[])  →  net worth
  → calcHypotheticalSavings + calcCompoundGrowth  →  SavingsProjectionChart
```

---

## Adding a New Section (checklist)

1. `src/router/index.ts` — agregar ruta
2. `src/views/<Section>View.vue` — crear view
3. `src/i18n/es.json` + `src/i18n/en.json` — agregar translation keys
4. `src/components/<section>/` — crear componentes
5. `src/stores/<section>Store.ts` — setup-store con `state = reactive({})` + boundary guards
6. `src/main.ts` → `hydrateStores()` — agregar `<section>Store.hydrateFromState(state)`
7. `src/main.ts` → `persistStores()` — agregar `<section>.state` al watch array y al `buildPayload()` object
8. `src/lib/storage/schema.ts` — extender `AppStateSchemaV3` + añadir `migrations[N]` si cambia forma
9. `App.vue` — agregar a `ALL_NAV` y `MOBILE_NAV` (RouterLink, nunca `<a href>`)
10. Tests: unit para lib/ + store actions + componentes (con `createTestingPinia({stubActions:false})`)

---

## Storage Schema (Zod — `src/lib/storage/schema.ts`)

```
AppStateSchemaV3 {
  schemaVersion: 3
  settings: SettingsSchema
  income: { grossSalary, deductions[], otherStreams[], nonSalaryBenefits[] }
  expenses: FixedExpense[]   ← category acepta 'vivienda' además de 'housing'
  cards: (CardSchema | LoanSchema)[]   ← discriminated union, dueDate: string|null
  goals: Goal[]
  assets: Asset[]            ← incluye annualRatePercent: number [0,100]
  variableExpenses: VariableCategory[]
  allocation: { needs, wants, savings }  ← refinement: suma = 100
  snapshots: Snapshot[]
}
```

Migration path: v1→v2→v3 (auto, en `loadAppState`). Backups: `finance_app_data_v1_backup`, `finance_app_data_v2_backup`.

---

## Health Score Thresholds

| Componente       | Bueno    | Warning | Malo | Peso |
| ---------------- | -------- | ------- | ---- | ---- |
| DTI              | ≤20%     | 36%     | ≥50% | 35%  |
| Fondo emergencia | ≥6 meses | 3 meses | 0    | 30%  |
| Ratio vivienda   | ≤30%     | 40%     | ≥60% | 20%  |
| Tasa ahorro      | ≥20%     | 10%     | 0%   | 15%  |

Fondo emergencia denominador: `gastos fijos + obligaciones de deuda mínimas` (no solo gastos fijos).

---

## Colombian Payroll Quick Reference

- **ARL**: 100% costo del empleador — NUNCA agregar como deducción del empleado
- **Retención base**: `gross − salud(4%) − pensión(4%)` (Art. 383 ET)
- **Renta exenta cap**: `240 × UVT_2025 = $11.951.760/mes` (Art. 206 num. 10 ET)
- **No-salary benefits**: se suman AL FINAL, nunca entran en base de aportes (Art. 128 CST)
- **Prima de servicios**: `bruto / 2` semestral (Art. 306 CST, 6 meses completos)
- **UVT 2025**: `$49.799` (Resolución DIAN 000187/2024)
- **APR field = TEA**: `(1+TEA)^(1/12)−1` para obtener tasa mensual equivalente
