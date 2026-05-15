# Tasks: Personal Finance Dashboard — Edición Profesional

> [Spec](./1-spec.md) · [Plan](./2-plan.md) · [Test Plan](./3-test-plan.md)
> Mode: `solo` · Generated: `2026-05-15`

## Legend

| Symbol       | Meaning                                                                                                        |
| ------------ | -------------------------------------------------------------------------------------------------------------- |
| **Type**     | `setup` · `test` · `impl` · `refactor` · `docs`                                                                |
| **Layer**    | `domain` (lib/\*) · `app` (composables, stores, views, components) · `infra` (router, i18n, storage) · `cross` |
| **Size**     | `S` < 2 h · `M` < 1 day · **`L` PROHIBITED**                                                                   |
| **Parallel** | tasks that share no deps and don't touch the same files                                                        |
| **Covers**   | AC and TC IDs this task satisfies                                                                              |

> **Read order during `/sdd.implement`:** tests come before their impls (Deps enforce it). Within a cluster, write the test first, watch it fail, then implement.

---

## Tasks

### T-001 — Setup: project scaffolding

- **Type:** setup · **Layer:** cross · **Deps:** — · **Parallel:** no · **Size:** M
- **Covers:** —
- **DoD:**
  - [ ] `package.json` with all deps from `2-plan.md#Dependencies` pinned at the specified versions
  - [ ] `vite.config.ts` (Vue plugin + Tailwind v4 plugin), `tsconfig.json` (strict mode), `vitest.config.ts` (jsdom env), `playwright.config.ts`
  - [ ] `eslint.config.ts` with `@vue/eslint-config-typescript`; `.prettierrc`; `husky` + `lint-staged` pre-commit hook
  - [ ] Folder structure created: `src/{views,components,composables,stores,lib,router,i18n}`, `tests/{unit,component}`, `e2e/`, `public/`
  - [ ] `index.html` boots `src/main.ts` (placeholder app)
  - [ ] Coverage thresholds wired in `vitest.config.ts`: 80% on `src/lib/calculations` and `src/lib/tax`; 60% overall
  - [ ] `npm test`, `npm run lint`, `npm run typecheck`, `vite build` all run cleanly with zero tests
  - [ ] Old `server.js`, `app.js`, `style.css` left in place (removed by T-088 after parity verified)

---

### T-002 — Test: `lib/currency/format` · foundational

- **Type:** test · **Layer:** domain · **Deps:** T-001 · **Parallel:** yes (T-004) · **Size:** S
- **Covers:** — (supports AC-2.x, AC-14.3, AC-15.2 indirectly)
- **DoD:**
  - [ ] `tests/unit/currency/format.test.ts` asserts `formatCurrency(1234567, 'COP')` returns "$1.234.567" (0 decimals)
  - [ ] Asserts `'USD'` uses 2 decimals; `'CLP'` uses 0 decimals
  - [ ] Asserts `getCurrencyConfig('COP')` returns `{ locale: 'es-CO', decimals: 0, symbol: '$' }`
  - [ ] Tests FAIL — no impl yet

---

### T-003 — Impl: `lib/currency/format.ts`

- **Type:** impl · **Layer:** domain · **Deps:** T-002 · **Parallel:** no · **Size:** S
- **Covers:** AC-2.1 (foundational currency display; reused by every money-displaying AC)
- **DoD:**
  - [ ] `getCurrencyConfig(code)` returns the per-currency decimal/locale/symbol triple
  - [ ] `formatCurrency(amount, code, opts?)` uses `Intl.NumberFormat` (constitution rule: no `.toFixed`)
  - [ ] T-002 tests pass
  - [ ] Zero imports of Vue, Pinia, VueUse (constitution: lib/\* purity)

---

### T-004 — Test: `lib/date/month`

- **Type:** test · **Layer:** domain · **Deps:** T-001 · **Parallel:** yes (T-002) · **Size:** S
- **Covers:** AC-8.4, AC-13.1 · TC-U-053, TC-U-054
- **DoD:**
  - [ ] `tests/unit/date/month.test.ts` with TC-U-053 (`'2026-04' → '2026-05'` returns `true`) and TC-U-054 (same month returns `false`)
  - [ ] Test for `formatYearMonth(date)` returning `"YYYY-MM"`
  - [ ] Tests FAIL — no impl yet

---

### T-005 — Impl: `lib/date/month.ts`

- **Type:** impl · **Layer:** domain · **Deps:** T-004 · **Parallel:** no · **Size:** S
- **Covers:** AC-8.4, AC-13.1
- **DoD:**
  - [ ] `detectMonthRollover(lastMonthSeen, currentMonth)` returns boolean
  - [ ] `formatYearMonth(date)` returns `"YYYY-MM"` ISO string
  - [ ] T-004 tests pass; lib purity preserved

---

### T-006 — Test: `lib/tax/colombia/retencion` (Art. 383 ET)

- **Type:** test · **Layer:** domain · **Deps:** T-001 · **Parallel:** yes (T-008, T-010..T-034 test tasks) · **Size:** S
- **Covers:** AC-2.3, EC-7 · TC-U-034, TC-U-035, TC-U-036, TC-U-037
- **DoD:**
  - [ ] Golden test fixtures for grossSalary = 1.5M (below threshold), 5M (mid bracket), 10M (verify salud+pensión base), 50M (verify 240 UVT cap)
  - [ ] TC-U-034..037 implemented; each expected value derived from UVT 2025 = $49,799 with inline legal-source comments
  - [ ] Tests FAIL — no impl yet

---

### T-007 — Impl: `lib/tax/colombia/{constants,retencion}.ts`

- **Type:** impl · **Layer:** domain · **Deps:** T-006 · **Parallel:** no · **Size:** M
- **Covers:** AC-2.3, EC-7
- **DoD:**
  - [ ] `constants.ts` exports `UVT_2025 = 49_799` with comment citing Resolución DIAN 000187/2024
  - [ ] `retencion.ts` implements Art. 383 ET marginal table; base = grossSalary − salud(4%) − pensión(4%) − min(25% × ingresoNominal, 240 × UVT)
  - [ ] Returns `{ amount, label: 'estimado', belowThreshold: boolean }`
  - [ ] T-006 tests all GREEN
  - [ ] No ARL anywhere in this file (constitution rule)

---

### T-008 — Test: `lib/tax/colombia/{presets,prima}.ts`

- **Type:** test · **Layer:** domain · **Deps:** T-001 · **Parallel:** yes (T-006, T-010..T-034) · **Size:** S
- **Covers:** AC-2.2, AC-3.3 · TC-U-038, TC-U-039, TC-U-040, TC-U-041
- **DoD:**
  - [ ] `tests/unit/tax/colombia/presets.test.ts` covers TC-U-038 (no ARL, only Salud + Pensión), TC-U-039 (idempotent)
  - [ ] `tests/unit/tax/colombia/prima.test.ts` covers TC-U-040 (half salary, semiannual), TC-U-041 (idempotent)
  - [ ] Tests FAIL

---

### T-009 — Impl: `lib/tax/colombia/{presets,prima}.ts`

