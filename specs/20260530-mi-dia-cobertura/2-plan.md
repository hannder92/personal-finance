# Technical Plan: Mi Día — cobertura y vencimientos

> Spec: [1-spec.md](./1-spec.md) · Discovery: [0-discovery.md](./0-discovery.md) · Mode: `solo`  
> Plan version: **v1** · Created: `2026-06-04`

## Summary

Añadimos el bloque **Mi Día** en `DashboardView` **encima** de `DashboardHero`: cobertura (liquidez vs mínimos que vencen hoy), lista de pagos de hoy y agenda de 3 días. La lógica de calendario y cobertura vive en **`lib/calculations/day-obligations.ts`** (puro, testeable); `useDayOverview` enlaza `cardsStore` + `useLiquidMetrics`. Sin cambio de schema ni nuevas rutas (ADR discovery Option A).

**No schema bump** — solo lectura de `CardDebt.dueDate` (ISO `YYYY-MM-DD`) y patrimonio existente.

## Architecture

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ views/                                                                      │
│  DashboardView [MODIFY]  — inserta <DayOverview /> antes de DashboardHero │
│         │                                                                   │
│         ▼ composables                                                       │
│  useDayOverview [NEW]  — liquid + debts due today + agenda 3d               │
│  useLiquidMetrics [EXIST] — liquidAssets (calcLiquidAssetsTotal)            │
│         │                                                                   │
│         ▼ components/dashboard/day/                                         │
│  DayOverview.vue [NEW]       — layout P0 stack, gap-4/6                     │
│  DayCoverageCard.vue [NEW]   — badge héroe + liquidez secundaria            │
│  DayPaymentsCard.vue [NEW]   — lista hoy + empty + link RouterLink /debts   │
│  DayAgendaCard.vue [NEW]     — 3 filas día → conteo + monto                 │
│         │                                                                   │
│         ▼ lib/calculations (pure)                                           │
│  day-obligations.ts [NEW]    — isDueOnLocalDay, sumDueToday, agenda, status │
│         │                                                                   │
│  cardsStore [READ]           — CardDebt.dueDate, minPayment                   │
│  assetsStore [READ via composable]                                          │
│  i18n es.json + en.json [MODIFY] — keys day.*                               │
│  DueDateAlerts.vue [OPTIONAL REFACTOR] — consumir lib (7d window en Deudas) │
└────────────────────────────────────────────────────────────────────────────┘
```

### Components

| Component                | Responsibility                                                                                                                           | Layer                      | Covers                                          |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ----------------------------------------------- |
| `day-obligations.ts`     | Comparar fechas en día local; listar deudas que vencen en D; sumar `minPayment`; estado `covered \| shortfall \| no_due`; agenda 3 filas | `lib/calculations`         | AC-1.1–AC-1.3, AC-2.1, AC-3.1–AC-3.2, EC-1–EC-3 |
| `useDayOverview`         | `today` inyectable (tests); expone `coverage`, `paymentsToday`, `agenda`, `hasLiquid`                                                    | `composables`              | AC-1.x–AC-3.x                                   |
| `useLiquidMetrics`       | `liquidAssets` — misma definición runway                                                                                                 | `composables`              | AC-1.4, AC-1.5, OQ-2                            |
| `DayCoverageCard`        | Badge semántico (emerald/amber/rose), monto shortfall, CTA patrimonio si liquidez 0                                                      | `components/dashboard/day` | AC-1.1–AC-1.5, AC-2.3 (estilo)                  |
| `DayPaymentsCard`        | Lista nombre + `formatCurrency(minPayment)`; empty `day.payments.empty`; `RouterLink` → `/debts`                                         | `components/dashboard/day` | AC-2.1–AC-2.3                                   |
| `DayAgendaCard`          | 3 filas (hoy+1, hoy+2, hoy+3); `day.agenda.none` si 0 pagos                                                                              | `components/dashboard/day` | AC-3.1–AC-3.2                                   |
| `DayOverview`            | Orquesta las 3 cards; `data-testid` opcional por card                                                                                    | `components/dashboard/day` | AC-4.1 (bloque único)                           |
| `DashboardView` [MODIFY] | `<DayOverview />` antes de `<DashboardHero />`                                                                                           | `views`                    | AC-4.1                                          |
| `i18n`                   | Claves `day.coverage.*`, `day.payments.*`, `day.agenda.*`                                                                                | `infra`                    | AC-4.2                                          |

### Moment → component map

| User Moment | UI block                                 | Covers        |
| ----------- | ---------------------------------------- | ------------- |
| UM-1        | `DayCoverageCard`                        | AC-1.1–AC-1.5 |
| UM-2        | `DayPaymentsCard`                        | AC-2.1–AC-2.3 |
| UM-3        | `DayAgendaCard`                          | AC-3.1–AC-3.2 |
| UM-1–3      | `DayOverview` + orden en `DashboardView` | AC-4.1        |

## Existing assets & reuse

| Existing module                              | Reuse / extend / replace | Notes                                                                                        |
| -------------------------------------------- | ------------------------ | -------------------------------------------------------------------------------------------- |
| `useLiquidMetrics` + `calcLiquidAssetsTotal` | **Reuse**                | Liquidez operativa = OQ-2; no duplicar Sets en composable                                    |
| `useCardsStore`                              | **Read**                 | Fuente de `dueDate` + `minPayment`                                                           |
| `DueDateAlerts.vue`                          | **Extend** (post-MVP)    | Hoy filtra 7 días en template; extraer filtros a `day-obligations.ts` y reutilizar en Deudas |
| `formatCurrency` (`lib/currency/format`)     | **Reuse**                | Montos en cards                                                                              |
| `DashboardHero`, KPIs, charts                | **No touch**             | Permanecen debajo del bloque Mi Día                                                          |
| `DebtsView` + ruta `/debts`                  | **Reuse**                | AC-2.2 navegación                                                                            |
| `constitution` Product Principles v5         | **Align**                | Cards cálidas, héroe, colores semánticos                                                     |

**Nota v1 deudas:** Solo `CardDebt` tiene `dueDate`. `LoanDebt` no tiene campo — EC-2 (préstamo con vencimiento hoy) queda **fuera** hasta extender schema; alineado con discovery §7.

**Deuda técnica detectada:** `DebtsView` pasa `:items` a `DueDateAlerts` pero el prop es `cards` — corregir en tarea de refactor opcional (no bloquea Mi Día).

## Security & privacy

| Surface      | Threat / concern               | Mitigation                           | TC ref             |
| ------------ | ------------------------------ | ------------------------------------ | ------------------ |
| Persistencia | Sin cambio de schema           | Solo lectura stores existentes       | TC-U (migrate N/A) |
| XSS / UI     | Render de `debt.name` en lista | Vue escape por defecto; sin `v-html` | TC-C               |
| Tests        | Nombres de deuda en snapshots  | Fixtures genéricos ("Tarjeta A")     | TC-U/C             |
| Logs         | —                              | Sin `console.log` de montos en prod  | constitution       |

No nuevos endpoints ni auth.

## Data Model

Sin cambios en `AppStateSchemaV3`.

| Entidad    | Campo usado                          | Uso                                  |
| ---------- | ------------------------------------ | ------------------------------------ |
| `CardDebt` | `dueDate: string \| null` (ISO date) | Match día local                      |
| `CardDebt` | `minPayment`                         | Monto en cobertura y listas          |
| `Asset`    | `type` ∈ `LIQUID_ASSET_TYPES`        | Liquidez vía `calcLiquidAssetsTotal` |

## Contracts

```typescript
// lib/calculations/day-obligations.ts

