# Tasks — `Fix cálculos financieros`

> [Spec](./1-spec.md) · [Plan](./2-plan.md) · [Test Plan](./3-test-plan.md) · [Data Model](./2-data-model.md)
> Mode: `solo` · Generated: `2026-05-16` · Version: **v1**

## Legend

| Symbol | Meaning |
|---|---|
| **Type** | `setup` · `test` · `impl` · `refactor` · `docs` |
| **Layer** | `domain` (lib/) · `app` (stores/composables/components/views) · `infra` (storage/main.ts) · `cross` |
| **Size** | `S` < 2h · `M` < 1 day · **`L` PROHIBITED** |
| **Parallel** | task ids that share no deps and touch no shared files |
| **Covers** | AC + TC ids satisfied by this task |

## Summary

- **34 tasks** — 1 setup · 13 test · 17 impl · 2 refactor/docs · 1 regression
- **No L-size tasks**
- **100% AC coverage** (33/33 ACs) · **100% TC coverage** (44/44 TCs)
- **Parallelization:** 13 test tasks can fan out after T-001; impl tasks split into 3 dependency waves

---

## Tasks

### T-001 — Setup: feature scaffolding + test fixtures

- **Type:** setup · **Layer:** cross · **Deps:** — · **Parallel:** no · **Size:** S
- **Covers:** —
- **DoD:**
  - [ ] Create empty `src/lib/calculations/savings-projection.ts` (named exports stub)
  - [ ] Create empty `src/composables/useNetIncome.ts`, `useHealthScore.ts`, `useDTI.ts`, `useGoalsBudget.ts`, `useSavingsProjection.ts`, `useStorageError.ts` (each exports a placeholder named function returning `{}` to keep TS happy)
  - [ ] Create empty `src/components/dashboard/SavingsProjectionChart.vue` and `src/components/common/StorageErrorToast.vue` (minimal valid SFC)
  - [ ] Create `tests/integration/` directory; add `tests/integration/.gitkeep`
  - [ ] Add to `tests/setup.ts` a `ResizeObserver` stub with comment: *"jsdom limitation: Chart.js requires ResizeObserver. Stub here, not in product code. See ADR-5 in 2-plan.md."*
  - [ ] Add to `tests/setup.ts` a `navigator.storage.estimate` stub guard with comment: *"Mocked only in TC-C-001 quota-exceeded scenario; real localStorage is used elsewhere."*
  - [ ] `npm test` runs to completion with 0 failing tests (placeholders pass or are skipped)
  - [ ] `npm run typecheck` passes

---

## Test Phase — 13 tasks (parallel after T-001)

### T-002 — Test: net-income + EC unit tests

- **Type:** test · **Layer:** domain · **Deps:** T-001 · **Parallel:** yes (T-003…T-014) · **Size:** S
- **Covers:** AC-2.1, AC-2.3, AC-2.4, AC-2.5 · TC-U-001, TC-U-002, TC-U-003, TC-U-020, TC-U-021
- **DoD:**
  - [ ] `tests/unit/lib/calculations/net-income.test.ts` has 5 failing tests with `TC-U-NNN (AC-X.Y):` prefix
  - [ ] Each test uses exact values from spec (e.g. `12_100_000 × 0.92 === 11_132_000`)
  - [ ] No production code written

### T-003 — Test: housing-ratio + savings rate + emergency denominator

- **Type:** test · **Layer:** domain · **Deps:** T-001 · **Parallel:** yes · **Size:** S
- **Covers:** AC-3.1, AC-3.2, AC-3.3, EC-2 · TC-U-005, TC-U-006, TC-U-007, TC-U-025
- **DoD:**
  - [ ] `tests/unit/lib/calculations/housing-ratio.test.ts` covers AC-3.1 + zero-income edge case
  - [ ] `tests/unit/composables/useHealthScore.test.ts` covers AC-3.2 denominator (`fixedExpenses + debtObligations`) and AC-3.3 savings rate from real goal contributions
  - [ ] All tests FAIL with assertion error (RED)

### T-004 — Test: amortization TEA formula

