# Tasks — Sprint 1: Personal Finance App Improvements

**Feature:** `20260516-sprint1-mejoras-finanzas`  
**Spec / Plan / Test Plan:** all signed off 2026-05-16  
**Mode:** solo (concise DoD)

---

## Summary

| Type | Count | IDs |
|---|---|---|
| setup | 1 | T-001 |
| test | 15 | T-002, T-003, T-004, T-007, T-008, T-009, T-013, T-014, T-017, T-018, T-019, T-022, T-023, T-024, T-025 |
| impl | 11 | T-005, T-006, T-010, T-011, T-012, T-015, T-016, T-020, T-021, T-026, T-027 |
| docs | 1 | T-028 |
| regression | 1 | T-LAST |
| **Total** | **29** | |

**Parallel groups (after T-001):**
- All 15 test tasks can run in parallel (none share files).
- The 5 user-story impl clusters are independent — US-1, US-2, US-3, US-4, US-5 can run in parallel.
- Within US-2: T-010 must precede T-011 and T-012 (T-011 ‖ T-012 after T-010).
- T-028 (docs) ‖ T-LAST (regression) — but T-LAST depends on all impls.

**Effort estimate:** 29 × S × 1.5h ≈ 43.5h (concentrated work; with parallelization closer to ~20–25h elapsed).

---

## T-001 — Setup: stubs and scaffolding

**Type:** setup · **Size:** S · **Covers:** —  
**Deps:** —

Create stub files so subsequent `test` tasks can produce assertion-level RED (not import errors).

**Actions:**
- Create `src/composables/useFinancialGlossary.ts` — export `function useFinancialGlossary() { return { getTerm: (_k: string) => null } }`.
- Create `src/composables/useDashboardGuide.ts` — export `function useDashboardGuide() { return { shouldShow: ref(false), ctaTarget: ref(''), ctaLabel: ref(''), hasCalculableIncome: ref(false) } }`.
- Create `src/composables/useTransportAllowance.ts` — export `function useTransportAllowance() { return { shouldShow: ref(false), showThresholdNotice: ref(false), dismiss: () => {}, accept: () => {} } }`.
- Create `src/components/dashboard/EmptyStateGuide.vue` — empty `<template><div></div></template>`.
- Create `src/components/income/TransportAllowanceSuggestion.vue` — empty template.
- Extend `src/lib/tax/colombia/constants.ts` — add placeholders `SMMLV_2025 = 0`, `SOLIDARITY_THRESHOLD = 0`, `TRANSPORT_THRESHOLD = 0`, `AUXILIO_TRANSPORTE_2025 = 0`.
- Extend `src/i18n/es.json` and `src/i18n/en.json` — add empty namespaces `glossary: {}`, `dashboard.guide: {}`, `income.transport: {}`.

**DoD:**
- [ ] All listed files exist (verified by `ls`).
- [ ] `npm run typecheck` exits 0.
- [ ] `npm test` exits 0 (existing suite still green; stubs untested).

---

## US-1 — Data load error notification

### T-002 — Test: useStorageError unit tests
**Type:** test · **Size:** S · **Covers:** AC-1.1, AC-1.4 · **TCs:** TC-U-001, TC-U-002, TC-U-026  
**Deps:** T-001 · **Parallel:** yes (T-003, T-004, T-007, T-008, T-009, T-013, T-014, T-017, T-018, T-019, T-022, T-023, T-024, T-025)

- [ ] Add `tests/unit/composables/useStorageError.test.ts` covering setError(), clearError(), initial state.
- [ ] Running the test file produces ≥3 RED assertions (not import errors).

### T-003 — Test: StorageErrorToast component tests
**Type:** test · **Size:** S · **Covers:** AC-1.1, AC-1.2, AC-1.3, AC-1.4 · **TCs:** TC-C-001..004  
**Deps:** T-001 · **Parallel:** yes (with other tests)

- [ ] Add tests in `tests/component/StorageErrorToast.test.ts` for: visible-when-error, no-auto-dismiss, retry-button-for-save-error, dismiss-clears.
- [ ] All 4 tests produce assertion-level RED on the current stub (or the existing component if behavior is missing).

