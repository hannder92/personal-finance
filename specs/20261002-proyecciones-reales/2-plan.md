# Technical Plan: Proyecciones reales (inflación, rentabilidad y aporte requerido)

> Spec: [1-spec.md](./1-spec.md) · Mode: solo

## Architecture

```text
views/FinancialFreedomView ──► composables/useFinancialFreedom ──► lib/calculations/financial-freedom
views/GoalsView → GoalList/GoalCard ──► composables/useGoalStatus ──► lib/calculations/goals
views/SettingsView → settings/AssumptionsPanel ──► composables/useAssumptions
                                                         │
                     lib/calculations/real-projection (pure: R-1…R-6)  ◄── financial-freedom, goals
                     lib/calculations/assumptions-reference (Colombia 2026-10 constants)
stores/settingsStore (inflation, withdrawal, fiDesiredYears, projection rate = rentabilidad)
stores/goalsStore (goal.invested)
lib/storage: AppStateSchemaV7 + migrateV6toV7 → main.ts hydrate/persist, useAppStorage
```

### Components

| Component                                         | Responsibility                                                                                                             | Layer  | Covers                                     |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------ |
| `lib/calculations/real-projection.ts` (new)       | `monthlyRate`, `realRatePercent`, `inflateToMonth`, `monthsToReach`, `requiredMonthlyFor` (R-1…R-6)                        | domain | AC-1.4, AC-2.2, AC-2.3, AC-2.6, AC-3.2–3.4 |
| `lib/calculations/assumptions-reference.ts` (new) | Colombia reference values + `asOf`                                                                                         | domain | AC-1.2                                     |
| `lib/calculations/financial-freedom.ts` (extend)  | Capital by withdrawal rate; months with return/inflation; required monthly for desired years; no-return months for benefit | domain | AC-2.1–2.6                                 |
| `lib/calculations/goals.ts` (extend)              | ETA / required monthly with optional `{ annualReturnPercent, inflationPercent }`; inflated target                          | domain | AC-3.2–3.6                                 |
| `lib/storage/schema.ts` + `migrate.ts`            | V7 schema + `migrateV6toV7`                                                                                                | infra  | AC-1.1, AC-1.6                             |
| `useAppStorage.ts`, `main.ts`                     | Validate/persist V7; hydrate new fields                                                                                    | infra  | AC-1.6                                     |
| `stores/settingsStore.ts`                         | `inflationPercent`, `withdrawalRatePercent`, `fiDesiredYears` + guarded setters + `applyColombiaReference()`               | app    | AC-1.1–1.3, AC-1.5                         |
| `stores/goalsStore.ts`                            | `invested` flag (default false) on add/update                                                                              | app    | AC-3.1                                     |
| `composables/useAssumptions.ts` (new)             | Reactive assumptions, real rate, optimistic flag                                                                           | app    | AC-1.4, AC-2.5                             |
| `composables/useFinancialFreedom.ts` (extend)     | Pass assumptions; expose new fields                                                                                        | app    | AC-2.x                                     |
| `composables/useGoalStatus.ts` (extend)           | Pass assumptions by `goal.invested`; status, benefit                                                                       | app    | AC-3.x                                     |
| `components/settings/AssumptionsPanel.vue` (new)  | Inputs with range errors, reference button + source, real rate + warning                                                   | app    | AC-1.1–1.4                                 |
| `views/FinancialFreedomView.vue`                  | Hero years, required monthly + desired years input, benefit, context, disclaimer, unreachable                              | app    | AC-2.1–2.7                                 |
| `components/goals/GoalCard.vue`, `GoalList.vue`   | Target hero, inflated detail, ETA, required, status badge, benefit, invest toggle (card + new-goal form)                   | app    | AC-3.1–3.7                                 |
| `i18n/es.json`, `en.json`                         | New keys                                                                                                                   | cross  | EC-7                                       |

### Moment → component map (user-facing)

| User Moment | UI block                                                             | Covers     |
| ----------- | -------------------------------------------------------------------- | ---------- |
| UM-1        | FinancialFreedomView hero + required monthly block                   | AC-2.1–2.7 |
| UM-2        | GoalCard (P0 rows) + GoalList form toggle                            | AC-3.1–3.7 |
| UM-3        | AssumptionsPanel in Settings (`#assumptions` anchor, linked from FI) | AC-1.1–1.5 |

## Existing assets & reuse

| Existing module / store / util                   | Reuse / extend / replace                      | Notes                                                                                        |
| ------------------------------------------------ | --------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `settings.projectionAnnualRatePercent`           | **Reuse** as "rentabilidad esperada"          | AC-1.5 holds by construction: dashboard control and AssumptionsPanel bind to the same setter |
| `calcFinancialFreedom`                           | Extend (new optional inputs, default neutral) | `targetPatrimony = expense × 12 × 100 / withdrawal` (exact for 4% = ×300)                    |
| `calcGoalETA`, `calcRequiredMonthly`             | Extend with optional assumptions arg          | Neutral path keeps today's closed form (R-6)                                                 |
| `useFormat`, `formatCurrency`, `formatMonthYear` | Reuse                                         |                                                                                              |
| `SemanticBadge`                                  | Reuse for En camino / Atrasada / Lograda      |                                                                                              |
| `assets.annualRatePercent`                       | Not used                                      | Per-asset rates stay for the net-worth projection only                                       |

