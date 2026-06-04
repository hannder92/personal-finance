# Technical Plan: Métricas verificadas — runway, ingresos y cobertura

> Spec: [1-spec.md](./1-spec.md) · Data model: [2-data-model.md](./2-data-model.md) · Mode: `solo`  
> Plan version: **v1** · Created: `2026-05-29`

## Summary

Introducimos **runway** (líquido ÷ gasto de vida), **patrimonio líquido unificado**, **mix de ingresos** (lineal / residual / pasivo), **cobertura por flujo** (IP+IR vs gastos), mejoras de **UX en deudas** (eliminar con icono dentro de la card) y **TEA configurable** en el gráfico compuesto del inicio. El núcleo es dominio puro nuevo + composables que centralizan definiciones hoy duplicadas (`useFinancialFreedom` vs `useHealthScore` vs `useSavingsProjection`).

**Dependencia de merge:** `20260529-planificacion-financiera-integrada` (FIRE, proyección, deudas) sobre `20260515-fix-calculos-financieros`.

**Schema bump:** v3 → v4 (`incomeClass` en streams, `projectionAnnualRatePercent` en settings). Ver [2-data-model.md](./2-data-model.md).

## Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ views/                                                                       │
│  DashboardView [MODIFY]        IncomeView [MODIFY]                           │
│  FinancialFreedomView [MODIFY]   DebtsView [MODIFY]                            │
│         │                                                                    │
│         ▼ composables (views never import lib/calculations directly)         │
│  useLiquidMetrics [NEW]        useFinancialRunway [NEW]                      │
│  useIncomeMix [NEW]            usePassiveCoverage [NEW]                        │
│  useFinancialFreedom [MODIFY]  useSavingsProjection [MODIFY]                 │
│  useHealthScore [MODIFY: labels only]                                        │
│         │                                                                    │
│         ▼ components/                                                        │
│  dashboard/RunwayCard [NEW]           dashboard/PassiveCoverageCompact [NEW] │
│  dashboard/SavingsProjectionChart [MODIFY: TEA input + hints]              │
│  dashboard/HealthScore [MODIFY: emergency label distinct]                    │
│  fi/FlowCoverageBlock [NEW]           income/IncomeClassSelect [NEW]         │
│  debts/CardCard [MODIFY: delete icon in header]                              │
│  common/IconButton [NEW]                                                     │
│         │                                                                    │
│         ▼ lib/calculations (pure)                                            │
│  liquid-metrics.ts [NEW]          financial-runway.ts [NEW]                  │
│  passive-coverage.ts [NEW]        income-mix.ts [NEW]                        │
│  financial-freedom.ts [EXIST]     savings-projection.ts [EXIST]              │
│  frequency.ts [EXIST]             calcMonthlyEquivalent                      │
│         │                                                                    │
│  cross: schema v4 + migrate [MODIFY]  i18n es/en [MODIFY]                    │
│         settingsStore [MODIFY]        incomeStore [MODIFY]                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Components