### T-004 — Test: E2E persistence error flow
**Type:** test · **Size:** S · **Covers:** AC-1.1, AC-1.2, AC-1.4 · **TCs:** TC-E-001  
**Deps:** T-001 · **Parallel:** yes

- [ ] Add `e2e/persistence-error.spec.ts` that seeds invalid JSON in localStorage via `context.addInitScript`, opens the app, asserts notification visible, dismisses, asserts navigation works.
- [ ] `playwright test --list` includes the new spec (full run not required at this stage).

### T-005 — Impl: capture parseError in main.ts boot
**Type:** impl · **Size:** S · **Covers:** AC-1.1, AC-1.4  
**Deps:** T-002

- [ ] Modify `src/main.ts` hydrateStores: destructure `parseError` from `loadAppState()` and call `useStorageError().setError(parseError)` when non-null.
- [ ] Extend `src/composables/useStorageError.ts` with a `setError(reason)` that accepts the union `'invalid_json' | 'quota_exceeded' | 'invalid_state' | string` for load-error messages.
- [ ] T-002 tests GREEN.
- [ ] Full suite GREEN, lint+typecheck clean.

### T-006 — Impl: StorageErrorToast supports load and save error types
**Type:** impl · **Size:** S · **Covers:** AC-1.1, AC-1.2, AC-1.3  
**Deps:** T-003, T-005

- [ ] Update `src/components/common/StorageErrorToast.vue` to render i18n message keyed by error reason, show retry button only for `quota_exceeded`/`invalid_state`, never auto-dismiss.
- [ ] Add i18n keys `storage.errorToast.load.invalidJson`, `storage.errorToast.load.invalidState`, `storage.errorToast.load.dismissedNote` to both `es.json` and `en.json`.
- [ ] T-003 tests GREEN.
- [ ] Full suite GREEN, lint+typecheck clean.

---

## US-2 — Tooltips for financial terms

### T-007 — Test: useFinancialGlossary unit tests
**Type:** test · **Size:** S · **Covers:** AC-2.1..2.5 · **TCs:** TC-U-017..021  
**Deps:** T-001 · **Parallel:** yes

- [ ] Add `tests/unit/composables/useFinancialGlossary.test.ts` covering 5 terms (dti, housing, emergency, savings, healthScore) returning {title, body, ranges?}.
- [ ] 5 tests RED on stub.

### T-008 — Test: KpiCard tooltip component tests
**Type:** test · **Size:** S · **Covers:** AC-2.1, AC-2.6, AC-2.7 · **TCs:** TC-C-005, TC-C-010, TC-C-011  
**Deps:** T-001 · **Parallel:** yes

- [ ] Extend `tests/component/KpiCard.test.ts` (or create) with: pointerenter shows tooltip (DTI definition + thresholds), 375px viewport contains tooltip, keyboard focus triggers tooltip.
- [ ] 3 tests RED.

### T-009 — Test: HealthScore tooltip component tests
**Type:** test · **Size:** S · **Covers:** AC-2.2..2.5 · **TCs:** TC-C-006..009  
**Deps:** T-001 · **Parallel:** yes

- [ ] Extend `tests/component/HealthScore.test.ts` (or create) with 4 tooltip tests (housing, emergency, savings, score).
- [ ] 4 tests RED.

### T-010 — Impl: useFinancialGlossary composable + i18n keys
**Type:** impl · **Size:** S · **Covers:** AC-2.1, AC-2.2, AC-2.3, AC-2.4, AC-2.5  
**Deps:** T-007

- [ ] Implement `useFinancialGlossary` returning `getTerm(key)` → `{ title, body, good?, risky?, recommended?, range? }` reading from i18n.
- [ ] Add 5 namespaces to `src/i18n/es.json` (and matching English placeholders in `en.json`): `glossary.dti`, `glossary.housing`, `glossary.emergency`, `glossary.savings`, `glossary.healthScore`.
- [ ] T-007 tests GREEN.
- [ ] Full suite GREEN, lint+typecheck clean.

