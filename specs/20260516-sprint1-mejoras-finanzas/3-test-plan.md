# Test Plan — Sprint 1: Personal Finance App Improvements

**Feature:** `20260516-sprint1-mejoras-finanzas`  
**Spec:** [1-spec.md](1-spec.md) · **Plan:** [2-plan.md](2-plan.md)

---

## 1. Testing Policy (from Constitution)

- Pyramid: ~60% unit / ~30% component / ~10% E2E (±10% tolerance)
- Coverage gate: `lib/tax/` ≥ 80% (new constants + presets code)
- Test-first: MUST for all tax/calculation functions (AC-4.x constants and presets)
- Mocking: MUST NOT mock Pinia in unit tests; SHOULD use `createTestingPinia({ stubActions: false })` in component tests

---

## 2. Traceability Matrix

| AC | Description | TCs | Level(s) |
|---|---|---|---|
| AC-1.1 | Load error → visible notification | TC-U-026, TC-C-001, TC-E-001 | U + C + E2E |
| AC-1.2 | Notification persists (no auto-dismiss) | TC-C-002 | C |
| AC-1.3 | Save failure → notification + retry | TC-C-003 | C |
| AC-1.4 | Dismiss → app fully usable | TC-U-002, TC-C-004, TC-E-001 | U + C + E2E |
| AC-2.1 | DTI tooltip: definition + thresholds | TC-U-017, TC-C-005 | U + C |
| AC-2.2 | Housing ratio tooltip | TC-U-018, TC-C-006 | U + C |
| AC-2.3 | Emergency fund tooltip | TC-U-019, TC-C-007 | U + C |
| AC-2.4 | Savings rate tooltip | TC-U-020, TC-C-008 | U + C |
| AC-2.5 | Health score tooltip | TC-U-021, TC-C-009 | U + C |
| AC-2.6 | Tooltips visible on 375px viewport | TC-C-010 | C |
| AC-2.7 | Tooltip on keyboard focus | TC-C-011 | C |
| AC-3.1 | No income → income CTA | TC-U-003, TC-C-012 | U + C |
| AC-3.2 | Income set, no expenses → expenses CTA | TC-U-004, TC-C-013 | U + C |
| AC-3.3 | Missing data added → CTA disappears | TC-U-005, TC-C-014 | U + C |
| AC-3.4 | Partial data: metrics shown + prompt | TC-U-006, TC-C-015 | U + C |
| AC-4.1 | Salary > $5,694,000 → solidarity 1% added | TC-U-007, TC-U-022, TC-U-024, TC-E-002 | U + E2E |
| AC-4.2 | Salary ≤ $5,694,000 → no solidarity | TC-U-008 | U |
| AC-4.3 | Presets applied twice → no duplicate | TC-U-009, TC-E-002 | U + E2E |
| AC-4.4 | Solidarity not auto-removed on salary drop | TC-U-025 | U |
| AC-5.1 | Salary ≤ $2,847,000 + no transport → banner | TC-U-011, TC-U-014, TC-U-023, TC-C-016, TC-E-003 | U + C + E2E |
| AC-5.2 | Accept → transport $200K added, banner hides | TC-C-017, TC-E-003 | C + E2E |
| AC-5.3 | Transport already present → no banner | TC-U-012 | U |
| AC-5.4 | Dismiss → banner gone for session | TC-U-015, TC-C-018 | U + C |
| AC-5.5 | Salary rises above threshold → notice shown | TC-U-016, TC-C-019 | U + C |

**Coverage: 24/24 ACs · 0 orphan TCs ✅**

---

## 3. Test Scenarios

### Unit Tests — `lib/` and composables

---

#### TC-U-001 (AC-1.1): useStorageError — setError makes error state truthy
```
Given: useStorageError composable initialized with no error
When: setError('invalid_json') is called
Then: the returned error ref is truthy and contains 'invalid_json'
```