| Component                         | Responsibility                                                                                          | Layer                  | Covers                                 |
| --------------------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------- | -------------------------------------- |
| `liquid-metrics.ts`               | `LIQUID_ASSET_TYPES`, `calcLiquidAssetsTotal(assets)`, `calcMonthlyLivingExpense(fixed, variableSpent)` | `lib/calculations`     | AC-1.2, AC-1.3, AC-2.1, AC-2.2, AC-6.6 |
| `financial-runway.ts`             | `calcFinancialRunway({ liquid, livingExpense }) → months \| null \| 'indefinite'`                       | `lib/calculations`     | AC-1.1–AC-1.4                          |
| `passive-coverage.ts`             | `calcPassiveCoverage({ passive, residual, living }) → percent, gap, covered`                            | `lib/calculations`     | AC-4.1–AC-4.3                          |
| `income-mix.ts`                   | `calcIncomeMixByClass(streams, salaryNet) → { linear, residual, passive }` monthly                      | `lib/calculations`     | AC-3.1, AC-3.3, AC-4.1                 |
| `useLiquidMetrics`                | Bridge assets + expenses + variable → liquid + living expense                                           | `composables`          | AC-1.x, AC-2.x, AC-6.6                 |
| `useFinancialRunway`              | Bridge → `calcFinancialRunway`                                                                          | `composables`          | AC-1.1–AC-1.4                          |
| `useIncomeMix`                    | Bridge income store + net salary → mix by class                                                         | `composables`          | AC-3.1–AC-3.4, AC-4.1                  |
| `usePassiveCoverage`              | Bridge mix + living → coverage metrics                                                                  | `composables`          | AC-4.1–AC-4.4                          |
| `useFinancialFreedom` [MODIFY]    | Consume `useLiquidMetrics` instead of local Sets                                                        | `composables`          | AC-2.1, AC-2.2                         |
| `useSavingsProjection` [MODIFY]   | Compound from `liquidTotal` + `settings.projectionAnnualRatePercent`; chart rate wins (OQ-3)            | `composables`          | AC-6.3–AC-6.6                          |
| `RunwayCard`                      | KPI meses de autonomía en dashboard                                                                     | `components/dashboard` | AC-1.1–AC-1.4                          |
| `PassiveCoverageCompact`          | % cobertura + brecha en dashboard o FI compact                                                          | `components/dashboard` | AC-4.1–AC-4.4                          |
| `FlowCoverageBlock`               | Detalle cobertura en `/financial-freedom`                                                               | `components/fi`        | AC-4.1–AC-4.4                          |
| `IncomeClassSelect`               | Select lineal / residual / pasivo en stream form                                                        | `components/income`    | AC-3.2, AC-3.4                         |
| `IncomeView` [MODIFY]             | Totales por clase + selector en streams; salario etiquetado lineal                                      | `views`                | AC-3.1–AC-3.3                          |
| `HealthScore` [MODIFY]            | i18n `dashboard.health.breakdown.emergency` ≠ `runway.label`                                            | `components/dashboard` | AC-2.3                                 |
| `IconButton`                      | Botón icono accesible (Trash2, etc.) reutilizable                                                       | `components/common`    | AC-5.1, AC-5.4                         |
| `CardCard` [MODIFY]               | Header con icono eliminar + emit `delete`; ancho 100%                                                   | `components/debts`     | AC-5.1, AC-5.2, AC-5.4                 |
| `DebtsView` [MODIFY]              | Sin botón externo; `@delete` → ConfirmDialog existente                                                  | `views`                | AC-5.2, AC-5.3                         |
| `SavingsProjectionChart` [MODIFY] | Input TEA % → `settingsStore.setProjectionAnnualRatePercent`; hints AC-6.5                              | `components/dashboard` | AC-6.1–AC-6.5                          |
| `settingsStore` [MODIFY]          | Campo + action `projectionAnnualRatePercent`                                                            | `stores`               | AC-6.2                                 |
| `incomeStore` [MODIFY]            | `incomeClass` en add/update stream                                                                      | `stores`               | AC-3.2, AC-3.4                         |
| `schema` + `migrate` v3→v4        | Persist new fields                                                                                      | `lib/storage`          | AC-3.4, AC-6.2                         |

## Data Model

Ver [2-data-model.md](./2-data-model.md). Resumen:

| Cambio         | Campo                                                | Default    |
| -------------- | ---------------------------------------------------- | ---------- |
| `IncomeStream` | `incomeClass: 'linear' \| 'residual' \| 'passive'`   | `'linear'` |
| `Settings`     | `projectionAnnualRatePercent: number [0,100]`        | `0`        |
| `assetsStore`  | Alinear `ALLOWED_TYPES` con schema (`cash` incluido) | —          |

Salario: **no** persiste clase; siempre lineal en UI y en `calcIncomeMixByClass` (AC-3.1).

## Contracts

```typescript
// lib/calculations/liquid-metrics.ts
export const LIQUID_ASSET_TYPES = ['cash', 'savings', 'investment'] as const

export function calcLiquidAssetsTotal(
  assets: ReadonlyArray<{ type: string; value: number }>
): number

export function calcMonthlyLivingExpense(fixedTotal: number, variableSpentTotal: number): number

// lib/calculations/financial-runway.ts
export type RunwayResult =
  | { kind: 'months'; value: number }
  | { kind: 'unavailable'; reason: 'no_liquid' | 'no_expense' }

export function calcFinancialRunway(inputs: {
  liquidAssets: number
  monthlyLivingExpense: number
}): RunwayResult

// lib/calculations/passive-coverage.ts
export interface PassiveCoverageResult {
  coveragePercent: number
  monthlyGap: number
  isFullyCovered: boolean
}

export function calcPassiveCoverage(inputs: {
  monthlyPassive: number
  monthlyResidual: number
  monthlyLivingExpense: number
}): PassiveCoverageResult

// lib/calculations/income-mix.ts
export type IncomeClass = 'linear' | 'residual' | 'passive'

export interface IncomeMixResult {
  linear: number
  residual: number
  passive: number
}

export function calcIncomeMixByClass(inputs: {
  salaryNetMonthly: number
  streams: ReadonlyArray<{
    amount: number
    frequency: Frequency
    incomeClass: IncomeClass
  }>
}): IncomeMixResult
```

