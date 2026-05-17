# Data Model — `Fix cálculos financieros`

> Plan: [2-plan.md](./2-plan.md) · Version: **v1**

Schema delta: v2 → v3. Two changes:
1. `Asset` gains `annualRatePercent: number` (default `0`, range `[0, 100]`).
2. `IncomeStream` gains optional `isPrima?: boolean` flag (idempotency marker for prima de servicios upsert).

The schema version constant in `AppStateSchemaV3` bumps from `2` to `3`. The localStorage key (`finance_app_data`) is unchanged; the backup key `finance_app_data_v2_backup` is written once on first v2→v3 migration.

---

## Entity Changes

### Asset (modified)

```ts
// BEFORE (v2)
interface Asset {
  id: string           // UUID
  name: string         // 1–60 chars
  value: number        // ≥ 0, finite
  type: 'savings' | 'investment' | 'property' | 'vehicle' | 'other'
}

// AFTER (v3)
interface Asset {
  id: string
  name: string
  value: number
  type: 'savings' | 'investment' | 'property' | 'vehicle' | 'other'
  annualRatePercent: number    // [NEW] 0–100, default 0; only meaningful when type ∈ {savings, investment}
}
```

**Zod schema** (in `src/lib/storage/schema.ts`):

```ts
export const AssetSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(60),
  value: z.number().nonnegative().finite(),
  type: z.enum(['savings', 'investment', 'property', 'vehicle', 'other']),
  annualRatePercent: z.number().min(0).max(100).default(0),
})
```