#### TC-U-002 (AC-1.4): useStorageError — clearError resets state
```
Given: useStorageError with an active error set
When: clearError() is called
Then: the error ref becomes falsy
```

#### TC-U-003 (AC-3.1): useDashboardGuide — no income → income CTA
```
Given: income store with grossSalary = 0 and empty deductions
When: useDashboardGuide() is called
Then: shouldShow = true and ctaTarget points to the income section
```

#### TC-U-004 (AC-3.2): useDashboardGuide — income set, no expenses → expenses CTA
```
Given: income store with grossSalary = 3_000_000 and expenses store with items = []
When: useDashboardGuide() is called
Then: shouldShow = true and ctaTarget points to the expenses section
```

#### TC-U-005 (AC-3.3): useDashboardGuide — both set → shouldShow = false
```
Given: income store with grossSalary = 3_000_000 and expenses store with 1+ items
When: useDashboardGuide() is called
Then: shouldShow = false
```

#### TC-U-006 (AC-3.4): useDashboardGuide — exposes calculable flag
```
Given: income store with grossSalary > 0 and expenses store empty
When: useDashboardGuide() is called
Then: hasCalculableIncome = true (income KPIs can render) AND shouldShow = true (expenses CTA active)
```

#### TC-U-007 (AC-4.1): presets.ts — solidarity included above threshold
```
Given: existing deductions = [salud 4%, pensión 4%] and gross = 6_000_000
When: applyColombiaPresets(deductions, gross) is called
Then: result contains an entry with id '__solidarity__', type 'percent', amount 1
```

#### TC-U-008 (AC-4.2): presets.ts — no solidarity at or below threshold
```
Given: existing deductions = [] and gross = 5_694_000
When: applyColombiaPresets(deductions, gross) is called
Then: result does NOT contain any entry with id '__solidarity__'
```

#### TC-U-009 (AC-4.3): presets.ts — solidarity not duplicated on second apply
```
Given: deductions already containing '__solidarity__' at 1%
When: applyColombiaPresets(deductions, 6_000_000) is called again
Then: result contains exactly one '__solidarity__' entry
```

#### TC-U-010 (EC-1): presets.ts — threshold boundary exactly at 4 × SMMLV
```
Given: gross = 5_694_000 (exactly 4 × SMMLV_2025)
When: applyColombiaPresets([], gross) is called
Then: result has NO '__solidarity__' entry (strictly above threshold required)

Given: gross = 5_694_001 (one peso above threshold)
When: applyColombiaPresets([], gross) is called
Then: result CONTAINS '__solidarity__' entry
```

#### TC-U-011 (AC-5.1): useTransportAllowance — shouldShow true below threshold
```
Given: gross salary = 2_000_000 and nonSalaryBenefits = []
When: useTransportAllowance composable is evaluated
Then: shouldShow = true
```

#### TC-U-012 (AC-5.3): useTransportAllowance — no banner if benefit already present
```
Given: gross salary = 2_000_000 and nonSalaryBenefits contains a benefit matching /^auxilio.*transporte/i
When: useTransportAllowance composable is evaluated
Then: shouldShow = false
```

#### TC-U-013 (AC-5.1 negative): useTransportAllowance — no banner above threshold
```
Given: gross salary = 3_000_000 and nonSalaryBenefits = []
When: useTransportAllowance composable is evaluated
Then: shouldShow = false
```

#### TC-U-014 (EC-2): useTransportAllowance — threshold inclusive at 2 × SMMLV
```
Given: gross salary = 2_847_000 (exactly 2 × SMMLV_2025) and no transport benefit
When: useTransportAllowance composable is evaluated
Then: shouldShow = true (threshold is inclusive ≤)
```

#### TC-U-015 (AC-5.4): useTransportAllowance — dismiss suppresses banner for session
```
Given: shouldShow = true (salary ≤ threshold, no benefit)
When: dismiss() is called
Then: shouldShow becomes false and remains false even if salary is re-read with same conditions
```

