# Technical Plan: Dashboard fintech redesign

> Spec: [1-spec.md](./1-spec.md) · Mode: solo

## Architecture

```text
┌─ DashboardView.vue (reorganizada — AC-6.x) ─────────────────────────┐
│ DashboardGreeting ── useGreeting ──────────── settingsStore.userName │
│ DayOverview (sin cambios)                                            │
│ DashboardHero + SpendingPaceBadge ── useSpendingPace ─┐              │
│ NetWorthCards ── useNetWorthSummary ── assets/cards   │              │
│ ┌──────────────┬──────────────────┐                   │              │
│ │ CashFlowChart│ MonthActivityCard│                   │              │
│ │ useMonthlyFlow│ variableExpenses│                   │              │
│ └──────┬───────┴──────────────────┘                   │              │
│ DashboardTier2Toggle + tier-2 (sin cambios)           │              │
└────────┼──────────────────────────────────────────────┼──────────────┘
         │ snapshotsStore (meses cerrados) ◄────────────┘
         ▲
useMonthRollover (boot en App.vue):
  detectMonthRollover → buildSnapshot → snapshots.append
  → variableExpenses.resetAllSpent → settings.setLastMonthSeen
         ▲
lib/ puros: spending-pace.ts · monthly-flow.ts · greeting.ts · snapshot.ts (existente)
```

### Components

| Component                                                                                                                                   | Responsibility                                                                                                      | Layer  | Covers                     |
| ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------ | -------------------------- |
| `lib/greeting.ts` — `greetingKey(hour)`                                                                                                     | Franja horaria → clave i18n (morning/afternoon/evening)                                                             | domain | AC-1.1, AC-1.2             |
| `lib/calculations/spending-pace.ts` — `calcSpendingPace()`                                                                                  | Ritmo: % gasto variable consumido vs % días transcurridos → `ahead \| below \| none`                                | domain | AC-2.1–2.4, EC-5           |
| `lib/calculations/monthly-flow.ts` — `buildMonthlyFlow()`                                                                                   | Snapshots → pares `{month, income, expenses}` (gasto total = fijos+deuda+variable), máx 6, orden cronológico        | domain | AC-4.1, EC-3               |
| `settingsStore` — `userName` + `setUserName()` (guard ≤30)                                                                                  | Nombre opcional persistido                                                                                          | app    | AC-1.3, EC-2               |
| `snapshotsStore` — re-tipado a `Snapshot` del schema (ADR-4)                                                                                | Fuente única de verdad: el store importa el tipo Zod; elimina los `as any` de hidratación/persistencia en `main.ts` | app    | AC-2.1, AC-4.1             |
| `lib/calculations/snapshot.ts` — `buildSnapshot()` + `debtPayments`                                                                         | Extender para capturar pago mensual de deuda al cierre (requerido por gasto total del flow)                         | domain | AC-4.1                     |
| `composables/useMonthRollover.ts`                                                                                                           | En boot: si cambió el mes → snapshot del mes cerrado + reset gasto variable + `setLastMonthSeen`                    | infra  | AC-2.1, AC-4.1, EC-1       |
| `composables/useGreeting.ts`                                                                                                                | Clave de saludo + nombre + fecha formateada por locale                                                              | app    | AC-1.1, AC-1.2             |
| `composables/useSpendingPace.ts`                                                                                                            | Une gasto variable actual + snapshot mes anterior + fecha → resultado pace                                          | app    | AC-2.1–2.4                 |
| `composables/useNetWorthSummary.ts`                                                                                                         | `totalAssets`, `totalLiabilities`, `net` (extraído del cálculo inline de NetWorthView)                              | app    | AC-3.1, AC-3.3             |
| `composables/useMonthlyFlow.ts`                                                                                                             | Datos de chart desde snapshots + flag `hasEnoughHistory` (≥2)                                                       | app    | AC-4.1, AC-4.3             |
| `components/dashboard/DashboardGreeting.vue`                                                                                                | Saludo + fecha; truncado a una línea en 390px                                                                       | app    | AC-1.1, AC-1.2, EC-2       |
| `components/dashboard/SpendingPaceBadge.vue`                                                                                                | Badge ↑/↓ + línea de contexto i18n; estado neutro sin histórico                                                     | app    | AC-2.1–2.4                 |
| `components/dashboard/NetWorthCards.vue`                                                                                                    | 3 tarjetas Tengo/Debo/Neto con RouterLink, color semántico, empty state                                             | app    | AC-3.1–3.4                 |
| `components/dashboard/CashFlowChart.vue`                                                                                                    | `Bar` (vue-chartjs) ingresos vs gastos, leyenda, empty state                                                        | app    | AC-4.1–4.3                 |
| `components/dashboard/MonthActivityCard.vue`                                                                                                | Top 5 categorías por `spent` desc + "ver todo" → `/variable` + empty CTA                                            | app    | AC-5.1, AC-5.2             |
| `views/DashboardView.vue` (mod)                                                                                                             | Orden: greeting → DayOverview → hero → networth → grid 2 col (flow+activity) → tier-2                               | app    | AC-6.1–6.4                 |
| `views/SettingsView.vue` (mod)                                                                                                              | Campo nombre opcional con validación y borrado                                                                      | app    | AC-1.3                     |
| `lib/storage/schema.ts` + `migrate.ts` — **V5**                                                                                             | `settings.userName` opcional; migración V4→V5                                                                       | infra  | AC-1.3                     |
| `i18n/es.json` + `en.json` — `dashboard.greeting.*`, `dashboard.pace.*`, `dashboard.networth.*`, `dashboard.flow.*`, `dashboard.activity.*` | Claves nuevas en ambos idiomas                                                                                      | cross  | AC-1.x, 2.x, 3.4, 4.3, 5.2 |