**Validation rules:**
- `annualRatePercent ∈ [0, 100]`. Negative rates rejected. Values > 100 rejected (sanity bound — Colombia's bank CDT max ~15% EA).
- The UI hides the rate input for `type ∈ {property, vehicle, other}` but stores `0` for those rows.
- `useSavingsProjection` filters `assets.filter(a => a.annualRatePercent > 0 && (a.type === 'savings' || a.type === 'investment'))` for the compound curve.

### IncomeStream (modified)

```ts
// BEFORE (v2)
interface IncomeStream {
  id: string                                                    // UUID
  label: string                                                 // 1–60 chars
  amount: number                                                // ≥ 0
  frequency: 'monthly' | 'quarterly' | 'semiannual' | 'annual'
}

// AFTER (v3)
interface IncomeStream {
  id: string
  label: string
  amount: number
  frequency: 'monthly' | 'quarterly' | 'semiannual' | 'annual'
  isPrima?: boolean    // [NEW] true ⇔ this stream is the auto-managed prima de servicios
}
```

**Zod schema:**

```ts
export const IncomeStreamSchema = z.object({
  id: z.string(),                              // not .uuid() — see constitution exception
  label: z.string().min(1).max(60),
  amount: z.number().nonnegative().finite(),
  frequency: z.enum(['monthly', 'quarterly', 'semiannual', 'annual']),
  isPrima: z.boolean().optional(),
})
```

**Constitution exception:** the `id` field on `IncomeStream` is no longer a strict UUID — when `isPrima === true`, the id MUST be the reserved string `__prima__`. This guarantees `addPrimaPreset()` is idempotent (single source of truth per ADR-6). All other streams continue to use `crypto.randomUUID()`.

**Validation rules added to `incomeStore.addStream`:**
- If `input.id === '__prima__'` and `!input.isPrima` → reject (reserved slug).
- If `input.isPrima === true` and `input.id !== '__prima__'` → reject (consistency).
- At most one stream with `isPrima === true` may exist at any time.

---

## Root Schema Bump

```ts
// schemaVersion field in AppStateSchemaV3
export const AppStateSchemaV3 = z.object({
  schemaVersion: z.literal(3),
  settings: SettingsSchema,
  income: z.object({
    grossSalary: z.number().nonnegative().finite(),
    deductions: z.array(DeductionSchema),
    otherStreams: z.array(IncomeStreamSchema),         // ← now includes isPrima
    nonSalaryBenefits: z.array(NonSalaryBenefitSchema),
  }),
  expenses: z.array(FixedExpenseSchema),
  cards: z.array(CardOrLoanSchema),
  goals: z.array(GoalSchema),
  assets: z.array(AssetSchema),                        // ← now includes annualRatePercent
  variableExpenses: z.array(VariableCategorySchema),
  allocation: AllocationSchema,
  snapshots: z.array(SnapshotSchema),
})

export type AppStateV3 = z.infer<typeof AppStateSchemaV3>
```

`AppStateSchemaV2` is kept as a parsing target in `migrate.ts` only — application code consumes `AppStateV3` exclusively.

---

## Migration: v2 → v3

Implemented as `migrations[3]` in `src/lib/storage/migrate.ts`. Idempotent — running twice on v3 data is a no-op.

```ts
// src/lib/storage/migrate.ts
function migrateV2toV3(state: AppStateV2): AppStateV3 {
  return {
    ...state,
    schemaVersion: 3,
    assets: state.assets.map(asset => ({
      ...asset,
      annualRatePercent: typeof asset['annualRatePercent'] === 'number'
        ? Math.min(100, Math.max(0, asset['annualRatePercent']))
        : 0,
    })),
    income: {
      ...state.income,
      otherStreams: state.income.otherStreams.map(stream => {
        const looksLikePrima =
          stream.label === 'Prima de servicios' &&
          stream.frequency === 'semiannual' &&
          Math.abs(stream.amount - state.income.grossSalary / 2) / Math.max(1, state.income.grossSalary / 2) < 0.05

        if (looksLikePrima) {
          return { ...stream, id: '__prima__', isPrima: true }
        }
        return stream
      }),
    },
  }
}

export const migrations: Record<number, (state: unknown) => unknown> = {
  2: migrateV1toV2,
  3: migrateV2toV3,
}
```

### Backup safety

Before applying `migrations[3]`, `useAppStorage.loadAppState` writes the original v2 payload to `finance_app_data_v2_backup` (best-effort; silent on quota error). This mirrors the existing v1 backup pattern.

```ts
function backupV2Once(rawV2: string, storage: Storage): void {
  try {
    if (!storage.getItem('finance_app_data_v2_backup')) {
      storage.setItem('finance_app_data_v2_backup', rawV2)
    }
  } catch {
    // best-effort — quota errors here MUST NOT block migration
  }
}
```

---

## AC Coverage Matrix (data-model only)

| AC | Field / Behavior | Where |
|---|---|---|
| AC-7.1 | `isPrima === true`, `id === '__prima__'` created on first press | `incomeStore.addPrimaPreset` |
| AC-7.2 | Same `__prima__` id → upsert (no duplicate) | `incomeStore.addPrimaPreset` |
| AC-7.3 | Editing `__prima__` stream persists; deleting removes it | `incomeStore.update` / `removeStream` |
| AC-8.2 | `Asset.annualRatePercent` available for compound math | `AssetSchema` + form |
| AC-8.5 | If no asset has `annualRatePercent > 0` → show "configure rate" message | `useSavingsProjection` filter |
| AC-8.6 | Compound chart uses `annualRatePercent` per asset | `calcCompoundGrowth` consumes the field |

---

## Quality Gates

- [ ] `AssetSchema` Zod test: rejects negative rate, rejects rate > 100, applies default 0 on missing field
- [ ] `IncomeStreamSchema` Zod test: rejects `id === '__prima__'` without `isPrima: true`, rejects `isPrima: true` with different id
- [ ] `incomeStore` test: cannot create two streams with `isPrima: true`
- [ ] `migrateV2toV3` test: malformed asset values clamp to 0; idempotent on v3 input
- [ ] `migrateV2toV3` test: legacy "Prima de servicios" stream is auto-tagged with `isPrima: true` and re-ided
- [ ] `loadAppState` test: writes `finance_app_data_v2_backup` on first v2→v3 migration
- [ ] All schema tests live in `tests/unit/storage/schema.test.ts` and `tests/unit/storage/migrate.test.ts`