#### TC-U-016 (AC-5.5): useTransportAllowance — notice when salary rises above threshold
```
Given: transport benefit present AND salary previously ≤ threshold
When: gross salary changes to 3_500_000 (above threshold)
Then: showThresholdNotice = true
```

#### TC-U-017 (AC-2.1): useFinancialGlossary — DTI term has title and body
```
Given: useFinancialGlossary composable
When: getTerm('dti') is called
Then: result.title is a non-empty string AND result.body mentions debt percentage AND result.good and result.risky thresholds are present
```

#### TC-U-018 (AC-2.2): useFinancialGlossary — housing term
```
Given: useFinancialGlossary composable
When: getTerm('housing') is called
Then: result.title and result.body are non-empty, result contains a recommended ceiling value
```

#### TC-U-019 (AC-2.3): useFinancialGlossary — emergency term
```
Given: useFinancialGlossary composable
When: getTerm('emergency') is called
Then: result.title and result.body non-empty, result contains a months range (3–6)
```

#### TC-U-020 (AC-2.4): useFinancialGlossary — savings term
```
Given: useFinancialGlossary composable
When: getTerm('savings') is called
Then: result.title and result.body non-empty, result mentions income percentage
```

#### TC-U-021 (AC-2.5): useFinancialGlossary — healthScore term
```
Given: useFinancialGlossary composable
When: getTerm('healthScore') is called
Then: result.title and result.body non-empty, result mentions 0–100 scale and four components
```

#### TC-U-022 (AC-4.1 invariant): constants — SOLIDARITY_THRESHOLD = SMMLV_2025 × 4
```
Given: constants module
When: SOLIDARITY_THRESHOLD is read
Then: SOLIDARITY_THRESHOLD === SMMLV_2025 * 4
```

#### TC-U-023 (AC-5.1 invariant): constants — TRANSPORT_THRESHOLD = SMMLV_2025 × 2
```
Given: constants module
When: TRANSPORT_THRESHOLD is read
Then: TRANSPORT_THRESHOLD === SMMLV_2025 * 2
```

#### TC-U-024 (AC-4.1): incomeStore — applyColombiaPresets adds solidarity when salary qualifies
```
Given: incomeStore with grossSalary = 8_000_000 and empty deductions
When: store.applyColombiaPresets() is called
Then: store.state.deductions contains an item with id '__solidarity__' and amount 1
```

#### TC-U-025 (AC-4.4): incomeStore — solidarity deduction remains when salary drops
```
Given: incomeStore with grossSalary = 8_000_000 and solidarity deduction present
When: setGrossSalary(3_000_000) is called
Then: store.state.deductions still contains '__solidarity__' (not auto-removed)
```

#### TC-U-026 (AC-1.1 negative): useStorageError — no error on init
```
Given: freshly initialized useStorageError composable
When: the error ref is read before any setError call
Then: error is falsy
```

---

### Component Tests — Vue components with createTestingPinia

---

#### TC-C-001 (AC-1.1): StorageErrorToast — renders visible when error is set
```
Given: StorageErrorToast mounted with useStorageError error = 'invalid_json'
When: the component renders
Then: a notification element with role='alert' is visible in the DOM
```

#### TC-C-002 (AC-1.2): StorageErrorToast — notification does not auto-dismiss
```
Given: StorageErrorToast with an active error
When: 10 seconds of fake timer advance pass without user interaction
Then: the alert is still visible in the DOM
```

#### TC-C-003 (AC-1.3): StorageErrorToast — retry button visible for save error
```
Given: StorageErrorToast with error type 'quota_exceeded'
When: the component renders
Then: a button with accessible name matching /reint/i is visible
```

#### TC-C-004 (AC-1.4): StorageErrorToast — dismiss clears notification
```
Given: StorageErrorToast with an active error
When: the dismiss button is clicked
Then: the role='alert' element is no longer in the DOM
```

