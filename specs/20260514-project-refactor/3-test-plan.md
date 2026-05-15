# Test Plan: Personal Finance Dashboard — Edición Profesional

> Spec: [1-spec.md](./1-spec.md) · Plan: [2-plan.md](./2-plan.md)
> Test plan version: **v1** · Mode: `solo`

## Pyramid Distribution

| Level                                                                       | Count   | %        | Target | Status |
| --------------------------------------------------------------------------- | ------- | -------- | ------ | ------ |
| Unit `TC-U-*` (Vitest, `jsdom`, zero Vue/Pinia)                             | 60      | 59.4%    | ~60%   | ✓      |
| Component `TC-C-*` (Vitest + `@testing-library/vue` + `createTestingPinia`) | 32      | 31.7%    | ~30%   | ✓      |
| E2E `TC-E-*` (Playwright, full browser)                                     | 9       | 8.9%     | ~10%   | ✓      |
| **Total**                                                                   | **101** | **100%** |        |        |

Constitution coverage minimum: **80%** on `lib/calculations/` and `lib/tax/`; **60%** overall.

---

## Traceability Matrix

> Every AC in the spec maps to ≥1 TC. No orphan TCs (every TC below covers ≥1 AC or EC).

| AC / EC  | Test Cases                                       | Level                |
| -------- | ------------------------------------------------ | -------------------- |
| AC-1.1   | TC-C-001, TC-E-001                               | Component, E2E       |
| AC-1.2   | TC-C-001                                         | Component            |
| AC-1.3   | TC-U-044, TC-C-002, TC-E-002                     | Unit, Component, E2E |
| AC-1.4   | TC-C-003                                         | Component            |
| AC-1.5   | TC-C-004, TC-E-001                               | Component, E2E       |
| AC-1.6   | TC-C-005                                         | Component            |
| AC-2.1   | TC-U-002, TC-C-006                               | Unit, Component      |
| AC-2.2   | TC-U-038, TC-U-039, TC-C-007                     | Unit, Component      |
| AC-2.3   | TC-U-034, TC-U-035, TC-U-036, TC-U-037, TC-C-008 | Unit, Component      |
| AC-2.4   | TC-U-003                                         | Unit                 |
| AC-2.5   | TC-U-001, TC-C-009                               | Unit, Component      |
| AC-3.1   | TC-U-005, TC-U-006, TC-U-045, TC-C-010           | Unit, Component      |
| AC-3.2   | TC-U-007, TC-U-029                               | Unit                 |
| AC-3.3   | TC-U-040, TC-U-041, TC-C-011                     | Unit, Component      |
| AC-4.1   | TC-C-012                                         | Component            |
| AC-4.2   | TC-C-012                                         | Component            |
| AC-4.3   | TC-U-008, TC-U-058                               | Unit                 |
| AC-4.4   | TC-C-013                                         | Component            |
| AC-5.1   | TC-U-009, TC-C-014, TC-E-005                     | Unit, Component, E2E |
| AC-5.2   | TC-U-010, TC-C-015                               | Unit, Component      |
| AC-5.3   | TC-U-011, TC-E-005                               | Unit, E2E            |
| AC-5.4   | TC-U-013                                         | Unit                 |
| AC-5.5   | TC-U-014                                         | Unit                 |
| AC-5.6   | TC-U-015, TC-U-050                               | Unit                 |
| AC-5.7   | TC-C-016                                         | Component            |
| AC-6.1   | TC-U-017                                         | Unit                 |
| AC-6.2   | TC-U-018                                         | Unit                 |
| AC-6.3   | TC-C-017                                         | Component            |
| AC-7.1   | TC-U-019, TC-C-018                               | Unit, Component      |
| AC-7.2   | TC-U-020                                         | Unit                 |
| AC-7.3   | TC-U-059, TC-C-019                               | Unit, Component      |
| AC-7.4   | TC-C-018                                         | Component            |
| AC-7.5   | TC-C-019                                         | Component            |
| AC-8.1   | TC-U-051, TC-C-020                               | Unit, Component      |
| AC-8.2   | TC-C-020                                         | Component            |
| AC-8.3   | TC-C-021, TC-E-003                               | Component, E2E       |
| AC-8.4   | TC-U-053, TC-U-054                               | Unit                 |
| AC-8.5   | TC-C-022                                         | Component            |
| AC-9.1   | TC-C-023                                         | Component            |
| AC-9.2   | TC-C-023                                         | Component            |
| AC-9.3   | TC-U-022, TC-C-023                               | Unit, Component      |
| AC-9.4   | TC-U-023                                         | Unit                 |
| AC-10.1  | TC-C-024, TC-E-001                               | Component, E2E       |
| AC-10.2  | TC-C-024                                         | Component            |
| AC-10.3  | TC-C-025                                         | Component            |
| AC-10.4  | TC-C-024                                         | Component            |
| AC-11.1  | TC-U-024, TC-U-027                               | Unit                 |
| AC-11.2  | TC-C-027                                         | Component            |
| AC-11.3  | TC-C-028                                         | Component            |
| AC-11.4  | TC-U-025                                         | Unit                 |
| AC-12.1  | TC-U-028                                         | Unit                 |
| AC-12.2  | TC-U-029                                         | Unit                 |
| AC-12.3  | TC-U-030                                         | Unit                 |
| AC-12.4  | TC-C-024                                         | Component            |
| AC-13.1  | TC-U-053, TC-U-054, TC-E-007                     | Unit, E2E            |
| AC-13.2  | TC-U-055                                         | Unit                 |
| AC-13.3  | TC-C-028                                         | Component            |
| AC-13.4  | TC-C-029                                         | Component            |
| AC-14.1  | TC-U-033, TC-C-026                               | Unit, Component      |
| AC-14.2  | TC-U-047, TC-C-026                               | Unit, Component      |
| AC-14.3  | TC-U-032                                         | Unit                 |
| AC-14.4  | TC-U-059                                         | Unit                 |
| AC-15.1  | TC-C-030, TC-E-004                               | Component, E2E       |
| AC-15.2  | TC-C-030, TC-E-004                               | Component, E2E       |
| AC-15.3  | TC-U-048, TC-U-049, TC-C-030                     | Unit, Component      |
| AC-15.4  | TC-C-031                                         | Component            |
| AC-16.1  | TC-C-032                                         | Component            |
| AC-16.2  | TC-E-009                                         | E2E                  |
| AC-16.3  | TC-C-033, TC-E-008                               | Component, E2E       |
| AC-16.4  | TC-E-006                                         | E2E                  |
| AC-17.1  | TC-E-008                                         | E2E                  |
| AC-17.2  | TC-C-033                                         | Component            |
| AC-17.3  | TC-C-032                                         | Component            |
| AC-17.4  | TC-E-008                                         | E2E                  |
| AC-17.5  | TC-C-024                                         | Component            |
| AC-17.6  | TC-C-025                                         | Component            |
| AC-17.7  | TC-C-032                                         | Component            |
| AC-17.8  | TC-C-034                                         | Component            |
| AC-17.9  | TC-E-002                                         | E2E                  |
| AC-17.10 | TC-C-034                                         | Component            |
| EC-1     | TC-U-004, TC-U-046                               | Unit                 |
| EC-2     | TC-U-016, TC-U-026                               | Unit                 |
| EC-3     | TC-U-021                                         | Unit                 |
| EC-4     | TC-C-020                                         | Component            |
| EC-5     | TC-U-042, TC-U-043                               | Unit                 |
| EC-6     | TC-U-056                                         | Unit                 |
| EC-7     | TC-U-035                                         | Unit                 |
| EC-8     | TC-U-031                                         | Unit                 |
| EC-9     | TC-C-002, TC-C-005                               | Component            |
| EC-10    | TC-U-012                                         | Unit                 |

