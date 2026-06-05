# Test Plan: Mi Día — cobertura y vencimientos

> Spec: [1-spec.md](./1-spec.md) · Plan: [2-plan.md](./2-plan.md) · IDs: [\_ids.yaml](./_ids.yaml)  
> Mode: `solo` · Created: `2026-06-04`

## Pyramid

| Capa      | Objetivo                                                                                    | ~%  |
| --------- | ------------------------------------------------------------------------------------------- | --- |
| Unit      | `day-obligations.ts`, `calcDayCoverage`, agenda, filtros fecha                              | 55% |
| Component | `DayCoverageCard`, `DayPaymentsCard`, `DayAgendaCard`, `DayOverview`, `DashboardView` orden | 35% |
| E2E       | P0 sin scroll 390×844, navegación `/debts`, regresión dashboard                             | 10% |

**Principio:** no mockear `lib/calculations/day-obligations`; `useDayOverview` con `createTestingPinia` y `today` fijo; sin `v-html` en listas (constitution).

## Spec Challenge Log

| AC     | Resultado | Notas                                                                                                                                             |
| ------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-1.1 | OK        | `data-coverage-status="covered"` + texto `day.coverage.ok`; orden DOM antes de hero                                                               |
| AC-1.2 | OK        | `data-shortfall-amount` o texto con $200.000 formateado                                                                                           |
| AC-1.3 | OK        | Spec usa `day.payments.empty` en cobertura sin vencimientos — implementar en `DayCoverageCard` o mensaje unificado visible P0; TC-C verifica copy |
| AC-1.4 | OK        | `data-liquid-secondary` + `day.coverage.context`; badge con clase mayor que liquidez (assert class order)                                         |
| AC-1.5 | OK        | `data-cta-patrimonio` + `RouterLink` a ruta patrimonio                                                                                            |
| AC-2.1 | OK        | `data-payment-item` count = 2                                                                                                                     |
| AC-2.2 | OK        | `data-link-debts` → `/debts`                                                                                                                      |
| AC-2.3 | OK        | `rounded-xl`, `data-section-icon` presente                                                                                                        |
| AC-3.1 | OK        | `data-agenda-row` × 3                                                                                                                             |
| AC-3.2 | OK        | fila con `data-agenda-count="0"` + `day.agenda.none`                                                                                              |
| AC-4.1 | OK        | `data-day-overview` precede `data-dashboard-hero` en DOM                                                                                          |
| AC-4.2 | OK        | `locale en` + sin texto hardcoded español en HTML                                                                                                 |

**SPEC-CHALLENGE:** ninguno.

**SPEC-GAP:**

| Gap                           | Resolución                                                                                      |
| ----------------------------- | ----------------------------------------------------------------------------------------------- |
| EC-2 (préstamo con `dueDate`) | **Diferido v1** — plan A-004; TC-U-014 documenta exclusión de `type: loan`                      |
| AC-1.1 “sin scroll”           | Verificación **componente** (orden + visibilidad badge) + **E2E** viewport 390×844 bounding box |

## Product Challenge Log

| ID   | Challenge                      | Spec answer                                    | Resolved?                   |
| ---- | ------------------------------ | ---------------------------------------------- | --------------------------- |
| PC-1 | ¿Acción clara en 30s?          | Badge cubro/faltan + lista pagos + link deudas | ✅ AC-1.1, AC-2.1, AC-2.2   |
| PC-2 | ¿Retorno diario (habit)?       | Bloque P0 al abrir inicio                      | ✅ AC-4.1, discovery UM-1   |
| PC-3 | ¿Beneficio visible (decision)? | N/A — overview/habit, no simulador             | ✅ N/A                      |
| PC-4 | ¿Empty state con tono?         | `day.payments.empty` aliviado                  | ✅ AC-1.3, AC-3.2           |
| PC-5 | ¿Loop nuevo vs dashboard?      | Cobertura vs pendiente hoy                     | ✅ AC-1.1–AC-1.2, discovery |

## Traceability Matrix

