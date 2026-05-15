# Technical Plan: Personal Finance Dashboard — Edición Profesional

> Spec: [1-spec.md](./1-spec.md) · Mode: `solo`
> Plan version: **v1** · Slug: `20260514-project-refactor`

## Summary

Full rewrite of the existing vanilla-JS SPA into the stack mandated by Constitution v2 (Vue 3.5 + Vite 6 + TypeScript strict + Pinia + Tailwind v4 + shadcn-vue + Chart.js + Vitest + Zod). The architecture is feature-slice with strict inward-only dependencies (`views → components → composables → stores → lib`). Domain logic (financial calculations, Colombian tax) lives in pure libraries with zero framework imports, enabling the 80% coverage gate without component-test brittleness. Persistence stays local (`localStorage`) — the new schema (v2) migrates the legacy v1 payload non-destructively, and a backup copy is preserved on first migration to make rollback to the vanilla app safe.

The plan addresses every AC in the spec (17 user stories, 80 ACs, 10 edge cases) and follows the Constitution's forbidden list (no Options API, no `any` without justification, no `v-html` with dynamic content, no ARL preset, no direct Pinia state mutation outside store files).

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  router/  →  views/  →  components/  →  composables/        │
│                                              │              │
│                                              ▼              │
│                                          stores/  (Pinia)   │
│                                              │              │
│                                              ▼              │
│                                            lib/   (pure)    │
│                                                             │
│  i18n/  ←  consumed by views, components, composables       │
│  lib/storage/  →  VueUse useStorage  →  localStorage        │
└─────────────────────────────────────────────────────────────┘