**Coverage: 80/80 ACs + 10/10 ECs = 100%**

---

## Scenarios

### Unit Tests — `lib/calculations/net-income.ts`

**TC-U-001** · Covers: AC-2.5

```
Given grossSalary = 4_000_000 and one fixed deduction of 200_000
When calcNetSalary({ grossSalary, deductions }) is called
Then result equals 3_800_000
```

**TC-U-002** · Covers: AC-2.1, AC-2.5

```
Given grossSalary = 5_000_000 and one percent deduction of type 'percent' amount 4
When calcNetSalary is called
Then deduction amount is 200_000 and net = 4_800_000
```

**TC-U-003** · Covers: AC-2.4

```
Given grossSalary = 3_000_000, one deduction of 120_000, and nonSalaryBenefit of 200_000
When calcNetSalary is called
Then net = (3_000_000 - 120_000) + 200_000 = 3_080_000 (benefit does not affect deduction base)
```

**TC-U-004** · Covers: EC-1

```
Given grossSalary = 0 and a percent deduction of 4%
When calcNetSalary is called
Then deduction amount is 0 and net is 0 (no NaN or Infinity)
```

### Unit Tests — `lib/calculations/frequency.ts`

**TC-U-005** · Covers: AC-3.1

```
Given incomeStream { amount: 3_000_000, frequency: 'monthly' }
When calcMonthlyEquivalent(stream) is called
Then result is 3_000_000
```

**TC-U-006** · Covers: AC-3.1

```
Given incomeStream { amount: 6_000_000, frequency: 'semiannual' }
When calcMonthlyEquivalent(stream) is called
Then result is 1_000_000 (6M / 6 months)
```

**TC-U-007** · Covers: AC-3.2

```
Given a quarterly income stream
When getProjectionMonthsForStream(stream, startMonth = 0, count = 12) is called
Then the result is an array with entries at indices 0, 3, 6, 9 only
```

### Unit Tests — `lib/calculations/housing-ratio.ts`

**TC-U-008** · Covers: AC-4.3

```
Given expenses = [{ category: 'housing', amount: 1_200_000 }, { category: 'food', amount: 500_000 }] and totalIncome = 4_000_000
When calcHousingRatio(expenses, totalIncome) is called
Then result is 30 (percent)
```

**TC-U-058** · Covers: AC-4.3

```
Given expenses with no 'housing' category entry
When calcHousingRatio(expenses, totalIncome) is called
Then result is 0 (no crash)
```

### Unit Tests — `lib/calculations/amortization.ts`

**TC-U-009** · Covers: AC-5.1

```
Given card { balance: 2_000_000, apr: 24, minPayment: 100_000 }
When calcDebtTimeline(card) is called
Then result.months is a positive finite integer and result.totalInterest >= 0
```

**TC-U-010** · Covers: AC-5.2

```
Given loan { type: 'loan', balance: 5_000_000, apr: 18, remainingInstallments: 24, minPayment: 250_000 }
When calcDebtTimeline(loan) is called
Then result.remainingInstallments is 24 and result.type === 'loan'
```

**TC-U-011** · Covers: AC-5.3

```
Given card { balance: 2_000_000, apr: 24, minPayment: 100_000 } and extraPayment = 50_000
When calcExtraPaymentImpact(card, extraPayment) is called
Then result.monthsSaved > 0 and result.interestSaved > 0
```

**TC-U-012** · Covers: EC-10

```
Given card { balance: 1_000_000, apr: 0, minPayment: 100_000 }
When calcDebtTimeline(card) is called
Then result.months = 10 (simple division, no division-by-zero)
```