- **Type:** impl · **Layer:** domain · **Deps:** T-008 · **Parallel:** no · **Size:** S
- **Covers:** AC-2.2, AC-3.3
- **DoD:**
  - [ ] `applyColombiaPresets(deductions, gross)` inserts Salud 4% + Pensión 4% (percent type); skips Salud or Pensión if already present
  - [ ] `addPrimaPreset(streams, gross)` adds entry `{ amount: gross/2, frequency: 'semiannual' }`; idempotent by label match
  - [ ] T-008 tests GREEN

---

### T-010 — Test: `lib/calculations/net-income`

- **Type:** test · **Layer:** domain · **Deps:** T-001 · **Parallel:** yes (others under T-001) · **Size:** S
- **Covers:** AC-2.1, AC-2.4, AC-2.5, EC-1 · TC-U-001, TC-U-002, TC-U-003, TC-U-004
- **DoD:**
  - [ ] Tests for fixed deduction, percent deduction, nonSalaryBenefit added after deductions, zero gross safe
  - [ ] Tests FAIL

---

### T-011 — Impl: `lib/calculations/net-income.ts`

- **Type:** impl · **Layer:** domain · **Deps:** T-010 · **Parallel:** no · **Size:** S
- **Covers:** AC-2.1, AC-2.4, AC-2.5, EC-1
- **DoD:**
  - [ ] `calcNetSalary({ grossSalary, deductions, nonSalaryBenefits })` returns `max(0, gross − deductions) + benefits`
  - [ ] Percent deductions calc against gross only (not benefits)
  - [ ] T-010 tests GREEN

---

### T-012 — Test: `lib/calculations/frequency`

- **Type:** test · **Layer:** domain · **Deps:** T-001 · **Parallel:** yes · **Size:** S
- **Covers:** AC-3.1, AC-3.2 · TC-U-005, TC-U-006, TC-U-007
- **DoD:**
  - [ ] Tests for monthly, semiannual, annual, quarterly equivalents
  - [ ] `getProjectionMonthsForStream(stream, 0, 12)` returns correct index array for each frequency
  - [ ] Tests FAIL

---

### T-013 — Impl: `lib/calculations/frequency.ts`

- **Type:** impl · **Layer:** domain · **Deps:** T-012 · **Parallel:** no · **Size:** S
- **Covers:** AC-3.1, AC-3.2
- **DoD:**
  - [ ] `calcMonthlyEquivalent(stream)` divides by 12/4/2/1 depending on frequency
  - [ ] `getProjectionMonthsForStream` returns indices `[0, 3, 6, 9]` for quarterly, `[0, 6]` for semiannual, etc.
  - [ ] T-012 tests GREEN

---

### T-014 — Test: `lib/calculations/housing-ratio`

- **Type:** test · **Layer:** domain · **Deps:** T-001 · **Parallel:** yes · **Size:** S
- **Covers:** AC-4.3 · TC-U-008, TC-U-058
- **DoD:**
  - [ ] Test for ratio with housing-category expense; test for no housing entry returns 0; test for zero income safe
  - [ ] Tests FAIL

---

### T-015 — Impl: `lib/calculations/housing-ratio.ts`

- **Type:** impl · **Layer:** domain · **Deps:** T-014 · **Parallel:** no · **Size:** S
- **Covers:** AC-4.3
- **DoD:**
  - [ ] `calcHousingRatio(expenses, totalIncome)` sums housing-category expense and divides by income, returns percentage; safe on zero
  - [ ] T-014 tests GREEN

---

### T-016 — Test: `lib/calculations/amortization`

- **Type:** test · **Layer:** domain · **Deps:** T-001 · **Parallel:** yes · **Size:** S
- **Covers:** AC-5.1, AC-5.2, AC-5.3, EC-10 · TC-U-009, TC-U-010, TC-U-011, TC-U-012
- **DoD:**
  - [ ] Tests for card timeline (positive APR), loan timeline (uses remainingInstallments), extra-payment impact (months + interest saved), zero APR (no division-by-zero)
  - [ ] Tests FAIL

---

### T-017 — Impl: `lib/calculations/amortization.ts`

- **Type:** impl · **Layer:** domain · **Deps:** T-016 · **Parallel:** no · **Size:** M
- **Covers:** AC-5.1, AC-5.2, AC-5.3, EC-10
- **DoD:**
  - [ ] `calcDebtTimeline(card)` returns `{ months, totalInterest, type }` using standard amortization formula
  - [ ] `calcExtraPaymentImpact(card, extra)` returns `{ monthsSaved, interestSaved }`
  - [ ] Zero APR uses simple division (no NaN)
  - [ ] T-016 tests GREEN

---

### T-018 — Test: `lib/calculations/payoff-strategy`

- **Type:** test · **Layer:** domain · **Deps:** T-001 · **Parallel:** yes · **Size:** S
- **Covers:** AC-5.4, AC-5.5 · TC-U-013, TC-U-014
- **DoD:**
  - [ ] Tests for `sortByAvalanche` (descending APR) and `sortBySnowball` (ascending balance)
  - [ ] Tests FAIL

---

### T-019 — Impl: `lib/calculations/payoff-strategy.ts`

- **Type:** impl · **Layer:** domain · **Deps:** T-018 · **Parallel:** no · **Size:** S
- **Covers:** AC-5.4, AC-5.5
- **DoD:**
  - [ ] Pure sort functions returning new arrays (no mutation of input)
  - [ ] T-018 tests GREEN

---

### T-020 — Test: `lib/calculations/dti`

- **Type:** test · **Layer:** domain · **Deps:** T-001 · **Parallel:** yes · **Size:** S
- **Covers:** AC-5.6, AC-10.1, EC-2 · TC-U-015, TC-U-016, TC-U-050, TC-U-057
- **DoD:**
  - [ ] Tests for typical DTI, DTI > 100%, debt-free date (max of card timelines), free-for-allocation
  - [ ] Tests FAIL

---

### T-021 — Impl: `lib/calculations/dti.ts`

- **Type:** impl · **Layer:** domain · **Deps:** T-017, T-020 · **Parallel:** no · **Size:** S
- **Covers:** AC-5.6, AC-10.1, EC-2
- **DoD:**
  - [ ] `calcDTI(obligations, income)` returns percentage (uncapped)
  - [ ] `calcDebtFreeDate(cards)` uses `calcDebtTimeline` per card and returns max
  - [ ] `calcFreeForAllocation(income, fixed, debt)` returns difference
  - [ ] T-020 tests GREEN

---

### T-022 — Test: `lib/calculations/installments`

- **Type:** test · **Layer:** domain · **Deps:** T-001 · **Parallel:** yes · **Size:** S
- **Covers:** AC-6.1, AC-6.2 · TC-U-017, TC-U-018
- **DoD:**
  - [ ] Tests for installment monthly amount and total card obligation (minPayment + installment sum)
  - [ ] Tests FAIL

---

### T-023 — Impl: `lib/calculations/installments.ts`

- **Type:** impl · **Layer:** domain · **Deps:** T-022 · **Parallel:** no · **Size:** S
- **Covers:** AC-6.1, AC-6.2
- **DoD:**
  - [ ] `calcInstallmentMonthly({ total, installments })` returns total / installments
  - [ ] `calcCardObligation(card)` sums minPayment + active installments
  - [ ] T-022 tests GREEN