Dependency rule: a module MAY import from layers to its right; it MUST NOT
import from layers to its left. lib/* MUST NOT import Vue, Pinia, or VueUse.
```

### Directory layout (target)

```
src/
  main.ts                        # createApp, install router, pinia, i18n, sentry
  App.vue                        # root layout, theme provider, toast host
  router/index.ts                # one route per view; guards for onboarding
  i18n/
    index.ts                     # createI18n + locale switcher
    es.json
    en.json
  views/
    DashboardView.vue            OnboardingView.vue
    IncomeView.vue               ExpensesView.vue
    DebtsView.vue                GoalsView.vue
    VariableExpensesView.vue     NetWorthView.vue
    AllocationView.vue           HistoryView.vue
    SettingsView.vue
  components/
    onboarding/                  income/
    expenses/                    debts/
    goals/                       variable/
    networth/                    dashboard/
    history/                     allocation/
    common/                      # EmptyState, Tooltip, ConfirmDialog,
                                 # CurrencyInput, LanguageToggle,
                                 # ThemeToggle, BottomNav, AppToast,
                                 # SemanticBadge (color+icon, AC-17.6)
  composables/
    useNetIncome.ts              useRetencion.ts
    useColombiaPresets.ts        useCardObligation.ts
    useAmortization.ts           usePayoffStrategy.ts
    useDebtAlerts.ts             useGoals.ts
    useVariableExpenses.ts       useNetWorth.ts
    useHealthScore.ts            useProjection.ts
    useSnapshots.ts              useAllocation.ts
    useDashboardKpis.ts          useImportExport.ts
    useTheme.ts                  useLocale.ts
    useMonthRollover.ts          useOnboarding.ts
    useQuickAddFAB.ts            useCurrencyFormat.ts
  stores/
    incomeStore.ts               expensesStore.ts
    cardsStore.ts                goalsStore.ts
    assetsStore.ts               variableExpensesStore.ts
    allocationStore.ts           snapshotsStore.ts
    settingsStore.ts
  lib/
    calculations/
      net-income.ts              frequency.ts
      amortization.ts            payoff-strategy.ts
      installments.ts            goals.ts
      net-worth.ts               projection.ts
      health-score.ts            allocation.ts
      dti.ts                     housing-ratio.ts
    tax/
      colombia/
        constants.ts             # UVT_2025, SMMLV, with legal source comments
        retencion.ts             # Art. 383 ET marginal table
        presets.ts               # salud 4%, pensión 4% (no ARL)
        prima.ts                 # prima de servicios calc
    currency/
      format.ts                  # Intl.NumberFormat wrapper, getCurrencyConfig
    storage/
      schema.ts                  # Zod schema v2 + types
      migrate.ts                 # v1 → v2 migration
      backup.ts                  # serialize/deserialize for import/export
      keys.ts                    # storage key constants
    date/
      month.ts                   # month rollover detection
    health/
      thresholds.ts              # CFPB-based thresholds (DTI/housing/savings/emergency)
    charts/
      theme.ts                   # color tokens reactive to theme
tests/
  unit/                          # mirrors lib/*; Vitest, no Vue env
  component/                     # @testing-library/vue + createTestingPinia
  setup.ts
public/
  favicon.svg
index.html
vite.config.ts
tsconfig.json
eslint.config.ts
.prettierrc
vitest.config.ts
package.json
```

### Components → AC coverage matrix

| Component / Module                                                                                            | Layer                         | Covers                                               |
| ------------------------------------------------------------------------------------------------------------- | ----------------------------- | ---------------------------------------------------- |
| `OnboardingWizard.vue` + `StepIndicator.vue` + `useOnboarding` + `settingsStore`                              | view+composable+store         | AC-1.1, AC-1.2, AC-1.3, AC-1.4, AC-1.5, AC-1.6, EC-9 |
| `IncomeView.vue` + `DeductionRow.vue` + `useNetIncome` + `lib/calculations/net-income.ts`                     | view+composable+lib           | AC-2.1, AC-2.4, AC-2.5, EC-1                         |
| `useColombiaPresets` + `lib/tax/colombia/presets.ts`                                                          | composable+lib                | AC-2.2                                               |
| `RetentionEstimator.vue` + `useRetencion` + `lib/tax/colombia/retencion.ts` + `lib/tax/colombia/constants.ts` | view+composable+lib           | AC-2.3, EC-7                                         |
| `IncomeStreamRow.vue` + `lib/calculations/frequency.ts`                                                       | component+lib                 | AC-3.1, AC-3.2                                       |
| `useColombiaPresets` + `lib/tax/colombia/prima.ts`                                                            | composable+lib                | AC-3.3                                               |
| `ExpensesView.vue` + `FixedExpenseList.vue` + `ExpenseForm.vue` + `expensesStore`                             | view+component+store          | AC-4.1, AC-4.2, AC-4.4                               |
| `lib/calculations/housing-ratio.ts` + `useDashboardKpis`                                                      | lib+composable                | AC-4.3                                               |
| `CardCard.vue` + `useAmortization` + `lib/calculations/amortization.ts`                                       | component+composable+lib      | AC-5.1, EC-10                                        |
| `LoanCard.vue` + `cardsStore.type === 'loan'` branch                                                          | component+store               | AC-5.2                                               |
| `PayoffSimulator.vue` + `lib/calculations/amortization.ts#calcExtraPaymentImpact`                             | component+lib                 | AC-5.3                                               |
| `PayoffMethodToggle.vue` + `usePayoffStrategy` + `lib/calculations/payoff-strategy.ts`                        | component+composable+lib      | AC-5.4, AC-5.5                                       |
| `DTIGauge.vue` + `useCardObligation` + `lib/calculations/dti.ts`                                              | component+composable+lib      | AC-5.6, EC-2                                         |
| `useDebtAlerts` + `AlertList.vue`                                                                             | composable+component          | AC-5.7                                               |
| `InstallmentList.vue` + `lib/calculations/installments.ts`                                                    | component+lib                 | AC-6.1, AC-6.2, AC-6.3                               |
| `GoalsView.vue` + `GoalCard.vue` + `useGoals` + `lib/calculations/goals.ts`                                   | view+component+composable+lib | AC-7.1, AC-7.2, AC-7.4, EC-3                         |
| `useGoals#totalMonthlyContrib` + `useAllocation` cross-check                                                  | composable                    | AC-7.3, AC-14.4                                      |
| `GoalsView` drag-reorder via `vuedraggable` (or native HTML5 DnD)                                             | view                          | AC-7.5                                               |
| `VariableExpensesView.vue` + `VariableCategoryCard.vue` + `useVariableExpenses`                               | view+component+composable     | AC-8.1, AC-8.5, EC-4                                 |
| `AlertList.vue` (re-used)                                                                                     | component                     | AC-8.2                                               |
| `QuickAddFAB.vue` + `QuickAddPanel.vue` + `useQuickAddFAB` (route-aware via `useRoute()`)                     | component+composable          | AC-8.3                                               |
| `useMonthRollover` + `variableExpensesStore.resetSpent()`                                                     | composable+store              | AC-8.4                                               |
| `NetWorthView.vue` + `AssetList.vue` + `useNetWorth` + `lib/calculations/net-worth.ts`                        | view+component+composable+lib | AC-9.1, AC-9.2, AC-9.3                               |
| `useHealthScore` reads `useNetWorth`                                                                          | composable                    | AC-9.4                                               |
| `DashboardView.vue` + `KpiCards.vue` + `useDashboardKpis`                                                     | view+component+composable     | AC-10.1                                              |
| `BudgetDonut.vue` (Chart.js) + `ProjectionChart.vue` (Chart.js)                                               | component                     | AC-10.2                                              |
| `SemanticBadge.vue` (icon+text+color) + `AlertList.vue`                                                       | component                     | AC-10.3, AC-17.6                                     |
| Dashboard color tokens + state-empty handling                                                                 | view                          | AC-10.4                                              |
| `HealthScore.vue` + `useHealthScore` + `lib/calculations/health-score.ts` + `lib/health/thresholds.ts`        | component+composable+lib      | AC-11.1, AC-11.2, AC-11.4                            |
| `ComparisonBadge.vue` reads latest two snapshots                                                              | component                     | AC-11.3, AC-13.3                                     |
| `ProjectionChart.vue` + `useProjection` + `lib/calculations/projection.ts`                                    | component+composable+lib      | AC-12.1, AC-12.2, AC-12.3, AC-12.4, EC-8             |
| `useMonthRollover` + `useSnapshots` + `snapshotsStore` + `AppToast`                                           | composable+store+component    | AC-13.1, AC-13.2                                     |
| `HistoryView.vue` + `SnapshotList.vue`                                                                        | view+component                | AC-13.4                                              |
| `AllocationPanel.vue` + `useAllocation` + `lib/calculations/allocation.ts`                                    | view+composable+lib           | AC-14.1, AC-14.2, AC-14.3, AC-14.4                   |
| `SettingsView.vue` + `useImportExport` + `lib/storage/backup.ts`                                              | view+composable+lib           | AC-15.1, AC-15.2, AC-15.3, AC-15.4, EC-5             |
| `lib/storage/schema.ts` Zod + storage write guard                                                             | lib                           | EC-6                                                 |
| `BottomNav.vue` + responsive layout                                                                           | component                     | AC-16.1, AC-17.3, AC-17.4                            |
| Global focus-visible ring + Tailwind `focus-visible:` utilities                                               | tokens                        | AC-16.2, AC-17.7                                     |
| `useTheme` (Tailwind `class` strategy) + `charts/theme.ts`                                                    | composable+lib                | AC-16.3, AC-17.1, AC-17.2                            |
| `useLocale` + vue-i18n                                                                                        | composable                    | AC-16.4                                              |
| `DashboardView` visual hierarchy + typography scale                                                           | view                          | AC-17.5                                              |
| `EmptyState.vue` (used by every list view)                                                                    | component                     | AC-17.8                                              |
| Vue Router `<RouterView>` + `<Transition>` wrappers                                                           | router                        | AC-17.9                                              |
| `Tooltip.vue` (shadcn-vue port) with viewport-aware positioning                                               | component                     | AC-17.10                                             |

> Every AC in the spec appears in at least one row above. EC-1 through EC-10 are covered by the same modules.

## Data Model

See [2-data-model.md](./2-data-model.md) for the full Zod schema (v2), entity descriptions, persistence shape, and migration rules from v1.

## Contracts

This SPA has no external HTTP/event contracts (constitution forbids sending financial data off-device). Internal contracts:

### Pinia action signature pattern

Every store action that mutates persisted state follows:

```ts
// Form input → Zod parse → store action → reactive state mutation
addDeduction(input: unknown): Deduction {
  const parsed = DeductionInputSchema.parse(input)        // Zod boundary
  const entity = { id: crypto.randomUUID(), ...parsed }   // ID generation
  this.deductions.push(entity)
  return entity
}
```

### Import/Export envelope (AC-15.1, AC-15.2, AC-15.3)

```json
{
  "appName": "personal-finances",
  "schemaVersion": 2,
  "exportedAt": "2026-05-15T10:30:00.000Z",
  "data": {
    /* full state matching lib/storage/schema.ts AppStateSchema */
  }
}
```

Import flow: `JSON.parse` → `BackupEnvelopeSchema.safeParse` → if `schemaVersion < 2` run `migrate()` → write to localStorage → `location.reload()`. Failure leaves current state untouched (AC-15.3).

## ADRs

### ADR-1: Pinia setup-style stores (Composition API)

- **Context:** Pinia supports two store styles: options (`defineStore('x', { state, getters, actions })`) and setup (`defineStore('x', () => { ... })`). The codebase has no legacy preference (greenfield rewrite). Constitution mandates `<script setup>` everywhere else.
- **Options:**
  1. **Setup-style stores** — pros: consistent with `<script setup>` Composition API, better TS inference, easier to share helpers with composables, simpler `storeToRefs()` ergonomics — cons: getters are computed refs (slightly different from options API getters), less discoverable structure.
  2. **Options-style stores** — pros: familiar Vuex-like shape, explicit `state/getters/actions` sections — cons: parallel mental model to the rest of the codebase, weaker type inference in some patterns.
- **Decision:** Setup-style stores.
- **Consequences:** Devs see one mental model everywhere (`<script setup>` + setup stores). Action functions live as regular function declarations and are exported via the returned object. Persistence is handled by an explicit watcher on the store's `state()` output (see ADR-3).
- **Covers:** AC-2.x, AC-4.x, AC-5.x, AC-7.x, AC-8.x, AC-9.x, AC-13.x, AC-14.x — every store-backed AC.

### ADR-2: Chart.js usage via `vue-chartjs` wrapper

- **Context:** Constitution mandates Chart.js 4.x. We must render donut (AC-10.2), DTI gauge (AC-5.6), variable budget progress bars (custom — not Chart.js), and 12-month projection (AC-12.1). Charts must be theme-reactive (AC-17.2).
- **Options:**
  1. **`vue-chartjs` thin wrapper** — pros: declarative `<Bar :data="..." :options="..." />` matches Vue idioms, handles lifecycle (mount/destroy/update), TypeScript types included — cons: one more dependency, indirection on chart-instance access.
  2. **Raw Chart.js inside `onMounted` + `ref` to canvas** — pros: one fewer dep, full control over chart instance — cons: every chart component re-implements mount/destroy/watcher boilerplate, easier to leak chart instances.
  3. **Native Canvas API (current vanilla approach)** — pros: zero dep — cons: forbidden by constitution.
- **Decision:** `vue-chartjs@5.x` wrapper.
- **Consequences:** Adds one dep but eliminates ~30 LOC of boilerplate per chart component. Chart colors are passed via `:options` from a reactive `useChartTheme()` composable that reads `useTheme()`.
- **Covers:** AC-5.6, AC-10.2, AC-12.1, AC-12.2, AC-12.3, AC-17.2.

### ADR-3: Persistence via explicit watcher in `lib/storage`

- **Context:** Constitution requires `useStorage` from VueUse for localStorage. We have 9 Pinia stores and want a single migration entry-point + version check + Zod validation at the read boundary.
- **Options:**
  1. **`pinia-plugin-persistedstate`** — pros: zero-config per store, battle-tested — cons: no migration hook, no Zod validation, writes per store under different keys (breaks single-key migration of v1 data).
  2. **`useStorage` per store, no central layer** — pros: simple — cons: same migration / validation problems; v1 → v2 migration becomes 9 separate concerns.
  3. **Single `useAppStorage()` composable in `lib/storage` that reads `finance_app_data`, runs Zod parse and `migrate()` on boot, then exposes a `watch(allStores, save, { deep: true })`** — pros: one migration entry-point, one Zod validation, single localStorage key (matches v1 key), backup on first migration, easy quota-error toast (EC-6) — cons: custom code (~80 LOC), centralized concern across all stores.
- **Decision:** Option 3 — central `useAppStorage()` in `lib/storage/`.
- **Consequences:** `lib/storage` becomes the single source of truth for persistence policy. `lib/storage/migrate.ts` handles v1 → v2 once, and writes `finance_app_data_v1_backup` for rollback safety. Quota errors surface as a non-blocking toast and the current in-memory state is preserved (EC-6).
- **Covers:** EC-5, EC-6, AC-15.1, AC-15.2, all schema-evolution constitution rules.

### ADR-4: Versioned migration chain

- **Context:** v1 (current vanilla SPA shape) → v2 (new shape with snapshots, frequency, non-salary benefits, lastMonthSeen, theme). Future schema bumps are likely (US-13 may want more snapshot fields; payoff method may grow).
- **Options:**
  1. **Single `migrate(state)` switch with `if (v < 2) ...; if (v < 3) ...` blocks** — pros: one function — cons: gets long and intertwined; hard to test individual hops in isolation.
  2. **Chain of named functions `migrations: Record<number, (s) => s>` applied sequentially** — pros: each hop is unit-testable in isolation, easy to add `migrations[3]` later — cons: slightly more setup.
- **Decision:** Chain of named functions (`migrations[2] = (v1State) => v2State`, applied in order).
- **Consequences:** New migrations are additive. Each step has its own unit test fixture (`v1-state.fixture.json` → `v2-state.fixture.json`).
- **Covers:** EC-5, constitution rule "Adding a persisted field without updating `migrate()`".

### ADR-5: Form validation with Zod + lightweight composable (no vee-validate)

- **Context:** Constitution mandates Zod at all form/storage boundaries. Form complexity is modest (~15 forms, mostly numeric inputs).
- **Options:**
  1. **Zod + manual `useForm<T>(schema)` composable** — pros: ~40 LOC of code, full control, no extra dep, TS types flow directly from `z.infer` — cons: build error/touched/submit state ourselves.
  2. **Zod + `vee-validate` + `@vee-validate/zod`** — pros: handles touched/dirty/submit state out of the box, integrates with shadcn-vue form components — cons: two more deps, framework opinions to learn, overkill for ≤15 forms.
- **Decision:** Custom `useForm<T>(schema)` composable in `src/composables/useForm.ts`.
- **Consequences:** Every form view follows: `const { values, errors, validate, submit } = useForm(MyFormSchema)`. Composable handles field-level error display, integrates with `aria-invalid` for AC-16.2.
- **Covers:** Constitution rule "Skipping Zod validation on form inputs"; AC-15.3, AC-14.2 (form rejection on > 100%).

### ADR-6: Health score — re-normalize weights when components are missing (AC-11.4)

- **Context:** AC-11.4 mandates that a component without data is excluded from the score with a notice. Default weights from clarifications: DTI 35, Emergency 30, Housing 20, Savings 15 (sum = 100).
- **Options:**
  1. **Re-normalize present weights to sum to 1** — e.g. if Emergency is missing, the remaining DTI:Housing:Savings ratio is 35:20:15 → re-normalized to 50:28.6:21.4 → score still scales 0–100.
  2. **Cap score at the sum of present weights** — e.g. if Emergency missing, max possible = 70; a "perfect" but emergency-less user scores 70, communicating incompleteness.
  3. **Refuse to compute until all components have data** — pros: avoids misleading single number — cons: violates AC-11.4 ("se calcula solo con los componentes disponibles").
- **Decision:** Option 1 — re-normalize. The descriptive label (Crítico/En riesgo/Regular/Bueno/Excelente) reflects relative health; the missing-component notice (AC-11.4) communicates incompleteness alongside the score.
- **Consequences:** Pure function `calcHealthScore(inputs)` returns `{ score, label, components: { dti, emergency, housing, savings }, missing: string[] }`. UI surfaces `missing[]` next to the score.
- **Covers:** AC-11.1, AC-11.4.

### ADR-7: Snapshot auto-save on app-open detection (AC-13.1)

- **Context:** AC-13.1 requires automatic snapshot on the first app-open of a new month. Q-1 resolved to silent auto-save with a non-blocking toast.
- **Options:**
  1. **App-open detection via `settings.lastMonthSeen`** — compare current `YYYY-MM` to stored value on every app boot; if different, snapshot the previous month using whatever data is in stores, then update `lastMonthSeen`.
  2. **`setInterval` polling every N minutes while app is open** — pros: catches rollover during a long session — cons: app may not be open at midnight; needless work.
  3. **Service Worker periodic-sync** — pros: works in background — cons: requires PWA infrastructure, browser support varies, way more complex than needed.
- **Decision:** Option 1 — `useMonthRollover` composable runs once on `App.vue` mount.
- **Consequences:** Snapshot timing depends on the user opening the app at least once per month. Acceptable per spec — users who don't open the app for months will see snapshots batched on next open (the rollover detector only writes one snapshot per missed-month gap, dated to the end of the previous month). The composable also triggers AC-8.4 (variable-expense reset prompt).
- **Covers:** AC-8.4, AC-13.1, AC-13.2.

### ADR-8: Theme strategy — Tailwind `class` strategy + tri-state setting

- **Context:** AC-16.3, AC-17.1, AC-17.2 require a comprehensive dark mode including charts. Tailwind v4 supports `prefers-color-scheme` media query mode or a `class` mode toggled by the app.
- **Options:**
  1. **Tailwind `class` strategy + `settingsStore.theme: 'light' | 'dark' | 'system'`** — pros: user override, OS-following default, deterministic in tests — cons: extra `useTheme` plumbing that watches `prefers-color-scheme` when `theme === 'system'`.
  2. **`prefers-color-scheme` only** — pros: zero plumbing — cons: no user override.
- **Decision:** Option 1.
- **Consequences:** `useTheme()` exposes `isDark: ComputedRef<boolean>` consumed by `lib/charts/theme.ts` for Chart.js options (background, grid lines, text). The Tailwind config uses `darkMode: 'class'`. Toggle is persisted in `settingsStore.theme`.
- **Covers:** AC-16.3, AC-17.1, AC-17.2.

### ADR-9: Onboarding state — single store flag + step index, route guard for redirect

- **Context:** AC-1.x defines a wizard with progress bar, skippable, relaunchable (AC-1.6), with a "resume where you left off" requirement (EC-9).
- **Options:**
  1. **`settingsStore.onboarding: { done: boolean; currentStep: number }` + a `beforeEach` router guard that redirects to `/onboarding` when `!done && location !== '/onboarding' && noDataYet`** — pros: simple, persists progress in localStorage, relaunch sets `done=false` without wiping other state — cons: a global guard.
  2. **Nested routes `/onboarding/step-1`, `/step-2`, `/step-3`** — pros: deep-linkable steps — cons: not needed (user can't share onboarding links), more routing complexity.
  3. **Modal overlay on `/dashboard`** — pros: no routing — cons: harder to deep-link or skip cleanly, conflicts with first-load empty state.
- **Decision:** Option 1.
- **Consequences:** Relaunch from Settings (AC-1.6) sets `onboarding.done = false` _without_ clearing any other store — onboarding views read existing store values as "precargados" (AC-1.6). Skip (AC-1.4) sets `done = true`. Each step completion bumps `currentStep`. EC-9 satisfied by persisting `currentStep` on every change.
- **Covers:** AC-1.1, AC-1.2, AC-1.3, AC-1.4, AC-1.5, AC-1.6, EC-9.

## Dependencies

Versions pinned by Constitution v2; exact range below.

**Runtime:**

- `vue@^3.5.0`
- `vue-router@^4.4.0`
- `pinia@^2.2.0`
- `@vueuse/core@^11.0.0`
- `vue-i18n@^9.14.0`
- `chart.js@^4.4.0`, `vue-chartjs@^5.3.0`
- `zod@^3.23.0`
- `@sentry/vue@^8.0.0`
- `pino@^9.0.0`, `pino-pretty@^11.0.0` (dev only)

**UI:**

- `tailwindcss@^4.0.0`, `@tailwindcss/vite@^4.0.0`
- `shadcn-vue` (CLI-generated components, no runtime dep) + `radix-vue@^1.9.0` (peer)
- `lucide-vue-next@^0.460.0` (icons used by `SemanticBadge` and EmptyState)

**Dev:**

- `vite@^6.0.0`, `@vitejs/plugin-vue@^5.0.0`
- `typescript@^5.5.0`, `vue-tsc@^2.1.0`
- `vitest@^2.1.0`, `@testing-library/vue@^8.1.0`, `@vue/test-utils@^2.4.0`, `jsdom@^25.0.0`
- `@vitest/coverage-v8@^2.1.0`
- `eslint@^9.0.0`, `@vue/eslint-config-typescript@^14.0.0`, `eslint-plugin-vue@^9.27.0`
- `prettier@^3.3.0`
- `lint-staged@^15.0.0`, `husky@^9.0.0`

**No external services, no new infrastructure.** Sentry DSN is optional (env var); production logging defaults to Pino at `warn` (constitution rule).

## Rollout / Rollback

- **Feature flag:** N/A — this is a full SPA rewrite on a personal project, not a gated release.
- **Rollout plan:** Develop on `feature/20260514-project-refactor` through `/sdt.test-plan` → `/sdd.tasks` → `/sdd.implement` → `/sdd.review` → merge to `main` after sign-off. The old `server.js` and `app.js` are removed in the final integration task; intermediate commits may keep them in parallel for cross-checking calculations during implementation.
- **Rollback steps (executable by anyone, including a future-you who didn't write this):**
  1. `git checkout main` — restores the vanilla SPA codebase.
  2. Open the app in the browser. The vanilla `migrate()` function reads `finance_app_data` and ignores `schemaVersion > 1` keys; the user sees v1 fields plus default values for anything new.
  3. **If localStorage was already migrated to v2 and the user wants v1 data restored verbatim:** open DevTools console, run:
     ```js
     const v1 = localStorage.getItem('finance_app_data_v1_backup')
     if (v1) localStorage.setItem('finance_app_data', v1)
     location.reload()
     ```
  4. `finance_app_data_v1_backup` is written once, on first successful v1 → v2 migration, and never overwritten.
- **No data loss path:** On first migration, v1 payload is preserved under `finance_app_data_v1_backup`. On any quota failure during migration, current state is preserved and a non-blocking toast surfaces the error (EC-6).

## Risks

| Risk                                                                                                                      | Impact   | Mitigation                                                                                                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tax calculation regression on the rewrite (Art. 383 ET retención is legally sensitive)                                    | **High** | Golden tests in `lib/tax/colombia/retencion.test.ts` covering boundary salaries from each marginal bracket; 80% coverage gate per constitution; legal source comments inline. Re-derive the expected values from UVT 2025 = $49,799 (Resolución DIAN 000187/2024). |
| Chart.js dark mode requires manual color tokens (AC-17.2) — default Chart.js options assume light-mode canvas backgrounds | **Med**  | Centralize chart color tokens in `lib/charts/theme.ts`; subscribe to `useTheme().isDark`; pass options through `useChartTheme()` composable; visual smoke test on every chart at both themes during `/sdd.implement`.                                              |
| localStorage quota exhaustion (EC-6) as snapshots accumulate beyond ~5 MB on some browsers                                | **Med**  | Wrap writes in try/catch in `lib/storage/useAppStorage`; surface non-blocking toast on `QuotaExceededError`; cap snapshots at 24 months rolling (older snapshots dropped silently, FIFO); document cap in `2-data-model.md`.                                       |
| Feature-parity gap vs current vanilla SPA — 17 user stories, 80 ACs is a lot of surface for a solo refactor               | **Med**  | Traceability matrix in this plan (Components → AC table above) is exhaustive; `/sdt.test-plan` will derive a TC for every AC; `/sdd.review` will run a final drift check.                                                                                          |
| shadcn-vue (Radix port) less mature than React equivalent — some components may have rough edges or be missing            | **Low**  | Fallback to hand-rolled with raw `radix-vue` primitives where shadcn-vue lacks; flag any gaps as Open Questions and route through `/sdd.fix-drift` if they require spec changes.                                                                                   |
| Tailwind v4 config syntax differs significantly from v3 (CSS-first config, no `tailwind.config.js`)                       | **Low**  | Pin `tailwindcss@^4.0.0` and `@tailwindcss/vite@^4.0.0`; document v4 setup in `tasks` phase; do not copy v3 examples from older docs.                                                                                                                              |
| Sentry SDK adds ~30 KB gzipped — bundle size concern for a personal-finance SPA loaded on mobile                          | **Low**  | Sentry initialized only when `import.meta.env.VITE_SENTRY_DSN` is set; tree-shaken otherwise; lazy-load via dynamic import on first error path if needed.                                                                                                          |
| `crypto.randomUUID()` not available on older Safari (< 15.4) — constitution mandates it                                   | **Low**  | Constitution rule; if a target browser doesn't support it, that's a constitution amendment, not a code workaround. Modern target is acceptable for v1.                                                                                                             |

## Constitution Exceptions

None.

## Open Questions

None. Spec resolved all 4 functional open questions; no technical open questions remain after the architecture review above.

---

## Sign-off

<!-- mode=solo -->

- [x] Author: `Johann Medina` — `2026-05-15`