### Unit Tests — `lib/calculations/payoff-strategy.ts`

**TC-U-013** · Covers: AC-5.4

```
Given cards = [{ id:'a', apr:18 }, { id:'b', apr:36 }, { id:'c', apr:12 }]
When sortByAvalanche(cards) is called
Then order is ['b', 'a', 'c'] (descending APR)
```

**TC-U-014** · Covers: AC-5.5

```
Given cards = [{ id:'a', balance:500_000 }, { id:'b', balance:200_000 }, { id:'c', balance:800_000 }]
When sortBySnowball(cards) is called
Then order is ['b', 'a', 'c'] (ascending balance)
```

### Unit Tests — `lib/calculations/dti.ts`

**TC-U-015** · Covers: AC-5.6

```
Given monthlyDebtObligations = 800_000 and totalMonthlyIncome = 4_000_000
When calcDTI(obligations, income) is called
Then result is 20 (percent)
```

**TC-U-016** · Covers: EC-2

```
Given monthlyDebtObligations = 5_000_000 and totalMonthlyIncome = 3_000_000
When calcDTI(obligations, income) is called
Then result > 100 and is finite (no cap or crash)
```

### Unit Tests — `lib/calculations/installments.ts`

**TC-U-017** · Covers: AC-6.1

```
Given installment { total: 1_200_000, installments: 12, paid: 0 }
When calcInstallmentMonthly(installment) is called
Then result is 100_000
```

**TC-U-018** · Covers: AC-6.2

```
Given card { minPayment: 100_000, installmentsList: [{ total:600_000, installments:6, paid:0 }] }
When calcCardObligation(card) is called
Then result is 200_000 (100_000 min + 100_000 installment)
```

### Unit Tests — `lib/calculations/goals.ts`

**TC-U-019** · Covers: AC-7.1

```
Given goal { target: 6_000_000, saved: 1_000_000, monthlyContrib: 500_000 }
When calcGoalETA(goal) is called
Then result.months = 10 and result.estimatedDate is 10 months from now
```

**TC-U-020** · Covers: AC-7.2

```
Given goal { target: 3_000_000, saved: 0, targetDate: 6 months from now }
When calcRequiredMonthly(goal) is called
Then result is 500_000
```

**TC-U-021** · Covers: EC-3

```
Given goal { target: 1_000_000, saved: 0, monthlyContrib: 100_000, targetDate: 1 month ago }
When calcGoalETA(goal) is called
Then result.overdue === true and result.estimatedDate is not null (no crash)
```

### Unit Tests — `lib/calculations/net-worth.ts`

**TC-U-022** · Covers: AC-9.3

```
Given assets = [{ value: 10_000_000 }, { value: 5_000_000 }] and cards = [{ balance: 2_000_000 }]
When calcNetWorth(assets, cards) is called
Then result = 13_000_000 (15M assets − 2M liabilities)
```

**TC-U-023** · Covers: AC-9.4

```
Given assets total = 1_000_000 and card balances total = 5_000_000
When calcNetWorth(assets, cards) is called
Then result = -4_000_000 (negative is returned, not clamped)
```

### Unit Tests — `lib/calculations/health-score.ts`

**TC-U-024** · Covers: AC-11.1, AC-11.2

```
Given dti = 20, emergencyMonths = 4, housingRatio = 28, savingsRate = 22
When calcHealthScore({ dti, emergencyMonths, housingRatio, savingsRate }) is called
Then result.score is between 0 and 100 and result.label is one of the 5 descriptive labels
```

**TC-U-025** · Covers: AC-11.4

```
Given emergencyMonths = null (no emergency fund data)
When calcHealthScore({ dti: 20, emergencyMonths: null, housingRatio: 28, savingsRate: 22 }) is called
Then result.missing includes 'emergency' and the remaining weights re-normalize to 1.0
```

**TC-U-026** · Covers: EC-2

```
Given dti = 150 (DTI > 100%)
When calcHealthScore is called
Then dti component score = 0 and result.score < 50
```

**TC-U-027** · Covers: AC-11.1

```
Given perfect inputs (dti=0, emergencyMonths=6, housingRatio=10, savingsRate=30)
When calcHealthScore is called
Then result.label === 'excellent' and result.score >= 90
Given worst-case inputs (dti=100, emergencyMonths=0, housingRatio=60, savingsRate=0)
When calcHealthScore is called
Then result.label === 'critical' and result.score <= 10
```

### Unit Tests — `lib/calculations/projection.ts`

**TC-U-028** · Covers: AC-12.1

```
Given income = 4_000_000/mo, fixedExpenses = 2_000_000/mo, debtObligation = 500_000/mo
When calcProjection(inputs, 12) is called
Then result has 12 entries and all balances are positive (1_500_000 net/mo surplus)
```

**TC-U-029** · Covers: AC-3.2, AC-12.2

```
Given a semiannual income stream of 3_000_000, monthly income = 2_000_000
When calcProjection(inputs, 12) is called
Then months 0 and 6 have balance significantly higher than adjacent months (income spike)
```

**TC-U-030** · Covers: AC-12.3

```
Given monthly deficit of 500_000 (expenses > income starting month 3)
When calcProjection(inputs, 12) is called
Then result.negativeMonths includes the months where projectedBalance < 0
```

**TC-U-031** · Covers: EC-8

```
Given income = 0 and fixedExpenses = 500_000
When calcProjection(inputs, 12) is called
Then all 12 projectedBalances are negative and no NaN or error is thrown
```

### Unit Tests — `lib/calculations/allocation.ts`

**TC-U-032** · Covers: AC-14.3