- **Type:** test · **Layer:** domain · **Deps:** T-001 · **Parallel:** yes · **Size:** S
- **Covers:** AC-4.1, AC-4.4, EC-3, EC-6 · TC-U-008, TC-U-011, TC-U-023
- **DoD:**
  - [ ] `tests/unit/lib/calculations/amortization.test.ts` has updated fixtures: TEA 30% → TEM ≈ 2.21%, months strictly less than `apr/12` baseline
  - [ ] Test for AC-4.4 (indefinite payoff when payment < monthly interest) uses TEA 36% as in spec
  - [ ] Test for EC-6 (APR=0) preserves simple-division fallback
  - [ ] Existing passing tests for `apr/12` updated to FAIL until impl lands

### T-005 — Test: DTI + card obligation with installments

- **Type:** test · **Layer:** domain · **Deps:** T-001 · **Parallel:** yes · **Size:** S
- **Covers:** AC-4.2, AC-4.3 · TC-U-009, TC-U-010
- **DoD:**
  - [ ] `tests/unit/lib/calculations/installments.test.ts` verifies `calcCardObligation = minPayment + Σ installment.monthly`
  - [ ] `tests/unit/lib/calculations/dti.test.ts` verifies DTI uses the full obligation (min + installments)
  - [ ] Edge: `netIncome = 0` → DTI = 0 (no NaN)

### T-006 — Test: projection cash-flow with periodic streams

- **Type:** test · **Layer:** domain · **Deps:** T-001 · **Parallel:** yes · **Size:** S
- **Covers:** AC-5.1, AC-5.2 · TC-U-012, TC-U-013
- **DoD:**
  - [ ] `tests/unit/lib/calculations/projection.test.ts` covers semiannual stream lifting balance at month 5 and 11
  - [ ] `tests/unit/lib/calculations/frequency.test.ts` covers quarterly = [0,3,6,9] and annual = [0]
  - [ ] Tests FAIL until projection consumer in DashboardView is wired (these tests target lib only — should actually PASS for existing lib but verify with current code)

### T-007 — Test: savings-projection (linear + compound + EC + schema refinement)

- **Type:** test · **Layer:** domain · **Deps:** T-001 · **Parallel:** yes · **Size:** M
- **Covers:** AC-6.1, AC-8.1, AC-8.2, AC-8.6, EC-5, EC-8, EC-10 · TC-U-014, TC-U-017, TC-U-018, TC-U-019, TC-U-022, TC-U-024
- **DoD:**
  - [ ] `tests/unit/lib/calculations/savings-projection.test.ts` covers happy path linear (10M × 20% × 12 = 24M at month 12)
  - [ ] Happy path compound (10M @ 12% EA → ≈11.2M at month 12)
  - [ ] Edge cases (required, per finance-test-engineer review):
    - [ ] `monthsAhead = 0` → empty array
    - [ ] `assets = []` for compound → returns flat zero series (not error)
    - [ ] Negative `netIncome` → linear returns clamped 0, not negative accumulation
    - [ ] Mixed assets (one rate=0, one rate>0) → compound sums correctly
  - [ ] Zod refinement test: `AssetSchema.parse({...annualRatePercent: 9999})` → fails

### T-008 — Test: incomeStore prima upsert + `__prima__` / `isPrima` guards

- **Type:** test · **Layer:** app · **Deps:** T-001 · **Parallel:** yes · **Size:** S
- **Covers:** AC-7.1, AC-7.2 · TC-U-015, TC-U-016
- **DoD:**
  - [ ] `tests/unit/stores/incomeStore.test.ts` covers `addPrimaPreset` creates with `id: '__prima__', isPrima: true`
  - [ ] Second `addPrimaPreset` call updates amount (single entry, no duplicate)
  - [ ] `addStream({id: '__prima__', isPrima: false})` → rejected
  - [ ] `addStream({id: 'some-uuid', isPrima: true})` → rejected
  - [ ] At most one stream with `isPrima === true` invariant

### T-009 — Test: assetsStore annualRatePercent + Zod schema v3

