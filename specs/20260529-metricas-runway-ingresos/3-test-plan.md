# Test Plan: Métricas verificadas — runway, ingresos y cobertura

> Spec: [1-spec.md](./1-spec.md) · Plan: [2-plan.md](./2-plan.md) · Data: [2-data-model.md](./2-data-model.md) · IDs: [\_ids.yaml](./_ids.yaml)  
> Mode: `solo` · Created: `2026-05-29`

## Pyramid

| Capa      | Objetivo                                                                                   | ~% esfuerzo |
| --------- | ------------------------------------------------------------------------------------------ | ----------- |
| Unit      | `liquid-metrics`, `financial-runway`, `income-mix`, `passive-coverage`, stores, migrate v4 | 55%         |
| Component | RunwayCard, cobertura, ingresos, deudas+IconButton, SavingsProjectionChart TEA             | 35%         |
| E2E       | Runway en inicio, clase ingreso persiste, eliminar deuda, TEA persiste                     | 10%         |

**Principio:** no mockear `lib/calculations/*`; Pinia real con `createTestingPinia({ stubActions: false })`; Chart.js stub `{ template: '<div />' }` en componentes de gráfico.

## Spec Challenge Log

| AC     | Resultado | Notas                                                                 |
| ------ | --------- | --------------------------------------------------------------------- |
| AC-1.1 | OK        | `data-testid="runway-months"` + etiqueta i18n `runway.title`          |
| AC-1.2 | OK        | Unit 30M/5M → 6; composable incluye variables en living               |
| AC-1.3 | OK        | Unit excluye property/vehicle del numerador                           |
| AC-1.4 | OK        | `data-testid="runway-unavailable"` cuando liquid=0 o living=0         |
| AC-2.1 | OK        | Mismo monto `fi-liquid-assets` compacto vs detalle                    |
| AC-2.2 | OK        | Unit/shared liquid incluye investment                                 |
| AC-2.3 | OK        | Textos i18n distintos emergency vs runway; hint opcional              |
| AC-3.1 | OK        | Badge/copy “Lineal” junto a bloque salario en IncomeView              |
| AC-3.2 | OK        | Select en form stream + persist store reload                          |
| AC-3.3 | OK        | Tres totales `data-testid` income-mix-\*                              |
| AC-3.4 | OK        | migrate + load fixture v3 sin incomeClass                             |
| AC-4.1 | OK        | Unit 30% + componente muestra “30%”                                   |
| AC-4.2 | OK        | ≥100% → `data-covered="true"` o copy “cubierto”                       |
| AC-4.3 | OK        | Brecha 7M visible cuando cobertura <100%                              |
| AC-4.4 | OK        | Claves i18n `flowCoverage.*` ≠ `fi.detail.*` en mismo bloque          |
| AC-5.1 | OK        | `data-testid="debt-delete-btn"` dentro de `[data-testid="debt-card"]` |
| AC-5.2 | OK        | Card width 100%; sin botón hermano externo en DOM                     |
| AC-5.3 | OK        | ConfirmDialog antes de remove en cardsStore                           |
| AC-5.4 | OK        | `aria-label` / `title` desde `common.delete`                          |
| AC-6.1 | OK        | `data-testid="projection-rate-input"` visible en chart block          |
| AC-6.2 | OK        | settingsStore + reload Pinia initialState                             |
| AC-6.3 | OK        | `data-compound-final` mes 12 mayor con TEA 12 vs 0                    |
| AC-6.4 | OK        | `data-series-count="2"` cuando rate>0 y liquid>0                      |
| AC-6.5 | OK        | Hints distintos `hintNeedRate` / `hintNeedAssets`; hipotética sigue   |
| AC-6.6 | OK        | Unit compound base 10M excluye inmueble                               |

**SPEC-CHALLENGE:** ninguno.  
**SPEC-GAP:** ninguno (EC-1…EC-7 cubiertos en TC-U-001, TC-U-004, TC-U-006, TC-U-008, TC-C-066).

## Traceability Matrix