```
Given allocation { needs: 50, wants: 30, savings: 20 } and totalIncome = 4_000_000
When calcAllocationAmounts(allocation, totalIncome) is called
Then result = { needs: 2_000_000, wants: 1_200_000, savings: 800_000 }
```

**TC-U-033** · Covers: AC-14.1

```
Given needs = 50, wants = 30
When calcSavingsComplement(needs, wants) is called
Then result = 20
```

### Unit Tests — `lib/tax/colombia/retencion.ts`

**TC-U-034** · Covers: AC-2.3

```
Given grossSalary = 5_000_000 COP, with salud (4%) + pensión (4%) deductions only
When calcRetencion(grossSalary, aporteSocial) is called
Then result matches the expected monthly retención under Art. 383 ET UVT 2025 = $49,799
(Expected derived from: base = 5M - 400K = 4.6M; renta exenta min(25% × 4.6M, 240×49_799) = 1_150_000; netBase = 3_450_000 / 49_799 → apply marginal table)
```

**TC-U-035** · Covers: EC-7, AC-2.3

```
Given grossSalary = 1_500_000 COP (below minimum threshold for retención)
When calcRetencion(grossSalary, aporteSocial) is called
Then result = 0 and returns indicator 'below_threshold'
```

**TC-U-036** · Covers: AC-2.3

```
Given grossSalary = 10_000_000 COP
When calcRetencion is called internally
Then the deductible base uses salud(4%) + pensión(4%) = 8% — NOT just pension alone
```

**TC-U-037** · Covers: AC-2.3 (constitution rule: renta exenta cap = 240 UVT)

```
Given grossSalary = 50_000_000 COP (high earner)
When calcRetencion is called
Then renta exenta applied is capped at 240 × 49_799 = 11_951_760 (not 65.833 × 49_799)
```

### Unit Tests — `lib/tax/colombia/presets.ts`

**TC-U-038** · Covers: AC-2.2

```
Given deductions = [] and grossSalary = 5_000_000
When applyColombiaPresets(deductions, grossSalary) is called
Then result has exactly 2 items: Salud 4% and Pensión 4% — no ARL entry
```

**TC-U-039** · Covers: AC-2.2

```
Given deductions already contains Salud (4%)
When applyColombiaPresets(deductions, grossSalary) is called
Then result still has exactly 2 items (idempotent — no Salud duplicate)
```

### Unit Tests — `lib/tax/colombia/prima.ts`

**TC-U-040** · Covers: AC-3.3

```
Given grossSalary = 4_000_000
When calcPrimaServicios(grossSalary) is called
Then result = { amount: 2_000_000, frequency: 'semiannual' }
```

**TC-U-041** · Covers: AC-3.3

```
Given otherStreams already contains a prima de servicios entry
When addPrimaPreset(streams, grossSalary) is called
Then streams length does not increase (idempotent)
```

### Unit Tests — `lib/storage/migrate.ts`

**TC-U-042** · Covers: EC-5

```
Given a valid v1 state payload (fixture: v1-typical.json)
When migrations[2](v1State) is called
Then AppStateSchemaV2.parse(result) succeeds without error
```

**TC-U-043** · Covers: EC-5

```
Given a v1 state with existing IDs
When migrations[2] is applied
Then all IDs in the migrated v2 state are preserved (no regeneration for existing entities)
```

**TC-U-044** · Covers: AC-1.3

```
Given v1 state where income.grossSalary > 0 (user has data)
When migrations[2](v1State) is called
Then result.settings.onboarding.done === true (existing user skips wizard)
```

**TC-U-045** · Covers: AC-3.1

```
Given v1 state with otherStreams entries (no frequency field in v1)
When migrations[2](v1State) is called
Then every migrated stream has frequency === 'monthly'
```

### Unit Tests — `lib/storage/schema.ts` (Zod validation)

**TC-U-046** · Covers: EC-1

```
Given a state payload with income.grossSalary = -500_000
When AppStateSchemaV2.safeParse(payload) is called
Then success === false and error includes 'grossSalary'
```

**TC-U-047** · Covers: AC-14.2

```
Given allocation { needs: 60, wants: 50, savings: 10 } (sum = 120)
When AppStateSchemaV2.safeParse({ ...validBase, allocation }) is called
Then success === false with refinement error 'allocation.sumMustBe100'
```

**TC-U-048** · Covers: AC-15.3

```
Given a JSON string that is not the backup envelope shape (missing 'data' key)
When BackupEnvelopeSchema.safeParse(parsed) is called
Then success === false
```

**TC-U-049** · Covers: AC-15.3

```
Given a valid envelope but schemaVersion = 99 (future unknown version)
When BackupEnvelopeSchema.safeParse(parsed) is called
Then success === false with discriminator error
```

### Unit Tests — `lib/calculations/dti.ts` (debt-free date)

**TC-U-050** · Covers: AC-5.6

```
Given two cards, each with 12-month payoff timeline
When calcDebtFreeDate(cards) is called
Then result is the date of the last card's payoff (max of all timelines)
```

### Unit Tests — variable expense threshold

**TC-U-051** · Covers: AC-8.1

```
Given category { budget: 500_000, spent: 400_000 } (80% threshold)
When calcSpendingStatus(category) is called
Then result === 'amber'
Given spent = 600_000 (> 100%)
Then result === 'red'
Given spent = 300_000 (< 80%)
Then result === 'green'
```

### Unit Tests — `lib/calculations/allocation.ts` (savings rate + excess goals)

**TC-U-052** · Covers: AC-14.1 (savings rate input to health score)

```
Given totalIncome = 4_000_000 and totalSaved = 1_000_000
When calcSavingsRate(totalIncome, totalSaved) is called
Then result = 25 (percent)
```