---

### T-024 — Test: `lib/calculations/goals`

- **Type:** test · **Layer:** domain · **Deps:** T-001 · **Parallel:** yes · **Size:** S
- **Covers:** AC-7.1, AC-7.2, EC-3 · TC-U-019, TC-U-020, TC-U-021
- **DoD:**
  - [ ] Tests for ETA from monthly contribution, required monthly from target date, past target date (`overdue` flag)
  - [ ] Tests FAIL

---

### T-025 — Impl: `lib/calculations/goals.ts`

- **Type:** impl · **Layer:** domain · **Deps:** T-024 · **Parallel:** no · **Size:** S
- **Covers:** AC-7.1, AC-7.2, EC-3
- **DoD:**
  - [ ] `calcGoalETA(goal)` returns `{ months, estimatedDate, overdue }`
  - [ ] `calcRequiredMonthly(goal)` from target date
  - [ ] T-024 tests GREEN

---

### T-026 — Test: `lib/calculations/net-worth`

- **Type:** test · **Layer:** domain · **Deps:** T-001 · **Parallel:** yes · **Size:** S
- **Covers:** AC-9.3, AC-9.4 · TC-U-022, TC-U-023
- **DoD:**
  - [ ] Tests for positive net worth, negative net worth (not clamped)
  - [ ] Tests FAIL

---

### T-027 — Impl: `lib/calculations/net-worth.ts`

- **Type:** impl · **Layer:** domain · **Deps:** T-026 · **Parallel:** no · **Size:** S
- **Covers:** AC-9.3, AC-9.4
- **DoD:**
  - [ ] `calcNetWorth(assets, cards)` returns `sum(assets.value) − sum(cards.balance)`; can be negative
  - [ ] T-026 tests GREEN

---

### T-028 — Test: `lib/calculations/projection`

- **Type:** test · **Layer:** domain · **Deps:** T-001 · **Parallel:** yes · **Size:** S
- **Covers:** AC-12.1, AC-12.2, AC-12.3, EC-8 · TC-U-028, TC-U-029, TC-U-030, TC-U-031
- **DoD:**
  - [ ] Tests for positive 12-month balance, income peaks at semiannual months, negativeMonths flagged, zero-income (all negative) safe
  - [ ] Tests FAIL

---

### T-029 — Impl: `lib/calculations/projection.ts`

- **Type:** impl · **Layer:** domain · **Deps:** T-013, T-028 · **Parallel:** no · **Size:** M
- **Covers:** AC-12.1, AC-12.2, AC-12.3, EC-8
- **DoD:**
  - [ ] `calcProjection({ income, streams, fixedExpenses, debtObligation }, monthsAhead)` returns array of `{ month, projectedBalance }`
  - [ ] Non-monthly streams placed at correct indices via `getProjectionMonthsForStream`
  - [ ] Returns `negativeMonths: number[]` array
  - [ ] T-028 tests GREEN

---

### T-030 — Test: `lib/calculations/allocation`

- **Type:** test · **Layer:** domain · **Deps:** T-001 · **Parallel:** yes · **Size:** S
- **Covers:** AC-14.1, AC-14.3, AC-14.4 · TC-U-032, TC-U-033, TC-U-052, TC-U-059, TC-U-060
- **DoD:**
  - [ ] Tests for amounts from percentages, savings auto-complement, savings-rate, goal-excess, debt-exceeds-savings
  - [ ] Tests FAIL

---

### T-031 — Impl: `lib/calculations/allocation.ts`

- **Type:** impl · **Layer:** domain · **Deps:** T-030 · **Parallel:** no · **Size:** S
- **Covers:** AC-14.1, AC-14.3, AC-14.4
- **DoD:**
  - [ ] `calcAllocationAmounts(allocation, totalIncome)` returns `{ needs, wants, savings }` in money
  - [ ] `calcSavingsComplement(needs, wants)` = `100 − needs − wants`
  - [ ] `calcSavingsRate`, `calcGoalExcess`, `debtExceedsSavings` implemented
  - [ ] T-030 tests GREEN

---

### T-032 — Test: `lib/calculations/health-score` + `lib/health/thresholds`

- **Type:** test · **Layer:** domain · **Deps:** T-001 · **Parallel:** yes · **Size:** S
- **Covers:** AC-11.1, AC-11.2, AC-11.4, EC-2 · TC-U-024, TC-U-025, TC-U-026, TC-U-027
- **DoD:**
  - [ ] Tests for full inputs, missing emergency (re-normalize), DTI>100% component=0, label boundaries (excellent/critical)
  - [ ] Tests FAIL

---

### T-033 — Impl: `lib/calculations/health-score.ts` + `lib/health/thresholds.ts`

- **Type:** impl · **Layer:** domain · **Deps:** T-032 · **Parallel:** no · **Size:** M
- **Covers:** AC-11.1, AC-11.2, AC-11.4, EC-2
- **DoD:**
  - [ ] `thresholds.ts` exports DTI/emergency/housing/savings thresholds with CFPB source comments
  - [ ] `calcHealthScore({ dti, emergencyMonths, housingRatio, savingsRate })` returns `{ score, label, components: { dti, emergency, housing, savings }, missing: string[] }`
  - [ ] Weights: DTI 35, Emergency 30, Housing 20, Savings 15 (per AC-11.2); re-normalize when `missing.length > 0` (ADR-6)
  - [ ] Label boundaries: critical (0–20), at-risk (21–40), regular (41–60), good (61–80), excellent (81–100)
  - [ ] T-032 tests GREEN

---

### T-034 — Test: `lib/calculations/variable-expenses`

- **Type:** test · **Layer:** domain · **Deps:** T-001 · **Parallel:** yes · **Size:** S
- **Covers:** AC-8.1 · TC-U-051
- **DoD:**
  - [ ] Tests for `calcSpendingStatus` returning 'green'/'amber'/'red' at the documented thresholds
  - [ ] Tests FAIL

---

### T-035 — Impl: `lib/calculations/variable-expenses.ts`

- **Type:** impl · **Layer:** domain · **Deps:** T-034 · **Parallel:** no · **Size:** S
- **Covers:** AC-8.1
- **DoD:**
  - [ ] `calcSpendingStatus({ budget, spent })` returns `'green' | 'amber' | 'red'` (80% / 100% breakpoints)
  - [ ] T-034 tests GREEN

---

### T-036 — Test: `lib/storage/{schema,backup}`

- **Type:** test · **Layer:** domain · **Deps:** T-001 · **Parallel:** yes · **Size:** S
- **Covers:** AC-14.2, AC-15.3, EC-1 · TC-U-046, TC-U-047, TC-U-048, TC-U-049
- **DoD:**
  - [ ] Tests for negative-money rejection, allocation-sum-not-100 refinement error, invalid-envelope rejection, future-schema-version rejection
  - [ ] Tests FAIL

---

### T-037 — Impl: `lib/storage/{schema,backup,keys}.ts`