- **Type:** test · **Layer:** app · **Deps:** T-001 · **Parallel:** yes · **Size:** S
- **Covers:** AC-8.2 · (new TCs derived from schema)
- **DoD:**
  - [ ] `tests/unit/stores/assetsStore.test.ts` verifies `add({...annualRatePercent: 12})` is accepted
  - [ ] Verifies negative rate rejected (boundary guard)
  - [ ] Verifies rate > 100 rejected
  - [ ] `tests/unit/lib/storage/schema.test.ts` validates `AppStateSchemaV3` rejects v2 shape (`schemaVersion: 2`) and accepts v3

### T-010 — Test: StorageErrorToast component

- **Type:** test · **Layer:** app · **Deps:** T-001 · **Parallel:** yes · **Size:** S
- **Covers:** AC-1.4 · TC-C-001
- **DoD:**
  - [ ] `tests/component/StorageErrorToast.test.ts` uses `createTestingPinia({ stubActions: false })` with FULL settings seed (lang, currency, theme, payoffMethod, lastMonthSeen, onboarding{done,currentStep,totalSteps})
  - [ ] Test triggers `saveAppState` → returns `{ok:false, reason:'quota_exceeded'}` via mocked storage; asserts toast rendered with i18n key `storage.error.title`
  - [ ] Toast does NOT auto-dismiss (asserts presence after 6s simulated time)

### T-011 — Test: Dashboard reactive components (Allocation, Projection, HealthScore)

- **Type:** test · **Layer:** app · **Deps:** T-001 · **Parallel:** yes · **Size:** M
- **Covers:** AC-2.2, AC-3.4, AC-3.5, AC-3.6, AC-5.3 · TC-C-002, TC-C-003, TC-C-004, TC-C-005, TC-C-006
- **DoD:**
  - [ ] All 5 tests use `createTestingPinia({ stubActions: false, createSpy: vi.fn })` with FULL settings seed
  - [ ] TC-C-002: AllocationPanel renders amounts from net income (not gross)
  - [ ] TC-C-003: HealthScore with empty assets shows "sin datos" for emergency
  - [ ] TC-C-004 / TC-C-005: HealthScore re-renders when asset/expense added (verify reactivity)
  - [ ] TC-C-006: ProjectionChart receives netIncome value (mock `calcProjection` spy)

### T-012 — Test: Goals + SavingsProjectionChart component

- **Type:** test · **Layer:** app · **Deps:** T-001 · **Parallel:** yes · **Size:** M
- **Covers:** AC-6.2, AC-8.1, AC-8.3, AC-8.4, AC-8.5, EC-10 · TC-C-007, TC-C-008, TC-C-009, TC-C-010, TC-C-011
- **DoD:**
  - [ ] All tests use full Pinia seed
  - [ ] TC-C-007: GoalsView cap updates reactively when `allocationStore.setAllocation` changes
  - [ ] TC-C-008: SavingsProjectionChart renders 2 datasets (solid + dashed) when both data sources exist
  - [ ] TC-C-009: hypothetical series updates on savings% change
  - [ ] TC-C-010: no asset rate configured → message visible (i18n key `savings.noRateConfigured`); empty state is OWNED by the chart, NOT by DashboardView
  - [ ] TC-C-011: hypothetical visible even with zero compound data

### T-013 — Test: integration — persistence cycle

- **Type:** test · **Layer:** infra · **Deps:** T-001 · **Parallel:** yes · **Size:** M
- **Covers:** AC-1.1, AC-1.2, AC-1.3, AC-7.3 · TC-I-001, TC-I-002, TC-I-003, TC-I-004
- **DoD:**
  - [ ] All 4 tests live in `tests/integration/persistence.test.ts` (committed directory choice)
  - [ ] Uses real `loadAppState` / `saveAppState` against jsdom localStorage
  - [ ] Verifies full round-trip: mutate store → reload state → assert fields intact
  - [ ] Prima persistence: edit `__prima__` amount → reload → amount persists
  - [ ] Delete `__prima__` → reload → no prima present

### T-014 — Test: E2E Playwright suite