| AC ID  | TC IDs                       | Kind              | Test file / método                                               |
| ------ | ---------------------------- | ----------------- | ---------------------------------------------------------------- |
| AC-1.1 | TC-U-001, TC-C-060           | unit + component  | `financial-runway.test.ts`, `RunwayCard.test.ts`                 |
| AC-1.2 | TC-U-001, TC-U-004           | unit + composable | `financial-runway.test.ts`, `useLiquidMetrics.test.ts`           |
| AC-1.3 | TC-U-001, TC-U-002           | unit              | `liquid-metrics.test.ts`                                         |
| AC-1.4 | TC-U-001, TC-C-060           | unit + component  | idem                                                             |
| AC-2.1 | TC-U-002, TC-C-061           | unit + component  | `useFinancialFreedom.test.ts`, `FinancialFreedomView.test.ts`    |
| AC-2.2 | TC-U-002, TC-U-004           | unit + composable | `liquid-metrics.test.ts`, `useLiquidMetrics.test.ts`             |
| AC-2.3 | TC-C-062                     | component         | `HealthScore.test.ts`                                            |
| AC-3.1 | TC-U-003, TC-C-063           | unit + component  | `income-mix.test.ts`, `IncomeView.test.ts`                       |
| AC-3.2 | TC-U-007, TC-C-063           | unit + component  | `incomeStore.test.ts`, `IncomeView.test.ts`                      |
| AC-3.3 | TC-U-003, TC-C-063           | unit + component  | `income-mix.test.ts`, `IncomeView.test.ts`                       |
| AC-3.4 | TC-U-008, TC-U-007           | unit              | `migrate.test.ts`, `incomeStore.test.ts`                         |
| AC-4.1 | TC-U-005, TC-C-064           | unit + component  | `passive-coverage.test.ts`, `PassiveCoverageCompact.test.ts`     |
| AC-4.2 | TC-U-005, TC-C-064           | unit + component  | idem                                                             |
| AC-4.3 | TC-U-005, TC-C-064           | unit + component  | idem                                                             |
| AC-4.4 | TC-C-064                     | component         | `PassiveCoverageCompact.test.ts`, `FlowCoverageBlock.test.ts`    |
| AC-5.1 | TC-C-065                     | component         | `CardCard.test.ts`, `IconButton.test.ts`                         |
| AC-5.2 | TC-C-065, TC-C-066           | component         | `DebtsView.test.ts`                                              |
| AC-5.3 | TC-C-066                     | component         | `DebtsView.test.ts`                                              |
| AC-5.4 | TC-C-065                     | component         | `IconButton.test.ts`                                             |
| AC-6.1 | TC-C-067                     | component         | `SavingsProjectionChart.test.ts`                                 |
| AC-6.2 | TC-U-006, TC-U-008, TC-E-023 | unit + e2e        | `settingsStore.test.ts`, `e2e/projection-rate.spec.ts`           |
| AC-6.3 | TC-U-009, TC-C-067           | unit + component  | `useSavingsProjection.test.ts`, `SavingsProjectionChart.test.ts` |
| AC-6.4 | TC-C-067                     | component         | `SavingsProjectionChart.test.ts`                                 |
| AC-6.5 | TC-C-067                     | component         | idem                                                             |
| AC-6.6 | TC-U-009, TC-U-002           | unit              | `useSavingsProjection.test.ts`, `liquid-metrics.test.ts`         |
| ALL    | TC-I-003                     | integration       | `npm test` regresión T-LAST feature                              |
| AC-1.1 | TC-E-020                     | e2e               | `e2e/runway-dashboard.spec.ts`                                   |
| AC-3.2 | TC-E-021                     | e2e               | `e2e/income-class.spec.ts`                                       |
| AC-5.3 | TC-E-022                     | e2e               | `e2e/debt-delete-card.spec.ts`                                   |
| AC-6.2 | TC-E-023                     | e2e               | `e2e/projection-rate.spec.ts`                                    |

**Cobertura:** 21/21 AC con ≥1 TC.

## Acceptance Scenarios

### TC-U-001 — Runway dominio (AC-1.1–AC-1.4, EC-1)

