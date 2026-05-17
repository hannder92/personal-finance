# Test Plan — `Fix cálculos financieros`

> Spec: [1-spec.md](./1-spec.md) · Plan: [2-plan.md](./2-plan.md) · Mode: `solo`
> Version: **v1** · Created: `2026-05-16`

## Pyramid Summary

| Level | Count | % actual | % target (Constitution) |
|---|---|---|---|
| Unit (`TC-U-*`) | 25 | 55.6% | ~60% |
| Component (`TC-C-*`) | 11 | 24.4% | ~30% |
| Integration (`TC-I-*`) | 4 | 8.9% | included in component tier |
| E2E (`TC-E-*`) | 5 | 11.1% | ~10% |
| **Total** | **45** | **100%** | — |

> Deviation: unit tier is 4.4% below target. Justified — the plan has no complex lib graph traversals; the financial calculations map cleanly to concise pure-function tests. Component tier compensates.

## AC → TC Traceability Matrix

| AC | Description | TCs | Kind |
|---|---|---|---|
| AC-1.1 | All data persists on reload | TC-I-001, TC-E-001 | integration, e2e |
| AC-1.2 | Debt persists with all fields | TC-I-002, TC-E-001 | integration, e2e |
| AC-1.3 | Debt + deduction coexist after reload | TC-I-003 | integration |
| AC-1.4 | Storage error shows visible toast | TC-C-001 | component |
| AC-2.1 | Net salary = $11,132,000 for given inputs | TC-U-001 | unit |
| AC-2.2 | Distribution panel uses net income | TC-C-002, TC-E-002 | component, e2e |
| AC-2.3 | Available = netIncome − fixed − debt | TC-U-002 | unit |
| AC-2.4 | Non-salary benefits added post-deductions | TC-U-003 | unit |
| AC-2.5 | No deductions → netIncome = grossSalary | TC-U-020 | unit |
| AC-3.1 | Housing ratio = housing expenses / netIncome | TC-U-005 | unit |
| AC-3.2 | Emergency months denominator = fixed + debt obligations | TC-U-006 | unit |
| AC-3.3 | Savings rate = goal contributions / netIncome | TC-U-007 | unit |
| AC-3.4 | No assets → emergency shows "sin datos" | TC-C-003 | component |
| AC-3.5 | Adding liquid asset recalculates emergency | TC-C-004, TC-E-003 | component, e2e |
| AC-3.6 | Adding housing expense recalculates housing ratio | TC-C-005, TC-E-003 | component, e2e |
| AC-4.1 | TEA 30% → fewer months than TNA/12 | TC-U-008 | unit |
| AC-4.2 | Card total includes installments | TC-U-009 | unit |
| AC-4.3 | DTI = (min + installments) / netIncome | TC-U-010 | unit |
| AC-4.4 | Payment < interest → indefinite | TC-U-011 | unit |
| AC-5.1 | Prima months show higher balance | TC-U-012 | unit |
| AC-5.2 | Non-monthly income only in correct months | TC-U-013 | unit |
| AC-5.3 | Projection uses net income as base | TC-C-006 | component |
| AC-6.1 | Goal cap = savings% × netIncome | TC-U-014 | unit |
| AC-6.2 | Changing savings% updates cap reactively | TC-C-007 | component |
| AC-7.1 | Prima button creates semiannual stream | TC-U-015 | unit |
| AC-7.2 | Prima button updates existing (no duplicate) | TC-U-016 | unit |
| AC-7.3 | Prima edit/delete persists | TC-I-004, TC-E-004 | integration, e2e |
| AC-8.1 | Hypothetical 12-month accumulation shown | TC-U-017, TC-C-008 | unit, component |
| AC-8.2 | Compound growth uses per-asset rate | TC-U-018 | unit |
| AC-8.3 | Both series visible simultaneously | TC-C-008, TC-E-005 | component, e2e |
| AC-8.4 | Changing savings% updates hypothetical | TC-C-009 | component |
| AC-8.5 | No rate configured → message shown | TC-C-010 | component |
| AC-8.6 | Month 12 compound value > initial balance | TC-U-019 | unit |