- **Type:** test · **Layer:** cross · **Deps:** T-001 · **Parallel:** yes · **Size:** M
- **Covers:** AC-1.1, AC-1.2, AC-1.3, AC-2.2, AC-3.5, AC-3.6, AC-7.1, AC-7.2, AC-7.3, AC-8.1, AC-8.2, AC-8.3 · TC-E-001, TC-E-002, TC-E-003, TC-E-004, TC-E-005
- **DoD:**
  - [ ] 5 spec files in `e2e/`: `persistence.spec.ts`, `net-income-dashboard.spec.ts`, `health-score-reactive.spec.ts`, `prima-upsert.spec.ts`, `savings-projection.spec.ts`
  - [ ] All tests use `returningPage` or `freshPage` fixtures (no raw `page.goto('/')`)
  - [ ] Tests FAIL until impl tasks land
  - [ ] No frame-budget assertion (`< 16ms`) — moved to advisory comment per finance-test-engineer review

---

## Implementation Phase — 17 tasks

### Wave 1 — Foundation (schema, migration, lib)

### T-015 — Impl: AppStateSchemaV3 — Asset.annualRatePercent + IncomeStream.isPrima + saveAppState literal

- **Type:** impl · **Layer:** infra · **Deps:** T-009 · **Parallel:** no · **Size:** S
- **Covers:** AC-7.1, AC-7.2, AC-8.2 (schema side)
- **DoD:**
  - [ ] `src/lib/storage/schema.ts` exports `AppStateSchemaV3` with `schemaVersion: z.literal(3)`
  - [ ] `AssetSchema.annualRatePercent = z.number().min(0).max(100).default(0)`
  - [ ] `IncomeStreamSchema.isPrima = z.boolean().optional()`
  - [ ] `src/lib/storage/useAppStorage.ts` `saveAppState()` writes `schemaVersion: 3` (literal updated, not just inferred)
  - [ ] `main.ts persistStores()` payload object literal also bumped to `schemaVersion: 3`
  - [ ] T-009 tests now GREEN
  - [ ] `npm run typecheck` passes

### T-016 — Impl: migration v2→v3 + v2 backup helper

- **Type:** impl · **Layer:** infra · **Deps:** T-015, T-013 · **Parallel:** no · **Size:** S
- **Covers:** AC-1.1, AC-8.2 (migration enables data continuity)
- **DoD:**
  - [ ] `src/lib/storage/migrate.ts` exports `migrateV2toV3(state)` per 2-data-model.md
  - [ ] `migrations[3] = migrateV2toV3` in the migrations map
  - [ ] Legacy "Prima de servicios" stream detection (label + frequency + amount within ±5% of bruto/2) → re-id to `__prima__` + set `isPrima: true`
  - [ ] `useAppStorage.loadAppState` writes `finance_app_data_v2_backup` once before v2→v3 (best-effort, mirrors v1 pattern)
  - [ ] Idempotent on v3 input (running twice = no-op)
  - [ ] T-013 integration test (round-trip) now GREEN

### T-017 — Impl: amortization.ts TEA formula

- **Type:** impl · **Layer:** domain · **Deps:** T-004 · **Parallel:** yes (T-015, T-016, T-018, T-019, T-020) · **Size:** S
- **Covers:** AC-4.1, AC-4.4
- **DoD:**
  - [ ] `src/lib/calculations/amortization.ts:monthsToPayoff` replaces `aprPercent / 100 / 12` with `Math.pow(1 + aprPercent / 100, 1 / 12) - 1`
  - [ ] Sentinel for indefinite payoff (payment ≤ balance × monthlyRate) preserved
  - [ ] APR=0 fallback (simple division) preserved
  - [ ] T-004 tests now GREEN
  - [ ] Coverage on `amortization.ts` ≥ 80%

### T-018 — Impl: savings-projection.ts (new pure module)