### T-011 — Impl: KpiCard tooltip integration
**Type:** impl · **Size:** S · **Covers:** AC-2.1, AC-2.6, AC-2.7  
**Deps:** T-008, T-010 · **Parallel:** yes (T-012)

- [ ] Wrap DTI label in `src/components/dashboard/KpiCard.vue` with radix-vue `TooltipRoot`/`TooltipTrigger`/`TooltipContent`, using `useFinancialGlossary().getTerm('dti')`.
- [ ] TooltipContent positioned with `side="bottom"` and `avoidCollisions` so it stays within viewport.
- [ ] Trigger has `tabindex="0"` for keyboard focus.
- [ ] T-008 tests GREEN.
- [ ] Full suite GREEN, lint+typecheck clean.

### T-012 — Impl: HealthScore tooltip integration
**Type:** impl · **Size:** S · **Covers:** AC-2.2, AC-2.3, AC-2.4, AC-2.5, AC-2.6, AC-2.7  
**Deps:** T-009, T-010 · **Parallel:** yes (T-011)

- [ ] Add tooltip wrappers to 4 breakdown labels (housing, emergency, savings, healthScore section title) in `src/components/dashboard/HealthScore.vue`.
- [ ] Each trigger uses `useFinancialGlossary().getTerm(key)` and `tabindex="0"`.
- [ ] Ensure single `TooltipProvider` at App.vue root (add if absent).
- [ ] T-009 tests GREEN.
- [ ] Full suite GREEN, lint+typecheck clean.

---

## US-3 — Empty state guidance

### T-013 — Test: useDashboardGuide unit tests
**Type:** test · **Size:** S · **Covers:** AC-3.1, AC-3.2, AC-3.3, AC-3.4 · **TCs:** TC-U-003..006  
**Deps:** T-001 · **Parallel:** yes

- [ ] Add `tests/unit/composables/useDashboardGuide.test.ts` covering 4 scenarios.
- [ ] 4 tests RED on stub.

### T-014 — Test: DashboardView empty-state component tests
**Type:** test · **Size:** S · **Covers:** AC-3.1, AC-3.2, AC-3.3, AC-3.4 · **TCs:** TC-C-012..015  
**Deps:** T-001 · **Parallel:** yes

- [ ] Extend `tests/component/DashboardView*.test.ts` with 4 empty-state scenarios.
- [ ] 4 tests RED.

### T-015 — Impl: useDashboardGuide composable
**Type:** impl · **Size:** S · **Covers:** AC-3.1, AC-3.2, AC-3.3, AC-3.4  
**Deps:** T-013

- [ ] Implement `useDashboardGuide` returning reactive `{ shouldShow, ctaTarget, ctaLabel, hasCalculableIncome }` derived from incomeStore + expensesStore.
- [ ] Priority order: income missing → income CTA; else expenses missing → expenses CTA; else `shouldShow: false`.
- [ ] T-013 tests GREEN.
- [ ] Full suite GREEN, lint+typecheck clean.

### T-016 — Impl: EmptyStateGuide component + DashboardView wire
**Type:** impl · **Size:** S · **Covers:** AC-3.1, AC-3.2, AC-3.3, AC-3.4  
**Deps:** T-014, T-015

- [ ] Implement `src/components/dashboard/EmptyStateGuide.vue` with i18n-keyed title, body, and `RouterLink` CTA from `useDashboardGuide`.
- [ ] Mount in `src/views/DashboardView.vue` above the KPI grid with `v-if="guide.shouldShow"`.
- [ ] Add i18n keys `dashboard.guide.income.{title,body,cta}` and `dashboard.guide.expenses.{title,body,cta}`.
- [ ] T-014 tests GREEN.
- [ ] Full suite GREEN, lint+typecheck clean.

---

## US-4 — Solidarity fund in Colombia presets

### T-017 — Test: lib/tax/colombia constants + presets
**Type:** test · **Size:** S · **Covers:** AC-4.1, AC-4.2, AC-4.3 · **TCs:** TC-U-007..010, TC-U-022  
**Deps:** T-001 · **Parallel:** yes