#### TC-C-005 (AC-2.1): KpiCard type=dti — tooltip content includes DTI explanation
```
Given: KpiCard rendered with type='dti' and label='DTI'
When: the ⓘ trigger element receives a pointerenter event
Then: a tooltip element is visible containing text matching /deuda/i and threshold values (20, 36)
```

#### TC-C-006 (AC-2.2): HealthScore breakdown — housing tooltip
```
Given: HealthScore rendered with breakdown data, breakdown open
When: the housing label trigger receives a pointerenter event
Then: tooltip visible containing text matching /vivienda/i or /housing/i and /30%/
```

#### TC-C-007 (AC-2.3): HealthScore breakdown — emergency fund tooltip
```
Given: HealthScore rendered with breakdown open
When: the emergency label trigger receives pointerenter
Then: tooltip visible containing text matching /emergencia/i and months range (3.*6|6.*3)
```

#### TC-C-008 (AC-2.4): HealthScore breakdown — savings rate tooltip
```
Given: HealthScore rendered with breakdown open
When: savings label trigger receives pointerenter
Then: tooltip visible containing text matching /ahorro/i and /ingreso/i
```

#### TC-C-009 (AC-2.5): HealthScore — score title tooltip
```
Given: HealthScore rendered with a score value
When: the score section title trigger receives pointerenter
Then: tooltip visible containing text matching /0.*100|100.*0/ and four component names
```

#### TC-C-010 (AC-2.6): KpiCard tooltip — contained within 375px viewport
```
Given: KpiCard with DTI type rendered in a jsdom container constrained to 375px
When: tooltip is triggered via pointerenter
Then: getBoundingClientRect() of tooltip element has right ≤ 375 (no overflow)
```

#### TC-C-011 (AC-2.7): KpiCard tooltip — appears on keyboard focus
```
Given: KpiCard with tooltip trigger
When: userEvent.tab() brings focus to the trigger element
Then: tooltip is visible in the DOM (same content as on hover)
```

#### TC-C-012 (AC-3.1): DashboardView — income CTA when grossSalary = 0
```
Given: DashboardView mounted with incomeStore.grossSalary = 0
When: the view renders
Then: an element matching /registra.*ingreso|agrega.*ingreso/i is visible, linking to /income
```

#### TC-C-013 (AC-3.2): DashboardView — expenses CTA when income set but no expenses
```
Given: DashboardView with incomeStore.grossSalary = 3_000_000 and expensesStore.items = []
When: the view renders
Then: an element matching /agrega.*gasto|registra.*gasto/i is visible, linking to /expenses
```

#### TC-C-014 (AC-3.3): DashboardView — CTA disappears reactively
```
Given: DashboardView with grossSalary = 0 (income CTA visible)
When: incomeStore.setGrossSalary(3_000_000) is called
Then: the income CTA element is no longer in the DOM without a page refresh
```

#### TC-C-015 (AC-3.4): DashboardView — KPIs render alongside empty-state prompt
```
Given: DashboardView with grossSalary = 3_000_000 and no expenses
When: the view renders
Then: KpiCard with label 'Ingreso neto' is visible AND the expenses CTA is also visible
```

#### TC-C-016 (AC-5.1): TransportAllowanceSuggestion — renders when shouldShow = true
```
Given: TransportAllowanceSuggestion mounted with useTransportAllowance returning shouldShow = true
When: the component renders
Then: an element matching /auxilio.*transporte|transporte.*\$200/i is visible
```

#### TC-C-017 (AC-5.2): TransportAllowanceSuggestion — accept adds benefit and hides
```
Given: TransportAllowanceSuggestion rendered and visible
When: the accept button (matching /agregar|añadir/i) is clicked
Then: incomeStore.addBenefit is called with label 'Auxilio de transporte' and amount 200_000, and the banner is no longer visible
```

#### TC-C-018 (AC-5.4): TransportAllowanceSuggestion — dismiss hides banner
```
Given: TransportAllowanceSuggestion rendered and visible
When: the dismiss button (matching /no.*gracias|cerrar|✕/i) is clicked
Then: the banner element is no longer visible in the DOM
```