### Moment → component map (user-facing)

| User Moment         | UI block                                        | Covers                 |
| ------------------- | ----------------------------------------------- | ---------------------- |
| UM-1                | DashboardGreeting + DayOverview + DashboardHero | AC-1.1, AC-1.2, AC-6.1 |
| UM-2                | SpendingPaceBadge (dentro del héroe)            | AC-2.1–2.4             |
| UM-3                | NetWorthCards                                   | AC-3.1–3.4             |
| UM-4                | CashFlowChart                                   | AC-4.1–4.3             |
| UM-5                | MonthActivityCard                               | AC-5.1, AC-5.2         |
| UM-1 (no regresión) | DashboardView layout + DashboardTier2Toggle     | AC-6.1–6.4             |

## Existing assets & reuse

| Existing module / store / util                         | Reuse / extend / replace | Notes                                                                                      |
| ------------------------------------------------------ | ------------------------ | ------------------------------------------------------------------------------------------ |
| `lib/calculations/snapshot.ts` — `buildSnapshot()`     | **Reuse**                | Ya produce los 10 campos del schema; hoy nadie lo llama en runtime                         |
| `lib/date/month.ts` — `detectMonthRollover()`          | **Reuse**                | Lógica de cierre de mes lista, sin wiring                                                  |
| `variableExpensesStore.resetAllSpent()`                | **Reuse**                | Prevista para rollover; sin caller en `src/`                                               |
| `snapshotsStore` (`append`, cap 24)                    | **Extend**               | Añadir `totalVariableSpent` al interface del store (alinear con schema)                    |
| `settingsStore.lastMonthSeen` + `setLastMonthSeen`     | **Reuse**                | Base del rollover                                                                          |
| `DashboardHero.vue`                                    | **Extend**               | Inserta `SpendingPaceBadge`; no se reescribe                                               |
| `ComparisonBadge.vue`                                  | **Reuse**                | Base visual del badge de pace (flecha + semántica)                                         |
| Cálculo inline de `NetWorthView.vue`                   | **Extract → reuse**      | Mover a `useNetWorthSummary`; NetWorthView pasa a consumirlo (sin duplicar)                |
| `ProjectionChart.vue` / `BudgetDonut.vue` patrón chart | **Reuse patrón**         | Mismo wrapper vue-chartjs con `:data`/`:options` y `useChartTheme`                         |
| `useDashboardTier2` + `DashboardTier2Toggle`           | **Reuse sin cambios**    | AC-6.3 exige no tocar sus reglas                                                           |
| `QuickAddFAB.vue`                                      | **Extend mount**         | Ya se auto-limita a `/` y `/dashboard`; montar también en DashboardView para CTA de AC-5.2 |
| `DayOverview.vue` y componentes `day/*`                | **Reuse sin cambios**    | Tier 1 protegido                                                                           |
| `useChartTheme`, `getCurrencyConfig`                   | **Reuse**                | Tema de charts y formato moneda                                                            |