- **Type:** impl · **Layer:** domain · **Deps:** T-007 · **Parallel:** yes (T-015, T-016, T-017, T-019, T-020) · **Size:** M
- **Covers:** AC-8.1, AC-8.2, AC-8.6
- **DoD:**
  - [ ] `src/lib/calculations/savings-projection.ts` exports `calcHypotheticalSavings({netIncome, savingsRatePercent, monthsAhead})` returning `Array<{month, cumulativeAmount}>`
  - [ ] Exports `calcCompoundGrowth(assets, monthsAhead)` returning `Array<{month, totalValue}>` where monthly rate per asset = `(1 + annualRatePercent/100)^(1/12) − 1`
  - [ ] Zero side effects, zero Vue/Pinia imports (verified by grep)
  - [ ] T-007 tests now GREEN
  - [ ] Coverage on `savings-projection.ts` ≥ 80%

### T-019 — Impl: incomeStore — prima upsert + addStream guards

- **Type:** impl · **Layer:** app · **Deps:** T-008, T-015 · **Parallel:** no · **Size:** S
- **Covers:** AC-7.1, AC-7.2
- **DoD:**
  - [ ] `incomeStore.addPrimaPreset()` finds existing `__prima__` and updates `amount = grossSalary / 2`, else pushes new `{id: '__prima__', isPrima: true, frequency: 'semiannual', label: 'Prima de servicios', amount: gross/2}`
  - [ ] `addStream` rejects `id === '__prima__'` when `!input.isPrima` (boundary guard)
  - [ ] `addStream` rejects `isPrima: true` with `id !== '__prima__'`
  - [ ] `addStream` rejects creating a second stream with `isPrima: true`
  - [ ] T-008 tests GREEN

### T-020 — Impl: assetsStore — annualRatePercent on add/update

- **Type:** impl · **Layer:** app · **Deps:** T-009, T-015 · **Parallel:** yes (T-019) · **Size:** S
- **Covers:** AC-8.2
- **DoD:**
  - [ ] `assetsStore.add(input)` accepts `annualRatePercent` (defaults `0`)
  - [ ] `assetsStore.update(id, patch)` accepts partial update of `annualRatePercent`
  - [ ] Boundary guard: reject if `annualRatePercent` is `< 0` or `> 100` (silent discard, matches other guards)
  - [ ] T-009 tests GREEN

### Wave 2 — Composables (bridges)

### T-021 — Impl: useNetIncome composable

- **Type:** impl · **Layer:** app · **Deps:** T-002 · **Parallel:** yes (T-022, T-023, T-024) · **Size:** S
- **Covers:** AC-2.1, AC-2.2, AC-2.3, AC-2.4, AC-2.5
- **DoD:**
  - [ ] `src/composables/useNetIncome.ts` exposes `netIncome: ComputedRef<number>` and `freeForAllocation: ComputedRef<number>`
  - [ ] Wraps `calcNetSalary` from `lib/calculations/net-income.ts`
  - [ ] No direct view→lib imports (verified by grep)
  - [ ] T-002 tests pass (lib already correct; composable validates plumbing)

### T-022 — Impl: useHealthScore composable

- **Type:** impl · **Layer:** app · **Deps:** T-003 · **Parallel:** yes (T-021, T-023, T-024) · **Size:** M
- **Covers:** AC-3.1, AC-3.2, AC-3.3, AC-3.4, AC-3.5, AC-3.6
- **DoD:**
  - [ ] Computes housing ratio from `expensesStore.items` filtered by `category === 'vivienda'` / netIncome
  - [ ] Computes emergency months = `liquidAssets / (fixedExpenses + debtObligations)` (denominator from spec AC-3.2)
  - [ ] Computes savings rate = `Σ goal.monthlyContrib / netIncome` (real contribution, per spec AC-3.3)
  - [ ] Returns `{score, label, components, missing}` from `calcHealthScore`
  - [ ] Returns `null` for any component when underlying data is empty (AC-3.4)
  - [ ] T-003 tests GREEN

### T-023 — Impl: useDTI composable