- **Type:** impl · **Layer:** domain · **Deps:** T-036 · **Parallel:** no · **Size:** M
- **Covers:** AC-14.2, AC-15.3, EC-1
- **DoD:**
  - [ ] `schema.ts` exports `AppStateSchemaV2` (Zod) per `2-data-model.md` plus `z.infer` types
  - [ ] `backup.ts` exports `BackupEnvelopeSchema` (discriminated by `schemaVersion`) + `serialize(state)` / `parseBackup(json)`
  - [ ] `keys.ts` exports `STORAGE_KEY = 'finance_app_data'`, `BACKUP_KEY = 'finance_app_data_v1_backup'`
  - [ ] T-036 tests GREEN

---

### T-038 — Test: `lib/storage/migrate` (v1 → v2) + `lib/calculations/snapshot`

- **Type:** test · **Layer:** domain · **Deps:** T-037 · **Parallel:** no · **Size:** S
- **Covers:** AC-1.3, AC-3.1, AC-13.2, EC-5 · TC-U-042, TC-U-043, TC-U-044, TC-U-045, TC-U-055, TC-U-056
- **DoD:**
  - [ ] Fixtures `tests/fixtures/{v1-empty,v1-typical,v1-with-loans,v1-corrupt-allocation}.json`
  - [ ] Tests assert: migrated state parses against `AppStateSchemaV2`, IDs preserved, `onboarding.done=true` when v1 has data, streams default to `frequency='monthly'`
  - [ ] TC-U-055: `buildSnapshot(stores, now)` returns the documented 10-field shape (month, capturedAt, netIncome, totalFixedExpenses, totalVariableSpent, totalDebt, dti, savingsRate, netWorth, healthScore)
  - [ ] TC-U-056: `applySnapshotCap(snapshots)` drops oldest entries beyond 24 (FIFO)
  - [ ] Tests FAIL

---

### T-039 — Impl: `lib/storage/migrate.ts` + `lib/calculations/snapshot.ts`

- **Type:** impl · **Layer:** domain · **Deps:** T-038 · **Parallel:** no · **Size:** M
- **Covers:** AC-1.3, AC-3.1, AC-13.2, EC-5
- **DoD:**
  - [ ] `migrations: Record<number, (s: any) => any>` per ADR-4
  - [ ] `migrations[2]` maps v1 → v2 per the table in `2-data-model.md`
  - [ ] `migrate(state)` chains all applicable migrations and returns final state + writes v1 backup on first migration
  - [ ] `lib/calculations/snapshot.ts` exports `buildSnapshot(inputs, now)` and `applySnapshotCap(snapshots, max=24)`
  - [ ] T-038 tests GREEN

---

### T-040 — Impl: `lib/storage/useAppStorage`

- **Type:** impl · **Layer:** infra · **Deps:** T-036, T-038, T-039 · **Parallel:** no · **Size:** S
- **Covers:** EC-6 (storage cap exercised in T-038)
- **DoD:**
  - [ ] Reads `STORAGE_KEY`, runs `migrate()`, parses with `AppStateSchemaV2.safeParse`
  - [ ] On parse failure → does NOT silently overwrite; surfaces error to caller for recovery flow
  - [ ] Writes wrapped in `try/catch` for `QuotaExceededError`; emits non-blocking error event without losing in-memory state
  - [ ] Debounced (300 ms) write via VueUse `watchDebounced` over all stores

---

### T-041 — Setup: i18n setup (`vue-i18n`)

- **Type:** setup · **Layer:** infra · **Deps:** T-001 · **Parallel:** yes (T-042) · **Size:** S
- **Covers:** AC-16.4 (keys; switching is verified by TC-E-006)
- **DoD:**
  - [ ] `src/i18n/index.ts` creates `vue-i18n` instance with `legacy: false`, `globalInjection: true`
  - [ ] `src/i18n/es.json` and `src/i18n/en.json` contain all keys referenced in views (initial scaffold; populated as views are built)
  - [ ] Helper script `scripts/i18n-check.ts` verifies every key exists in both files

---

### T-042 — Setup: router + guards

- **Type:** setup · **Layer:** infra · **Deps:** T-001 · **Parallel:** yes (T-041) · **Size:** S
- **Covers:** AC-1.3, AC-17.9 (route guards + transition wrappers)
- **DoD:**
  - [ ] 11 routes registered: /, /onboarding, /income, /expenses, /debts, /goals, /variable, /networth, /allocation, /history, /settings
  - [ ] `beforeEach` guard redirects to /onboarding when `settingsStore.onboarding.done === false` and route !== /onboarding (ADR-9)
  - [ ] `<RouterView>` wrapped with `<Transition>` for AC-17.9

---

### T-043 — Impl: `settingsStore` + `incomeStore`

- **Type:** impl · **Layer:** app · **Deps:** T-009, T-011, T-040, T-055, T-057 · **Parallel:** yes (T-044..T-047) · **Size:** S
- **Covers:** AC-1.4, AC-1.5, AC-1.6, AC-2.x, AC-3.1, AC-16.3, AC-16.4 (state shape)
- **DoD:**
  - [ ] `settingsStore` (setup-style, ADR-1) with state from `SettingsSchema` and actions: `setLang`, `setCurrency`, `setTheme`, `setPayoffMethod`, `setOnboardingDone`, `bumpOnboardingStep`, `setLastMonthSeen`
  - [ ] `incomeStore` with `addDeduction`, `removeDeduction`, `updateDeduction`, `addStream`, `removeStream`, `addBenefit`, etc. — every mutating action parses input via Zod (constitution rule)
  - [ ] Actions return new entities with `crypto.randomUUID()` IDs

---

### T-044 — Impl: `expensesStore` + `variableExpensesStore`

- **Type:** impl · **Layer:** app · **Deps:** T-040, T-059, T-065 · **Parallel:** yes (T-043, T-045..T-047) · **Size:** S
- **Covers:** AC-4.1, AC-4.4, AC-8.1, AC-8.3, AC-8.4 (state)
- **DoD:**
  - [ ] `expensesStore` with `add`, `remove`, `update` actions; Zod parse at boundary
  - [ ] `variableExpensesStore` with `add`, `remove`, `recordSpending`, `resetAllSpent` (used by T-077)
  - [ ] Both use `crypto.randomUUID()`

---

### T-045 — Impl: `cardsStore` (with installments)

- **Type:** impl · **Layer:** app · **Deps:** T-040, T-061 · **Parallel:** yes (T-043, T-044, T-046, T-047) · **Size:** M
- **Covers:** AC-5.1, AC-5.2, AC-6.1, AC-6.3
- **DoD:**
  - [ ] Card discriminated-union (`type: 'card' | 'loan'`) actions: `addCard`, `addLoan`, `update`, `remove`
  - [ ] Installment sub-actions: `addInstallment(cardId, ...)`, `updateInstallment`, `removeInstallment`, `incrementPaid`
  - [ ] Zod parse on every action

---

### T-046 — Impl: `goalsStore` + `assetsStore`

- **Type:** impl · **Layer:** app · **Deps:** T-040, T-063, T-067 · **Parallel:** yes (T-043..T-045, T-047) · **Size:** S
- **Covers:** AC-7.5, AC-9.1
- **DoD:**
  - [ ] `goalsStore` with `add`, `remove`, `update`, `reorder(idsInPriorityOrder)` — reorder updates `priority` field
  - [ ] `assetsStore` with `add`, `remove`, `update`

