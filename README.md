# Personal Finances Dashboard

![Vue 3](https://img.shields.io/badge/Vue_3-4FC08D?style=flat&logo=vuedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![SDD](https://img.shields.io/badge/SDD-Spec--Driven_Development-6366F1?style=flat)
![Playwright](https://img.shields.io/badge/E2E-Playwright-2EAD33?style=flat&logo=playwright&logoColor=white)

A full-stack personal finance SPA built with **Spec-Driven Development (SDD)** — from constitution and specs to production code with AI-assisted workflows. Manages income, fixed expenses, debts, goals, variable spending, net worth, and a financial health score.

## SDD Workflow

This project follows a constitution-driven development process:

- **`constitution.md`** — immutable architectural rules (stack, layers, invariants)
- **`specs/`** — feature specifications with acceptance criteria and task breakdown
- **`AGENTS.md` / `CLAUDE.md`** — AI agent context for consistent code generation
- **Test-first delivery** — Vitest unit tests + Playwright E2E before feature completion

## Stack (v2)

| Layer                  | Technology                             |
| ---------------------- | -------------------------------------- |
| Frontend               | Vue 3.5 + Vite 6 + TypeScript (strict) |
| State                  | Pinia (Composition API stores)         |
| Styling                | Tailwind CSS v4                        |
| Charts                 | Chart.js 4 + vue-chartjs               |
| Internationalization   | vue-i18n (es / en)                     |
| Validation             | Zod v3                                 |
| Unit / Component tests | Vitest 2 + @testing-library/vue        |
| E2E tests              | Playwright                             |

## Setup

```bash
npm install       # install dependencies
npm start         # dev server → http://localhost:5173
npm run build     # production build → dist/
npm run preview   # preview production build → http://localhost:4173
```

## Testing

```bash
npm test                  # run unit + component tests (Vitest)
npm run test:coverage     # with coverage report
npm run e2e               # Playwright E2E (builds + boots preview server)
npm run typecheck         # vue-tsc strict type check
npm run lint              # ESLint
```

## Architecture

```
src/
├── lib/             # Pure functions (zero Vue/Pinia imports)
│   ├── calculations/  # amortization, DTI, health-score, projection
│   ├── currency/      # formatCurrency (Intl.NumberFormat)
│   ├── storage/       # Zod schemas, migration, useAppStorage
│   └── tax/colombia/  # Art.383 ET retención, Colombia payroll constants
├── stores/          # Pinia setup stores (one per domain)
├── composables/     # useTheme, useLocale, useCurrencyFormat, useForm, useChartTheme
├── components/      # UI components grouped by section
├── views/           # One view per route (lazy-loaded)
├── router/          # Vue Router + onboarding guard (ADR-9)
└── i18n/            # es.json, en.json translation files
```

### Key invariants

- **State lives in Pinia stores.** Never in component refs beyond local UI state.
- **lib/ is pure** — no Vue or Pinia imports; testable with plain Vitest.
- **All stores validate inputs** at the action boundary (lightweight guards; formal Zod validation at storage load).
- **localStorage key:** `finance_app_data`. Hydration runs in `main.ts` before the router guard fires.
- **Currency:** COP and CLP use 0 decimal places (configured in `getCurrencyConfig()`).
- **Colombian tax (Art.383 ET):** UVT_2025 = 49,799 · Renta exenta cap: 240 UVT/month · ARL is 100% employer cost.

## Specs

All feature specifications live in `specs/20260514-project-refactor/`. See `specs/20260514-project-refactor/_state.yaml` for the implementation progress (SDD workflow).