- **Type:** impl · **Layer:** app · **Deps:** T-005, T-017 · **Parallel:** yes (T-021, T-022, T-024) · **Size:** S
- **Covers:** AC-4.2, AC-4.3
- **DoD:**
  - [ ] Computes `totalDebtObligation = Σ (card.minPayment + calcCardObligation(card).installments)` across all cards
  - [ ] DTI = `(totalDebtObligation / netIncome) × 100`
  - [ ] Returns `0` when netIncome = 0 (no division error)
  - [ ] T-005 tests GREEN

### T-024 — Impl: useGoalsBudget composable

- **Type:** impl · **Layer:** app · **Deps:** T-002, T-007 · **Parallel:** yes (T-021, T-022, T-023) · **Size:** S
- **Covers:** AC-6.1, AC-6.2
- **DoD:**
  - [ ] Computes `goalCap = (allocation.savings / 100) × netIncome` (reactive)
  - [ ] Returns `0` when savings% = 0 (EC-5)
  - [ ] Reactive to both `incomeStore` and `allocationStore` changes
  - [ ] T-012 TC-C-007 prep (composable in place for component test)

### T-025 — Impl: useSavingsProjection composable

- **Type:** impl · **Layer:** app · **Deps:** T-007, T-012, T-018, T-020, T-024 · **Parallel:** no · **Size:** S
- **Covers:** AC-8.1, AC-8.2, AC-8.3, AC-8.4, AC-8.5
- **DoD:**
  - [ ] Returns `{ hypothetical: Series, compound: Series, hasConfiguredRate: boolean }`
  - [ ] `hypothetical` always present when netIncome > 0 and savings% > 0
  - [ ] `compound` only includes assets where `annualRatePercent > 0 && type ∈ {savings, investment}`
  - [ ] `hasConfiguredRate` is `false` when no qualifying asset → drives AC-8.5 empty state in chart
  - [ ] Reactive to `assetsStore`, `incomeStore`, `allocationStore`

### T-026 — Impl: useStorageError + StorageErrorToast component

- **Type:** impl · **Layer:** app · **Deps:** T-010 · **Parallel:** yes (T-021…T-025) · **Size:** M
- **Covers:** AC-1.4
- **DoD:**
  - [ ] `useStorageError.ts` exposes a module-level `ref<{visible, reason} | null>` updated from `saveAppState` failures
  - [ ] `StorageErrorToast.vue` renders when `error.value !== null`, sticky (no auto-dismiss), shows i18n keys `storage.error.title`, `storage.error.quotaExceeded`, `storage.error.retry`
  - [ ] Retry button calls `saveAppState` again and clears the toast on success
  - [ ] Mounted in `App.vue` once (root-level toast container)
  - [ ] T-010 test GREEN

### Wave 3 — Wiring views + UI

### T-027 — Impl: main.ts — isHydrating flag + saveAppState error surfacing

- **Type:** impl · **Layer:** infra · **Deps:** T-010, T-013, T-026 · **Parallel:** no · **Size:** S
- **Covers:** AC-1.1, AC-1.2, AC-1.3, AC-1.4
- **DoD:**
  - [ ] `main.ts` introduces `isHydrating = true` before `hydrateStores()`, set to `false` on `nextTick()` after mount
  - [ ] Deep watcher early-returns when `isHydrating === true` (prevents v2→v3 migration triggering immediate re-save loop)
  - [ ] Watcher destructures `{ok, reason} = saveAppState(...)` and emits to `useStorageError` if `!ok`
  - [ ] T-013 round-trip test still GREEN; no extra saves on first load (verify via spy count)

### T-028 — Impl: DashboardView — wire useNetIncome / useHealthScore / useDTI / projection net base

- **Type:** impl · **Layer:** app · **Deps:** T-011, T-021, T-022, T-023 · **Parallel:** no · **Size:** M
- **Covers:** AC-2.2, AC-3.1, AC-3.2, AC-3.3, AC-3.4, AC-3.5, AC-3.6, AC-5.1, AC-5.2, AC-5.3
- **DoD:**
  - [ ] DashboardView uses `useNetIncome()` for all monetary KPIs (no direct `incomeStore.state.grossSalary` for distribution)
  - [ ] HealthScore component receives real data from `useHealthScore()` (replaces static values — addresses Known Bug B-3)
  - [ ] ProjectionChart receives `monthlyIncome = useNetIncome().netIncome` (AC-5.3)
  - [ ] DashboardView does NOT import from `lib/calculations/*` directly (verified by grep)
  - [ ] T-011 tests GREEN

