# CLAUDE.md

## Running the app

```bash
npm start          # dev server on http://localhost:5173 (alias for npm run dev)
npm run dev        # Vite dev server
npm run build      # TypeScript check + production build → dist/
npm run preview    # serve dist/ at http://localhost:4173
```

## Testing

```bash
npm test           # Vitest unit + component tests
npm run test:coverage  # with lcov report
npm run e2e        # Playwright E2E (builds + boots preview server)
npm run lint       # ESLint (Vue + TypeScript rules)
npm run typecheck  # vue-tsc --noEmit
```

## Architecture

Single-state Vue 3 SPA. Feature-slice layout:

```
views/ → components/ → composables/ → stores/ → lib/
```

- **`lib/`** — pure functions; zero Vue/Pinia imports. `lib/calculations/`, `lib/tax/`, `lib/currency/`, `lib/storage/`.
- **`stores/`** — Pinia setup stores (one per domain). Inputs validated at action boundary.
- **`composables/`** — `useTheme`, `useLocale`, `useCurrencyFormat`, `useForm` (Zod-backed), `useChartTheme`.
- **`router/index.ts`** — 11 lazy-loaded routes + onboarding guard (ADR-9): redirects to `/onboarding` when `settingsStore.onboarding.done === false`.
- **`main.ts`** — hydrates Pinia stores from localStorage before the router guard fires (`hydrateStores()`).

### State hydration

Storage key: `finance_app_data`. Schema: `AppStateSchemaV2` (Zod). Hydration runs **synchronously in main.ts** before `app.use(router)` so the onboarding guard sees the correct state on first load.

### Colombian tax

`calcRetencion(grossSalary)` → Art.383 ET marginal table, **UVT_2025 = 49,799** (Resolución DIAN 000187/2024).

- Renta exenta cap: **240 UVT/month** (Art.206 num.10 ET, NOT 65.833).
- **ARL is 100% employer cost** (Art.16 Ley 1562/2012) — never add to employee deductions.
- Colombia preset button visible only when `settingsStore.currency === 'COP'`.

### Key calculation functions

| Function                       | Location                           | What it computes                         |
| ------------------------------ | ---------------------------------- | ---------------------------------------- |
| `calcRetencion(gross)`         | `lib/tax/colombia/retencion.ts`    | Colombian withholding tax (Art.383 ET)   |
| `calcDebtTimeline(debt)`       | `lib/calculations/amortization.ts` | Months to payoff + total interest        |
| `calcExtraPaymentImpact`       | `lib/calculations/amortization.ts` | Months/interest saved with extra payment |
| `calcDTI(debts, income)`       | `lib/calculations/dti.ts`          | Debt-to-income ratio                     |
| `calcHealthScore(inputs)`      | `lib/calculations/health-score.ts` | 0-100 score, 4 weighted components       |
| `calcProjection(inputs, n)`    | `lib/calculations/projection.ts`   | 12-month balance projection              |
| `buildSnapshot(inputs, now)`   | `lib/calculations/snapshot.ts`     | Monthly snapshot record                  |
| `formatCurrency(amount, code)` | `lib/currency/format.ts`           | Intl.NumberFormat + NBSP strip           |

### Adding a new section

1. Add route to `src/router/index.ts`
2. Add view to `src/views/`
3. Add translation keys to both `src/i18n/es.json` and `src/i18n/en.json`
4. Create components in `src/components/<section>/`
5. Create store in `src/stores/<section>Store.ts`
6. Add `<section>Store.hydrateFromState(state)` call in `main.ts`'s `hydrateStores()`
