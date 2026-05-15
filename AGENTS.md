# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Running the app

```bash
npm install        # install dependencies (Node 18+ required)
npm start          # dev server on http://localhost:5173 (alias for npm run dev)
npm run build      # TypeScript check + production build → dist/
npm run preview    # serve dist/ at http://localhost:4173
```

## Testing

```bash
npm test                  # Vitest unit + component tests
npm run test:coverage     # with lcov report
npm run e2e               # Playwright E2E (builds + boots preview server)
npm run lint              # ESLint (Vue + TypeScript rules)
npm run typecheck         # vue-tsc --noEmit
```

## Stack

Vue 3.5 · Vite 6 · TypeScript strict · Pinia · Tailwind v4 · Chart.js 4 + vue-chartjs · vue-i18n · Zod · Vitest 2 · Playwright

See `CLAUDE.md` for full architecture details.