### T-029 — Impl: SavingsProjectionChart + integrate into DashboardView

- **Type:** impl · **Layer:** app · **Deps:** T-012, T-025 · **Parallel:** yes (T-028, T-030, T-031) · **Size:** M
- **Covers:** AC-8.1, AC-8.3, AC-8.4, AC-8.5, AC-8.6
- **DoD:**
  - [ ] `SavingsProjectionChart.vue` uses Chart.js line chart with 2 datasets
  - [ ] Hypothetical series: `borderDash: []` (solid)
  - [ ] Compound series: `borderDash: [5, 5]` (dashed)
  - [ ] When `useSavingsProjection().hasConfiguredRate === false` → renders `<EmptyState>` with i18n key `savings.noRateConfigured` (chart owns its empty state, per vue review)
  - [ ] Chart legend visible; tooltip shows both values at hover month
  - [ ] Mounted in DashboardView in a dedicated section (no new route; respects constitution nav rule)
  - [ ] T-012 component tests GREEN

### T-030 — Impl: UI changes — AssetForm + IncomeView prima button + GoalsView cap

- **Type:** impl · **Layer:** app · **Deps:** T-008, T-012, T-013, T-019, T-020, T-024 · **Parallel:** yes (T-028, T-029, T-031) · **Size:** M
- **Covers:** AC-6.1, AC-6.2, AC-7.1, AC-7.2, AC-7.3, AC-8.2 (data entry)
- **DoD:**
  - [ ] `AssetForm.vue` shows `annualRatePercent` input ONLY when `type ∈ {savings, investment}` (hidden for other types; stores `0`)
  - [ ] Input is a number input with `min="0" max="100" step="0.01"` and i18n hint
  - [ ] IncomeView "Cargar prima de servicios" button calls `incomeStore.addPrimaPreset()` (upsert behavior preserved)
  - [ ] IncomeView shows the prima stream in the list (already supported by existing IncomeStreamRow)
  - [ ] GoalsView displays the cap from `useGoalsBudget()` — does not recompute locally
  - [ ] T-012 TC-C-007 component test GREEN

### T-031 — Impl: i18n keys — add to both es.json and en.json

- **Type:** impl · **Layer:** app · **Deps:** T-010, T-012 · **Parallel:** yes (T-028, T-029, T-030) · **Size:** S
- **Covers:** AC-1.4 (toast text), AC-8.5 (empty state), AC-8.2 (form labels), AC-4.1 (APR tooltip)
- **DoD:**
  - [ ] `src/i18n/es.json` and `src/i18n/en.json` BOTH receive the following keys:
    - `storage.error.title`
    - `storage.error.quotaExceeded`
    - `storage.error.invalidState`
    - `storage.error.retry`
    - `storage.error.unknownReason`
    - `savings.projection.hypothetical.label`
    - `savings.projection.compound.label`
    - `savings.noRateConfigured`
    - `savings.projection.section.title`
    - `assets.annualRatePercent.label`
    - `assets.annualRatePercent.hint`
    - `debts.apr.label` ("Tasa Efectiva Anual (E.A.)")
    - `debts.apr.tooltip` (explanation of TEA convention — ADR-1)
  - [ ] No hardcoded Spanish/English strings introduced in any new template
  - [ ] `npm run typecheck` passes (vue-i18n strict mode if enabled)

---

## Refactor + Docs Phase

### T-032 — Refactor: prima.ts inline legal citation

- **Type:** refactor · **Layer:** domain · **Deps:** T-018 (no behavior change) · **Parallel:** yes (T-033) · **Size:** S
- **Covers:** — (compliance with colombia-payroll rule)
- **DoD:**
  - [ ] `src/lib/tax/colombia/prima.ts` has inline comment above `calcPrimaServicios`: *"Per Art. 306 CST: prima = (salario mensual × días en el semestre) / 180. For a full 6-month period this simplifies to gross / 2. Auxilio de transporte (Art. 7 Ley 1/1963) is intentionally excluded — out of scope per spec; users earning > 2 SMMLV (current threshold ~$2.8M) do not receive auxilio."*
  - [ ] No behavioral change; existing tests still GREEN
  - [ ] Linter clean