```gherkin
Given liquidAssets = 30_000_000 and monthlyLivingExpense = 5_000_000
When calcFinancialRunway executes
Then result.kind = 'months' and result.value = 6

Given liquidAssets = 10_000_000, property 100_000_000 excluded via calcLiquidAssetsTotal
And monthlyLivingExpense = 2_000_000
When calcFinancialRunway executes
Then result.value = 5

Given liquidAssets = 0 OR monthlyLivingExpense = 0
When calcFinancialRunway executes
Then result.kind = 'unavailable'

Given fixed 3_000_000 and variableSpent 2_000_000
When calcMonthlyLivingExpense executes
Then total = 5_000_000
```

### TC-U-002 — Líquido unificado (AC-1.3, AC-2.2, AC-6.6)

```gherkin
Given assets cash 0, savings 0, investment 50_000_000, property 1_000_000
When calcLiquidAssetsTotal executes
Then total = 50_000_000
```

### TC-U-003 — Mix ingresos (AC-3.1, AC-3.3, EC-3)

```gherkin
Given salaryNetMonthly = 8_000_000
And streams: passive monthly 1_000_000, residual semiannual 3_000_000 (500k/mo)
When calcIncomeMixByClass executes
Then linear = 8_000_000, passive = 1_000_000, residual = 500_000

Given salary present
When IncomeView renders salary section
Then label or badge indicates linear class (UI)
```

### TC-U-004 — useLiquidMetrics (AC-1.2, AC-2.2)

```gherkin
Given Pinia: expenses 4M, variable spent 1M, assets investment 50M
When useLiquidMetrics in test harness
Then monthlyLivingExpense = 5_000_000
And liquidAssets = 50_000_000
```

### TC-U-005 — Cobertura pasiva (AC-4.1–AC-4.3, EC-2, EC-4)

```gherkin
Given passive 2M, residual 1M, living 10M
When calcPassiveCoverage executes
Then coveragePercent = 30 and monthlyGap = 7_000_000 and isFullyCovered = false

Given passive+residual = 12M, living 10M
When calcPassiveCoverage executes
Then coveragePercent = 120 and isFullyCovered = true and monthlyGap = 0

Given no passive/residual streams
When calcPassiveCoverage executes
Then coveragePercent = 0 and monthlyGap = living
```

### TC-U-006 — Settings TEA persist (AC-6.2, EC-6)

```gherkin
Given settingsStore projectionAnnualRatePercent unset
When setProjectionAnnualRatePercent(10)
Then state.projectionAnnualRatePercent = 10

When setProjectionAnnualRatePercent(150) or (-1)
Then state unchanged (boundary guard)
```

### TC-U-007 — Income stream class (AC-3.2, AC-3.4)

```gherkin
Given addStream with incomeClass 'passive'
When reload store state
Then stream.incomeClass = 'passive'

Given addStream without incomeClass
Then incomeClass defaults to 'linear'
```

### TC-U-008 — Migrate v3→v4 (AC-3.4, AC-6.2)

```gherkin
Given AppStateV3 fixture without incomeClass and without projectionAnnualRatePercent
When migrate runs
Then schemaVersion = 4
And each otherStream.incomeClass = 'linear'
And settings.projectionAnnualRatePercent = 0
```

### TC-U-009 — useSavingsProjection + settings rate (AC-6.3, AC-6.6, EC-7)

```gherkin
Given liquidTotal = 10_000_000, projectionAnnualRatePercent = 12
When useSavingsProjection compound month 11
Then totalValue > 10_000_000

Given same liquid, projectionAnnualRatePercent = 0
Then compound flat at balance (no growth)

Given assets with annualRatePercent 8 on asset BUT settings projectionAnnualRatePercent = 10
When useSavingsProjection compound
Then uses settings rate 10 (OQ-3), not per-asset 8
```

### TC-C-060 — RunwayCard (AC-1.1, AC-1.4)

```gherkin
Given Pinia liquid 30M, living 5M
When RunwayCard renders
Then data-testid="runway-months" shows "6"
And label matches t('runway.title')

Given liquid 0
Then data-testid="runway-unavailable" visible
```

### TC-C-061 — Líquido FIRE coherente (AC-2.1)

```gherkin
Given same liquid assets in Pinia
When FinancialFreedomCompact and FinancialFreedomView render
Then both show identical formatted liquid amount
```