---

### T-047 — Impl: `allocationStore` + `snapshotsStore` (with cap)

- **Type:** impl · **Layer:** app · **Deps:** T-031, T-040, T-069, T-071, T-074 · **Parallel:** yes (T-043..T-046) · **Size:** S
- **Covers:** AC-14.1, AC-13.2
- **DoD:**
  - [ ] `allocationStore` action `setAllocation(needs, wants)` auto-derives savings = `100 − needs − wants`; rejects when sum > 100
  - [ ] `snapshotsStore.append(snapshot)` adds entry and applies `applySnapshotCap` (from T-039) to keep most recent 24 (FIFO)
  - [ ] Reads/writes wired through `useAppStorage` (T-040) so persistence is automatic

---

### T-048 — Impl: base composables

- **Type:** impl · **Layer:** app · **Deps:** T-003, T-043, T-053 · **Parallel:** no · **Size:** M
- **Covers:** AC-16.3 (theme switching), AC-16.4 (locale switching)
- **DoD:**
  - [ ] `useTheme()` exposes `isDark`, `theme`, `setTheme`; watches `prefers-color-scheme` when `theme === 'system'`; toggles `'dark'` class on `<html>` (ADR-8)
  - [ ] `useLocale()` exposes current locale and `setLocale(lang)` that updates `settingsStore.lang` and `vue-i18n`
  - [ ] `useCurrencyFormat()` wraps `lib/currency/format` and reactive to `settingsStore.currency`
  - [ ] `useForm<T>(schema)` returns `{ values, errors, validate, submit, reset }` per ADR-5
  - [ ] `useChartTheme()` returns Chart.js options object reactive to `useTheme().isDark`

---

### T-049 — Test: common components A (EmptyState, ConfirmDialog, AppToast, CurrencyInput)

- **Type:** test · **Layer:** app · **Deps:** T-001 · **Parallel:** yes (T-051, T-053) · **Size:** S
- **Covers:** AC-17.8 · TC-C-034 (EmptyState part)
- **DoD:**
  - [ ] Component test for `EmptyState` renders icon + message + CTA when given props (covers AC-17.8 generic case)
  - [ ] Tests for `ConfirmDialog` (open/close, confirm fires action), `AppToast` (auto-dismiss after timeout), `CurrencyInput` (formats blur, parses input)
  - [ ] Tests FAIL

---

### T-050 — Impl: common components A

- **Type:** impl · **Layer:** app · **Deps:** T-049 · **Parallel:** no · **Size:** M
- **Covers:** AC-17.8
- **DoD:**
  - [ ] `EmptyState.vue` accepts `icon`, `message`, `ctaLabel`, `ctaTo` props (slot-friendly)
  - [ ] `ConfirmDialog.vue` (Radix Dialog primitive from shadcn-vue) with v-model open
  - [ ] `AppToast.vue` listening on a global event bus (Pinia or VueUse `createGlobalState`)
  - [ ] `CurrencyInput.vue` integrates `useCurrencyFormat`
  - [ ] T-049 tests GREEN

---

### T-051 — Test: common components B (Tooltip, SemanticBadge, AlertList)

- **Type:** test · **Layer:** app · **Deps:** T-001 · **Parallel:** yes (T-049, T-053) · **Size:** S
- **Covers:** AC-17.6, AC-17.10 · TC-C-034 (Tooltip part), TC-C-025 partial (SemanticBadge)
- **DoD:**
  - [ ] Tooltip viewport-aware positioning test (rect fully inside viewport)
  - [ ] SemanticBadge renders text + icon + color class (not color-only)
  - [ ] AlertList renders zero items when no alerts, renders items when fed
  - [ ] Tests FAIL

---

### T-052 — Impl: common components B

- **Type:** impl · **Layer:** app · **Deps:** T-051 · **Parallel:** no · **Size:** M
- **Covers:** AC-17.6, AC-17.10
- **DoD:**
  - [ ] `Tooltip.vue` (shadcn-vue port) with `collisionPadding` against viewport edge
  - [ ] `SemanticBadge.vue` accepts `status: 'success' | 'warning' | 'danger' | 'info'` and renders matching icon + label + color
  - [ ] `AlertList.vue` accepts `alerts: Alert[]` prop
  - [ ] T-051 tests GREEN

---

### T-053 — Test: common components C (ThemeToggle, BottomNav, LanguageToggle)

- **Type:** test · **Layer:** app · **Deps:** T-001 · **Parallel:** yes (T-049, T-051) · **Size:** S
- **Covers:** AC-16.1, AC-16.3, AC-17.2, AC-17.3, AC-17.7 · TC-C-032, TC-C-033
- **DoD:**
  - [ ] TC-C-033 ThemeToggle test (dark class toggles + chart options change)
  - [ ] TC-C-032 BottomNav test at 375px width (no overlap; focus ring visible)
  - [ ] LanguageToggle test (clicks update locale)
  - [ ] Tests FAIL

---

### T-054 — Impl: common components C

- **Type:** impl · **Layer:** app · **Deps:** T-053 · **Parallel:** no · **Size:** M
- **Covers:** AC-16.1, AC-16.2, AC-16.3, AC-17.2, AC-17.3, AC-17.7
- **DoD:**
  - [ ] `ThemeToggle.vue` 3-state cycle (system/light/dark)
  - [ ] `BottomNav.vue` mobile-first (visible <768px), keyboard-accessible, focus-visible ring via Tailwind
  - [ ] `LanguageToggle.vue` 2-state (es/en)
  - [ ] T-053 tests GREEN

---

### T-055 — Test: Onboarding cluster

- **Type:** test · **Layer:** app · **Deps:** T-001 · **Parallel:** yes (T-057, T-059, T-061, T-063, T-065, T-067, T-069, T-074, T-076) · **Size:** S
- **Covers:** AC-1.1, AC-1.2, AC-1.3, AC-1.4, AC-1.5, AC-1.6, EC-9 · TC-C-001, TC-C-002, TC-C-003, TC-C-004, TC-C-005
- **DoD:**
  - [ ] Component tests for OnboardingWizard + StepIndicator + Onboarding relaunch from Settings
  - [ ] Tests use `createTestingPinia({ initialState })` per constitution
  - [ ] Tests FAIL

---

### T-056 — Impl: Onboarding (wizard, view, composable)

- **Type:** impl · **Layer:** app · **Deps:** T-055 · **Parallel:** no · **Size:** M
- **Covers:** AC-1.1, AC-1.2, AC-1.3, AC-1.4, AC-1.5, AC-1.6, EC-9
- **DoD:**
  - [ ] `OnboardingView.vue`, `OnboardingWizard.vue`, `StepIndicator.vue` rendering 3 steps (Salary → Expenses → Debts)
  - [ ] `useOnboarding()` composable exposing `currentStep`, `next`, `prev`, `skip`, `finish`, `relaunch`
  - [ ] Wizard reads existing store values for prefill; relaunch never clears existing data (AC-1.6)
  - [ ] T-055 tests GREEN

---

### T-057 — Test: Income cluster

