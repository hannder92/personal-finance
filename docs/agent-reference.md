# Agent Reference — Personal Finances App

> Project reference for AI agents. **Project skills:** `.agents/skills/` · **Policy:** `constitution.md` and `AGENTS.md` · **This file:** store/lib catalogs, boot cycle, and pipelines (reference only).

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
├── router/index.ts          # 11 routes (no onboarding guard — app opens on dashboard)
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
│   ├── fi/                  # financial-freedom cards
│   └── settings/            # SettingsPanel
├── composables/
│   ├── useTheme.ts          # dark/light/system + matchMedia
│   ├── useLocale.ts         # lang switch + vue-i18n sync
│   ├── useCurrencyFormat.ts # Intl.NumberFormat by currency code
│   ├── useChartTheme.ts     # Chart.js colors by isDark
│   ├── useBaseMetrics.ts    # SINGLE monthly base: net salary (retención, libranza), income, debt, outflow, liquid assets
│   ├── useNetIncome.ts      # thin facade over useBaseMetrics (legacy consumers)
│   ├── useHealthScore.ts    # useBaseMetrics → calcHealthScore
│   ├── useDTI.ts            # useBaseMetrics → calcDTI
│   ├── useMonthClose.ts     # month rollover: snapshot + variable reset (boot + tab visible)
│   ├── usePrepaymentPlan.ts # bridge: cards + settings → prepayment.ts
│   ├── useGoalsBudget.ts    # goalCap = allocation.savings% × netIncome
│   ├── useSavingsProjection.ts # bridge: assets + allocation → savings-projection.ts
│   ├── useStorageError.ts   # module-level singleton for save failure toast
│   ├── useForm.ts           # Zod-powered form validation
│   ├── useImportExport.ts   # JSON backup export/import (import is partial — see Known gaps)
│   └── …                    # dashboard/insight composables: ls src/composables
└── lib/                     # pure, 0 Vue/Pinia (see Lib Catalog below)
    ├── calculations/        # financial calculation modules (see Lib Catalog)
    ├── tax/colombia/        # payroll, aportes, retención, prima, cesantías
    ├── storage/             # Zod schemas V2–V6, load/save, migrate.ts, backup
    ├── currency/format.ts   # formatCurrency(amount, code)
    ├── date/month.ts        # detectMonthRollover, formatYearMonth
    ├── format/ · navigation/ # locale formatting · nav-config
    └── health/thresholds.ts # CFPB-aligned cutoffs
```

---

## Boot Cycle (main.ts)

```
1. createPinia()
2. hydrateStores()  →  loadAppState(): migrate v1→…→v6 if needed, Zod validate AppStateSchemaV6
                       → populate all 9 stores  [synchronous]
                       isHydrating = true during this step (suppresses persist watcher)
3. persistStores()  →  deep watch all 9 store states → saveAppState() on any change
                       if save fails → useStorageError.setError() → StorageErrorToast
4. app.use(router).use(i18n).mount('#app')
5. nextTick → isHydrating = false → useMonthClose().runMonthClose()
                       (also re-runs when the tab becomes visible)
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
| `prepayment.ts`         | `comparePrepaymentPlan(input)→{baseline,plan,monthsSaved,interestSaved}` · abonos a capital: mode `term` (rollover) o `payment` (recalcula cuota)                       |

### `src/lib/tax/colombia/`