## ADRs

### ADR-1: Módulo compartido `liquid-metrics.ts` para líquido y gasto de vida

- **Context:** Tres composables usan definiciones distintas de líquido (AC-2.2, AC-2.3).
- **Options:**
  1. **`liquid-metrics.ts` + `useLiquidMetrics`** — pros: una fuente, tests unitarios; cons: refactor de composables existentes.
  2. **Duplicar Set en cada composable** — pros: diff mínimo; cons: reproduce el bug actual.
  3. **Extender solo `useFinancialFreedom` y reexportar** — pros: un import; cons: acopla FIRE con proyección y health.
- **Decision:** Option 1.
- **Consequences:** `useHealthScore` mantiene fórmula emergencia (fijos+deuda, cash+savings) pero **etiquetas** distintas; no unifica numerador con runway.
- **Covers:** AC-1.2, AC-1.3, AC-2.1, AC-2.2, AC-6.6

### ADR-2: TEA del gráfico en `settingsStore.projectionAnnualRatePercent`

- **Context:** AC-6.1–AC-6.2 exigen persistencia; OQ-3: tasa del gráfico gana sobre tasas por activo.
- **Options:**
  1. **Campo en `settings`** — pros: coherente con `payoffMethod`; persiste en snapshot; cons: schema v4.
  2. **Campo en `allocationStore`** — pros: cerca del % ahorro; cons: mezcla norma presupuesto con hipótesis de mercado.
  3. **Solo UI local (ref)** — pros: sin migración; cons: falla AC-6.2.
- **Decision:** Option 1.
- **Consequences:** `useSavingsProjection` usa `calcCompoundGrowth([{ balance: liquidTotal, annualRatePercent: settingsRate }])` cuando `settingsRate > 0`; ignora `asset.annualRatePercent` en dashboard.
- **Covers:** AC-6.1–AC-6.6, EC-7

### ADR-3: `incomeClass` en `IncomeStream` (schema v4)

- **Context:** AC-3.2–AC-3.4 requieren persistencia por stream.
- **Options:**
  1. **Campo en `IncomeStreamSchema`** — pros: colocated; migrate default `linear`; cons: schema bump.
  2. **Mapa paralelo `incomeClasses: Record<id, class>`** — pros: no toca stream shape; cons: sync drift, peor DX.
  3. **Inferir clase por etiqueta** — pros: cero UI; cons: frágil, no cumple spec.
- **Decision:** Option 1.
- **Consequences:** `migrateV3toV4` asigna `linear` a streams existentes; salario sigue implícito lineal.
- **Covers:** AC-3.2, AC-3.4

### ADR-4: `IconButton` + eliminar dentro de `CardCard`

- **Context:** AC-5.1–AC-5.2; `lucide-vue-next` ya en stack (constitution v4).
- **Options:**
  1. **`IconButton.vue` + emit desde `CardCard`** — pros: reutilizable (metas, gastos futuro); cons: un componente más.
  2. **Lucide inline solo en CardCard** — pros: menos archivos; cons: duplica estilos de botón fantasma.
  3. **Mantener botón texto fuera** — pros: ninguno; cons: falla spec.
- **Decision:** Option 1.
- **Consequences:** `DebtsView` elimina wrapper `flex` con botón externo; confirmación sigue en vista (AC-5.3).
- **Covers:** AC-5.1–AC-5.4

### ADR-5: Ubicación runway + cobertura en UI

- **Context:** AC-1.1 (runway en resumen), AC-4.1 (cobertura visible).
- **Options:**
  1. **`RunwayCard` + `PassiveCoverageCompact` en dashboard; detalle cobertura en `FinancialFreedomView`** — pros: alinea con FIRE existente; cons: más bloques verticales.
  2. **Solo en `/financial-freedom`** — pros: dashboard limpio; cons: falla AC-1.1.
  3. **Fusionar runway en `FinancialFreedomCompact`** — pros: una card; cons: mezcla meses con % cobertura (AC-4.4).