- [ ] Extend `tests/unit/tax/colombia/presets.test.ts` with solidarity tests (above/below threshold, idempotency, boundary).
- [ ] Add `tests/unit/tax/colombia/constants.test.ts` asserting `SOLIDARITY_THRESHOLD === SMMLV_2025 * 4`.
- [ ] 5 tests RED on stub values.

### T-018 — Test: incomeStore.applyColombiaPresets
**Type:** test · **Size:** S · **Covers:** AC-4.1, AC-4.4 · **TCs:** TC-U-024, TC-U-025  
**Deps:** T-001 · **Parallel:** yes

- [ ] Extend `tests/unit/stores/incomeStore.test.ts` with: applyColombiaPresets at high salary adds solidarity; setGrossSalary below threshold afterwards does NOT auto-remove solidarity.
- [ ] 2 tests RED.

### T-019 — Test: E2E Colombia presets flow
**Type:** test · **Size:** S · **Covers:** AC-4.1, AC-4.3 · **TCs:** TC-E-002  
**Deps:** T-001 · **Parallel:** yes

- [ ] Add `e2e/colombia-presets-solidarity.spec.ts` using `returningPage` with salary 8M, applies presets, asserts solidarity present, clicks again, asserts no duplicate.
- [ ] `playwright test --list` includes it.

### T-020 — Impl: SMMLV constants + solidarity in presets.ts
**Type:** impl · **Size:** S · **Covers:** AC-4.1, AC-4.2, AC-4.3  
**Deps:** T-017

- [ ] Replace stub values in `src/lib/tax/colombia/constants.ts`: `SMMLV_2025 = 1_423_500` (cite Decreto 1572 de 2024), `SOLIDARITY_THRESHOLD = SMMLV_2025 * 4` (cite Ley 100/1993 Art. 20).
- [ ] Extend `src/lib/tax/colombia/presets.ts` `applyColombiaPresets(deductions, salary)` to add `{ id: '__solidarity__', label, amount: 1, type: 'percent' }` when `salary > SOLIDARITY_THRESHOLD` and not already present (idempotent by id).
- [ ] T-017 tests GREEN.
- [ ] Full suite GREEN, lint+typecheck clean, coverage on `lib/tax/` ≥ 80%.

### T-021 — Impl: incomeStore wiring for solidarity
**Type:** impl · **Size:** S · **Covers:** AC-4.1, AC-4.4  
**Deps:** T-018, T-020

- [ ] In `src/stores/incomeStore.ts`, update the `applyColombiaPresets` action to pass `state.grossSalary` to the lib function.
- [ ] Update IncomeStreamSchema/deduction id union to include `'__solidarity__'` if persisted shape requires it (no migration if it falls under the existing string union).
- [ ] T-018 tests GREEN.
- [ ] Full suite GREEN, lint+typecheck clean.

---

## US-5 — Transport allowance suggestion

### T-022 — Test: useTransportAllowance unit tests
**Type:** test · **Size:** S · **Covers:** AC-5.1, AC-5.3, AC-5.4, AC-5.5 · **TCs:** TC-U-011..016, TC-U-023  
**Deps:** T-001 · **Parallel:** yes

- [ ] Add `tests/unit/composables/useTransportAllowance.test.ts` covering 7 scenarios (below/above threshold, benefit present, boundary, dismiss session-scoped, threshold notice).
- [ ] Use `vi.resetModules()` between tests to clear module-level dismissal state.
- [ ] 7 tests RED on stub.

### T-023 — Test: TransportAllowanceSuggestion component tests
**Type:** test · **Size:** S · **Covers:** AC-5.1, AC-5.2, AC-5.4 · **TCs:** TC-C-016..018  
**Deps:** T-001 · **Parallel:** yes

- [ ] Add `tests/component/TransportAllowanceSuggestion.test.ts` covering: renders when shouldShow, accept adds benefit + hides, dismiss hides.
- [ ] 3 tests RED.

### T-024 — Test: IncomeView threshold notice
**Type:** test · **Size:** S · **Covers:** AC-5.5 · **TCs:** TC-C-019  
**Deps:** T-001 · **Parallel:** yes

- [ ] Extend `tests/component/IncomeView.test.ts` with: salary rises above threshold after transport added → notice visible.
- [ ] 1 test RED.

