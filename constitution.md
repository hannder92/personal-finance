# Project Constitution — personal-finances

> Immutable rules. Amend only via `/sdd.constitution --update`. Each amendment requires fresh sign-off.

## Stack

- Language: `TypeScript 5.x`
- Runtime: `Node.js 20+ LTS` — development server via Vite; no custom server.js
- Framework: `Vue 3.5+` — Composition API + `<script setup>` exclusively
- State: `Pinia 2.x` — one store per domain (settings, income, expenses, cards, goals, assets, variableExpenses, allocation, snapshots)
- Router: `Vue Router 4.x` — one route per section
- Styling: `Tailwind CSS 4.x` — utility-first; no custom CSS except `src/style.css` global resets
- UI primitives: `radix-vue 1.x` — headless accessible primitives (dialog, tooltip, etc.)
- Icons: `lucide-vue-next` — tree-shakable icon components; **MUST NOT** use `data-icon` string attributes as icon rendering mechanism
- Charts: `Chart.js 4.x` via `vue-chartjs 5.x` wrapper — no direct Canvas API usage
- Utilities: `@vueuse/core 11.x` — composables utilities (reactivity helpers, event listeners, etc.)
- i18n: `vue-i18n 9.x` — all user-visible strings via `t('key')` from `useI18n()`
- Validation: `Zod 3.x` — schema validation at storage boundaries (`loadAppState`, `importFromFile`)
- Testing: `Vitest 2.x` + `@testing-library/vue 8.x` + `@pinia/testing` + `Playwright 1.x` for E2E
- Build: `Vite 6.x` — no custom bundler config unless justified with an ADR

## Architecture

- Pattern: **Feature-slice** — views + stores + composables, one slice per financial domain
- Layers (strict, inward-only dependency):
  - `views/` → `components/` → `composables/` → `stores/` → `lib/`
  - `lib/` contains only pure functions (no Vue, no Pinia imports)
- State: **MUST** live in Pinia stores; **MUST NOT** be held in component `ref`/`reactive` beyond local UI state
- Reactivity: setup-style stores expose a `state = reactive({})` object — components access it as `store.state.field` directly; `storeToRefs()` is only required when destructuring top-level reactive refs from a store, not when accessing the nested `state` object
- Mutations: **MUST** happen only through Pinia actions — never via direct store property assignment outside the store file
- Schema evolution: **MUST** update the Zod schema in `lib/storage/schema.ts` AND the `migrate()` function whenever the persisted state shape changes
- Composables: **MUST** encapsulate all domain logic that touches both store and calculations — views **MUST NOT** call `lib/calculations` directly
- Pure functions: `lib/calculations/` and `lib/tax/` **MUST** have zero side effects and zero framework imports
- **Navigation shell**: `App.vue` **MUST** contain a persistent layout shell with (a) a sticky top bar including a logo/title, ThemeToggle wired to `useTheme()`, and LanguageToggle wired to `useLocale()`; (b) a mobile bottom navigation using `RouterLink` for SPA-correct navigation; (c) responsive content padding so the bottom nav does not overlap content. Any feature that adds a route **MUST** also add it to the nav items in `App.vue`.
- **View CRUD completeness**: every domain view that owns a Pinia store with an `add()` / `addCard()` / `addLoan()` action **MUST** expose a visible CTA (button or link) that opens an add form within the same view. A view that only renders a list without a create flow is **incomplete** and **MUST NOT** be marked done in `_state.yaml` tasks until the CTA is present. Read-only views (e.g., HistoryView, DashboardView) are exempt and **MUST** be documented as read-only in their task DoD.

## Testing Policy

- Pyramid: **MUST** be ~60% unit / ~30% component / ~10% e2e
- Coverage minimum: **80%** for `lib/calculations/` and `lib/tax/` — these contain financial logic; **MUST NOT** decrease
- Coverage minimum: **60%** overall project — enforced in CI via `vitest --coverage`
- Test-first: **SHOULD** write the test for a pure function before implementing it; **MUST** for all tax/calculation functions
- Mocking: **MUST NOT** mock Pinia stores in unit tests for `lib/`; **SHOULD** use `createTestingPinia()` for component tests
- Flaky tests: **MUST** be skipped with `.skip` + a tracking comment within 24h of detection
- E2E: **MAY** use Playwright for critical flows (add income → see dashboard update); not required for v1

## Code Style

- Linter: `ESLint` with `@vue/eslint-config-typescript` — config tracked in `eslint.config.ts`
- Formatter: `Prettier` — config tracked in `.prettierrc`; **MUST** run on pre-commit via `lint-staged`
- TypeScript: **MUST** use strict mode (`"strict": true` in `tsconfig.json`); **MUST NOT** use `any` except at explicit parsing boundaries with an inline justification comment
- Vue SFC: **MUST** use `<script setup lang="ts">` — no Options API, no `defineComponent()` wrapper
- Identifiers: `camelCase` for variables/functions/composables; `PascalCase` for components/types/interfaces; `UPPER_SNAKE_CASE` for constants; `kebab-case` for file names
- Comments: **MUST NOT** describe what code does — only WHY (hidden constraint, legal reference, workaround)
- i18n: **MUST** use `t('key')` from `vue-i18n` — **MUST NOT** hardcode Spanish or English strings in templates or composables
- Translation keys: **MUST** exist in both `i18n/es.json` AND `i18n/en.json` before use
- Currency: **MUST** use `Intl.NumberFormat` with locale from `getCurrencyConfig()` — **MUST NOT** use `.toFixed()` directly
- Colombian payroll constants: **MUST** cite legal source inline; **MUST NOT** be magic numbers