- **Decision:** Option 1 — runway card separada; cobertura compacta bajo bloque FI o adyacente con etiquetas distintas.
- **Consequences:** i18n `runway.*`, `flowCoverage.*` separados de `fi.*`.
- **Covers:** AC-1.1, AC-4.1, AC-4.4

## Assumption Register

| ID    | Assumption                                                        | Impact if wrong                                        | Verify by                              | Status     |
| ----- | ----------------------------------------------------------------- | ------------------------------------------------------ | -------------------------------------- | ---------- |
| A-001 | Rama base incluye `planificacion-financiera-integrada` mergeada   | H — faltan FIRE, SavingsProjectionChart                | git merge / smoke `/financial-freedom` | unverified |
| A-002 | Líquido = `cash` + `savings` + `investment` (OQ-1)                | M — runway/FIRE incoherentes                           | TC unit `liquid-metrics`               | unverified |
| A-003 | Gasto de vida = fijos + variables mes corriente (OQ-2)            | M — runway distinto al esperado                        | TC `calcFinancialRunway` + composable  | unverified |
| A-004 | Salario neto mensual entra 100% como ingreso lineal               | L — mix incorrecto si usuario espera clasificar nómina | AC-3.1 UI copy                         | unverified |
| A-005 | Streams con `incomeClass` ausente post-migrate → `linear`         | M — cobertura pasiva inflada                           | migrate test + AC-3.4                  | unverified |
| A-006 | Health score emergencia sigue usando cash+savings ÷ (fijos+deuda) | L — solo etiqueta cambia (AC-2.3)                      | component test HealthScore             | unverified |
| A-007 | No se añaden dependencias npm nuevas; lucide-vue-next suficiente  | L — IconButton sin nueva lib                           | package.json unchanged                 | unverified |

## Dependencies

| Dependency                                    | Reason                                                    |
| --------------------------------------------- | --------------------------------------------------------- |
| `20260529-planificacion-financiera-integrada` | FIRE, SavingsProjectionChart, DebtsView, ConfirmDialog    |
| `20260515-fix-calculos-financieros`           | `calcCompoundGrowth`, `calcMonthlyEquivalent`, net income |
| `lucide-vue-next` (existente)                 | Iconos Trash2 en deudas                                   |

## Rollout / Rollback

- **Feature flag:** none (local-first).
- **Rollout:** merge branch → `migrate()` v3→v4 en primer load; nuevos campos con defaults.
- **Rollback:** revert branch; v4 data ignored if downgraded (Zod parse fails → user may need export/import); documentar export antes de rollback en producción personal.

## Risks

| Risk                                           | Impact | Mitigation                                  |
| ---------------------------------------------- | ------ | ------------------------------------------- |
| Dashboard más largo (Runway + cobertura + FI)  | M      | Orden: hero → brecha → runway → FI → charts |
| Schema v4 rompe load sin migrate               | H      | Test migrate v3 fixture; T-LAST regression  |
| Usuario confunde runway vs emergencia health   | M      | AC-2.3 i18n + tooltip breve                 |
| TEA gráfico vs tasa en patrimonio              | M      | Hint en chart: “solo proyección del inicio” |
| `assetsStore` sin tipo `cash` en ALLOWED_TYPES | M      | Alinear store con schema en mismo PR        |

## AC coverage matrix

| AC            | Primary owner                                                          |
| ------------- | ---------------------------------------------------------------------- |
| AC-1.1–AC-1.4 | `RunwayCard` + `calcFinancialRunway` + `useLiquidMetrics`              |
| AC-2.1–AC-2.2 | `useLiquidMetrics` + `useFinancialFreedom` refactor                    |
| AC-2.3        | `HealthScore` i18n                                                     |
| AC-3.1–AC-3.4 | `IncomeView` + `IncomeClassSelect` + `income-mix.ts` + migrate         |
| AC-4.1–AC-4.3 | `PassiveCoverageCompact` + `FlowCoverageBlock` + `passive-coverage.ts` |
| AC-4.4        | i18n + layout separado FI vs cobertura                                 |
| AC-5.1–AC-5.4 | `IconButton` + `CardCard` + `DebtsView`                                |
| AC-5.3        | `ConfirmDialog` existente                                              |
| AC-6.1–AC-6.6 | `SavingsProjectionChart` + `settingsStore` + `useSavingsProjection`    |

## Sign-off

- [x] Johann Medina — 2026-05-29