| AC ID        | TC IDs                       | Kind                   | Test file (planned)                                                              |
| ------------ | ---------------------------- | ---------------------- | -------------------------------------------------------------------------------- |
| AC-1.1       | TC-U-011, TC-C-068, TC-E-024 | unit + component + e2e | `day-obligations.test.ts`, `DayCoverageCard.test.ts`, `e2e/day-overview.spec.ts` |
| AC-1.2       | TC-U-011, TC-C-069           | unit + component       | idem                                                                             |
| AC-1.3       | TC-U-011, TC-C-070           | unit + component       | idem                                                                             |
| AC-1.4       | TC-C-071                     | component              | `DayCoverageCard.test.ts`                                                        |
| AC-1.5       | TC-U-011, TC-C-070           | unit + component       | idem                                                                             |
| AC-2.1       | TC-U-012, TC-C-072           | unit + component       | `DayPaymentsCard.test.ts`                                                        |
| AC-2.2       | TC-C-073, TC-E-024           | component + e2e        | `DayPaymentsCard.test.ts`, `e2e/day-overview.spec.ts`                            |
| AC-2.3       | TC-C-072                     | component              | `DayPaymentsCard.test.ts`                                                        |
| AC-3.1       | TC-U-013, TC-C-074           | unit + component       | `DayAgendaCard.test.ts`                                                          |
| AC-3.2       | TC-U-013, TC-C-074           | unit + component       | idem                                                                             |
| AC-4.1       | TC-C-075                     | component              | `DashboardView.test.ts`                                                          |
| AC-4.2       | TC-C-076                     | component              | `DayOverview.test.ts`                                                            |
| EC-1         | TC-U-010                     | unit                   | `day-obligations.test.ts`                                                        |
| EC-3         | TC-U-011                     | unit                   | `day-obligations.test.ts`                                                        |
| A-004        | TC-U-014                     | unit                   | `day-obligations.test.ts`                                                        |
| constitution | TC-C-077                     | component              | `DayPaymentsCard.test.ts` (no v-html)                                            |
| ALL          | TC-I-010                     | integration            | T-LAST: `npm test` + `npm run e2e`                                               |

**Cobertura:** 12/12 AC con ≥1 TC · Edge EC-1, EC-3 cubiertos · EC-2 explícitamente diferido.

## Acceptance Scenarios

### TC-U-010 — Fecha local (EC-1)

```gherkin
Given dueDate = "2026-06-04" and reference = 2026-06-04T23:30:00 local
When isDueOnLocalDay executes
Then returns true

Given dueDate = "2026-06-05" and reference = 2026-06-04T10:00:00 local
When isDueOnLocalDay executes
Then returns false
```

### TC-U-011 — Cobertura (AC-1.1, AC-1.2, AC-1.3, AC-1.5, EC-3)

```gherkin
Given liquidTotal = 800_000 and dueTodayTotal = 500_000
When calcDayCoverage executes
Then status = covered and shortfallAmount = 0

Given liquidTotal = 400_000 and dueTodayTotal = 600_000
When calcDayCoverage executes
Then status = shortfall and shortfallAmount = 200_000

Given dueTodayTotal = 0
When calcDayCoverage executes
Then status = no_due_today

Given liquidTotal = 500_000 and dueTodayTotal = 500_000
When calcDayCoverage executes
Then status = covered  # EC-3 exact equality
```

### TC-U-012 — Pagos hoy (AC-2.1)

```gherkin
Given card A due today min 200_000, card B due today min 150_000, card C due tomorrow min 99_000
When listDebtsDueOnDay(reference = today) executes
Then length = 2 and sum = 350_000
```

### TC-U-013 — Agenda 3 días (AC-3.1, AC-3.2)

```gherkin
Given one card due tomorrow min 100_000, none day+2
When buildAgendaThreeDays executes
Then rows.length = 3
And row[offset=1].paymentCount = 1 and totalMinPayment = 100_000
And row[offset=2].paymentCount = 0
```

### TC-U-014 — Exclusión préstamos (A-004 / EC-2 deferido)

```gherkin
Given loan type with minPayment 50_000 (no dueDate field)
When listDebtsDueOnDay executes
Then loan not included
```

### TC-I-010 — useDayOverview (AC-1.x, AC-3.x)

