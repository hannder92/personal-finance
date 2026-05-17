# Technical Plan: `Fix cálculos financieros`

> Spec: [1-spec.md](./1-spec.md) · Mode: `solo`
> Plan version: **v1** · Created: `2026-05-16`

## Summary

Corregimos los cálculos financieros del dashboard (ingreso neto vs. bruto, DTI con cuotas, TEA mensual correcta, health score con datos reales), aseguramos la persistencia confiable entre sesiones, y añadimos US-8 (proyección de ahorro hipotética + interés compuesto). El cambio de fórmula de amortización (TEA en vez de TNA) y la migración v2→v3 del schema (Asset.annualRatePercent) son los dos puntos de mayor blast radius. No hay servicios externos, no hay feature flags, no hay infra nueva — todo el rollback es local al navegador del usuario.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│ LAYER: views/                                                            │
│  DashboardView, IncomeView, GoalsView, NetWorthView                      │
│         │                                                                │
│         │ uses (composables only — never lib directly)                   │
│         ▼                                                                │
│ LAYER: composables/                                                      │
│  useNetIncome [NEW]           useSavingsProjection [NEW]                 │
│  useHealthScore [NEW]         useStorageError    [NEW]                   │
│  useDTI [NEW]                 useGoalsBudget     [NEW]                   │
│         │                                                                │
│         │ reads/writes stores                                            │
│         ▼                                                                │
│ LAYER: stores/                                                           │
│  assetsStore        [MODIFY: annualRatePercent]                          │
│  incomeStore        [MODIFY: addPrimaPreset → upsert]                    │
│  cardsStore         [unchanged]                                          │
│  expensesStore      [unchanged]                                          │
│  goalsStore         [unchanged]                                          │
│  allocationStore    [unchanged]                                          │
│  snapshotsStore     [unchanged]                                          │
│  variableExpensesStore [unchanged]                                       │
│  settingsStore      [unchanged]                                          │
│         │                                                                │
│         │ calls pure functions                                           │
│         ▼                                                                │
│ LAYER: lib/                                                              │
│  calculations/                                                           │
│   ├─ amortization.ts       [MODIFY: TEA → (1+TEA)^(1/12)−1]              │
│   ├─ savings-projection.ts [NEW]                                         │
│   ├─ health-score.ts       [unchanged]                                   │
│   ├─ dti.ts, projection.ts, net-income.ts, ... [unchanged]              │
│  storage/                                                                │
│   ├─ schema.ts             [MODIFY: AppStateSchemaV3 + Asset rate]       │
│   ├─ migrate.ts            [MODIFY: + migrations[3]]                     │
│   └─ useAppStorage.ts      [MODIFY: surface save errors via emitter]     │
└─────────────────────────────────────────────────────────────────────────┘

Persistence cycle (after fix):
  store.action() → state mutates → main.ts watcher → saveAppState()
    → if {ok:false} → useStorageError emits → StorageErrorToast renders (AC-1.4)
