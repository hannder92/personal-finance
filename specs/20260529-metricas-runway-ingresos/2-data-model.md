# Data Model: Métricas verificadas — runway, ingresos y cobertura

> Plan: [2-plan.md](./2-plan.md) · Schema bump: **v3 → v4**

## Schema version

| Version               | Changes                                                            |
| --------------------- | ------------------------------------------------------------------ |
| v3 (current)          | `Asset.annualRatePercent`, streams sin clase                       |
| **v4 (this feature)** | `IncomeStream.incomeClass`, `Settings.projectionAnnualRatePercent` |

## Settings

```typescript
interface Settings {
  lang: 'es' | 'en'
  currency: CurrencyCode
  theme: 'light' | 'dark' | 'system'
  payoffMethod: 'avalanche' | 'snowball'
  lastMonthSeen: string | null
  onboarding: { done: boolean; currentStep: number }
  /** TEA % for dashboard compound projection (OQ-3). Range [0, 100]. */
  projectionAnnualRatePercent: number // NEW, default 0
}
```

Zod: `projectionAnnualRatePercent: Percent01.default(0)`

Store action: `setProjectionAnnualRatePercent(rate: number)` — silent reject if out of range.

## IncomeStream

```typescript
type IncomeClass = 'linear' | 'residual' | 'passive'

interface IncomeStream {
  id: string
  label: string
  amount: number
  frequency: 'monthly' | 'quarterly' | 'semiannual' | 'annual'
  isPrima?: boolean
  incomeClass: IncomeClass // NEW, default 'linear'
}
```

Zod: `incomeClass: z.enum(['linear', 'residual', 'passive']).default('linear')`

**Salario (`grossSalary` + deductions):** no field — always treated as `linear` net in `calcIncomeMixByClass`.

## Migration v3 → v4

```text
migrations[4]: (state: AppStateV3) => AppStateV4
  - settings.projectionAnnualRatePercent ← 0 if missing
  - for each income.otherStreams[]: incomeClass ← 'linear' if missing
  - schemaVersion ← 4
```

No destructive changes. Rollback = revert code; v4 fields ignored if loader expects v3 only (user should export JSON first).

## Asset types (alignment)

Schema already allows `cash`. **Task:** add `'cash'` to `assetsStore` `ALLOWED_TYPES` so UI and liquid sum stay consistent with Zod.

## Liquid asset definition (domain, not persisted)

```typescript
const LIQUID_ASSET_TYPES = ['cash', 'savings', 'investment'] as const
// property | vehicle | other → excluded from runway, FIRE liquid, compound base
```

## Computed fields (not persisted)

| Field             | Formula                                                                                     | Used in                |
| ----------------- | ------------------------------------------------------------------------------------------- | ---------------------- |
| `runwayMonths`    | `liquid / livingExpense`                                                                    | RunwayCard             |
| `coveragePercent` | `(passive+residual)/living * 100`                                                           | PassiveCoverageCompact |
| `compoundSeries`  | `calcCompoundGrowth([{ balance: liquid, rate: settings.projectionAnnualRatePercent }], 12)` | SavingsProjectionChart |

## i18n keys (planned)

| Key                                                                                      | Purpose        |
| ---------------------------------------------------------------------------------------- | -------------- |
| `runway.title`, `runway.months`, `runway.unavailable.*`                                  | AC-1.1, AC-1.4 |
| `flowCoverage.title`, `flowCoverage.percent`, `flowCoverage.gap`, `flowCoverage.covered` | AC-4.x         |
| `income.class.linear`, `.residual`, `.passive`, `income.mix.title`                       | AC-3.x         |
| `savings.projection.rateLabel`, `rateHint`, `hintNeedRate`, `hintNeedAssets`             | AC-6.x         |
| `common.delete`, `debts.deleteConfirm`                                                   | AC-5.x         |
| `dashboard.health.breakdown.emergencyHint`                                               | AC-2.3         |