```gherkin
Given Pinia with cards due today and assets cash 800_000
When useDayOverview({ today: fixed }) mounts
Then coverage.status = covered and paymentsToday.length >= 1
```

### TC-C-068 — Badge cubierto P0 (AC-1.1)

```gherkin
Given stores: due today 500k, liquid 800k
When DayCoverageCard renders at 390×844 wrapper
Then [data-coverage-status="covered"] visible
And text matches i18n day.coverage.ok
```

### TC-C-069 — Shortfall (AC-1.2)

```gherkin
Given due 600k liquid 400k
When DayCoverageCard renders
Then [data-coverage-status="shortfall"] contains formatted 200_000 gap
```

### TC-C-070 — Sin vencimientos / sin liquidez (AC-1.3, AC-1.5)

```gherkin
Given no debts due today
When DayCoverageCard renders
Then relieved copy (day.payments.empty or day.coverage.noDue) without shortfall badge

Given liquid 0 and due today > 0
When DayCoverageCard renders
Then [data-cta-patrimonio] links to assets route
And no [data-coverage-status="covered"]
```

### TC-C-071 — Liquidez secundaria (AC-1.4)

```gherkin
Given liquid 1_000_000
When DayCoverageCard renders
Then [data-liquid-secondary] shows formatted amount
And context line day.coverage.context present
```

### TC-C-072 — Pagos hoy lista y estilo (AC-2.1, AC-2.3)

```gherkin
Given two cards due today
When DayPaymentsCard renders mobile
Then 2× [data-payment-item] with names and amounts
And root has rounded-xl and [data-section-icon]
```

### TC-C-073 — Ver deudas (AC-2.2)

```gherkin
Given payments today non-empty
When user clicks [data-link-debts]
Then router resolves to /debts
```

### TC-C-074 — Agenda (AC-3.1, AC-3.2)

```gherkin
Given agenda fixture
When DayAgendaCard renders
Then 3× [data-agenda-row]
And zero-count row shows day.agenda.none
```

### TC-C-075 — Orden dashboard (AC-4.1)

```gherkin
Given DashboardView with income configured
When rendered
Then [data-day-overview] appears before [data-dashboard-hero]
```

### TC-C-076 — i18n inglés (AC-4.2)

```gherkin
Given locale = en
When DayOverview renders
Then visible strings match en.json keys (no raw Spanish in template text)
```

### TC-C-077 — Constitution XSS (security)

```gherkin
Given debt name "<img onerror=alert(1)>"
When DayPaymentsCard renders
Then output is escaped text, no img node
And template does not use v-html
```

### TC-E-024 — E2E Mi Día P0 (AC-1.1, AC-2.2, regresión)

```gherkin
Given seeded state: card due today, liquid assets
When user opens "/" at 390×844
Then coverage badge visible without scrolling to charts
And optional: click ver deudas → URL /debts
And DashboardHero still visible below fold after minimal scroll
```

## Mocking Strategy

| Dependency                | Real or Mock                    | Why                                    |
| ------------------------- | ------------------------------- | -------------------------------------- |
| `day-obligations`         | **Real**                        | Financial logic — constitution 80% lib |
| Pinia stores              | **Real** (`createTestingPinia`) | AC need store wiring                   |
| `today` Date              | **Injected** fixed              | Deterministic calendar                 |
| Vue Router                | **Real** memory history         | AC-2.2 navigation                      |
| Chart.js / Hero internals | **Stub** if needed              | Isolate DayOverview tests              |

## Performance

- O(n) sobre `cards.state.items` — sin preocupación v1 (<100 deudas).
- Sin benchmark obligatorio; T-LAST `npm test` < baseline existente.

## Security

| Check                     | TC                | Criterio             |
| ------------------------- | ----------------- | -------------------- |
| Sin `v-html` en cards día | TC-C-077          | grep + render escape |
| Sin log de montos         | Manual review     | constitution         |
| Sin cambio schema         | TC-U-014 + review | no `migrate` task    |
| Fixtures sin PII real     | All tests         | nombres "Tarjeta A"  |

## Sign-off

- [x] Author — Johann Medina — 2026-06-04

## Next

`/sdd-signoff test_plan` → `/sdd-tasks`