### TC-C-062 — Health vs runway labels (AC-2.3)

```gherkin
Given HealthScore and RunwayCard on dashboard stub
When reading i18n keys in DOM
Then emergency breakdown label ≠ runway.title
And emergency hint or subtitle present if both show months
```

### TC-C-063 — IncomeView mix (AC-3.1–AC-3.3)

```gherkin
Given streams configured per TC-U-003
When IncomeView renders
Then data-testid income-mix-linear, -passive, -residual show correct totals
And stream form includes IncomeClassSelect with three options
```

### TC-C-064 — Cobertura flujo UI (AC-4.1–AC-4.4)

```gherkin
Given mix and living from TC-U-005 first case
When PassiveCoverageCompact renders
Then coverage shows 30% and gap 7_000_000
And labels use flowCoverage.* not fi.detail.targetPatrimony

Given covered case
Then data-covered="true" or equivalent visible
```

### TC-C-065 — CardCard delete icon (AC-5.1, AC-5.2, AC-5.4)

```gherkin
Given CardCard with showDelete true
When rendered
Then debt-delete-btn inside card article boundary
And no sibling delete button outside card in DebtsView list row

Given IconButton trash
Then accessible name from i18n common.delete
```

### TC-C-066 — DebtsView confirm delete (AC-5.2, AC-5.3, EC-5)

```gherkin
Given two debts in store
When click debt-delete-btn then cancel
Then count unchanged

When click delete then confirm
Then cardsStore.items length decreases by 1
And cards same width (querySelectorAll debt-card same parent width class)
```

### TC-C-067 — SavingsProjectionChart TEA (AC-6.1–AC-6.5)

```gherkin
Given projection-rate-input visible
When user sets value 10
Then settingsStore.projectionAnnualRatePercent = 10
And data-series-count = 2 when liquid > 0

Given rate 0 and liquid > 0
Then hintNeedRate visible, hypothetical chart still data-series-count >= 1

Given rate > 0 and liquid 0
Then hintNeedAssets visible

Given rate > 0 liquid 10M
Then data-compound-final > 10_000_000 at month 12
```

### TC-I-003 — Regresión feature (ALL AC)

```gherkin
Given full test suite after implementation
When npm test && npm run typecheck && npm run build
Then all green; lib/calculations coverage ≥ prior baseline
```

### TC-E-020 — Runway en dashboard (AC-1.1)

```gherkin
Given seed: liquid assets + fixed expenses
When navigate to /
Then runway indicator visible with numeric months
```

### TC-E-021 — Clase ingreso persiste (AC-3.2)

```gherkin
Given add stream class passive on /income
When reload page
Then stream still shows passive selected
```

### TC-E-022 — Eliminar deuda (AC-5.3)

```gherkin
Given debt on /debts
When click in-card delete icon, confirm dialog, confirm
Then debt row removed
```

### TC-E-023 — TEA gráfico persiste (AC-6.2)

```gherkin
Given set projection rate 10 on dashboard
When reload
Then input still shows 10 and compound legend visible if assets exist
```

## Mocking Strategy

| Dependency           | Real or Mock                    | Why                                                 |
| -------------------- | ------------------------------- | --------------------------------------------------- |
| `lib/calculations/*` | **Real**                        | Constitution: financial logic tested for real       |
| Pinia stores         | **Real** (`createTestingPinia`) | AC require store persistence semantics              |
| Chart.js Line        | **Stub**                        | Evita canvas en jsdom; assert via data-\* attrs     |
| vue-router           | **Memory history**              | E2E only; component tests stub RouterLink if needed |
| localStorage         | **Real** in migrate/e2e         | Persist AC-3.2, AC-6.2                              |
| ConfirmDialog        | **Real**                        | AC-5.3 integration with DebtsView                   |

## Performance

No path crítico nuevo beyond O(n) assets/streams. Composables memoized; no perf AC — smoke only via TC-I-003.

## Security

Local-first; no new external APIs. Zod rejects `projectionAnnualRatePercent` >100 and invalid `incomeClass`. No PII in test fixtures.

## Sign-off

- [x] Johann Medina — 2026-05-29
