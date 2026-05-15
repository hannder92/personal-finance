# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Running the app

```bash
npm start          # starts Node.js server on http://localhost:3000
node server.js     # equivalent — no npm packages required
```

`server.js` is a zero-dependency static file server using Node built-ins (`http`, `fs`, `path`). It exists because the corporate npm registry (`npm.artifacts.furycloud.io`) blocks `npx serve`.

There is no build step, no transpiler, no bundler, and no test runner.

## Architecture

Single-file vanilla JS SPA — no framework, no imports. All logic lives in `app.js` (~1850 lines), styles in `style.css`, markup in `index.html`.

### Single state object

One global `state` object is the single source of truth. Never mutate it directly from render functions — only from event handlers. Shape:

```js
{
  schemaVersion: 1,
  lang: 'es' | 'en',
  currency: 'COP',           // drives Intl.NumberFormat locale + decimal places
  income: {
    grossSalary: Number,
    deductions: [{ id, label, amount, type: 'fixed'|'percent' }],
    otherStreams: [{ id, label, amount }]
  },
  expenses:        [{ id, name, amount, category, notes }],
  cards:           [{ id, name, limit, balance, minPayment, apr, dueDate, installments[] }],
  goals:           [{ id, name, target, saved, monthlyContrib, targetDate, priority }],
  assets:          [{ id, name, value, type }],       // for net worth
  variableExpenses:[{ id, name, budget, spent, categoryId }],
  budgetAllocation:{ needs, wants, savings },          // pct, must sum to 100
  payoffMethod:    'avalanche'|'snowball'
}
```

### Render cycle

Every state mutation follows this pattern:

1. Update `state` field
2. Call a targeted `render*()` or `update*Live()` for the affected component
3. Call `updateDashboardPartial()` to keep summary cards, alerts, donut, and ratios in sync
4. Call `saveState()` (debounced 300 ms → `localStorage`)

Full `render()` is called only on boot, language switch, currency switch, and import. Avoid calling it on individual field edits — use the `*Live` partial updaters instead.

### i18n

All user-visible strings go through `t('key')`. Translations live in the `TRANSLATIONS` object at the top of `app.js` with `es` and `en` keys. `currentLang` is a module-level variable. Static HTML uses `data-i18n="key"` attributes; `applyI18n()` patches them on language change.

When adding a new string: add to both `TRANSLATIONS.es` and `TRANSLATIONS.en`, use `t('key')` in render functions.

### Persistence

Single `localStorage` key: `finance_app_data`. The `migrate()` function handles schema evolution — add missing fields there whenever `state` shape changes. `SCHEMA_VERSION` is currently `1`.

COP and CLP currencies use 0 decimal places (set in `getCurrencyConfig()`).

### Charts

All charts use the native Canvas API — no chart library. `drawDonut()` renders the budget breakdown donut; `drawDTIGauge()` renders the debt-to-income semicircle gauge. Both are called from `renderDashboard()` / `renderDebtSummary()`.

## Colombian tax specifics

`calcRetencionFuente(grossSalary)` implements the Art. 383 ET marginal table using **UVT 2025 = $49,799** (Resolución DIAN 000187/2024). It deducts:

1. Pensión employee contribution (4%)
2. Renta exenta 25%, capped at 65.833 UVT/month

The "🇨🇴 Cargar deducciones Colombia" button appears only when `state.currency === 'COP'`. It inserts Salud (4%), Pensión (4%), ARL (0.522%) as percent-type deductions without duplicating existing ones.

## Adding a new section

1. Add a `<li class="nav-item" data-section="x">` in `index.html`
2. Add a `<section id="section-x" class="section">` in `index.html`
3. Add translation keys to both `TRANSLATIONS.es` and `TRANSLATIONS.en`
4. Write `renderX()` in `app.js` and call it from `render()`
5. Write `bindXEvents()` and call it from the `DOMContentLoaded` boot block
6. Add new state fields to `buildDefaultState()` **and** to `migrate()` so existing saved data doesn't break

## Key calculation functions

| Function                              | What it computes                                                    |
| ------------------------------------- | ------------------------------------------------------------------- |
| `calcNetSalary()`                     | Gross − all deductions (handles `fixed` and `percent` types)        |
| `calcTotalIncome()`                   | Net salary + other income streams                                   |
| `calcCardObligation(card)`            | Min payment + sum of active installment monthly amounts             |
| `calcDTI()`                           | Total debt obligations / total income × 100                         |
| `calcFreeAlloc()`                     | Income − fixed expenses − debt obligations                          |
| `calcExtraPaymentImpact(card, extra)` | Amortization delta: months saved + interest saved when paying extra |
| `calcNetWorth()`                      | Total assets − total card balances                                  |
| `calcRetencionFuente(gross)`          | Colombian withholding tax via Art. 383 ET marginal table            |
