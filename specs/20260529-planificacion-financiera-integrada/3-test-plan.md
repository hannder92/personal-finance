# Test Plan: Planificación financiera integrada

> Spec: [1-spec.md](./1-spec.md) · Plan: [2-plan.md](./2-plan.md) · IDs: [\_ids.yaml](./_ids.yaml)  
> Mode: `solo` · Created: `2026-05-29`

## Pyramid

| Capa      | Objetivo                                                                                  | ~% esfuerzo |
| --------- | ----------------------------------------------------------------------------------------- | ----------- |
| Unit      | `calcSavingsFeasibility`, `calcFinancialFreedom`, proyección flujo, insights, nav, payoff | 50%         |
| Component | Brecha, allocation, gráficos, deudas, FIRE, metas                                         | 40%         |
| E2E       | Brecha 800K vs 2M, prima en flujo, simulador deuda, enlace FIRE                           | 10%         |

**Principio:** no mockear `lib/calculations/*`; Pinia real con `createTestingPinia({ stubActions: false })` en componentes; router `createMemoryHistory` en tests con `RouterLink`.

## Spec Challenge Log

| AC     | Resultado | Notas                                                                 |
| ------ | --------- | --------------------------------------------------------------------- |
| AC-1.1 | OK        | `data-testid` en tres filas + montos formateados                      |
| AC-1.2 | OK        | `role="alert"` cuando objetivo > factible > 0                         |
| AC-1.3 | OK        | Factible 0 o `data-unavailable` cuando free ≤ 0                       |
| AC-1.4 | OK        | Monto needs = net × % vs bruto × % en AllocationPanel                 |
| AC-1.5 | OK        | Texto insight sin “disponible este mes”                               |
| AC-2.1 | OK        | `data-base` mes 1 en stub ProjectionChart = net − fixed − debt        |
| AC-2.2 | OK        | Reutilizar escenario semestral de `projection.test.ts` vía composable |
| AC-2.3 | OK        | Claves i18n distintas `insight.flow` vs `insight.hypothetical`        |
| AC-3.1 | OK        | Label dataset Chart.js o leyenda visible en DOM                       |
| AC-3.2 | OK        | Segunda serie visible cuando `annualRatePercent > 0`                  |
| AC-3.3 | OK        | `data-testid="savings-no-rate-empty"` ya existe; mantener             |
| AC-4.1 | OK        | Texto fecha en `DebtPayoffSummary`                                    |
| AC-4.2 | OK        | Inputs extra → meses/interest saved numéricos                         |
| AC-4.3 | OK        | settings persist + UI refleja selección                               |
| AC-4.4 | OK        | Orden DOM ids según APR o balance                                     |
| AC-5.1 | OK        | Suma gastos fijos en vista detalle                                    |
| AC-5.2 | OK        | Excluir property/vehicle en total                                     |
| AC-5.3 | OK        | Meta = 25 × monthlyLiving × 12                                        |
| AC-5.4 | OK        | Meses finitos o mensaje si feasible = 0                               |
| AC-5.5 | OK        | Bloque compacto sin fila gasto de vida completa                       |
| AC-5.6 | OK        | `RouterLink` a `/financial-freedom`                                   |
| AC-6.1 | OK        | Alerta con tres cifras: regla, factible, aportes                      |
| AC-6.2 | OK        | Dos referencias visibles en Goals                                     |

**SPEC-CHALLENGE:** ninguno.  
**SPEC-GAP:** ninguno (EC-1…EC-5 cubiertos en unit/component donde aplica).

## Traceability Matrix