## Security

- Secrets: **MUST NOT** be hardcoded; environment variables via `import.meta.env` with Zod validation at startup
- Input validation: **MUST** parse all form inputs through a Zod schema before touching a Pinia store — no raw `parseFloat()` on user strings in stores
- Data persistence: `localStorage` only — **MUST NOT** send financial data to any external API or analytics service
- XSS: **MUST NOT** use `v-html` with any user-provided or store-derived string — use `{{ }}` interpolation or `textContent` bindings
- ID generation: **MUST** use `crypto.randomUUID()` for new entity IDs — **MUST NOT** use sequential integers or `Math.random()` alone
- PII: **MUST NOT** log store state or financial data to external services; no analytics SDKs

## Forbidden

- **Options API** — `defineComponent({ data() {}, methods: {} })` is banned. Use `<script setup>` + Composition API exclusively. Reason: inconsistency with the rest of the codebase and worse TypeScript inference.
- **Direct Pinia state mutation outside store files** — `store.someField = value` from a component or composable bypasses actions and breaks devtools traceability.
- **`any` type without justification comment** — Erodes type safety on financial calculations where a wrong numeric type causes silent bugs.
- **`console.log` / `console.error` in production paths** — `console.*` calls outside `if (import.meta.env.DEV)` blocks are forbidden.
- **`v-html` with dynamic content** — XSS surface. Use `{{ }}` or DOM-safe bindings.
- **Skipping Zod validation at storage boundaries** — `loadAppState()` and `importFromFile()` **MUST** call `AppStateSchemaV3.safeParse()` before touching any Pinia store. For UI forms, Zod is **SHOULD** (encouraged); the store action's own boundary guards (`isValidName`, `isValidAmount`) are the minimum acceptable fallback. Raw mutations that bypass both form validation AND store guards are forbidden.
- **ARL as an employee deduction** — ARL is 100% employer cost (Art. 16 Ley 1562/2012). **MUST NOT** appear in employee-facing deduction presets or default store state.
- **`lib/calculations/` or `lib/tax/` importing Vue or Pinia** — These are pure function libraries. A Vue/Pinia import makes them untestable in isolation and couples domain logic to the framework.
- **Charting outside Chart.js** — No D3, no native Canvas API, no Highcharts. Custom canvas drawing requires an ADR with justification.
- **Adding a persisted field without updating `migrate()`** — Existing users with localStorage data get `undefined` on the new field. Schema change = Zod update + migration step, both mandatory.
- **Guessing Colombian payroll percentages** — Always reference `node-colombia-payroll.md` and cite the legal source (UVT 2025 = $49,799, Art. 383 ET, Art. 16 Ley 1562/2012, etc.).

## Versioning

- Constitution version: **v4** (this document)
- Amendments: recorded as `v{N+1}` with date + diff summary at the bottom

---

## Sign-off

- [x] Author: `Johann Medina` — `2026-05-14` (v2)
- [x] Author: `Johann Medina` — `2026-05-15` (v3)
- [x] Author: `Johann Medina` — `2026-05-29` (v4)

---

## Amendment History

| Version | Date       | Author        | Summary                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------- | ---------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v1      | 2026-05-14 | Johann Medina | Initial Constitution — vanilla JS SPA, zero-dependency, manual testing.                                                                                                                                                                                                                                                                                                                                 |
| v2      | 2026-05-14 | Johann Medina | Full stack migration: Vue 3.5 + Vite 6 + TypeScript + Pinia + Tailwind + Vitest. Testing policy upgraded to 80% coverage on financial calculations. Forbidden list updated for Vue/TypeScript idioms.                                                                                                                                                                                                   |
| v3      | 2026-05-15 | Johann Medina | Post-implementation retrospective corrections: (1) Stack fixed — removed `shadcn-vue`, `@sentry/vue`, `pino` (never installed); added `radix-vue`, `lucide-vue-next`, `vue-chartjs`. (2) Architecture — added mandatory navigation shell rule for `App.vue` and CRUD completeness rule for domain views. (3) Zod rule relaxed from MUST to SHOULD on UI forms.                                          |
| v4      | 2026-05-29 | Johann Medina | (1) Version header synced to v4; removed stale `pino` references from Security/Forbidden. (2) Storage boundary updated to `AppStateSchemaV3`. (3) Store catalog expanded to all 9 Pinia domains. (4) Onboarding wizard removed — app opens directly on dashboard; legacy `onboarding` field in persisted schema kept for migration compat only. (5) Navigation shell no longer hides during onboarding. |