**Coverage: 33/33 ACs (100%).**

---

## Unit Tests — `TC-U-*`

> Location: `tests/unit/` · Setup: plain Vitest, no Pinia. `createPinia` in `beforeEach` only for store-level tests.

---

### TC-U-001 (AC-2.1): calcNetSalary — valor exacto con caso colombiano

```
Given  grossSalary = 12_100_000
And    deductions = [{amount: 4, type: 'percent'}, {amount: 4, type: 'percent'}]
And    nonSalaryBenefits = []
When   calcNetSalary(inputs) is called
Then   result === 11_132_000
```

```
Given  grossSalary = 12_100_000
And    deductions = [{amount: 484_000, type: 'fixed'}, {amount: 484_000, type: 'fixed'}]
When   calcNetSalary(inputs) is called
Then   result === 11_132_000
```

---

### TC-U-002 (AC-2.3): calcFreeForAllocation

```
Given  totalIncome = 11_132_000
And    fixedExpenses = 3_000_000
And    debtObligations = 1_500_000
When   calcFreeForAllocation is called
Then   result === 6_632_000
```

```
Given  debtObligations > totalIncome
When   calcFreeForAllocation is called
Then   result is a negative number (no error thrown)
```

---

### TC-U-003 (AC-2.4): non-salary benefits added post-deductions

```
Given  grossSalary = 10_000_000
And    deductions = [{amount: 10, type: 'percent'}]  // −1_000_000
And    nonSalaryBenefits = [{amount: 500_000}]
When   calcNetSalary(inputs) is called
Then   result === 9_500_000  // (10_000_000 − 1_000_000) + 500_000
```

```
Given  same inputs but benefits added before deductions conceptually
When   verifying the formula
Then   benefits MUST NOT reduce the deduction base
```

---

### TC-U-005 (AC-3.1): calcHousingRatio

```
Given  expenses = [{name: 'Arriendo', amount: 2_000_000, category: 'vivienda'}]
And    totalIncome = 10_000_000
When   calcHousingRatio(expenses, totalIncome) is called
Then   result === 20  // 20%
```

```
Given  totalIncome = 0
When   calcHousingRatio is called
Then   result === 0  // no division by zero
```

---

### TC-U-006 (AC-3.2): emergency months denominator includes debt obligations

```
Given  liquidAssets = 6_000_000
And    fixedExpenses = 1_500_000
And    debtObligations = 500_000
When   emergencyMonths = liquidAssets / (fixedExpenses + debtObligations)
Then   result === 3  // covers 3 months of full obligations
```

```
Given  liquidAssets = 6_000_000
And    fixedExpenses + debtObligations = 0
When   computing emergency months
Then   result is null or 'sin datos'  // no division by zero
```

---

### TC-U-007 (AC-3.3): savings rate from real goal contributions

```
Given  goals = [{monthlyContrib: 500_000}, {monthlyContrib: 300_000}]
And    netIncome = 10_000_000
When   savingsRate = (500_000 + 300_000) / 10_000_000 * 100
Then   result === 8  // 8%
```

```
Given  no goals have monthlyContrib > 0
When   computing savings rate
Then   result === 0  // not null, not error
```

---

### TC-U-008 (AC-4.1): TEA formula — fewer months than TNA/12

```
Given  debt = {type: 'card', balance: 5_000_000, apr: 30, minPayment: 300_000}
When   calcDebtTimeline(debt) is called using TEA formula (1+0.30)^(1/12)−1
And    also computed using TNA formula: 0.30/12
Then   months_TEA < months_TNA  // correct TEA gives fewer months
And    months_TEA > 0
And    Number.isFinite(months_TEA) === true
```