| Module         | Key export(s)                                                                                           |
| -------------- | ------------------------------------------------------------------------------------------------------- |
| `constants.ts` | `uvtForYear(y)`, `smmlvForYear(y)`, `RENTA_EXENTA_CAP_UVT=790/12`, `FSP_BRACKETS`, `ART_383_BRACKETS[]` |
| `aportes.ts`   | `calcAportesEmpleado(gross, year)→{salud,pension,fsp,total}` (IBC ≤ 25 SMMLV)                           |
| `retencion.ts` | `calcRetencion(grossSalary, now)→{amount,label,belowThreshold}`                                         |
| `prima.ts`     | `calcPrimaServicios(grossSalary)→{amount,frequency:'semiannual'}`                                       |
| `cesantias.ts` | `calcInteresesCesantias(salary)→number` (12% anual, Ley 52/1975; se pagan en enero)                     |
| `presets.ts`   | `applyColombiaPresets(deductions[],salary)→deductions[]` (idempotente)                                  |

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
All dashboard figures come from ONE monthly base — never recompute income or debt
elsewhere (PR #6 fixed disagreements between hero, DTI and health score).

useBaseMetrics
  grossSalary + deductions[] + nonSalaryBenefits[]
    − retencionApplied (COP, unless settings.deductRetencion=false or manual "retención")
    − payrollDeductionApplied (loans with payrollDeducted, unless manual "libranza")
    → netSalary ;  + streamsMonthly → monthlyIncome (= netIncome)
  debtObligation (all debt, incl. libranza) · monthlyOutflow (excl. libranza) · liquidAssets

netIncome
  → × allocation%              →  distribución (needs/wants/savings amounts)
  → - fixedExpenses - debtObligations  →  disponible libre
  → calcDTI(debtObligation, grossMonthlyIncome)  →  DTI%   [useDTI]
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
8. Si cambia la forma persistida: nuevo `AppStateSchemaVN` en `src/lib/storage/schema.ts` + `migrateV(N-1)toVN` registrado en `src/lib/storage/migrate.ts` + `tests/unit/storage/migrate-vN.test.ts`; actualizar `useAppStorage.ts` al nuevo schema
9. `App.vue` — agregar a `ALL_NAV` y `MOBILE_NAV` (RouterLink, nunca `<a href>`)
10. Tests: unit para lib/ + store actions + componentes (con `createTestingPinia({stubActions:false})`)

---

## Storage Schema (Zod — `src/lib/storage/schema.ts`)

```
AppStateSchemaV6 {           ← active; each version is additive over the previous
  schemaVersion: 6
  settings: SettingsSchema
            + projectionAnnualRatePercent, deductRetencion   (V4)
            + userName ≤30                                  (V5)
  income: { grossSalary, deductions[], otherStreams[] (+ incomeClass V4), nonSalaryBenefits[] }
  expenses: FixedExpense[]   ← category acepta 'vivienda' además de 'housing'
  cards: (CardSchema | LoanSchema)[]   ← discriminated union, dueDate: string|null
                                         loan + payrollDeducted (libranza, V6)
  goals: Goal[]
  assets: Asset[]            ← incluye annualRatePercent: number [0,100]
  variableExpenses: VariableCategory[]
  allocation: { needs, wants, savings }  ← refinement: suma = 100
  snapshots: Snapshot[]     ← + debtPayments (V5), written by useMonthClose
}
```

Migration path: v1→v2→v3→v4→v5→v6 (auto, `src/lib/storage/migrate.ts`, run by `loadAppState`). Backups: `finance_app_data_v1_backup`, `finance_app_data_v2_backup`.

**Known gap:** `useImportExport` still exports/imports a V2 envelope and `importFromFile` restores only settings + grossSalary. A JSON export is not a full restore path; the real source of truth is the `finance_app_data` localStorage key.

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
- **Retención base**: `gross − salud(4%) − pensión(4%) − FSP` (Art. 383 ET); FSP 1% desde 4 SMMLV, hasta 2% desde 20 SMMLV
- **Renta exenta**: 25%, tope `790 UVT/año` (790/12 por mes, Art. 206 num. 10 ET, Ley 2277/2022); límite global 40% / 1.340 UVT/año (Art. 336)
- **Neto**: `useBaseMetrics` descuenta la retención estimada salvo `settings.deductRetencion = false` o una deducción manual de retención
- **Libranza**: préstamo con `payrollDeducted: true` (schema v6) → la cuota se resta del neto (`useBaseMetrics.netSalary`) y no del flujo de caja; sí cuenta en DTI, runway y fondo de emergencia. Si ya hay una deducción manual con "libranza" en el nombre, no se resta otra vez
- **No-salary benefits**: se suman AL FINAL, nunca entran en base de aportes (Art. 128 CST)
- **Prima de servicios**: `bruto / 2` semestral (Art. 306 CST, 6 meses completos)
- **UVT**: 2025 `$49.799` (Res. DIAN 000187/2024) · 2026 `$52.374` (Res. DIAN 000238/2025). SMMLV 2026 `$1.750.905`
- **APR field = TEA**: `(1+TEA)^(1/12)−1` para obtener tasa mensual equivalente