- **Type:** test · **Layer:** app · **Deps:** T-001 · **Parallel:** yes (T-055, T-059..T-069) · **Size:** S
- **Covers:** AC-2.1, AC-2.2, AC-2.3, AC-2.5, AC-3.1, AC-3.3 · TC-C-006, TC-C-007, TC-C-008, TC-C-009, TC-C-010, TC-C-011
- **DoD:**
  - [ ] Component tests for DeductionRow, IncomeStreamRow, RetentionEstimator, IncomeView
  - [ ] Tests for Colombian preset + prima preset buttons
  - [ ] Tests FAIL

---

### T-058 — Impl: Income view + components + composables

- **Type:** impl · **Layer:** app · **Deps:** T-057 · **Parallel:** no · **Size:** M
- **Covers:** AC-2.1, AC-2.2, AC-2.3, AC-2.4, AC-2.5, AC-3.1, AC-3.3
- **DoD:**
  - [ ] `IncomeView.vue`, `DeductionRow.vue`, `IncomeStreamRow.vue`, `RetentionEstimator.vue`, `NonSalaryBenefitRow.vue`
  - [ ] Composables: `useNetIncome`, `useRetencion`, `useColombiaPresets`
  - [ ] Colombian preset button visible only when `settingsStore.currency === 'COP'`
  - [ ] All forms use `useForm` (Zod-validated)
  - [ ] T-057 tests GREEN

---

### T-059 — Test: Expenses cluster

- **Type:** test · **Layer:** app · **Deps:** T-001 · **Parallel:** yes · **Size:** S
- **Covers:** AC-4.1, AC-4.2, AC-4.4 · TC-C-012, TC-C-013
- **DoD:**
  - [ ] Tests for add expense, delete with confirmation, total recalculation
  - [ ] Tests FAIL

---

### T-060 — Impl: Expenses view + components

- **Type:** impl · **Layer:** app · **Deps:** T-059 · **Parallel:** no · **Size:** S
- **Covers:** AC-4.1, AC-4.2, AC-4.4
- **DoD:**
  - [ ] `ExpensesView.vue`, `FixedExpenseList.vue`, `ExpenseForm.vue`
  - [ ] Delete triggers ConfirmDialog (from T-050)
  - [ ] T-059 tests GREEN

---

### T-061 — Test: Debts cluster

- **Type:** test · **Layer:** app · **Deps:** T-001 · **Parallel:** yes · **Size:** S
- **Covers:** AC-5.1, AC-5.2, AC-5.7, AC-6.3 · TC-C-014, TC-C-015, TC-C-016, TC-C-017
- **DoD:**
  - [ ] Tests for CardCard (utilization + timeline), LoanCard (remaining installments), AlertList due-soon, InstallmentList progress
  - [ ] Tests FAIL

---

### T-062 — Impl: Debts view + components + composables

- **Type:** impl · **Layer:** app · **Deps:** T-061 · **Parallel:** no · **Size:** M
- **Covers:** AC-5.1, AC-5.2, AC-5.3, AC-5.4, AC-5.5, AC-5.6, AC-5.7, AC-6.1, AC-6.2, AC-6.3
- **DoD:**
  - [ ] `DebtsView.vue`, `CardCard.vue`, `LoanCard.vue`, `PayoffSimulator.vue`, `InstallmentList.vue`, `PayoffMethodToggle.vue`, `DTIGauge.vue`
  - [ ] Composables: `useAmortization`, `useCardObligation`, `usePayoffStrategy`, `useDebtAlerts` (also emits to AlertList)
  - [ ] T-061 tests GREEN

---

### T-063 — Test: Goals cluster

- **Type:** test · **Layer:** app · **Deps:** T-001 · **Parallel:** yes · **Size:** S
- **Covers:** AC-7.1, AC-7.3, AC-7.4, AC-7.5 · TC-C-018, TC-C-019
- **DoD:**
  - [ ] Tests for GoalCard progress/ETA/completed + GoalList over-budget warning + drag reorder
  - [ ] Tests FAIL

---

### T-064 — Impl: Goals view + components + composables

- **Type:** impl · **Layer:** app · **Deps:** T-063 · **Parallel:** no · **Size:** M
- **Covers:** AC-7.1, AC-7.2, AC-7.3, AC-7.4, AC-7.5
- **DoD:**
  - [ ] `GoalsView.vue`, `GoalCard.vue`, `GoalList.vue`, `GoalForm.vue`
  - [ ] `useGoals()` composable wrapping `lib/calculations/goals` + `goalsStore`
  - [ ] Drag reorder via HTML5 DnD (no extra library) updating `goalsStore.reorder(...)`
  - [ ] T-063 tests GREEN

---

### T-065 — Test: Variable Expenses cluster

- **Type:** test · **Layer:** app · **Deps:** T-001 · **Parallel:** yes · **Size:** S
- **Covers:** AC-8.1, AC-8.2, AC-8.3, AC-8.5, EC-4 · TC-C-020, TC-C-021, TC-C-022
- **DoD:**
  - [ ] Tests for VariableCategoryCard color states + overbudget alert, QuickAddFAB route-aware visibility, monthly summary excess in red
  - [ ] Tests FAIL

---

### T-066 — Impl: Variable Expenses view + components + composables

- **Type:** impl · **Layer:** app · **Deps:** T-065 · **Parallel:** no · **Size:** M
- **Covers:** AC-8.1, AC-8.2, AC-8.3, AC-8.5, EC-4
- **DoD:**
  - [ ] `VariableExpensesView.vue`, `VariableCategoryCard.vue`, `QuickAddFAB.vue`, `QuickAddPanel.vue`
  - [ ] `useVariableExpenses`, `useQuickAddFAB` (route-aware: only `/` and `/variable`)
  - [ ] T-065 tests GREEN

---

### T-067 — Test: Net Worth cluster

- **Type:** test · **Layer:** app · **Deps:** T-001 · **Parallel:** yes · **Size:** S
- **Covers:** AC-9.1, AC-9.2, AC-9.3 · TC-C-023
- **DoD:**
  - [ ] Tests for AssetList add, liabilities derived from cards automatically, banner positive/negative
  - [ ] Tests FAIL

---

### T-068 — Impl: Net Worth view + components + composable

- **Type:** impl · **Layer:** app · **Deps:** T-067 · **Parallel:** no · **Size:** S
- **Covers:** AC-9.1, AC-9.2, AC-9.3, AC-9.4
- **DoD:**
  - [ ] `NetWorthView.vue`, `AssetList.vue`, `NetWorthBanner.vue`
  - [ ] `useNetWorth()` composable
  - [ ] T-067 tests GREEN

---

### T-069 — Test: Allocation cluster

- **Type:** test · **Layer:** app · **Deps:** T-001 · **Parallel:** yes · **Size:** S
- **Covers:** AC-14.1, AC-14.2 · TC-C-026
- **DoD:**
  - [ ] Tests for savings auto-calc, > 100% rejection turns field red
  - [ ] Tests FAIL

---

### T-070 — Impl: Allocation view + composable

- **Type:** impl · **Layer:** app · **Deps:** T-069 · **Parallel:** no · **Size:** S
- **Covers:** AC-14.1, AC-14.2, AC-14.3, AC-14.4
- **DoD:**
  - [ ] `AllocationView.vue`, `AllocationPanel.vue`
  - [ ] `useAllocation()` wires store + `lib/calculations/allocation`
  - [ ] T-069 tests GREEN