### T-033 — Docs: update CLAUDE.md known-bugs status + add Known Bug → Fixed

- **Type:** docs · **Layer:** cross · **Deps:** T-017, T-022, T-027 · **Parallel:** yes (T-032) · **Size:** S
- **Covers:** — (project memory hygiene)
- **DoD:**
  - [ ] `CLAUDE.md` "Known Bugs" table updated: B-1 (amortization TEA), B-2 (persistence), B-3 (health score real data) marked as FIXED with PR/commit reference
  - [ ] "Missing Features" table updated: US-8 modules marked as IMPLEMENTED
  - [ ] "Domain Model" section: `Asset` includes `annualRatePercent`; `IncomeStream` includes optional `isPrima` field
  - [ ] "Active Feature" section: marked as **completed**, sign-off pending review

---

## Regression Phase

### T-LAST (T-034) — Regression: full validation gate

- **Type:** test · **Layer:** cross · **Deps:** T-015, T-016, T-017, T-018, T-019, T-020, T-021, T-022, T-023, T-024, T-025, T-026, T-027, T-028, T-029, T-030, T-031, T-032, T-033 · **Parallel:** no · **Size:** S
- **Covers:** ALL ACs (AC-1.1 … AC-8.6)
- **DoD:**
  - [ ] `npm run typecheck` passes
  - [ ] `npm run lint` passes (zero new warnings)
  - [ ] `npm test` — all unit + component + integration green
  - [ ] `npm run test:coverage` — `lib/calculations/**` ≥ 80%, `lib/tax/**` ≥ 80%, global ≥ 60%
  - [ ] `npm run e2e` — all 5 Playwright specs green on desktop + mobile viewports
  - [ ] Manual smoke: open app fresh, run through all 11 routes, verify no console errors
  - [ ] Migration smoke: seed `localStorage` with a v2 payload (saved fixture), reload, verify v3 migration occurred and `finance_app_data_v2_backup` exists
  - [ ] CHANGELOG entry written (if release workflow expects it)

---

## Dependency graph (high level)

```
T-001 (setup)
   │
   ├── T-002 … T-014 (13 test tasks, all parallel) ─┐
   │                                                  │
   ▼                                                  ▼
Wave 1 (foundation):  T-015 → T-016
                       T-017 (TEA)   ← T-004
                       T-018 (savings-lib) ← T-007
                       T-019 (income store) ← T-008, T-015
                       T-020 (assets store) ← T-009, T-015
   │
Wave 2 (composables):  T-021 ← T-002
                       T-022 ← T-003
                       T-023 ← T-005, T-017
                       T-024 ← T-002, T-007
                       T-025 ← T-018, T-020, T-024
                       T-026 ← T-010
   │
Wave 3 (wiring + UI):  T-027 ← T-010, T-013, T-026
                       T-028 ← T-011, T-021, T-022, T-023
                       T-029 ← T-012, T-025
                       T-030 ← T-019, T-020, T-024
                       T-031 ← T-001
   │
Refactor + docs:       T-032, T-033 (parallel)
   │
T-LAST (T-034): regression — deps all impl + refactor + docs
```

## Effort estimate

- 1 × setup (S) ≈ 1.5h
- 13 × test (mostly S, 4× M) ≈ 9 × 1.5h + 4 × 4h = 29.5h
- 17 × impl (mostly S, 5× M) ≈ 12 × 1.5h + 5 × 4h = 38h
- 2 × refactor/docs (S) ≈ 3h
- 1 × regression (S) ≈ 1.5h
- **Total estimate:** ~73 hours of focused work (≈ 2 weeks solo at 50% utilization)

---

## Sign-off

<!-- mode=solo -->
- [x] Author: `Johann Medina` — `2026-05-16`