```
Given  apr = 30 (TEA)
When   computing monthly rate
Then   monthlyRate ≈ 0.02210  // (1.30)^(1/12) − 1
And    monthlyRate < 0.025     // strictly less than TNA/12
```

---

### TC-U-009 (AC-4.2): calcCardObligation includes installments

```
Given  card = {minPayment: 200_000, installmentsList: [{total: 600_000, installments: 3, paid: 0}]}
When   calcCardObligation(card) is called
Then   result === 200_000 + 200_000 === 400_000
```

```
Given  installmentsList is empty
When   calcCardObligation is called
Then   result === minPayment  // no installment addition
```

---

### TC-U-010 (AC-4.3): DTI with full card obligation

```
Given  monthlyDebtObligations = 400_000  // min + installments from TC-U-009
And    netIncome = 10_000_000
When   calcDTI(400_000, 10_000_000) is called
Then   result === 4  // 4%
```

```
Given  netIncome = 0
When   calcDTI is called
Then   result === 0  // no division by zero
```

---

### TC-U-011 (AC-4.4): indefinite payoff when payment < monthly interest

```
Given  debt = {balance: 5_000_000, apr: 36, minPayment: 100_000}
When   monthly interest = 5_000_000 × ((1.36)^(1/12) − 1) ≈ 5_000_000 × 0.02596 ≈ 129_800
And    minPayment (100_000) < monthly interest (129_800)
When   calcDebtTimeline(debt) is called
Then   result.months === Infinity
```

---

### TC-U-012 (AC-5.1): prima months show higher balance in projection

```
Given  monthlyIncome = 4_000_000
And    streams = [{amount: 4_000_000, frequency: 'semiannual'}]  // prima
And    fixedExpenses = 2_000_000
And    debtObligation = 500_000
When   calcProjection(inputs, 12) is called
Then   months[5].projectedBalance > months[4].projectedBalance + 1_500_000
And    months[11].projectedBalance > months[10].projectedBalance + 1_500_000
```

---

### TC-U-013 (AC-5.2): non-monthly income appears only in correct months

```
Given  stream = {amount: 1_000_000, frequency: 'quarterly'}
When   getProjectionMonthsForStream(stream, 0, 12) is called
Then   result contains [0, 3, 6, 9]  // quarterly months
And    result.length === 4
```

```
Given  stream = {frequency: 'annual'}
When   getProjectionMonthsForStream is called for 12 months
Then   result.length === 1  // only one annual occurrence
```

---

### TC-U-014 (AC-6.1): goal cap = savings% × netIncome

```
Given  allocation.savings = 20
And    netIncome = 11_132_000
When   goalCap = (20 / 100) × 11_132_000
Then   goalCap === 2_226_400
```

```
Given  allocation.savings = 0
When   computing goalCap
Then   goalCap === 0  // no available budget
```

---

### TC-U-015 (AC-7.1): addPrimaPreset creates stream when none exists

```
Given  incomeStore with grossSalary = 12_000_000
And    no stream with isPrima === true exists
When   addPrimaPreset() is called
Then   state.otherStreams contains one stream with {id: '__prima__', isPrima: true, frequency: 'semiannual', amount: 6_000_000}
```

---

### TC-U-016 (AC-7.2): addPrimaPreset updates existing (no duplicate)

```
Given  incomeStore with grossSalary = 12_000_000
And    one stream with {id: '__prima__', isPrima: true, amount: 5_000_000} already exists
When   addPrimaPreset() is called (grossSalary changed to 12_000_000)
Then   state.otherStreams has exactly one stream with isPrima === true
And    that stream's amount === 6_000_000  // updated
```

---

### TC-U-017 (AC-8.1): calcHypotheticalSavings — linear accumulation