---

### T-071 — Test: Dashboard cluster

- **Type:** test · **Layer:** app · **Deps:** T-001 · **Parallel:** yes (T-074, T-076) · **Size:** S
- **Covers:** AC-10.1, AC-10.2, AC-10.3, AC-10.4, AC-11.2, AC-11.3, AC-12.4, AC-13.3, AC-17.5, AC-17.6 · TC-C-024, TC-C-025, TC-C-027, TC-C-028
- **DoD:**
  - [ ] Tests for KPI cards full set, donut + projection chart canvases present, risk color + context, health score breakdown click, comparison badge with 2+ snapshots
  - [ ] Tests FAIL

---

### T-072 — Impl: Dashboard composables + Chart.js components

- **Type:** impl · **Layer:** app · **Deps:** T-029, T-033, T-071 · **Parallel:** no · **Size:** M
- **Covers:** AC-10.2, AC-12.4, AC-17.2
- **DoD:**
  - [ ] `BudgetDonut.vue` + `ProjectionChart.vue` using `vue-chartjs` (per ADR-2)
  - [ ] Charts subscribe to `useChartTheme()` (light/dark colors)
  - [ ] Composables: `useDashboardKpis`, `useHealthScore`, `useProjection`, `useSnapshots`, `useMonthRollover`
  - [ ] `useMonthRollover` fires snapshot save on app boot when month changed (ADR-7, AC-13.1)

---

### T-073 — Impl: Dashboard view + remaining components

- **Type:** impl · **Layer:** app · **Deps:** T-071, T-072 · **Parallel:** no · **Size:** M
- **Covers:** AC-10.1, AC-10.3, AC-10.4, AC-11.1, AC-11.2, AC-11.3, AC-13.3, AC-17.4, AC-17.5, AC-17.6, AC-17.9
- **DoD:**
  - [ ] `DashboardView.vue`, `HealthScore.vue` (clickable → breakdown panel), `KpiCards.vue`, `ComparisonBadge.vue`, dashboard `AlertList` integration
  - [ ] Health score breakdown uses `SemanticBadge` for color+icon (not color-only, AC-17.6)
  - [ ] Layout: score and KPIs prominently positioned (AC-17.5)
  - [ ] `App.vue` wires `<RouterView v-slot>` with a `<Transition name="fade">` wrapper for AC-17.9 (no layout flash on route change)
  - [ ] T-071 tests GREEN

---

### T-074 — Test: History cluster

- **Type:** test · **Layer:** app · **Deps:** T-001 · **Parallel:** yes (T-076) · **Size:** S
- **Covers:** AC-13.4 · TC-C-029
- **DoD:**
  - [ ] Test for snapshot list ordered newest-first
  - [ ] Tests FAIL

---

### T-075 — Impl: History view

- **Type:** impl · **Layer:** app · **Deps:** T-074 · **Parallel:** no · **Size:** S
- **Covers:** AC-13.4
- **DoD:**
  - [ ] `HistoryView.vue`, `SnapshotList.vue` with sort descending by `month`
  - [ ] T-074 tests GREEN

---

### T-076 — Test: Settings cluster (Export/Import/Reset/Relaunch)

- **Type:** test · **Layer:** app · **Deps:** T-001 · **Parallel:** yes · **Size:** S
- **Covers:** AC-15.1, AC-15.2, AC-15.3, AC-15.4 · TC-C-030, TC-C-031
- **DoD:**
  - [ ] Tests for export triggers blob download (mock `URL.createObjectURL`), import round-trip restores state, malformed file shows error and preserves state, reset clears and routes to /onboarding
  - [ ] Tests FAIL

---

### T-077 — Impl: Settings view + import/export + reset

- **Type:** impl · **Layer:** app · **Deps:** T-076 · **Parallel:** no · **Size:** M
- **Covers:** AC-1.6 (relaunch button), AC-15.1, AC-15.2, AC-15.3, AC-15.4
- **DoD:**
  - [ ] `SettingsView.vue` with sections: Language, Currency, Theme, Export, Import, Reset, Relaunch Onboarding
  - [ ] `useImportExport()` composable serializing/deserializing via `lib/storage/backup`
  - [ ] Import flow runs `parseBackup` → if older schemaVersion, run `migrate` → write to storage → `location.reload()` (or store hydration)
  - [ ] Reset clears all stores and navigates to /onboarding
  - [ ] T-076 tests GREEN

---

### T-078 — Setup: Playwright

- **Type:** setup · **Layer:** infra · **Deps:** T-001 · **Parallel:** yes (most other tasks) · **Size:** S
- **Covers:** —
- **DoD:**
  - [ ] `playwright.config.ts` with `chromium` browser, baseURL `http://localhost:5173`, viewport defaults
  - [ ] `e2e/fixtures.ts` exports a fixture that seeds localStorage before each test
  - [ ] `npm run e2e` boots Vite preview and runs Playwright; passes with 0 tests

---

### T-079 — Test+Impl: E2E TC-E-001 (new user onboarding)

- **Type:** test · **Layer:** infra · **Deps:** T-056, T-058, T-073, T-078 · **Parallel:** yes (T-080..T-087) · **Size:** S
- **Covers:** AC-1.1, AC-1.5, AC-10.1 · TC-E-001
- **DoD:**
  - [ ] `e2e/onboarding-new-user.spec.ts` with TC-E-001 scenario
  - [ ] Test passes against the running app (the impl already exists from earlier tasks; this verifies end-to-end)

---

### T-080 — Test+Impl: E2E TC-E-002 (returning user)

- **Type:** test · **Layer:** infra · **Deps:** T-056, T-073, T-078 · **Parallel:** yes · **Size:** S
- **Covers:** AC-1.3, AC-17.9 · TC-E-002
- **DoD:**
  - [ ] `e2e/returning-user.spec.ts` seeds localStorage with v2 state, asserts /dashboard loads directly, asserts no layout flash on navigation
  - [ ] Test passes deterministically against `vite preview` build (no retries needed)

---

### T-081 — Test+Impl: E2E TC-E-003 (quick-add FAB)

- **Type:** test · **Layer:** infra · **Deps:** T-066, T-073, T-078 · **Parallel:** yes · **Size:** S
- **Covers:** AC-8.3 · TC-E-003
- **DoD:**
  - [ ] `e2e/quick-add-fab.spec.ts` asserts FAB on /dashboard opens panel, registers spending, updates category total
  - [ ] Test asserts FAB is NOT visible on at least one non-allowlisted route (e.g. /debts)

---

### T-082 — Test+Impl: E2E TC-E-004 (export/import)

- **Type:** test · **Layer:** infra · **Deps:** T-077, T-078 · **Parallel:** yes · **Size:** S
- **Covers:** AC-15.1, AC-15.2 · TC-E-004
- **DoD:**
  - [ ] `e2e/export-import.spec.ts` uses Playwright's download listener to capture export, then imports it on a fresh context, asserts counts match
  - [ ] Test verifies the downloaded JSON parses against `BackupEnvelopeSchema` (round-trip integrity)

---

### T-083 — Test+Impl: E2E TC-E-005 (payoff simulator)