## Security & privacy

| Surface                | Threat / concern                 | Mitigation                                                                                                        | TC ref |
| ---------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------ |
| Input nombre (ajustes) | XSS / desbordes                  | Interpolación `{{ }}` (nunca `v-html`); guard `setUserName` ≤30 chars + trim; Zod en schema V5                    | fase 3 |
| Persistencia V4→V5     | Pérdida de datos en migración    | `migrate()` aditivo (`userName: ''`); test de migración con payload V4 real                                       | fase 3 |
| Rollover mensual       | Doble snapshot o pérdida del mes | `append` es idempotente por orden (cap 24); guard: solo si `detectMonthRollover` true y mes no existe ya en items | fase 3 |
| Logs / tests           | PII en fixtures                  | Nombres ficticios en tests; sin analytics (constitución)                                                          | fase 3 |

## Data Model

**Hallazgo verificado (recon):** el interface `Snapshot` del store (`fixedExpenses`, `debtPayments`, sin `totalVariableSpent`/`savingsRate`/`totalDebt`) **no coincide** con `SnapshotSchema` Zod (`totalFixedExpenses`, `totalVariableSpent`, `totalDebt`, `savingsRate`). `main.ts` oculta el choque con `as any` en hidratación (L66) y persistencia (L111): los datos reales viajan con forma del schema y el tipo del store miente. Latente porque los consumidores actuales solo leen campos comunes (`month`, `netWorth`, `healthScore`). Este feature lee los campos desalineados → la corrección es prerequisito.

```text
Corrección (parte de este feature):
  1. snapshotsStore importa `type Snapshot` desde lib/storage/schema (fuente única — ADR-4)
  2. main.ts: eliminar ambos `as any` de snapshots (deben tipar sin cast tras 1)
  3. SnapshotSchema V5 (+aditivo): debtPayments: Money.default(0)
     # totalDebt = saldo total ≠ pago mensual; el gasto total del mes (OQ-2)
     # necesita el pago mensual → se captura al cierre vía buildSnapshot
  4. buildSnapshot(): nuevo input debtPayments (desde totalDebtObligation de useDTI)

SettingsState (+V5):
  userName: string            # '' = sin configurar; ≤30 chars; trim

AppStateSchemaV5 (Zod):
  settings.userName: z.string().max(30).default('')
  snapshots[].debtPayments: Money.default(0)
  migrate v5: userName ?? '' · snapshot.debtPayments ?? 0

Gasto total de mes cerrado (flow chart):
  expenses = totalFixedExpenses + totalVariableSpent + debtPayments
  # snapshots antiguos (pre-V5): debtPayments=0 → gasto subestimado, aceptado
  # (solo existen en seeds de tests; documentado en test plan)
```

## Contracts