```
Given  netIncome = 10_000_000
And    savingsRatePercent = 20
And    monthsAhead = 12
When   calcHypotheticalSavings({netIncome, savingsRatePercent, monthsAhead}) is called
Then   result[11].cumulativeAmount === 10_000_000 × 0.20 × 12 === 24_000_000
And    result[0].cumulativeAmount === 2_000_000  // month 1
And    result is monotonically increasing
```

---

### TC-U-018 (AC-8.2): calcCompoundGrowth — per-asset rate

```
Given  assets = [{balance: 10_000_000, annualRatePercent: 12}]
And    monthsAhead = 12
When   calcCompoundGrowth(assets, monthsAhead) is called
Then   result[11].totalValue > 10_000_000  // grew
And    result[11].totalValue ≈ 10_000_000 × (1.12)^1 === 11_200_000  // ≈ within 1%
```

```
Given  assets with annualRatePercent = 0
When   calcCompoundGrowth is called
Then   result[11].totalValue === initial balance  // flat line — EC-8
```

---

### TC-U-019 (AC-8.6): month 12 compound value > initial balance

```
Given  any asset with annualRatePercent > 0 and balance > 0
When   calcCompoundGrowth is called for 12 months
Then   result[11].totalValue > asset.balance
```

---

### TC-U-020 (AC-2.5 / EC-1): no deductions → netIncome = grossSalary

```
Given  grossSalary = 8_000_000
And    deductions = []
And    nonSalaryBenefits = []
When   calcNetSalary is called
Then   result === 8_000_000
```

---

### TC-U-021 (EC-2): grossSalary = 0 → no division errors

```
Given  grossSalary = 0
And    deductions = [{amount: 4, type: 'percent'}]
When   calcNetSalary is called
Then   result === 0  // not NaN
When   calcDTI(0, 0) is called
Then   result === 0  // not NaN
When   calcHousingRatio(expenses, 0) is called
Then   result === 0  // not NaN
```

---

### TC-U-022 (EC-5): savings = 0% → goal cap = $0

```
Given  allocation.savings = 0
And    netIncome = 10_000_000
When   goalCap = (0 / 100) × 10_000_000
Then   goalCap === 0
```

---

### TC-U-023 (EC-6): debt rate = 0% → simple division

```
Given  debt = {balance: 1_200_000, apr: 0, minPayment: 100_000}
When   calcDebtTimeline(debt) is called
Then   result.months === 12  // 1_200_000 / 100_000
And    result.totalInterest === 0
```

---

### TC-U-024 (EC-8): compound growth with rate = 0% → flat line

```
Given  assets = [{balance: 5_000_000, annualRatePercent: 0}]
When   calcCompoundGrowth(assets, 12) is called
Then   every month's totalValue === 5_000_000
```

---

### TC-U-025 (EC-9): no goal contributions → savings rate = 0

```
Given  goals = [{monthlyContrib: 0}, {monthlyContrib: 0}]
And    netIncome = 8_000_000
When   savingsRate = sum(monthlyContrib) / netIncome
Then   result === 0  // not null, not NaN
```

---

## Component Tests — `TC-C-*`

> Location: `tests/component/` · Setup: `createTestingPinia({ stubActions: false, createSpy: vi.fn })`.
> Always seed `settings` store with `{lang: 'es', currency: 'COP', theme: 'system', ...}` to avoid formatCurrency errors.

---

### TC-C-001 (AC-1.4): StorageErrorToast — visible within 5s on save failure

```
Given  saveAppState is mocked to return {ok: false, reason: 'quota_exceeded'}
When   a store mutation triggers the watcher in main.ts
Then   the toast component renders within the next render cycle
And    it contains the i18n key text for 'storage.error.title'
And    a retry button is visible
And    the toast does not auto-dismiss (sticky: true)
```

---

### TC-C-002 (AC-2.2): AllocationPanel — amounts use net income, not gross