- **Type:** test · **Layer:** infra · **Deps:** T-062, T-078 · **Parallel:** yes · **Size:** S
- **Covers:** AC-5.1, AC-5.3 · TC-E-005
- **DoD:**
  - [ ] `e2e/payoff-simulator.spec.ts` adds card, enters extraPayment, asserts "months saved" + "interest saved" update reactively
  - [ ] Setting extraPayment back to 0 restores the original timeline (no stale state)

---

### T-084 — Test+Impl: E2E TC-E-006 (language switch)

- **Type:** test · **Layer:** infra · **Deps:** T-054, T-073, T-078 · **Parallel:** yes · **Size:** S
- **Covers:** AC-16.4 · TC-E-006
- **DoD:**
  - [ ] `e2e/language-switch.spec.ts` toggles es → en → es, asserts representative labels change in each direction
  - [ ] `lang` attribute on `<html>` updates accordingly

---

### T-085 — Test+Impl: E2E TC-E-007 (snapshot rollover)

- **Type:** test · **Layer:** infra · **Deps:** T-072, T-073, T-078 · **Parallel:** yes · **Size:** S
- **Covers:** AC-13.1 · TC-E-007
- **DoD:**
  - [ ] `e2e/snapshot-rollover.spec.ts` seeds `lastMonthSeen = '2026-04'`, mocks `Date` to be in `2026-05`, opens app, asserts toast + snapshot appended
  - [ ] Second app boot in the same simulated month does NOT create a duplicate snapshot

---

### T-086 — Test+Impl: E2E TC-E-008 (dark mode + responsive)

- **Type:** test · **Layer:** infra · **Deps:** T-054, T-072, T-073, T-078 · **Parallel:** yes · **Size:** S
- **Covers:** AC-16.3, AC-17.1, AC-17.2, AC-17.4 · TC-E-008
- **DoD:**
  - [ ] `e2e/dark-mode-responsive.spec.ts` toggles dark mode, runs `@axe-core/playwright` scan (0 color-contrast violations), resizes viewport to 375/768/1280 and asserts no horizontal overflow on any section
  - [ ] Charts (donut + projection) render with theme-aware colors in dark mode (no white canvas backgrounds)

---

### T-087 — Test+Impl: E2E TC-E-009 (keyboard navigation)

- **Type:** test · **Layer:** infra · **Deps:** T-058, T-078 · **Parallel:** yes · **Size:** S
- **Covers:** AC-16.2 · TC-E-009
- **DoD:**
  - [ ] `e2e/keyboard-nav.spec.ts` Tab-walks income form, asserts focus order and visible focus ring (computed style outline ≠ none); Enter on retención button fires calc
  - [ ] Shift+Tab walks the form in reverse order without focus traps

---

### T-088 — Cleanup: remove legacy vanilla SPA

- **Type:** refactor · **Layer:** cross · **Deps:** T-079..T-087 · **Parallel:** yes (T-089) · **Size:** S
- **Covers:** —
- **DoD:**
  - [ ] `server.js`, `app.js`, root-level `style.css`, root-level `index.html` deleted (replaced by Vite-served versions in `src/` and `index.html` at root)
  - [ ] `package.json` scripts updated: `start` → `vite`, `build` → `vite build`, `test` → `vitest`, `e2e` → `playwright test`, `lint` → `eslint .`, `typecheck` → `vue-tsc --noEmit`
  - [ ] `.gitignore` updated for `dist/`, `coverage/`, `playwright-report/`
  - [ ] All previous tests still GREEN (regression sanity)

---

### T-089 — Docs: README + CHANGELOG + rules refresh

- **Type:** docs · **Layer:** cross · **Deps:** T-077 · **Parallel:** yes (T-088) · **Size:** S
- **Covers:** —
- **DoD:**
  - [ ] `README.md` rewritten for new stack: setup (npm install, npm start, npm test, npm run e2e), architecture summary, link to `specs/`
  - [ ] `CHANGELOG.md` `[Unreleased]` entry under `Changed`: "Full SPA rewrite to Vue 3 + Vite + TS + Pinia + Tailwind + Chart.js + Vitest (constitution v2)"
  - [ ] `.claude/rules/README.md` updated to point at new stack rules; legacy vanilla-spa rules archived to `.claude/rules/_legacy/` or removed
  - [ ] CLAUDE.md updated for new stack (architecture, key calculation functions live in `src/lib/`)

---

### T-LAST — Regression + coverage gate

- **Type:** test · **Layer:** cross · **Deps:** T-003, T-005, T-007, T-009, T-011, T-013, T-015, T-017, T-019, T-021, T-023, T-025, T-027, T-029, T-031, T-033, T-035, T-037, T-039, T-040, T-041, T-042, T-043, T-044, T-045, T-046, T-047, T-048, T-050, T-052, T-054, T-056, T-058, T-060, T-062, T-064, T-066, T-068, T-070, T-072, T-073, T-075, T-077, T-079, T-080, T-081, T-082, T-083, T-084, T-085, T-086, T-087, T-088, T-089 · **Parallel:** no · **Size:** S
- **Covers:** all 80 ACs + 10 ECs
- **DoD:**
  - [ ] `npm test` GREEN — zero failures, zero unexplained `.skip`
  - [ ] `npm run e2e` GREEN
  - [ ] Coverage report shows ≥ 80% on `src/lib/calculations/**` and `src/lib/tax/**`, ≥ 60% overall (constitution gates)
  - [ ] `npm run lint` clean
  - [ ] `npm run typecheck` clean (`vue-tsc --noEmit` zero errors, `strict: true`)
  - [ ] No `console.log` / `console.error` outside `if (import.meta.env.DEV)` blocks (constitution rule); verified by ESLint rule or grep
  - [ ] No `v-html` with non-literal expressions in `src/` (verified by grep)
  - [ ] No `any` without inline justification comment (verified by ESLint `no-explicit-any` with override comment requirement)
  - [ ] `/sdd.check` run: zero FAIL items, drift list empty
  - [ ] Bundle size: gzipped JS < 250 KB (verified by `vite build` summary)
  - [ ] Manual smoke: open app, walk through onboarding → dashboard → settings export → import on cleared storage → all data restored

---

## Summary

| Metric           | Value                                                                                         |
| ---------------- | --------------------------------------------------------------------------------------------- |
| Total tasks      | **90** (T-001 … T-089, T-LAST)                                                                |
| `setup`          | 4 (T-001, T-041, T-042, T-078)                                                                |
| `test`           | 43                                                                                            |
| `impl`           | 41                                                                                            |
| `refactor`       | 1 (T-088)                                                                                     |
| `docs`           | 1 (T-089)                                                                                     |
| `S`-size         | 79                                                                                            |
| `M`-size         | 11                                                                                            |
| `L`-size         | **0** (constitution rule honored)                                                             |
| Parallel groups  | 5 major groups (lib unit tests; Pinia stores; common components; feature clusters; E2E specs) |
| Estimated effort | 79 × 1.5h + 11 × 4h ≈ **163 h** (~4 working weeks for a solo developer)                       |

---

## Sign-off

<!-- mode=solo -->

- [x] Author: `Johann Medina` — `2026-05-15`