**TC-U-059** · Covers: AC-7.3, AC-14.4

```
Given totalGoalMonthlyContrib = 1_500_000 and savingsBucket = 800_000
When calcGoalExcess(totalGoalMonthlyContrib, savingsBucket) is called
Then result = 700_000 (excess that should trigger warning)
```

### Unit Tests — `lib/date/month.ts`

**TC-U-053** · Covers: AC-8.4, AC-13.1

```
Given lastMonthSeen = '2026-04' and currentMonth = '2026-05'
When detectMonthRollover(lastMonthSeen, currentMonth) is called
Then result === true (rollover occurred)
```

**TC-U-054** · Covers: AC-13.1

```
Given lastMonthSeen = '2026-05' and currentMonth = '2026-05'
When detectMonthRollover(lastMonthSeen, currentMonth) is called
Then result === false (no rollover)
```

### Unit Tests — snapshot shape

**TC-U-055** · Covers: AC-13.2

```
Given current stores with known values
When buildSnapshot(stores, now) is called
Then result contains: month, capturedAt, netIncome, totalFixedExpenses, totalVariableSpent, totalDebt, dti, savingsRate, netWorth, healthScore
```

### Unit Tests — snapshot cap

**TC-U-056** · Covers: risk mitigation (EC-6 adjacent)

```
Given snapshotsStore has 25 entries
When a new snapshot is appended via the store action
Then snapshots.length === 24 (oldest entry dropped, FIFO cap)
```

### Unit Tests — `lib/calculations/dti.ts` (secondary)

**TC-U-057** · Covers: AC-10.1

```
Given totalIncome = 4_000_000, fixedExpenses = 1_500_000, debtObligations = 500_000
When calcFreeForAllocation(totalIncome, fixedExpenses, debtObligations) is called
Then result = 2_000_000
```

**TC-U-060** · Covers: AC-14.4 (debt consuming savings)

```
Given debtMonthlyObligations = 1_000_000 and savingsBucketAmount = 800_000
When debtExceedsSavings(debtMonthlyObligations, savingsBucketAmount) is called
Then result === true
```

---

### Component Tests (Vitest + @testing-library/vue + createTestingPinia)

**TC-C-001** · Covers: AC-1.1, AC-1.2

```
Given settingsStore = { onboarding: { done: false, currentStep: 0 } } and all other stores empty
When OnboardingWizard mounts
Then step 1 content is visible; StepIndicator shows 1/3; progress bar renders
When the user completes step 1 and clicks "Siguiente"
Then StepIndicator shows 2/3 and progress bar advances
```

**TC-C-002** · Covers: AC-1.3, EC-9

```
Given settingsStore = { onboarding: { done: false, currentStep: 1 } } and incomeStore.grossSalary > 0
When OnboardingWizard mounts
Then step 2 is shown with grossSalary pre-filled (data preserved)
Given settingsStore = { onboarding: { done: true } }
When DashboardView mounts
Then OnboardingWizard is not rendered
```

**TC-C-003** · Covers: AC-1.4

```
Given OnboardingWizard is rendered (done = false)
When the user clicks "Saltar configuración"
Then settingsStore.onboarding.done is set to true via store action
And wizard is unmounted from the DOM
```

**TC-C-004** · Covers: AC-1.5

```
Given OnboardingWizard is on last step (step 3)
When the user clicks "Finalizar"
Then settingsStore.onboarding.done = true
And a success message is visible
And DashboardView is shown with the entered data
```

**TC-C-005** · Covers: AC-1.6, EC-9

```
Given incomeStore has data and settingsStore.onboarding.done = true
When SettingsView renders and the user clicks "Relanzar guía de configuración"
Then settingsStore.onboarding.done is set to false
And incomeStore data is NOT cleared
And router navigates to /onboarding
```

**TC-C-006** · Covers: AC-2.1

```
Given incomeStore.grossSalary = 5_000_000 and a percent deduction { amount: 4, type: 'percent' }
When DeductionRow renders
Then a secondary label shows "200.000 COP" (4% of 5M, formatted with Intl.NumberFormat)
```

**TC-C-007** · Covers: AC-2.2

```
Given incomeStore.deductions = [] and settingsStore.currency = 'COP'
When the "Cargar deducciones Colombia" button is clicked
Then incomeStore.addDeduction is called with Salud 4% and Pensión 4%
And no ARL entry is added
Given Salud already exists in deductions
When the button is clicked again
Then incomeStore.deductions length does not increase (no duplicate Salud)
```

**TC-C-008** · Covers: AC-2.3

```
Given RetentionEstimator renders with grossSalary > threshold
When component mounts
Then a retention amount is shown with a label containing "estimado" (i18n key)
```

**TC-C-009** · Covers: AC-2.5

```
Given IncomeView renders with grossSalary = 3_000_000 and a 4% deduction
When the user changes grossSalary input to 6_000_000 (fires input event)
Then the deduction amount label re-renders to "240.000 COP" without a full page reload
```

**TC-C-010** · Covers: AC-3.1

```
Given IncomeStreamRow renders with { amount: 6_000_000, frequency: 'semiannual' }
When component mounts
Then a secondary label shows "≈ 1.000.000 / mes" (monthly equivalent)
```

**TC-C-011** · Covers: AC-3.3

```
Given incomeStore.otherStreams = [] and incomeStore.grossSalary = 4_000_000 and currency = 'COP'
When the "Cargar prima de servicios" button is clicked
Then otherStreams contains one entry { amount: 2_000_000, frequency: 'semiannual' }
Given that entry already exists
When the button is clicked again
Then otherStreams length is still 1 (idempotent)
```