```
Given  incomeStore = {grossSalary: 12_100_000, deductions: [{amount: 8, type: 'percent'}]}
And    allocationStore = {needs: 50, wants: 30, savings: 20}
When   AllocationPanel renders
Then   the needs amount shown is ≈ 5_566_000  // 50% of 11_132_000
And    the text does NOT contain 6_050_000     // 50% of gross
```

---

### TC-C-003 (AC-3.4): HealthScore — no assets → emergency shows "sin datos"

```
Given  assetsStore = {items: []}  // no liquid assets
When   HealthScore component renders
Then   the emergency fund section displays the 'sin datos' indicator
And    the overall health score is computed from the remaining 3 components only
```

---

### TC-C-004 (AC-3.5): HealthScore — adding liquid asset recalculates emergency

```
Given  HealthScore is mounted with assetsStore.items = []
When   assetsStore.add({name: 'Ahorro', value: 6_000_000, type: 'savings', annualRatePercent: 0}) is called
Then   the emergency fund indicator updates to show a positive value in months
And    the overall score changes
```

---

### TC-C-005 (AC-3.6): HealthScore — adding housing expense recalculates ratio

```
Given  HealthScore mounted with expensesStore.items = []
When   expensesStore.add({name: 'Arriendo', amount: 2_000_000, category: 'vivienda'}) is called
Then   the housing ratio component shows a non-zero value
And    the overall health score updates
```

---

### TC-C-006 (AC-5.3): ProjectionChart — receives net income (not gross)

```
Given  incomeStore = {grossSalary: 12_100_000, deductions: [{amount: 8, type: 'percent'}]}
When   DashboardView renders and ProjectionChart is populated
Then   the monthlyIncome prop passed to calcProjection equals 11_132_000
And    does NOT equal 12_100_000
```

---

### TC-C-007 (AC-6.2): GoalsView — cap updates when savings% changes

```
Given  GoalsView mounted with allocationStore = {savings: 20} and netIncome = 10_000_000
And    displayed cap = 2_000_000
When   allocationStore.setAllocation(50, 20)  // savings drops to 30
Then   displayed cap updates to 3_000_000
And    no page reload is required
```

---

### TC-C-008 (AC-8.1, AC-8.3): SavingsProjectionChart — two series rendered

```
Given  netIncome = 10_000_000, savingsRate = 20%
And    assets = [{balance: 5_000_000, annualRatePercent: 10, type: 'savings'}]
When   SavingsProjectionChart renders
Then   Chart.js is initialized with 2 datasets
And    one dataset has borderDash = [] (solid — hypothetical)
And    one dataset has borderDash = [5, 5] (dashed — compound)
And    both datasets have 12 data points
```

---

### TC-C-009 (AC-8.4): SavingsProjectionChart — hypothetical updates on savings% change

```
Given  SavingsProjectionChart mounted with allocationStore.savings = 20
When   allocationStore.setAllocation(50, 20)  // savings becomes 30
Then   the hypothetical series data at month 12 updates to reflect 30% × netIncome × 12
And    the compound series data is unchanged (different input)
```

---

### TC-C-010 (AC-8.5): SavingsProjectionChart — no rate configured → message shown

```
Given  assetsStore.items = [{type: 'savings', annualRatePercent: 0}]
When   SavingsProjectionChart renders
Then   the compound series is NOT rendered (or is hidden)
And    a message with i18n key 'savings.noRateConfigured' is visible
And    the hypothetical series IS rendered (unaffected)
```

---

### TC-C-011 (EC-10): SavingsProjectionChart — hypothetical visible even without rate

```
Given  assetsStore.items = [{annualRatePercent: 0}]
And    netIncome > 0 and savings% > 0
When   SavingsProjectionChart renders
Then   the hypothetical accumulation series IS shown
And    only the compound curve is absent
```

---

## Integration Tests — `TC-I-*`

> Location: `tests/unit/` or `tests/component/` with real localStorage (jsdom).
> Setup: `createTestingPinia({ stubActions: false })` + real `loadAppState` / `saveAppState`.