#### TC-C-019 (AC-5.5): IncomeView — threshold notice after salary rises
```
Given: IncomeView with transport benefit present and salary previously ≤ threshold
When: setGrossSalary(4_000_000) is called (above threshold)
Then: a notice element matching /auxilio.*no aplica|ya no aplica/i is visible
```

---

### E2E Tests — Playwright (top-level user flows)

---

#### TC-E-001 (AC-1.1, AC-1.2, AC-1.4): Load error → notification → dismiss → usable
```
Given: localStorage contains JSON that fails schema validation (e.g. schemaVersion: 99)
When: the user opens the app
Then: a visible error notification is present on screen
  AND the notification is still visible after 5 seconds without interaction
  AND clicking the dismiss button removes the notification
  AND the user can navigate to /income without errors
```

#### TC-E-002 (AC-4.1, AC-4.3): Colombia presets with high salary → solidarity appears once
```
Given: returningPage fixture with grossSalary = 8_000_000 and no deductions
When: the user navigates to /income and clicks the Colombia presets button
Then: "Fondo de Solidaridad" (or matching text) appears in the deductions list
  AND clicking the button a second time does not add a duplicate entry
```

#### TC-E-003 (AC-5.1, AC-5.2): Low salary → transport suggestion → accept → benefit visible
```
Given: returningPage fixture with grossSalary = 2_000_000 and no non-salary benefits
When: the user navigates to /income
Then: a transport allowance suggestion banner is visible
  AND clicking the accept button adds "Auxilio de transporte" to the benefits list
  AND the suggestion banner is no longer visible after accepting
```

---

## 4. Mocking Strategy

| Dependency | Strategy | Justification |
|---|---|---|
| `localStorage` | **Real** (pre-seeded via `addInitScript` in E2E; direct set in component tests) | Constitution prefers real for storage; ensures actual serialization/parse is exercised |
| Pinia stores in component tests | **Real** via `createTestingPinia({ stubActions: false })` | Constitution rule: `stubActions: false` always — prevents silent mutation misses |
| Session dismissal (`module-level ref`) | **Reset** via `vi.resetModules()` between tests | Module-level state must be isolated per test; no other way than module reset |
| Viewport width (375px) for TC-C-010 | **Simulated** via `Object.defineProperty(window, 'innerWidth', 375)` | jsdom has no real layout engine — viewport simulation is the only viable option in unit/component test env |
| radix-vue Tooltip portal | **Real** — appended to `document.body` in jsdom | radix-vue portals to body by default; jsdom supports `document.body.appendChild` natively |
| `Date.now()` for TC-C-002 timing | **Faked** via `vi.useFakeTimers()` | Needed to advance time without real async waits; restores via `vi.useRealTimers()` after test |

---

## 5. Performance

N/A for this sprint — no new financial calculations, no new chart rendering, no data structure changes. The five improvements are limited to:
- One `parseError` string check in the boot cycle (O(1), negligible)
- One threshold comparison per salary change (O(1))
- Static glossary term lookup (O(1) map access)

No performance regression expected. Existing Vitest benchmarks unchanged.

---

## 6. Security

- **Tooltip content** sourced from i18n translation strings (not from user input or store state) — no XSS risk from `{{ }}` interpolation.
- **Threshold constants** (`SMMLV_2025`, `AUXILIO_TRANSPORTE_2025`) are compile-time values — not runtime user input, no injection surface.
- **Solidarity / transport deduction labels** added via `incomeStore.addDeduction()` / `addBenefit()` which pass through existing boundary guards (label non-empty, amount ≥ 0) — no bypass of store validation.
- **`parseError` string** from `loadAppState()` is an internal Zod message — never rendered in the DOM via `v-html` (forbidden by Constitution); rendered via `{{ }}` interpolation.

No new security surface introduced by this sprint.

---

## Sign-off

- [x] Author: Johann Medina — 2026-05-16