**TC-C-012** · Covers: AC-4.1, AC-4.2

```
Given FixedExpenseList renders with expenses = []
When the user fills the form (name, amount, category) and submits
Then the new expense appears in the list
And the total expenses label updates immediately
And the "remaining available" label recalculates
```

**TC-C-013** · Covers: AC-4.4

```
Given FixedExpenseList renders with one expense
When the delete button is clicked
Then a ConfirmDialog appears
When the user cancels
Then the expense is still in the list
When the user confirms
Then expensesStore.remove is called and the expense disappears
And the total recalculates
```

**TC-C-014** · Covers: AC-5.1

```
Given CardCard renders with a card { type: 'card', balance: 2_000_000, limit: 5_000_000, apr: 24, minPayment: 100_000 }
When component mounts
Then a utilization bar is visible at 40%
And a payoff timeline shows a positive number of months
```

**TC-C-015** · Covers: AC-5.2

```
Given CardCard renders with { type: 'loan', remainingInstallments: 18 }
When component mounts
Then "18 cuotas restantes" text is visible (not a month timeline)
And no "dueDate" field is rendered
```

**TC-C-016** · Covers: AC-5.7

```
Given cardsStore has a card with dueDate = today + 3 days
When AlertList renders
Then an alert with the card name and minPayment amount is visible
Given dueDate = today + 10 days
When AlertList renders
Then no due-date alert is shown
```

**TC-C-017** · Covers: AC-6.3

```
Given InstallmentList renders with installment { name: 'TV', total: 1_200_000, installments: 12, paid: 4 }
When component mounts
Then "4 / 12" progress text is visible
```

**TC-C-018** · Covers: AC-7.1, AC-7.4

```
Given GoalCard renders with { target: 6_000_000, saved: 3_000_000, monthlyContrib: 500_000 }
When component mounts
Then a progress bar at 50% is visible
And a positive ETA in months is displayed
Given saved = 6_000_000 (equals target)
Then a "completada" indicator is visible
```

**TC-C-019** · Covers: AC-7.3, AC-7.5

```
Given GoalList renders with two goals and totalMonthlyContrib > savingsBucket
When component mounts
Then a warning message about savings overage is visible
When the user drags a goal card to change order
Then goalsStore.reorder action is dispatched with the new priority sequence
```

**TC-C-020** · Covers: AC-8.1, AC-8.2, EC-4

```
Given VariableCategoryCard renders with { budget: 500_000, spent: 0 }
When component mounts
Then the progress bar is green and at 0%
Given spent = 400_000 (80% threshold)
Then bar is amber
Given spent = 600_000 (>100%)
Then bar is red
And AlertList on DashboardView shows a budget-exceeded alert for this category
Given spent = 0 for all categories
Then no overage alert appears in the dashboard alert list
```

**TC-C-021** · Covers: AC-8.3

```
Given the router is on '/dashboard'
When QuickAddFAB renders
Then the FAB button is visible in the DOM
Given the router is on '/debts'
When QuickAddFAB renders
Then the FAB button is not present
When the FAB is clicked (on dashboard)
Then QuickAddPanel appears with category selector and amount input
```

**TC-C-022** · Covers: AC-8.5

```
Given VariableExpensesView renders with totalBudget = 1_000_000 and totalSpent = 1_200_000
When component mounts
Then a summary row shows excess = 200_000 in red styled text
```

**TC-C-023** · Covers: AC-9.1, AC-9.2, AC-9.3

```
Given assetsStore = [] and cardsStore.cards = [{ balance: 3_000_000 }]
When AssetList renders and user adds { name: 'Savings', value: 10_000_000, type: 'savings' }
Then assetsStore total = 10_000_000
When NetWorthBanner renders
Then liabilities section shows 3_000_000 (from card balance, no manual entry)
And net worth banner shows +7_000_000 in green
Given assets total < liabilities total
Then net worth banner shows negative amount in red
```

**TC-C-024** · Covers: AC-10.1, AC-10.2, AC-10.4, AC-12.4, AC-17.5

```
Given DashboardView renders with full store data (income, expenses, cards, goals)
When component mounts
Then all KPI cards are visible: grossSalary, netIncome, fixedExpenses, debtPayments, freeToAllocate, goalMonthly, healthScore
And a donut chart canvas is present in the DOM
And a projection chart canvas is present
And the HealthScore component is more visually prominent than secondary details
Given incomeStore.grossSalary changes
Then the projection chart reactive update is triggered (useDashboardKpis re-computes)
```

**TC-C-025** · Covers: AC-10.3, AC-17.6

```
Given KpiCard renders with { value: 45, type: 'dti', threshold: 36 } (DTI > 36% = risk)
When component mounts
Then the card has an alert color class (amber or red, not green)
And a context text is visible explaining the risk
And a non-color indicator (icon or label) is also present (not color-only, per AC-17.6)
```

**TC-C-026** · Covers: AC-14.1, AC-14.2

```
Given AllocationPanel renders with needs = 50, wants = 30 (savings auto = 20)
When the user changes 'needs' to 60
Then savings auto-updates to 10 without manual input
When the user sets wants = 50 (needs + wants = 110 > 100)
Then the conflicting field turns red and the store action is NOT dispatched
```

**TC-C-027** · Covers: AC-11.2

```
Given HealthScore renders with score = 75 and all 4 component values set
When the user clicks the score
Then a breakdown panel appears listing DTI, Emergency, Housing, Savings
Each with: current value, ideal threshold, and a semaphore status (green/amber/red)
```

**TC-C-028** · Covers: AC-11.3, AC-13.3