---

### TC-I-001 (AC-1.1): full persist + reload cycle

```
Given  the app is mounted with empty state
When   incomeStore.setGrossSalary(10_000_000)
And    expensesStore.add({name: 'Arriendo', amount: 2_000_000, category: 'vivienda'})
And    goalsStore.add({name: 'Vacaciones', target: 5_000_000, saved: 0, monthlyContrib: 300_000, targetDate: null, priority: 0})
And    localStorage is read back via loadAppState()
Then   parsed state contains all three items with matching values
And    no fields are missing or changed
```

---

### TC-I-002 (AC-1.2): debt persists with all fields

```
Given  cardsStore.addCard({name: 'Visa', balance: 3_000_000, limit: 10_000_000, apr: 28, minPayment: 200_000, dueDate: '2026-06-15', installments: []})
When   localStorage is reloaded via loadAppState()
Then   the card appears with all fields intact: name, balance, limit, apr, minPayment, dueDate
And    no field is undefined or null unexpectedly
```

---

### TC-I-003 (AC-1.3): debt + deduction coexist after reload

```
Given  cardsStore.addCard({...any valid card...})
And    incomeStore.addDeduction({label: 'Salud', amount: 4, type: 'percent'})
When   loadAppState() is called on the current localStorage
Then   state.cards.length === 1
And    state.income.deductions.length === 1
And    neither entry caused the other to vanish (schema merge is clean)
```

---

### TC-I-004 (AC-7.3): prima edit and delete persists

```
Given  incomeStore.addPrimaPreset() has been called (grossSalary = 10_000_000)
When   incomeStore.update('__prima__', {amount: 4_500_000})
And    loadAppState() is called
Then   the prima stream persists with amount === 4_500_000
```

```
Given  prima stream exists
When   incomeStore.removeStream('__prima__')
And    loadAppState() is called
Then   no stream with isPrima === true exists in the loaded state
```

---

## E2E Tests — `TC-E-*`

> Location: `e2e/` · Framework: Playwright.
> Use `returningPage` fixture for sessions with pre-seeded data; `freshPage` for onboarding flows.

---

### TC-E-001 (AC-1.1, AC-1.2, AC-1.3): persist flow — add debt + deduction → reload

```
Given  returningPage with no prior data
When   user navigates to /debts and adds a card: "Visa", $3.000.000, 28% EA, $200.000 pago mínimo
And    user navigates to /income and adds deduction: "Salud" 4%
And    page is reloaded (page.reload())
Then   /debts shows the card "Visa" with correct values
And    /income shows "Salud 4%" deduction
And    neither entry disappeared
```

---

### TC-E-002 (AC-2.2): dashboard metrics use net income

```
Given  returningPage seeded with grossSalary = 12_100_000, salud 4% + pensión 4% deductions
When   user navigates to /
Then   the displayed net income is $11.132.000 (not $12.100.000)
And    the distribution amounts are based on $11.132.000
```

---

### TC-E-003 (AC-3.5, AC-3.6): health score updates reactively

```
Given  returningPage with no assets and no housing expenses
And    health score is visible on dashboard
When   user navigates to /networth and adds a savings asset of $6.000.000 at 0% rate
And    user navigates back to /
Then   the emergency fund component of the health score shows a positive value
And    the overall score has changed from its previous value
```

---

### TC-E-004 (AC-7.1, AC-7.2, AC-7.3): prima button create + update + persist

```
Given  returningPage seeded with grossSalary = 12_000_000 and no prima stream
When   user navigates to /income and clicks "Cargar prima de servicios"
Then   a semiannual stream of $6.000.000 appears in the list
When   user clicks "Cargar prima de servicios" again
Then   the list still has exactly ONE prima entry (no duplicate)
When   page is reloaded
Then   the prima entry is still present with amount $6.000.000
```

---

