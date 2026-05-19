# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added (feature `20260516-sprint1-mejoras-finanzas`)

- **Load-error notification (US-1)** — `useStorageError` now distinguishes load vs save errors with a `kind` discriminator; `main.ts` surfaces `loadAppState().parseError` (covers AC-1.1–1.4). Adds i18n keys `storage.errorToast.load.*` for load-context messages.
- **Financial-term tooltips (US-2)** — radix-vue tooltips on KpiCard (DTI) and HealthScore breakdown rows (housing, emergency, savings, score title). Backed by `useFinancialGlossary` composable returning glossary entries with thresholds/ranges. Single `TooltipProvider` at App shell (AC-2.1–2.7).
- **Dashboard empty-state guide (US-3)** — `EmptyStateGuide` component + `useDashboardGuide` composable show a contextual CTA when income or fixed expenses are missing. Reactive: CTA disappears as soon as data is registered (AC-3.1–3.4).
- **Fondo de solidaridad pensional (US-4)** — `applyColombiaPresets` adds `{ id: '__solidarity__', amount: 1, type: 'percent' }` when `gross > 4 × SMMLV` (Ley 100/1993 Art. 20); idempotent by reserved id. Persists if salary later drops below threshold (AC-4.1–4.4).
- **Transport allowance suggestion (US-5)** — `TransportAllowanceSuggestion` banner on `IncomeView` proposes `$200.000/mes` when gross ≤ 2 × SMMLV. `useTransportAllowance` returns `shouldShow`, `showThresholdNotice`, `dismiss()`, `accept()`. Threshold notice surfaces when salary later rises above 2 SMMLV with the benefit still attached (AC-5.1–5.5).
- **Colombian payroll constants** — `SMMLV_2025 = 1_423_500` (Decreto 1572 de 2024), `SOLIDARITY_THRESHOLD = SMMLV_2025 × 4`, `TRANSPORT_THRESHOLD = SMMLV_2025 × 2`, `AUXILIO_TRANSPORTE_2025 = 200_000`.
- **E2E coverage** — `e2e/persistence-error.spec.ts`, `e2e/colombia-presets-solidarity.spec.ts`, `e2e/transport-allowance.spec.ts`.

### Fixed (feature `20260515-fix-calculos-financieros`)

- **Amortization TEA** — `monthsToPayoff` now uses `(1+TEA)^(1/12)−1` instead of `apr/12` (covers AC-4.1, AC-4.4). Matches Superfinanciera Colombia.
- **Net income on dashboard** — distribution, DTI and projection use net income (not gross) via `useNetIncome` composable (AC-2.1–2.5, AC-5.3).
- **Real health score** — all four components (DTI, emergency, housing, savings) now computed from real user data, replacing hardcoded values (AC-3.1–3.6).
- **Reliable persistence** — schema v2→v3 migration with auto-backup; `isHydrating` flag prevents save loop; sticky StorageErrorToast with retry on quota exceeded (AC-1.1–1.4).
- **Prima de servicios upsert** — button uses reserved id `__prima__` + `isPrima` flag; reloads keep a single entry (AC-7.1–7.3).
- **Reactive goal cap** — `useGoalsBudget` computes `savings% × netIncome` instead of hardcoded 15% × gross (AC-6.1, AC-6.2).
- **Card schema ↔ store drift** — `dueDate` now accepts ISO string in V3; `installmentsList` renamed to `installments`. Cards finally persist.
- **Housing ratio** — lib accepts category `'vivienda'` (matching UI default) in addition to legacy `'housing'`.

### Added (feature `20260515-fix-calculos-financieros`)

- **Savings projection (US-8)** — new lib `lib/calculations/savings-projection.ts` with `calcHypotheticalSavings` (linear accumulation) and `calcCompoundGrowth` (per-asset compound).
- **SavingsProjectionChart** — Chart.js with 2 datasets (solid + dashed) on DashboardView. Inline empty-state when no rate is configured (AC-8.1–8.6).
- **`Asset.annualRatePercent`** — new field on Asset (default 0, range [0, 100]). UI input only visible for `savings`/`investment` types.
- **i18n keys** — `storage.error.*`, `savings.*`, `assets.annualRatePercent.*`, `debts.apr.*` in both es.json and en.json.

### Changed

- Full SPA rewrite to Vue 3.5 + Vite 6 + TypeScript (strict mode) + Pinia + Tailwind v4 + Chart.js 4 + vue-i18n + Zod + Vitest + Playwright (constitution v2). All vanilla JS / `server.js` / `app.js` code removed.

### Added

- **Income section** (AC-2.x, AC-3.x): gross salary, percent/fixed deductions, retención en la fuente (Art.383 ET UVT 2025), other income streams, non-salary benefits, Colombia + prima presets.
- **Expenses section** (AC-4.x): fixed expense list with ConfirmDialog-gated delete, total and remaining display.
- **Debts section** (AC-5.x, AC-6.x): credit card (utilization bar + payoff timeline) and loan (remaining installments) cards, installment management, due-date alerts within 7 days.
- **Goals section** (AC-7.x): goal cards with progress bar and ETA, savings overage warning, priority reordering.
- **Variable expenses section** (AC-8.x): per-category progress bars (green/amber/red thresholds), monthly summary with excess indicator, QuickAdd FAB.
- **Net worth section** (AC-9.x): asset list, liabilities derived from card balances, signed-color banner.
- **Allocation section** (AC-14.x): 50/30/20 panel with auto-derived savings and sum-100 guard.
- **Dashboard** (AC-10.x, AC-11.x, AC-12.x, AC-13.x): 5 KPI cards, HealthScore (4-component breakdown on click), ComparisonBadge, BudgetDonut + ProjectionChart (Chart.js).
- **History** (AC-13.x): snapshot list, ordered newest-first.
- **Settings** (AC-15.x, AC-16.x): language/currency/theme toggles, JSON export/import (BackupEnvelopeSchema), ConfirmDialog-gated reset, onboarding relaunch.
- **Onboarding wizard** (AC-1.x): 3-step wizard (salary → expenses → debts), skip/finish with router redirect, relaunch from settings without data loss.
- **Common components**: EmptyState, ConfirmDialog, AppToast, CurrencyInput, Tooltip (collision-aware), SemanticBadge, AlertList, ThemeToggle, LanguageToggle, BottomNav.
- **Pinia stores** with UUID v4 IDs and boundary validation (settingsStore, incomeStore, expensesStore, cardsStore, goalsStore, assetsStore, allocationStore, snapshotsStore, variableExpensesStore).
- **Base composables**: useTheme (module-level singleton isDark), useLocale, useCurrencyFormat, useForm (Zod-backed), useChartTheme.
- **Zod AppStateSchemaV2** with AllocationSchema sum=100 guard, discriminated CardSchema, migration chain v1→v2.
- **Playwright E2E suite**: 15 tests covering onboarding, returning user, export/import, debts, history, dark mode, responsive layout, keyboard navigation.
- Colombian payroll: UVT_2025 = 49,799 · ARL employer-only · Renta exenta 240 UVT/month cap (Art.206 num.10 ET).

## [1.0.0] — 2026-05-11

- Initial release: vanilla JS single-file SPA with zero dependencies.
