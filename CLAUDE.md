# CLAUDE.md

## Running the app

```bash
npm start          # dev server on http://localhost:5173 (alias for npm run dev)
npm run build      # TypeScript check + production build → dist/
npm run preview    # serve dist/ at http://localhost:4173
```

## Testing

```bash
npm test               # Vitest unit + component tests
npm run test:coverage  # with lcov report
npm run e2e            # Playwright E2E (builds + boots preview server)
npm run lint           # ESLint (Vue + TypeScript rules)
npm run typecheck      # vue-tsc --noEmit
```

## State hydration

Storage key: `finance_app_data`. Schema: `AppStateSchemaV2` (Zod). Hydration runs **synchronously in main.ts** before `app.use(router)` so the onboarding guard sees the correct state on first load.

## Adding a new section

1. Add route to `src/router/index.ts`
2. Add view to `src/views/`
3. Add translation keys to **both** `src/i18n/es.json` and `src/i18n/en.json`
4. Create components in `src/components/<section>/`
5. Create store in `src/stores/<section>Store.ts`
6. Add `<section>Store.hydrateFromState(state)` call in `main.ts`'s `hydrateStores()`