```
Given snapshotsStore has two snapshots: month 2026-03 (score=60) and 2026-04 (score=70)
When ComparisonBadge renders on the dashboard
Then it shows "+10" with an upward-arrow indicator
Given only one snapshot exists
Then ComparisonBadge renders nothing (no delta to show)
```

**TC-C-029** · Covers: AC-13.4

```
Given snapshotsStore has snapshots for months: 2026-01, 2026-03, 2026-02
When HistoryView renders
Then snapshots are listed in order: 2026-03, 2026-02, 2026-01 (newest first)
```

**TC-C-030** · Covers: AC-15.1, AC-15.2, AC-15.3

```
Given SettingsView renders with full store data
When the user clicks "Exportar"
Then a file download is triggered with a valid JSON payload matching BackupEnvelopeSchema
When the user imports that same file on an empty store set
Then all store values are restored to match the exported state
When the user imports a malformed JSON file
Then an error message is shown and no store state changes
```

**TC-C-031** · Covers: AC-15.4

```
Given SettingsView renders with non-empty stores
When the user clicks "Reiniciar" and cancels the confirm dialog
Then all stores remain unchanged
When the user clicks "Reiniciar" and confirms
Then all stores are reset to their default states
And the router navigates to /onboarding
```

**TC-C-032** · Covers: AC-16.1, AC-17.3, AC-17.7

```
Given the viewport is set to 375px width
When BottomNav renders
Then all navigation items are visible and not overflowing
And no two elements overlap (verified by bounding-rect queries on each nav item)
When any interactive element receives focus
Then it has a visible focus ring (focus-visible class applied)
```

**TC-C-033** · Covers: AC-16.3, AC-17.2

```
Given ThemeToggle renders with theme = 'light'
When the user clicks the toggle (switching to 'dark')
Then settingsStore.theme is set to 'dark'
And the <html> element has the class 'dark'
And the Chart.js chart options (via useChartTheme) include non-white background colors
```

**TC-C-034** · Covers: AC-17.8, AC-17.10

```
Given ExpensesView renders with expensesStore = []
When the component mounts
Then an EmptyState component is rendered with a message and an icon
And a call-to-action button (e.g., "+ Agregar primer gasto") is visible
Given a Tooltip renders near the bottom-right of a 375px viewport
When the tooltip opens
Then its bounding rect is fully within the viewport (no clipping)
```

---

### E2E Tests (Playwright)

**TC-E-001** · Covers: AC-1.1, AC-1.5, AC-10.1

```
Given a fresh browser session (localStorage empty)
When the user navigates to the app
Then the onboarding wizard is shown (step 1: income)
When the user fills grossSalary and clicks "Siguiente" through all 3 steps
Then the dashboard is shown with the entered data reflected in KPI cards
```

**TC-E-002** · Covers: AC-1.3, AC-17.9

```
Given a returning user (localStorage has saved state with schemaVersion = 2)
When the user navigates to the app
Then the onboarding wizard is NOT shown and the dashboard loads directly
And the section transition (if navigating between sections) has no layout flash
```

**TC-E-003** · Covers: AC-8.3

```
Given the user is on the Dashboard with at least one variable category in the store
When the user clicks the FAB button
Then a quick-add panel appears
When the user selects a category and enters an amount and submits
Then the panel closes and the category's spent amount is updated
```

**TC-E-004** · Covers: AC-15.1, AC-15.2

```
Given the user has income, 2 cards, 3 expenses, and 1 goal in the store
When the user navigates to Settings and clicks "Exportar"
Then a JSON file is downloaded
When the user clears localStorage and imports the downloaded file
Then all data is restored: same counts of cards, expenses, goals, and same grossSalary
```

**TC-E-005** · Covers: AC-5.1, AC-5.3

```
Given the user adds a card { name: 'VISA', balance: 5_000_000, apr: 30, minPayment: 200_000 }
When the card detail view shows
Then a payoff timeline in months is displayed
When the user enters extraPayment = 100_000 in the PayoffSimulator
Then "months saved" and "interest saved" amounts update in real-time
```

**TC-E-006** · Covers: AC-16.4

```
Given the app is in Spanish (default)
When the user clicks the language toggle to English
Then all visible text changes to English: navigation labels, form placeholders, button text, section headings
When the user switches back to Spanish
Then all text reverts to Spanish
```

**TC-E-007** · Covers: AC-13.1

```
Given settingsStore.lastMonthSeen = '2026-04' and the real date is in '2026-05'
When the user opens the app
Then a non-blocking toast appears confirming the April snapshot was saved
And snapshotsStore has a new entry for month '2026-04'
And lastMonthSeen is updated to '2026-05'
```

**TC-E-008** · Covers: AC-16.3, AC-17.1, AC-17.2, AC-17.4

```
Given the app is loaded in light mode
When the user toggles to dark mode
Then all sections (dashboard, income, expenses, debts, goals, variable, networth) have no white-background chart canvases
And an axe-core accessibility scan reports 0 color-contrast violations
When viewport is resized to 768px then to 1280px
Then no horizontal overflow is detected on any section (scrollWidth <= viewportWidth)
```

**TC-E-009** · Covers: AC-16.2

```
Given the user opens the income form
When the user presses Tab repeatedly from the first input
Then focus moves sequentially through grossSalary input, deduction fields, add-deduction button, and section navigation
And a visible focus indicator is present at each focused element (CSS outline not 0)
When the user presses Enter on the "Calcular retención" button
Then the retention calculation fires without mouse interaction
```

---

## Mocking Strategy