### T-025 — Test: E2E transport allowance flow
**Type:** test · **Size:** S · **Covers:** AC-5.1, AC-5.2 · **TCs:** TC-E-003  
**Deps:** T-001 · **Parallel:** yes

- [ ] Add `e2e/transport-allowance.spec.ts` using `returningPage` with salary 2M, navigates to /income, accepts suggestion, asserts benefit appears and banner gone.
- [ ] `playwright test --list` includes it.

### T-026 — Impl: TRANSPORT constants + useTransportAllowance composable
**Type:** impl · **Size:** S · **Covers:** AC-5.1, AC-5.3, AC-5.4, AC-5.5  
**Deps:** T-022

- [ ] Replace stub values in `src/lib/tax/colombia/constants.ts`: `AUXILIO_TRANSPORTE_2025 = 200_000` (cite Decreto 1572 de 2024), `TRANSPORT_THRESHOLD = SMMLV_2025 * 2`.
- [ ] Implement `src/composables/useTransportAllowance.ts` with module-level `dismissed` ref and reactive `shouldShow`, `showThresholdNotice`, `dismiss()`, `accept()`.
- [ ] T-022 tests GREEN.
- [ ] Full suite GREEN, lint+typecheck clean.

### T-027 — Impl: TransportAllowanceSuggestion component + IncomeView wire
**Type:** impl · **Size:** S · **Covers:** AC-5.1, AC-5.2, AC-5.4, AC-5.5  
**Deps:** T-023, T-024, T-026

- [ ] Implement `src/components/income/TransportAllowanceSuggestion.vue` with i18n-keyed banner, accept/dismiss buttons, calling `accept()` which invokes `incomeStore.addBenefit({ label: t('income.transport.label'), amount: AUXILIO_TRANSPORTE_2025 })`.
- [ ] Mount in `src/views/IncomeView.vue` above the benefits section. Add threshold-notice render for AC-5.5.
- [ ] Add i18n keys `income.transport.{label,suggestion.title,suggestion.body,suggestion.accept,suggestion.dismiss,notice.aboveThreshold}`.
- [ ] T-023, T-024 tests GREEN.
- [ ] Full suite GREEN, lint+typecheck clean.

---

## T-028 — Docs: CHANGELOG + CLAUDE.md update

**Type:** docs · **Size:** S · **Covers:** —  
**Deps:** T-005, T-006, T-010, T-011, T-012, T-015, T-016, T-020, T-021, T-026, T-027 · **Parallel:** yes (with T-LAST start)

- [ ] Add `[Unreleased]` entry in `CHANGELOG.md` summarizing the 5 user stories.
- [ ] Update `CLAUDE.md`:
  - Add `SMMLV_2025`, `SOLIDARITY_THRESHOLD`, `TRANSPORT_THRESHOLD`, `AUXILIO_TRANSPORTE_2025` to Colombian Payroll Quick Reference.
  - Add new composables (`useFinancialGlossary`, `useDashboardGuide`, `useTransportAllowance`) to the directory map.
  - Note the annual update cadence for CO payroll constants (Decreto cited).
- [ ] Verify all links resolve (`grep` for broken internal references).

---

## T-LAST — Regression gate

**Type:** test · **Size:** S · **Covers:** all 24 ACs  
**Deps:** T-005, T-006, T-010, T-011, T-012, T-015, T-016, T-020, T-021, T-026, T-027

- [ ] `npm run typecheck` exits 0.
- [ ] `npm run lint` exits 0 (warnings acceptable only if pre-existing).
- [ ] `npm test` — full suite GREEN, no skipped tests other than pre-existing `.skip` with tracking comments.
- [ ] `npm run test:coverage` — `lib/tax/` ≥ 80%, `lib/calculations/` ≥ 80%, global ≥ 60%, no decrease from prior baseline.
- [ ] `npm run e2e` — all Playwright specs GREEN (after `npm run build`).
- [ ] Manual smoke: open dev server, verify dashboard tooltips render, transport suggestion appears with salary 2M, solidarity appears with salary 8M, dismiss persistence-error toast works.

---

## Sign-off

- [x] Author: Johann Medina — 2026-05-16
