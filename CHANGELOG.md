# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added (feature `20260604-dashboard-progressive-disclosure`)

- **Progressive disclosure** — analytics tier (KPIs, charts, runway) collapsed by default on mobile; single “Ver análisis del mes” toggle with sessionStorage memory.
- **Desktop unchanged** — tier 2 always visible at ≥768px without toggle.
- **Fresh user guard** — tier 2 hidden when `grossSalary` is zero.

### Added (feature `20260530-mi-dia-cobertura`)

- **Mi Día block** — daily coverage badge, payments due today, and 3-day agenda above dashboard hero.
- **Day obligations** — pure `day-obligations.ts` for local-date due matching and coverage status.

### Added (feature `20260529-metricas-runway-ingresos`)

- **Runway card** — meses de autonomía (líquido ÷ gasto de vida) con estados explícitos sin líquido/gasto.
- **Passive coverage** — cobertura pasivo+residual vs gasto de vida en resumen y vista libertad financiera.
- **Income class** — streams adicionales con clase lineal/residual/pasivo persistente (schema v4).
- **Projection TEA** — tasa anual editable en gráfico de proyección; persiste en settings.
- **Debt delete in-card** — icono eliminar dentro de cada card con confirmación.
- **Shared liquid metrics** — `useLiquidMetrics` como fuente única para runway, FIRE y proyección compuesta.

### Added (feature `20260529-planificacion-financiera-integrada`)

- **Savings gap card** — objetivo (regla %), factible (libre tras gastos/deudas) y brecha con alerta cuando la regla no es viable (AC-1.1–1.3).
- **Cashflow projection** — dashboard usa `calcProjection(12)` con ingresos no mensuales en meses correctos (AC-2.1–2.2).
- **Separated insights** — frases distintas para donut (objetivo) vs proyección de flujo (AC-1.5, AC-2.3).
- **Savings chart labels** — series hipotética vs crecimiento con tasa i18n (AC-3.1–3.3).
- **Debt payoff tools** — fecha libre de deudas, simulador pago extra, orden avalancha/bola de nieve (AC-4.1–4.4).
- **Financial freedom** — bloque compacto en resumen + vista `/financial-freedom` con meta 25× y horizonte (AC-5.1–5.6).
- **Goals feasibility** — cupo regla/factible y alerta cuando aportes superan el mínimo (AC-6.1–6.2).

### Added (feature `20260529-ux-clarity-phase1`)

- **Responsive navigation** — DesktopNav, MobileBottomNav, NavBottomSheet y agrupación Plan/Resumen.
- **Dashboard hero & KPI strip** — héroe con disponible y tira de KPIs scrollable en móvil.

### Changed

- **AllocationView** — montos de distribución calculados sobre ingreso neto (AC-1.4).
- **Playwright** — usa `channel: 'chrome'` cuando el bundle Chromium no está disponible (ubuntu 26.04).

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