```ts
// lib/calculations/spending-pace.ts
interface SpendingPaceInput {
  currentVariableSpent: number
  previousVariableTotal: number | null // null → sin histórico
  dayOfMonth: number // días naturales
  daysInMonth: number
}
interface SpendingPaceResult {
  status: 'ahead' | 'below' | 'none' // none: sin histórico o previous=0 (EC-5)
  spentPct: number // % del total del mes pasado ya consumido
  elapsedPct: number // % del mes transcurrido
}

// lib/calculations/monthly-flow.ts
interface MonthlyFlowPoint {
  month: string /* YYYY-MM */
  income: number
  expenses: number
}
// buildMonthlyFlow(snapshots, { max = 6 }): MonthlyFlowPoint[] — solo meses cerrados, cronológico

// lib/greeting.ts
type GreetingSlot = 'morning' | 'afternoon' | 'evening'
// greetingKey(hour: number): GreetingSlot  — [5,12) morning · [12,19) afternoon · resto evening
```

## ADRs

### ADR-1: Cablear el rollover mensual en runtime (prerequisito de datos)

- **Context:** AC-2.x y AC-4.x necesitan totales de meses cerrados. La infraestructura existe (`buildSnapshot`, `detectMonthRollover`, `resetAllSpent`) pero ningún código de producción la invoca — hoy los snapshots solo existen pre-seeded en tests. Sin esto, el badge de ritmo y la gráfica jamás tendrían datos reales.
- **Options:**
  1. **Composable `useMonthRollover` ejecutado en boot (`App.vue` onMounted)** — pros: un solo punto de entrada, testeable, usa todo lo existente; cons: si la app queda abierta cruzando medianoche de fin de mes no detecta hasta el próximo boot (aceptable para app personal).
  2. Watcher/interval que vigila cambio de mes en vivo — pros: cubre sesión abierta; cons: complejidad y timers innecesarios para uso diario real.
  3. Mantener deferred (solo seeds) — pros: cero esfuerzo; cons: las secciones nuevas nacerían muertas en producción.
- **Decision:** Opción 1.
- **Consequences:** El feature absorbe el wiring que el spec `snapshot-rollover` dejó diferido; e2e de rollover pasa de seeds a flujo real (manteniendo seeds para fixtures de chart).
- **Covers:** AC-2.1, AC-4.1, EC-1

### ADR-2: Versión de schema V5 para `userName`

- **Context:** La constitución obliga: campo persistido nuevo = Zod + `migrate()`.
- **Options:**
  1. **Bump a V5 con migración aditiva** (`userName: ''`) — pros: cumple constitución, rollback inocuo; cons: un paso más de migración.
  2. Guardar el nombre fuera del estado financiero (localStorage key suelta) — pros: sin migración; cons: rompe el patrón de persistencia única validada, queda fuera de export/import.
- **Decision:** Opción 1 — el nombre viaja con export/import como el resto de ajustes.
- **Consequences:** `migrations[5]`, `AppStateSchemaV5`, tests de migración; rollback documentado abajo.
- **Covers:** AC-1.3

### ADR-3: Badge de ritmo como componente propio vs extender `ComparisonBadge`

- **Context:** Existe `ComparisonBadge` (delta numérico con flecha) usado para health score.
- **Options:**
  1. Extender `ComparisonBadge` con modo "pace" — pros: un solo badge; cons: su semántica actual es "más = verde", la del pace es "más = rojo" (gasto); el doble contrato lo vuelve confuso.
  2. **`SpendingPaceBadge` propio reusando estilos** — pros: una idea por componente (constitución), semántica invertida explícita, línea de contexto integrada; cons: leve duplicación visual.
- **Decision:** Opción 2.
- **Consequences:** `ComparisonBadge` queda intacto para score; tests separados.
- **Covers:** AC-2.2, AC-2.3

### ADR-4: Fuente única de tipo para Snapshot (corrección del hallazgo)