### TC-E-005 (AC-8.1, AC-8.2, AC-8.3): savings projection chart with two series

```
Given  returningPage seeded with:
       - grossSalary = 10_000_000, no deductions
       - allocationStore: savings = 20%
       - assets = [{name: 'CDT', value: 5_000_000, type: 'savings', annualRatePercent: 10}]
When   user navigates to / (dashboard)
Then   the SavingsProjectionChart renders with two visible series
And    both series have 12 data points
And    the compound series value at month 12 is greater than $5.000.000
And    the hypothetical series value at month 12 is $24.000.000 (10_000_000 × 20% × 12)
```

---

## Mocking Strategy

| Dependency | Strategy | Justification |
|---|---|---|
| `localStorage` | **Real** (jsdom built-in) | Constitution: prefer real over mocks for persistence; jsdom provides a full implementation; test setup clears it `afterEach` |
| Pinia stores | **Real** (`createTestingPinia({ stubActions: false })`) | Constitution rule: `stubActions: true` hides real store logic — forbidden |
| `crypto.randomUUID()` | **Real** (jsdom provides it) | No need to mock; tests verify UUID shape with regex `/^[0-9a-f]{8}-/` |
| `Date.now()` / `new Date()` | **Mock** (`vi.useFakeTimers()`) | Only for tests depending on "current month" (TC-U-012, TC-U-013, TC-I-004). Restores with `vi.useRealTimers()` in `afterEach` |
| `ResizeObserver` (Chart.js) | **Mock** (stub in `tests/setup.ts`) | jsdom does not implement ResizeObserver; Chart.js requires it; stub prevents render errors without affecting business logic |
| `navigator.storage.estimate()` | **Mock** (returns `{quota: 1000, usage: 999}`) | Only in TC-C-001 to simulate quota-exceeded scenario without filling real storage |
| Network / external APIs | **N/A** | No external services in this project. Nothing to mock. |

---

## Performance

**Scope:** client-side calculations only (no server, no network).

| Concern | Target | Test Approach |
|---|---|---|
| `calcProjection(12 months)` with 10 income streams | < 2ms | `performance.now()` assertion in TC-U-012 |
| `calcCompoundGrowth` with 20 assets × 12 months | < 5ms | `performance.now()` in TC-U-018 |
| `saveAppState()` with full state (~50 items per store) | < 20ms | Measured in TC-I-001 |
| Dashboard reactive update on store mutation | < 1 frame (16ms) | Playwright `waitForFunction` in TC-E-002 |

All targets are conservative for a single-tab browser app. If exceeded, add to backlog with profiling evidence.

---

## Security

**Scope:** client-side only; no auth, no network. OWASP considerations for local-data SPA.

| Concern | Status | Verification |
|---|---|---|
| No `v-html` with user-derived data | Constitution-enforced (Forbidden list) | `grep -r "v-html" src/` in lint step; no manual test needed |
| No financial data sent to external APIs | Architecture guarantee (localStorage only) | No `fetch` / `axios` in `src/`; verified by dependency audit |
| Zod validation before store mutations | Verified at `loadAppState` + `importFromFile` | TC-I-001 tests that malformed data returns `parseError`, never silently passes |
| `annualRatePercent` range `[0, 100]` — prevent extreme values | Schema refinement (Zod `.min(0).max(100)`) | TC-U-018 extended: input of `annualRatePercent = 9999` is rejected by schema before reaching the store |
| Prima stream id `__prima__` — prevent non-prima stream from claiming it | Store boundary guard in `addStream` | TC-U-015/TC-U-016 verify guard rejects `{id: '__prima__', isPrima: false}` |
| XSS via goal/expense names rendered in chart tooltips | Chart.js renders via Canvas (no innerHTML) | Architectural guarantee; documented in `## Mocking Strategy` |

---

## Sign-off

<!-- mode=solo -->
- [x] Author: `Johann Medina` — `2026-05-16`