| AC ID          | TC IDs             | Kind             | Test file / método                                               |
| -------------- | ------------------ | ---------------- | ---------------------------------------------------------------- |
| AC-1.1         | TC-U-001, TC-C-040 | unit + component | `savings-feasibility.test.ts`, `SavingsGapCard.test.ts`          |
| AC-1.2         | TC-U-001, TC-C-040 | unit + component | idem                                                             |
| AC-1.3         | TC-U-001, TC-C-040 | unit + component | idem                                                             |
| AC-1.4         | TC-C-041           | component        | `AllocationPanel.test.ts`                                        |
| AC-1.5         | TC-U-005, TC-C-042 | unit + component | `useDashboardInsights.test.ts`, `BudgetDonut.test.ts`            |
| AC-2.1         | TC-U-003, TC-C-043 | unit + component | `useCashFlowProjection.test.ts`, `DashboardViewPlanning.test.ts` |
| AC-2.2         | TC-U-003, TC-C-043 | unit + component | idem (+ caso prima semestral)                                    |
| AC-2.3         | TC-U-005, TC-C-044 | unit + component | `useDashboardInsights.test.ts`, `ProjectionChart.test.ts`        |
| AC-3.1         | TC-C-045           | component        | `SavingsProjectionChart.test.ts`                                 |
| AC-3.2         | TC-C-045           | component        | idem                                                             |
| AC-3.3         | TC-C-045           | component        | idem                                                             |
| AC-4.1         | TC-U-007, TC-C-046 | unit + component | `useDebtPayoffPlan.test.ts`, `DebtPayoffSummary.test.ts`         |
| AC-4.2         | TC-U-008, TC-C-047 | unit + component | `amortization.test.ts` (exist.), `DebtPayoffSimulator.test.ts`   |
| AC-4.3         | TC-C-048           | component        | `SettingsPanel.test.ts`                                          |
| AC-4.4         | TC-U-007, TC-C-049 | unit + component | `payoff-strategy.test.ts`, `DebtPriorityList.test.ts`            |
| AC-5.1         | TC-U-002, TC-C-050 | unit + component | `financial-freedom.test.ts`, `FinancialFreedomView.test.ts`      |
| AC-5.2         | TC-U-002, TC-C-050 | unit + component | idem                                                             |
| AC-5.3         | TC-U-002, TC-C-050 | unit + component | idem                                                             |
| AC-5.4         | TC-U-002, TC-C-050 | unit + component | idem                                                             |
| AC-5.5         | TC-C-051           | component        | `FinancialFreedomCompact.test.ts`                                |
| AC-5.6         | TC-U-006, TC-C-051 | unit + component | `nav-config.test.ts`, `FinancialFreedomCompact.test.ts`          |
| AC-6.1         | TC-U-004, TC-C-052 | unit + component | `useSavingsFeasibility.test.ts`, `GoalList.test.ts`              |
| AC-6.2         | TC-U-004, TC-C-052 | unit + component | idem                                                             |
| ALL            | TC-I-002           | integration      | `npm test` regresión completa                                    |
| AC-1.1, AC-1.2 | TC-E-010           | e2e              | `e2e/savings-gap.spec.ts`                                        |
| AC-2.2         | TC-E-011           | e2e              | `e2e/cashflow-projection-prima.spec.ts`                          |
| AC-4.1, AC-4.2 | TC-E-012           | e2e              | `e2e/debt-payoff-plan.spec.ts`                                   |
| AC-5.5, AC-5.6 | TC-E-013           | e2e              | `e2e/financial-freedom-nav.spec.ts`                              |

**Cobertura:** 23/23 AC con ≥1 TC.

## Acceptance Scenarios

### TC-U-001 — Brecha ahorro (AC-1.1, AC-1.2, AC-1.3)

```gherkin
Given ingreso neto 10_000_000, ahorro 20%, gastos fijos 8_000_000, deudas 1_200_000
When calcSavingsFeasibility ejecuta
Then objective = 2_000_000
And feasible = 800_000
And gap = 1_200_000
And isRuleViable = false

Given feasible = 0 porque gastos + deudas >= neto
When calcSavingsFeasibility ejecuta
Then feasible = 0
And gap no implica ahorro mensual positivo automático
```

### TC-U-002 — Libertad financiera (AC-5.1–AC-5.4, EC-5)

```gherkin
Given gastos fijos suman 4_000_000, activos líquidos 50_000_000, feasible 500_000/mes
When calcFinancialFreedom ejecuta
Then monthlyLivingExpense = 4_000_000
And liquidAssets = 50_000_000
And targetPatrimony = 4_000_000 * 12 * 25
And monthsToTarget = ceil((target - liquid) / feasible)

Given liquidAssets >= targetPatrimony
When calcFinancialFreedom ejecuta
Then targetReached = true
And monthsToTarget es null o 0 con mensaje de meta alcanzada
```

### TC-U-003 — Proyección flujo (AC-2.1, AC-2.2)

```gherkin
Given neto mensual 11_132_000, sin streams, fixed 0, debt 0
When useCashFlowProjection mes 1
Then balance mes 1 = 11_132_000

Given neto 10_000_000 y stream semestral 6_000_000 en meses 6 y 12
When useCashFlowProjection produce 12 meses
Then balance mes 6 > balance mes 5
And balance mes 12 > balance mes 11
```

### TC-U-004 — Composable useSavingsFeasibility (AC-6.1, AC-6.2)

```gherkin
Given Pinia con neto y allocation 20%
When useSavingsFeasibility en componente de prueba
Then effectiveGoalCap = min(objective, feasible) disponible para metas
```

### TC-U-005 — Insights separados (AC-1.5, AC-2.3)

```gherkin
Given donutInsight con objetivo 2M
When leo el string en locale es
Then no contiene la frase de flujo de caja acumulado

Given projectionInsight desde cola de calcProjection
When leo el string
Then menciona flujo o acumulado de caja, no "destinas X a ahorros"
```

### TC-U-006 — Ruta FIRE en nav (AC-5.6)

```gherkin
Given nav-config y ROUTE_NAMES
When busco grupo plan
Then existe item financialFreedom con path /financial-freedom
And routeName está en router
```