- **Context:** El interface del store y el schema Zod divergieron silenciosamente; los `as any` de `main.ts` anularon la detección por TypeScript. Cualquier solución debe impedir que vuelva a pasar.
- **Options:**
  1. **El store importa `type Snapshot` desde `lib/storage/schema`** — pros: una sola definición, el compilador detecta drift futuro, permitido por capas (stores → lib, import type sin side effects); cons: el store queda acoplado al módulo de schema.
  2. Mantener dos interfaces + función de mapeo explícita store↔schema — pros: desacople; cons: el mapeo es código que puede divergir igual, y hoy no existe — es exactamente el bug actual con más pasos.
  3. Solo añadir los campos faltantes al interface del store a mano — pros: cambio mínimo; cons: no previene la próxima divergencia (causa raíz intacta).
- **Decision:** Opción 1, eliminando ambos `as any` de `main.ts` en el mismo cambio.
- **Consequences:** Si un futuro cambio de schema rompe el store, falla `typecheck` en vez de fallar en runtime con `undefined`.
- **Covers:** AC-2.1, AC-4.1

## Assumption Register

| ID    | Assumption                                                                                                                                                               | Impact if wrong | Verify by                                                                                 | Status       |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------- | ----------------------------------------------------------------------------------------- | ------------ |
| A-001 | El schema Zod V4 de snapshots ya incluye `totalVariableSpent` y nombres compatibles con `buildSnapshot()`                                                                | M               | Verificado leyendo `schema.ts` L165–177 (2026-06-09)                                      | **verified** |
| A-002 | La hidratación de snapshots es pass-through directo (sin mapeo); re-tipar el store no rompe datos V4 — el campo nuevo `debtPayments` lo cubre `migrate v5` con default 0 | H               | Verificado en `main.ts` L66/L111 (2026-06-09); test de migración V4→V5 confirma en fase 5 | **verified** |
| A-003 | `chart.js` ya instalado expone `BarElement` (no requiere dependencia nueva)                                                                                              | L               | Import en CashFlowChart + suite verde                                                     | unverified   |
| A-004 | Rollover detectado solo en boot es suficiente (sesiones no cruzan fin de mes abiertas)                                                                                   | L               | Decisión ADR-1; revisar en feedback post-release                                          | unverified   |
| A-005 | El fold 390×844 admite saludo compacto + cobertura Mi Día + monto héroe (AC-6.1) sin reducir Mi Día                                                                      | M               | E2E móvil de fold en fase 5                                                               | unverified   |

## Dependencies

- Sin dependencias nuevas: `chart.js` + `vue-chartjs` (Bar), `@vueuse/core`, `vue-i18n` ya instalados.

## Rollout / Rollback

- Feature flag: no (app personal local; el branch es el flag).
- Rollout: merge a `main` → build estático. La migración V5 corre sola al primer load.
- Rollback: revertir el merge. Datos: V5 solo añade `settings.userName`; un build V4 posterior hará `safeParse` V4 sobre payload V5 — el campo extra se descarta (Zod no-strict) y `schemaVersion: 5` cae al branch de versión desconocida → **verificar en test que el loader V4 con payload V5 no borra estado**; si falla, paso manual documentado: export → rollback → import.
- Snapshots creados por rollover son válidos para V4 (mismo schema) — sin riesgo en rollback.

## Risks

| Risk                                                      | Impact | Mitigation                                                                                                          |
| --------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------- |
| Regresión Mi Día / tier-2 (specs firmados)                | H      | Suites existentes (`DashboardView*`, `dashboard-tier2`, `day-*`, e2e fold) corren en T-LAST; AC-6.3 con test propio |
| Desalineación Snapshot store↔schema corrompe hidratación  | H      | Corrección ADR-4 como tarea de setup (fuente única de tipo + sin `as any`); A-001/A-002 ya verificadas              |
| Fold móvil excedido por el saludo (AC-6.1)                | M      | Greeting de una línea + e2e 390×844 del fold                                                                        |
| Doble snapshot del mismo mes en rollover                  | M      | Guard por `month` único antes de `append` + test unit                                                               |
| Primer mes sin datos: secciones nuevas vacías simultáneas | L      | Empty states diseñados por AC (3.4, 4.3, 5.2) con tono definido                                                     |

## Sign-off

- [x] Author — Johann Medina — 2026-06-09
