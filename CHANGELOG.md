# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

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