### TC-U-007 — Orden de deudas (AC-4.4)

```gherkin
Given deudas A apr 30 balance 1M, B apr 15 balance 2M
When sortByAvalanche
Then orden [A, B]
When sortBySnowball
Then orden por balance ascendente
```

### TC-U-008 — Pago extra (AC-4.2)

```gherkin
Given tarjeta balance 2M apr 24 min 100k
When calcExtraPaymentImpact(extra 50_000)
Then monthsSaved > 0
And interestSaved > 0
```

### TC-C-040 — SavingsGapCard (AC-1.1–AC-1.3)

```gherkin
Given Pinia fixture objetivo > factible
When renderizo SavingsGapCard
Then existen data-testid objective, feasible, gap
And role=alert con texto de regla no viable
```

### TC-C-041 — Allocation neto (AC-1.4)

```gherkin
Given bruto 12.1M, deducciones 8%, needs 50%
When renderizo AllocationPanel con netIncome prop
Then monto needs muestra ~5.566.000 no 6.050.000
```

### TC-C-043 — Dashboard flujo (AC-2.1, AC-2.2)

```gherkin
Given stub ProjectionChart con data-base
When DashboardView monta con neto 11.132M y prima semestral
Then data-base mes 1 = 11_132_000 - fixed - debt
And mes 6 > mes 5 en serie acumulada
```

### TC-C-045 — Etiquetas ahorro (AC-3.1–AC-3.3)

```gherkin
Given chart montado con tasa en activo
When leo leyenda
Then una serie dice acumulación sin rendimiento
And otra dice crecimiento patrimonio con tasa
Given sin tasa en activos
Then savings-no-rate-empty visible
```

### TC-C-046 — Fecha libre deudas (AC-4.1)

```gherkin
Given dos deudas en store
When renderizo DebtsView
Then DebtPayoffSummary muestra mes/año estimado
```

### TC-C-047 — Simulador extra (AC-4.2)

```gherkin
Given tarjeta en store
When ingreso 200_000 extra y confirmo
Then UI muestra meses ahorrados e interés ahorrado > 0
```

### TC-C-048 — Estrategia payoff (AC-4.3)

```gherkin
Given settings avalanche
When cambio a snowball en SettingsPanel
Then settingsStore.payoffMethod = snowball tras recarga
```

### TC-C-051 — FIRE compacto + enlace (AC-5.5, AC-5.6)

```gherkin
Given datos FI completos
When renderizo FinancialFreedomCompact en dashboard
Then progress % y meta visibles
And enlace ver detalle apunta a /financial-freedom
```

### TC-C-052 — Metas (AC-6.1, AC-6.2)

```gherkin
Given aportes 3M, objetivo 2M, factible 800k
When renderizo GoalList
Then alerta visible con tres cifras
Given sin exceso
Then cupo regla y tope factible visibles
```

### TC-E-010 — Brecha en UI real (AC-1.1, AC-1.2)

```gherkin
Given fixture: neto 10M, 20% ahorro, gastos 8M, deuda 1.2M
When abro /
Then bloque brecha muestra objetivo 2M y factible 800k
And mensaje de no viable visible
```

### TC-E-011 — Prima en gráfico (AC-2.2)

```gherkin
Given prima semestral en localStorage seed
When abro / y reviso gráfico flujo
Then picos visibles en meses de prima
```

### TC-E-012 — Deudas (AC-4.1, AC-4.2)

```gherkin
Given tarjeta en seed
When voy a /debts
Then veo fecha libre de deudas
When uso simulador con pago extra
Then resultados actualizan
```

### TC-E-013 — Navegación FIRE (AC-5.5, AC-5.6)

```gherkin
Given dashboard con bloque FIRE
When clic ver detalle
Then URL /financial-freedom y gasto de vida visible
```

## Mocking Strategy

| Dependency           | Real o Mock                          | Por qué                                  |
| -------------------- | ------------------------------------ | ---------------------------------------- |
| `lib/calculations/*` | **Real**                             | Fuente de verdad; constitution           |
| Pinia stores         | **Real** (`createTestingPinia`)      | Reactividad y AC de integración store→UI |
| Chart.js             | **Real** en component (canvas jsdom) | Ya usado en BudgetDonut tests            |
| Router               | **Real** `createMemoryHistory`       | Evita cuelgue de `isReady`               |
| localStorage E2E     | **Seed** `addInitScript`             | Patrón `e2e/fixtures.ts`                 |

## Performance

- `calcProjection(12)` y `calcFinancialFreedom`: O(1) — sin umbral de perf.
- Dashboard con 3 bloques nuevos: verificar LCP en manual smoke post-merge (no automatizado v1).

## Security

- Sin datos en servidor; sin superficie nueva de auth.
- Export/import JSON no incluye campos nuevos (solo UI); sin cambio de schema.

## Sign-off

- [x] Johann Medina — 2026-05-29