```

### Components

| Component | Responsibility | Layer | Covers |
|---|---|---|---|
| `calcNetSalary` (existing) | gross − deductions + non-salary benefits | `lib/calculations` | AC-2.1, AC-2.4, AC-2.5 |
| `useNetIncome` | bridge incomeStore → calcNetSalary; reactive `netIncome` | `composables` | AC-2.2, AC-2.3 |
| `useHealthScore` | aggregates DTI, emergency months, housing, savings rate; calls `calcHealthScore` | `composables` | AC-3.1, AC-3.2, AC-3.3, AC-3.4, AC-3.5, AC-3.6 |
| `monthsToPayoff` in `amortization.ts` | uses `(1+TEA)^(1/12)−1` (was `apr/12`) | `lib/calculations` | AC-4.1, AC-4.4 |
| `useDTI` | sums minPayment + `calcCardObligation` installments; divides by netIncome | `composables` | AC-4.2, AC-4.3 |
| `calcProjection` (existing) wired with netIncome | uses net income, not gross | `lib/calculations` + view | AC-5.1, AC-5.2, AC-5.3 |
| `useGoalsBudget` | cap = `allocation.savings × netIncome / 100` | `composables` | AC-6.1, AC-6.2 |
| `incomeStore.addPrimaPreset` (upsert) | idempotent by reserved `__prima__` id | `stores` | AC-7.1, AC-7.2, AC-7.3 |
| `calcHypotheticalSavings` | `netIncome × rate% × month` (linear) | `lib/calculations/savings-projection.ts` | AC-8.1, AC-8.4 |
| `calcCompoundGrowth` | Σ assets[i].balance × (1+rate_i)^(month/12) | `lib/calculations/savings-projection.ts` | AC-8.2, AC-8.6 |
| `useSavingsProjection` | bridge stores → savings-projection.ts; reactive series | `composables` | AC-8.3, AC-8.4, AC-8.5 |
| `SavingsProjectionChart` | Chart.js line chart, two series (solid + dashed) | `components/dashboard` | AC-8.3 |
| `AssetForm` (modify) | input for `annualRatePercent` on `savings | investment` types | `components/networth` | AC-8.2 (data entry) |
| `useStorageError` | listens to `saveAppState` failures; pushes toast | `composables` | AC-1.4 |
| `StorageErrorToast` | accessible toast with retry CTA | `components/common` | AC-1.4 |
| `main.ts persistStores` (verify) | deep-watch all 9 stores; calls `saveAppState`; handles `{ok:false}` | `entry` | AC-1.1, AC-1.2, AC-1.3, AC-1.4 |
| `migrate.ts migrations[3]` | v2→v3: adds `annualRatePercent: 0` to all assets | `lib/storage` | (enables AC-8.2 for existing users) |

## Data Model

Schema change is substantial (new field + migration + Zod refinement). See [2-data-model.md](./2-data-model.md) for the full delta.

Summary of change:
- `Asset` gains `annualRatePercent: number` (default `0`, range `0–100`, only meaningful for `type: 'savings' | 'investment'`).
- `schemaVersion` bumps from `2` to `3`.
- `migrate()` chain extended with `migrations[3]` (v2 → v3).
- Existing v2 backups (`finance_app_data_v1_backup`) untouched; new `finance_app_data_v2_backup` written on first v2→v3 migration.

## Contracts

No external APIs. No event contracts. localStorage payload contract is the Zod schema in `src/lib/storage/schema.ts` — see [2-data-model.md](./2-data-model.md).

## ADRs

### ADR-1: APR field interpreted as TEA (Tasa Efectiva Anual)

- **Context:** The spec (AC-4.1) and the Colombian banking standard (Superfinanciera) express credit interest as TEA. The current code (`amortization.ts:61`) divides APR by 12, which mathematically treats APR as a nominal rate (TNA), producing systematically higher month counts and higher total interest for the user.
- **Options:**
  1. **Treat APR as TNA (status quo)** — pros: no code change, no migration; cons: financially incorrect for the Colombian market; reports more months and more interest than reality.
  2. **Treat APR as TEA, compute TEM `(1+TEA)^(1/12)−1`** — pros: matches Superfinanciera and bank statements; correct for the user's mental model; less interest reported → friendlier UX. Cons: existing test fixtures break; users see different numbers after deploy.
  3. **Dual field (TEA / TNA) with selector** — pros: explicit; cons: clutter UI; user must understand the difference; complicates forms.
- **Decision:** Option 2 (TEA).
- **Consequences:** Update tests in `tests/unit/amortization.test.ts`. Update the label in the debt form: "Tasa Efectiva Anual (E.A.)" with a tooltip explaining the convention. Existing user data is unchanged (APR value), but displayed amortizations will improve.
- **Covers:** AC-4.1, AC-4.4

### ADR-2: New module location `lib/calculations/savings-projection.ts`

- **Context:** US-8 needs two new pure functions (`calcHypotheticalSavings`, `calcCompoundGrowth`). The existing `projection.ts` only models cash-flow with periodic income — it does not compose well with savings/compound growth.
- **Options:**
  1. **New file `lib/calculations/savings-projection.ts`** — pros: clean separation; cash-flow stays unchanged; testable in isolation. Cons: small file (~60 lines).
  2. **New top-level directory `lib/projections/`** — pros: future-proof if more projection types appear; cons: premature abstraction (YAGNI); breaks current directory convention.
  3. **Extend `projection.ts`** — pros: one file; cons: mixes concerns (income forecast vs. savings growth); harder to test in isolation.
- **Decision:** Option 1.
- **Consequences:** New file follows existing `lib/calculations/*` convention; coverage gate ≥80% applies automatically (vitest.config.ts).
- **Covers:** AC-8.1, AC-8.2, AC-8.6

### ADR-3: Migration v2→v3 — default `annualRatePercent: 0` for existing assets

- **Context:** Existing users have assets without `annualRatePercent`. The Zod schema must validate, and we cannot block load.
- **Options:**
  1. **Default `0` in migration** — pros: schema validates; UI shows "configura tu tasa" message (AC-8.5); user is in control. Cons: until user edits, compound chart shows flat line for that asset.
  2. **Prompt user at first load post-migration** — pros: forces value; cons: intrusive UX; out of scope for the spec.
  3. **`annualRatePercent: number | null` with composable handling null** — pros: explicit "unset" state; cons: more complex types; nullable financial fields are an anti-pattern (we have boundary guards).
- **Decision:** Option 1.
- **Consequences:** `useSavingsProjection` filters assets with `annualRatePercent > 0` for the compound curve; if all assets have rate `0`, AC-8.5 message is shown.
- **Covers:** AC-8.2, AC-8.5

### ADR-4: Storage error UX — non-dismissible toast with retry CTA

- **Context:** AC-1.4 requires a visible notice within 5 seconds when `saveAppState()` returns `{ok: false}` (quota exceeded, validation failure). The user's data is still in memory, so we must not lose UX confidence.
- **Options:**
  1. **Toast (5s auto-hide + retry button)** — pros: matches existing `AppToast` pattern; non-intrusive; retry option; cons: user may miss it if away from screen.
  2. **Inline banner in `App.vue`** — pros: persistent until dismissed; cons: takes vertical space; harder to retry contextually.
  3. **Modal dialog** — pros: forces acknowledgment; cons: blocks workflow; overkill for a recoverable error.
- **Decision:** Option 1 (toast, but **without** the 5-second auto-hide — sticky until user dismisses or retry succeeds).
- **Consequences:** Reuse `AppToast.vue` with `persistent: true` variant. Add i18n keys `storage.error.title`, `storage.error.retry`, `storage.error.quotaExceeded`.
- **Covers:** AC-1.4

### ADR-5: One chart with two series (hypothetical solid + compound dashed)

- **Context:** AC-8.3 requires both projections visible simultaneously and visually distinguishable.
- **Options:**
  1. **Two separate charts** — pros: maximum clarity; cons: more space; harder to compare values at the same month index.
  2. **One chart, two series (solid + dashed, different colors)** — pros: direct visual comparison; less space; cons: requires legend/tooltip for clarity.
  3. **Toggle between views** — pros: one focal point at a time; cons: violates AC-8.3 (must be simultaneous).
- **Decision:** Option 2.
- **Consequences:** Reuse `useChartTheme()` composable for color tokens; legend obligatory; tooltip shows both values at hover month.
- **Covers:** AC-8.3

### ADR-6: Prima upsert keyed by reserved id `__prima__`

- **Context:** AC-7.2 requires upsert without duplication when the user presses the prima button repeatedly.
- **Options:**
  1. **Reserved id `__prima__`** — pros: simple; one lookup; cons: id is no longer a UUID (constitution requires `crypto.randomUUID()` for entity IDs).
  2. **Flag `isPrima: true` on the stream** — pros: keeps UUID convention; cons: extends `IncomeStream` schema with a domain-specific flag.
  3. **Dedicated `primaServicios` field on income state** — pros: type-safe; cons: separate data shape; complicates the projection (must aggregate prima + otherStreams).
- **Decision:** Option 2 (`isPrima: true` flag on `IncomeStream`). Documented dispensation: this is not a generic flag — it's a stable marker for the upsert idempotency required by AC-7.2. Add to Constitution exceptions.
- **Consequences:** Schema bump: `IncomeStreamSchema` adds optional `isPrima: z.boolean().optional()`. Migration v2→v3 also sets this flag on streams whose label matches "Prima de servicios" (best-effort detection for existing users).
- **Covers:** AC-7.1, AC-7.2, AC-7.3

## Dependencies

- **External services:** none
- **New libraries:** none (Chart.js, Zod, vue-i18n all already pinned)
- **New infra:** none (localStorage)
- **Modified library usage:**
  - `chart.js@^4.4.0` — add `borderDash` config for compound series
  - `zod@^3.23.0` — refine `Asset` with `annualRatePercent` range `[0, 100]`

## Rollout / Rollback

- **Feature flag:** none — this is a bug fix; no A/B desired.
- **Rollout plan:** single PR, single deploy. No staged rollout (single-user app, no backend).
- **Rollback steps (executable by any developer):**
  1. `git revert <merge-sha>` of the feature commit
  2. Deploy reverted bundle
  3. **For users already migrated to v3:** the app will read v3-shape data with v2 schema → Zod parse fails → `loadAppState` returns `null` → fresh state. To recover: restore from `finance_app_data_v2_backup` localStorage key:
     ```js
     // run in browser console after rollback
     const backup = localStorage.getItem('finance_app_data_v2_backup')
     if (backup) localStorage.setItem('finance_app_data', backup)
     location.reload()
     ```
  4. Optional: provide a hotfix `/recover` route that performs step 3 automatically (out of scope for this plan but documented for ops).

## Risks

| Risk | Impact | Mitigation |
|---|---|---|
| TEA fix changes existing user calculations (months ↓, totalInterest ↓) | H | Tests updated in same commit. UI shows tooltip explaining "Tasa Efectiva Anual" convention. Single deploy — no inconsistent state. |
| Migration v2→v3 fails for users with malformed assets | H | `migrations[3]` is defensive: if `annualRatePercent` is non-numeric, clamps to `0`. `loadAppState` returns `parseError` so toast surfaces (AC-1.4). |
| Deep watch in `main.ts` fires excessively during hydration | M | Use a `isHydrating` flag set to `true` during `hydrateStores()` and unset on `nextTick()`. Watcher early-returns when flag is set. |
| Persistence save fails silently (no toast wired) | M | `saveAppState` returns `{ok, reason}` typed result. Watcher destructures and emits via `useStorageError`. Test in `tests/component/storage-toast.test.ts`. |
| Prima upsert detection for legacy users (no `isPrima` flag) misclassifies a user's custom stream named "Prima de servicios" | L | Migration converts only streams where `label === 'Prima de servicios' AND frequency === 'semiannual' AND amount === grossSalary/2 (±5%)`. If unsure, leave as-is. |
| User has assets with `type: 'property' \| 'vehicle' \| 'other'` and expects compound growth | L | Spec scopes US-8 to `savings | investment` only (per OQ-P2 below). UI hides the rate input for other types. |
| Chart.js mobile rendering breaks with two overlapping series | L | E2E test in `e2e/savings-projection.spec.ts` validates render on viewport 375×667. Use `borderDash` for compound + distinct hue. |

## Constitution Exceptions

| Rule | Exception | Rationale | Expiration |
|---|---|---|---|
| "IDs MUST use `crypto.randomUUID()`" (Security) | `IncomeStream.id` can be `__prima__` for the prima de servicios entry | ADR-6: required for AC-7.2 upsert idempotency. Reserved slug, validated in `addStream` to prevent collision. | Permanent (domain rule). |

## Open Questions

- [ ] **Q-P-1** — Visualización US-8: ¿en `DashboardView` o nueva ruta `/savings-projection`? *Recomendación: DashboardView con sección expandible (no añade ruta, respeta nav shell).*
- [ ] **Q-P-2** — `annualRatePercent` aplica sólo a `type: 'savings' | 'investment'`, ¿o también `property` (apreciación inmobiliaria)? *Recomendación: solo `savings | investment` en v1; `property` requiere modelo de plusvalía diferente, fuera de scope.*

---

## Sign-off

<!-- mode=solo -->
- [x] Author: `Johann Medina` — `2026-05-16`