## Security & privacy

| Surface      | Threat / concern           | Mitigation                                                        | TC ref       |
| ------------ | -------------------------- | ----------------------------------------------------------------- | ------------ |
| Inputs       | Out-of-range / NaN numbers | Store guards + Zod ranges (0–30, 0–100, 1–10, int 5–40)           | TC-U-010     |
| Persistence  | Data loss on V6→V7         | Additive migration, defaults neutral; schema test with V6 fixture | TC-U-020…022 |
| Import       | Old backup                 | Import runs `migrate()` then V7 `safeParse`                       | TC-I-001     |
| Logs / tests | PII                        | Fixtures synthetic                                                | —            |

## Data Model

```ts
// V7 (additive over V6)
settings.inflationPercent: number      // 0–30, default 0
settings.withdrawalRatePercent: number // 1–10, default 4
settings.fiDesiredYears: number        // int 5–40, default 20
goals[].invested: boolean              // default false
```

`migrateV6toV7`: add the four defaults; keep `projectionAnnualRatePercent` untouched (it becomes the shared return rate).

## Contracts

```ts
monthlyRate(annualPercent): number                         // (1+a)^(1/12) − 1
realRatePercent(returnPct, inflationPct): number           // R-5
inflateToMonth(amountToday, months, inflationPct): number  // R-3
monthsToReach({ targetToday, balance, monthlyContrib, annualReturnPercent, inflationPercent, maxMonths = 1200 }): number | null
requiredMonthlyFor({ targetToday, balance, months, annualReturnPercent, inflationPercent }): number
```

## ADRs

### ADR-1: Month-by-month simulation vs closed form

- **Context**: Target grows with inflation while balance compounds at the return with flat contributions (R-2…R-4).
- **Options**:
  1. Closed form with logarithms — exact, but needs special cases (r = i, r = 0, unreachable) and is hard to read.
  2. Month loop ≤ 1200 iterations; closed form only for `requiredMonthlyFor` (annuity) — simple, matches spec definition literally.
- **Decision**: Option 2. Neutral case (r = i = 0) uses `ceil(shortfall / contrib)` to guarantee R-6 bit-exactness.
- **Consequences**: ≤1200 iterations per goal per render; negligible.
- **Covers**: AC-2.2, AC-2.6, AC-3.3

### ADR-2: Where assumptions live

- **Options**: 1. New `assumptionsStore` — clean but another hydrate/persist path. 2. Extend `settingsStore` — the return rate already lives there.
- **Decision**: Option 2.
- **Covers**: AC-1.1, AC-1.5, AC-1.6

### ADR-3: Reference values

- **Options**: 1. Fetch from DANE/BanRep — fresh but violates local-only invariant. 2. Bundled constant with `asOf` — updated per release.
- **Decision**: Option 2 (non-goal in spec).
- **Covers**: AC-1.2

## Assumption Register

| ID    | Assumption                                                    | Impact if wrong | Verify by                                             | Status     |
| ----- | ------------------------------------------------------------- | --------------- | ----------------------------------------------------- | ---------- |
| A-001 | 1200-iteration loop per goal is imperceptible                 | L               | Component tests with 20 goals stay < existing timings | unverified |
| A-002 | Float rounding reproduces spec examples within $1             | M               | Unit tests TC-U-001…009                               | unverified |
| A-003 | Months to target date keep today's year/month difference rule | L               | Existing goals tests stay green                       | unverified |

## Dependencies

None new.

## Rollout / Rollback

- Feature flag: none (neutral defaults make the change invisible until configured, except AC-1.1 consequence for users with a projection rate > 0).
- Rollback: revert the feature commits. A V7 payload loaded by the V6 app fails `AppStateSchemaV6` (`schemaVersion` literal) and shows the storage-recovery UI; recover by importing a V6 export, or by editing `schemaVersion` to 6 in localStorage (extra keys are stripped by Zod).

## Risks

| Risk                                                     | Impact        | Mitigation                                         |
| -------------------------------------------------------- | ------------- | -------------------------------------------------- |
| Existing tests assert V6                                 | Build red     | Update version asserts in same task as schema bump |
| AC-1.1 visible change for users with projection rate > 0 | User surprise | Context line shows assumptions on FI               |
| GoalCard redesign breaks existing tests                  | Medium        | Keep existing `data-testid`s                       |

## Sign-off

- [x] Author — Claude — 2026-10-02