| Dependency                            | Strategy                                                 | Justification                                                                                                                                                                                |
| ------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `localStorage`                        | **Real** (`jsdom` provides it)                           | Unit and component tests run in `jsdom`; real storage avoids false-positive mocks. Reset via `localStorage.clear()` in `beforeEach`.                                                         |
| Pinia stores in `lib/*` unit tests    | **Not needed** — `lib/*` is pure and never imports Pinia | Constitution rule: `lib/calculations/` and `lib/tax/` MUST have zero framework imports.                                                                                                      |
| Pinia stores in component tests       | **`createTestingPinia(initialState)`**                   | Constitution rule: "SHOULD use `createTestingPinia()` for component tests." Avoids coupling component tests to store action implementation.                                                  |
| `crypto.randomUUID()`                 | **Real** (available in `jsdom` / Node 20)                | No need to mock. Tests that assert a stable ID shape use `expect(id).toMatch(/^[0-9a-f-]{36}$/)`.                                                                                            |
| `Date` / current month                | **Stub via `vi.setSystemTime()`**                        | TC-U-053, TC-U-054, TC-E-007 require a deterministic "current month." `vi.useFakeTimers()` + `afterEach(vi.useRealTimers)` pattern.                                                          |
| Chart.js canvas rendering             | **Mock `getContext` via `vi.stubGlobal`**                | `jsdom` does not implement canvas 2D rendering; Chart.js calls `canvas.getContext('2d')`. Mock prevents errors, avoids testing Chart.js internals (already covered by Chart.js's own tests). |
| Vue Router                            | **Real `createRouter(createMemoryHistory())`**           | Component tests that need route-awareness (QuickAddFAB, router guard) use an in-memory router — no browser navigation needed.                                                                |
| `@sentry/vue`                         | **Stub (`vi.mock('@sentry/vue')`)**                      | Sentry is error-reporting infrastructure; its behavior is not a feature to test. Stub prevents network calls in CI.                                                                          |
| `pino` logger                         | **Stub in component/unit**                               | Logger is a side-effect dependency; stub silences test output and prevents CI interference.                                                                                                  |
| File download (`URL.createObjectURL`) | **Mock in TC-C-030 + TC-E-004**                          | `jsdom` doesn't implement object URLs. In component test: mock and assert `URL.createObjectURL` called with a Blob. E2E uses Playwright's download listener.                                 |
| Playwright browser                    | **Real Chromium (headless)**                             | E2E tests run against the full Vite-served app. No mocks. All stores populated through the UI.                                                                                               |

---

## Performance

The app is a client-side-only SPA with no network requests (all data is `localStorage`). Classic web performance metrics (TTFB, API latency) are not applicable. The performance concerns are:

1. **Initial bundle size** — Vitest does not measure bundle size; Vite's build stats (`vite build --report`) should be checked manually during the final `/sdd.review` phase. Target: JS < 250 KB gzipped (Chart.js ~50 KB + Vue + Pinia + Tailwind).

2. **Render performance on large data sets** — Pure function perf is covered by unit test speed (Vitest reports per-test time). Any test taking > 50 ms is a flag. The projection calculation (`calcProjection`) for 12 months with complex store is the most CPU-intensive; TC-U-028 through TC-U-031 will surface any O(n²) regression.

3. **`localStorage` write debounce** — The 300 ms debounce in `useAppStorage` means saves are batched. No performance test is written for this; the behavior is exercised by TC-C-030 (import flow hits the watcher). If the watcher fires synchronously under high mutation load, TC-U-056 (cap logic) would fail if the cap runs more than once per tick.

4. **Chart.js re-render frequency** — TC-C-024 and TC-C-033 assert that chart canvas elements update reactively; if they fire on every keystroke due to a missing `computed` memoization, it would show as excessive DOM mutations. This is caught by the component tests' absence of `await nextTick()` loops.

No dedicated load or stress tests are planned for v1 (single-user, local-only app).

---

## Security

The app stores personal financial data locally; no server communication exists. Security testing scope is therefore limited but non-trivial:

1. **XSS via user input** — Constitution forbids `v-html` with dynamic content. TC-C-006 (DeductionRow renders user-provided label) uses `{{ }}` interpolation (Vue escapes by default). Manual assertion: search for `v-html` in the codebase returns zero results (`grep -r 'v-html' src/`) before sign-off.

2. **Import file injection** — AC-15.3 tests that an invalid import file does not crash the app or execute arbitrary code. TC-U-048 / TC-U-049 assert Zod rejects malformed payloads before they touch any store. Since the import is `JSON.parse` only (no `eval`), no code execution is possible. Edge case: a JSON file with a 10 MB `grossSalary` string is caught by `z.number()` type assertion in the schema.

3. **localStorage data leakage** — Data never leaves the browser. Sentry is initialized only when `VITE_SENTRY_DSN` is set (environment variable absent in default dev); even then, pino log level is `'warn'` in production and store state is never passed to Sentry (enforced by the forbidden list in the constitution). No financial fields are added to Sentry event context.

4. **Dependency audit** — `npm audit` is run as part of CI on every push. The team (solo) accepts `moderate` advisories for devDependencies; `high` / `critical` in runtime deps block merge. Chart.js, Zod, Vue, Pinia, and VueUse have excellent security track records; Sentry SDK is excluded from audit blocking (it patches its own CVEs promptly).

5. **Colombian tax constants** — Not a runtime security concern, but accuracy is a legal concern. TC-U-034 through TC-U-037 serve as regression tests that the tax calculation matches known legal values. A wrong retención estimate could cause financial harm; the 80% coverage gate on `lib/tax/` is part of the security posture.

6. **Crypto ID generation** — `crypto.randomUUID()` is used for all entity IDs per constitution. No sequential or predictable IDs. This matters for localStorage uniqueness (prevent accidental key collision on import).

---

## Sign-off

<!-- mode=solo -->

- [x] Author: `Johann Medina` — `2026-05-15`