export type DayCoverageStatus = 'covered' | 'shortfall' | 'no_due_today' | 'no_liquid'

export interface DebtDueSlice {
  id: string
  name: string
  minPayment: number
  dueDate: string
}

export interface AgendaDayRow {
  /** 0 = today, 1 = tomorrow, 2 = day after */
  offset: 0 | 1 | 2
  labelKey: string // i18n day.agenda.day0 etc. or formatted date in composable
  paymentCount: number
  totalMinPayment: number
}

/** Same local calendar day (device TZ), dueDate as YYYY-MM-DD or parseable ISO */
export function isDueOnLocalDay(dueDate: string, reference: Date): boolean

export function listDebtsDueOnDay(
  debts: ReadonlyArray<{
    id: string
    name: string
    minPayment: number
    dueDate: string | null
    type: string
  }>,
  reference: Date
): DebtDueSlice[]

export function sumMinPaymentsDueToday(
  debts: ReadonlyArray<{ minPayment: number; dueDate: string | null; type: string }>,
  reference: Date
): number

export function calcDayCoverage(params: { liquidTotal: number; dueTodayTotal: number }): {
  status: DayCoverageStatus
  shortfallAmount: number
}

export function buildAgendaThreeDays(
  debts: ReadonlyArray<{ minPayment: number; dueDate: string | null; type: string }>,
  reference: Date
): AgendaDayRow[]
```

```typescript
// composables/useDayOverview.ts (sketch)
export function useDayOverview(options?: { today?: Date }): {
  coverage: ComputedRef<
    ReturnType<typeof calcDayCoverage> & { dueTodayTotal: number; liquidTotal: number }
  >
  paymentsToday: ComputedRef<DebtDueSlice[]>
  agenda: ComputedRef<AgendaDayRow[]>
}
```

**UI testids (sugeridos):** `data-coverage-status`, `data-payments-today`, `data-agenda-row` — para TC-C y E2E.

## ADRs

### ADR-1: Ubicación del bloque Mi Día

- **Context:** Discovery Option A vs tab `/today`.
- **Options:**
  1. **Option A** — `DayOverview` encima de `DashboardHero` en `/` — mínima superficie, un solo lugar de verdad.
  2. **Option B** — Ruta `/today` + nav — separación operativo/analítico; más descubrimiento.
- **Decision:** Option A (spec + discovery).
- **Consequences:** Dashboard más largo; analítico sigue accesible con scroll. Reversal cost: medium si luego se mueve a tab.
- **Covers:** AC-4.1, non-goals

### ADR-2: Lógica de vencimientos en `lib/` vs solo en composable

- **Context:** `DueDateAlerts` ya filtra 7 días inline; cobertura necesita hoy + 3 días + sumas.
- **Options:**
  1. **`day-obligations.ts`** — funciones puras + tests unitarios RED primero.
  2. **Solo `useDayOverview`** — más rápido, peor trazabilidad y duplicación con Deudas.
- **Decision:** Option 1 (constitution: views no llaman `lib/`; composable sí).
- **Consequences:** Refactor opcional de `DueDateAlerts` después. Reversal cost: low.
- **Covers:** AC-1.x, AC-3.x, EC-1–EC-3

### ADR-3: Tres subcomponentes vs una SFC monolítica

- **Context:** Tres cards con DoD y estilos distintos.
- **Options:**
  1. **Coverage + Payments + Agenda** — testeo aislado, coincide con UI Intent P0/P1.
  2. **Un solo `DayOverview.vue`** — menos archivos, tests más pesados.
- **Decision:** Option 1.
- **Consequences:** Más archivos; mejor paralelismo en tasks. Reversal cost: low.
- **Covers:** AC-2.3, mantenibilidad

## Assumption Register

| ID    | Assumption                                                                            | Impact if wrong             | Verify by                            | Status     |
| ----- | ------------------------------------------------------------------------------------- | --------------------------- | ------------------------------------ | ---------- |
| A-001 | `dueDate` es fecha ISO (`YYYY-MM-DD`) coherente con `<input type="date">`             | Cobertura incorrecta        | Unit `isDueOnLocalDay` + fixture     | unverified |
| A-002 | Monto a cubrir hoy = suma de `minPayment` de tarjetas que vencen hoy (no saldo total) | Badge engañoso              | AC-1.1/1.2 tests + spec EC-3         | unverified |
| A-003 | Comparación de día usa timezone local del dispositivo                                 | Off-by-one a medianoche     | Unit con `reference` fija            | unverified |
| A-004 | Préstamos sin `dueDate` quedan fuera en v1                                            | EC-2 no cumplido para loans | Documentado en plan; test solo cards | unverified |
| A-005 | Sin migración schema — deploy solo frontend                                           | N/A local-first             | `npm test` + manual                  | unverified |

## Dependencies

- Pinia stores hidratados (mismo boot que dashboard actual)
- `vue-i18n`, `vue-router`, Tailwind tokens existentes
- Sin paquetes nuevos

## Rollout / Rollback

- **Feature flag:** No (SPA local-first, cambio UI acotado).
- **Rollout:** Merge → `npm test` → `npm run e2e` (dashboard) → verificar 390×844 manual en verify.
- **Rollback:**
  1. Revert commit que añade `DayOverview` en `DashboardView`.
  2. Eliminar carpeta `components/dashboard/day/` y `day-obligations.ts` si se revierte todo el feature.
  3. Sin migración de datos — estado localStorage intacto.

## Risks

| Risk                                | Impact            | Mitigation                                                   |
| ----------------------------------- | ----------------- | ------------------------------------------------------------ |
| P0 no cabe sin scroll en móvil real | Alto (AC-1.1 RED) | Cards compactas; badge una línea; prueba viewport en TC-C    |
| Duplicar lógica con `DueDateAlerts` | Medio             | ADR-2 centraliza en `lib/`; refactor Deudas en task opcional |
| `dueDate` null en tarjetas legacy   | Bajo              | Tratar como no vence; empty states                           |
| Regresión dashboard tests           | Medio             | T-LAST; no modificar asserts de Hero salvo orden DOM         |

## Sign-off

- [x] Author — Johann Medina — 2026-06-04

## Next

`/sdd-signoff plan` → `/sdt-test-plan`
