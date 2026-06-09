# Tasks: Dashboard fintech redesign

> [Spec](./1-spec.md) · [Plan](./2-plan.md) · [Tests](./3-test-plan.md)

## Legend

- Type: `setup` | `test` | `impl` | `refactor` | `docs`
- Layer: `domain` | `app` | `infra` | `cross`
- Size: S (<2h) | M (<1d) | L (FORBIDDEN)
- Risk (impl only): H | M | L

## Phase 1 — Setup

### T-001 — Refactor: ADR-4 — Snapshot tipo único desde schema

- Type: refactor · Layer: infra · Deps: — · Size: M
- Covers: ADR-4 (prerequisito AC-2.1, AC-4.1)
- DoD:
  - [ ] `snapshotsStore` importa `type Snapshot` desde `lib/storage/schema` (elimina interface local)
  - [ ] Ambos `as any` de snapshots en `main.ts` (hidratación L66, persistencia L111) eliminados
  - [ ] Consumidores actuales (`HistoryView`/`SnapshotList`, `DashboardHero`) compilan sin cambios de comportamiento
  - [ ] `npm run typecheck` + suite existente verde (sin tests nuevos: refactor cubierto por suite actual)

### T-002 — Setup: claves i18n nuevas (es + en)

- Type: setup · Layer: cross · Deps: — · Size: S
- Covers: AC-1.1, AC-2.2, AC-3.4, AC-4.3, AC-5.2 (copys)
- DoD:
  - [ ] `dashboard.greeting.*` (morning/afternoon/evening, withName), `dashboard.pace.*` (ahead/below/noHistory + context), `dashboard.networth.*` (have/owe/net + empty), `dashboard.flow.*` (title/legend + empty), `dashboard.activity.*` (title/viewAll + empty/cta), `settings.userName.*` (label/placeholder/error)
  - [ ] Mismas claves en `i18n/es.json` y `i18n/en.json` (paridad)

### T-003 — Setup: stubs de archivos de test

- Type: setup · Layer: cross · Deps: — · Size: S
- DoD:
  - [ ] Archivos vacíos creados: `tests/greeting.test.ts`, `tests/spending-pace.test.ts`, `tests/monthly-flow.test.ts`, `tests/useMonthRollover.test.ts`, `tests/migrate-v5.test.ts`, `tests/DashboardGreeting.test.ts`, `tests/SettingsUserName.test.ts`, `tests/SpendingPaceBadge.test.ts`, `tests/NetWorthCards.test.ts`, `tests/CashFlowChart.test.ts`, `tests/MonthActivityCard.test.ts`, `tests/DashboardViewRedesign.test.ts`, `e2e/dashboard-redesign.spec.ts`

## Phase 2 — Tests

### T-004 — Test: lib greeting (franjas horarias)

- Type: test · Layer: domain · Deps: T-003 · Size: S
- Covers: AC-1.1, AC-1.2, TC-U-001, TC-U-002
- DoD:
  - [ ] `greetingKey()` testeado en límites exactos 5:00/12:00/19:00 + casos interiores (RED)

### T-005 — Test: settingsStore.userName + migración V5

- Type: test · Layer: app/infra · Deps: T-003 · Size: M
- Covers: AC-1.3, EC-2, TC-U-003, TC-U-010, TC-I-014
- DoD:
  - [ ] Guard `setUserName`: trim, ≤30 chars, rechazo 31+ (RED)
  - [ ] Migración payload V4 real → V5: `userName=''`, `snapshots[].debtPayments=0`, sin pérdida de campos (RED)
  - [ ] Hidratación V5 puebla store sin casts (RED)

### T-006 — Test: lib spending-pace

- Type: test · Layer: domain · Deps: T-003 · Size: M
- Covers: AC-2.1–2.4, EC-5, TC-U-004, TC-U-005, TC-U-012
- DoD:
  - [ ] `ahead` (70% vs 50%), `below` (40% vs 50%), empate exacto → `below` (RED)
  - [ ] `previousVariableTotal` null o 0 → `none`, sin NaN/Infinity (RED)
  - [ ] `spentPct`/`elapsedPct` con días naturales correctos (mes 28/30/31 días) (RED)

### T-007 — Test: lib monthly-flow

- Type: test · Layer: domain · Deps: T-003 · Size: S
- Covers: AC-4.1, EC-3, TC-U-006, TC-U-007, TC-U-011
- DoD:
  - [ ] 8 snapshots → 6 puntos máx, cronológicos, sin mes en curso (RED)
  - [ ] `expenses = totalFixedExpenses + totalVariableSpent + debtPayments` (0 si falta) (RED)
  - [ ] 2–5 meses → solo disponibles, sin huecos (RED)

### T-008 — Test: useMonthRollover

- Type: test · Layer: infra · Deps: T-003 · Size: M
- Covers: EC-1, AC-2.1, AC-4.1, TC-U-009, TC-I-013
- DoD:
  - [ ] `lastMonthSeen` anterior → append snapshot mes cerrado (con `totalVariableSpent`, `debtPayments`) + `resetAllSpent` + `setLastMonthSeen` (RED)
  - [ ] Mismo mes → no-op; mes ya existente en items → no duplica (guard) (RED)

### T-009 — Test: DashboardGreeting + campo nombre en ajustes (component)

- Type: test · Layer: app · Deps: T-002, T-003 · Size: M
- Covers: AC-1.1–1.3, TC-I-001, TC-I-002
- DoD:
  - [ ] Greeting renderiza clave por franja + fecha locale; con nombre lo incluye (RED)
  - [ ] SettingsView: campo opcional, guarda/borra; payload `<script>` renderiza como texto plano (RED)

### T-010 — Test: SpendingPaceBadge + integración en héroe (component)

- Type: test · Layer: app · Deps: T-002, T-003 · Size: M
- Covers: AC-2.1–2.4, TC-I-003, TC-I-004, TC-I-005
- DoD:
  - [ ] Estados rojo/verde/neutro con copy de contexto i18n exacto (RED)
  - [ ] Sin histórico: no badge, línea neutra, nunca "NaN"/"0%" (RED)
  - [ ] Hero monta el badge junto al disponible (RED)

### T-011 — Test: useNetWorthSummary + NetWorthCards (component)

- Type: test · Layer: app · Deps: T-002, T-003 · Size: M
- Covers: AC-3.1–3.4, TC-U-008, TC-I-006, TC-I-007
- DoD:
  - [ ] Exactamente 3 tarjetas; monto = tipografía mayor por tarjeta (RED)
  - [ ] Drill-down con router real a `/networth` y `/debts` (RED)
  - [ ] Neto negativo rojo / ≥0 verde (RED)
  - [ ] Sin datos → empty state con icono y copy, no tarjetas en $0 (RED)

### T-012 — Test: CashFlowChart (component)

- Type: test · Layer: app · Deps: T-002, T-003 · Size: S
- Covers: AC-4.1–4.3, TC-I-008, TC-I-009
- DoD:
  - [ ] `:data` del stub Bar: N pares, labels de mes, dataset verde/rojo, leyenda (RED)
  - [ ] <2 meses → empty state, sin canvas (RED)

### T-013 — Test: MonthActivityCard (component)

- Type: test · Layer: app · Deps: T-002, T-003 · Size: S
- Covers: AC-5.1, AC-5.2, TC-I-010, TC-I-011
- DoD:
  - [ ] Top 5 desc, empate alfabético, spent=0 nunca desplaza a >0; "ver todo" → `/variable` (RED)
  - [ ] Sin gasto → empty neutro + CTA registrar visible (RED)

### T-014 — Test: layout DashboardView + paridad i18n

- Type: test · Layer: app · Deps: T-002, T-003 · Size: M
- Covers: AC-6.2, AC-6.3, TC-I-012, TC-I-015
- DoD:
  - [ ] Orden de secciones en DOM: greeting → DayOverview → hero → networth → flow/activity → tier-2 (RED)
  - [ ] Secciones nuevas fuera de `[data-testid="dashboard-tier-2"]` (RED)
  - [ ] Paridad de claves nuevas es/en (extiende `dashboard-keys-parity`) (RED→GREEN con T-002)

### T-015 — Test: E2E redesign (fold, columnas, regresión, touch, saludo)

- Type: test · Layer: app · Deps: T-003 · Size: M
- Covers: AC-6.1–6.4, AC-1.2, AC-1.3, TC-E-001–TC-E-005
- DoD:
  - [ ] 390×844: saludo + badge cobertura + monto héroe `boundingBox.bottom ≤ 844` (RED)
  - [ ] ≥768px: flow y actividad lado a lado; toggle ausente en desktop (reusa helpers tier-2) (RED)
  - [ ] Toggle móvil conserva reglas (suite `dashboard-tier2` existente sigue verde — no se modifica)
  - [ ] Touch targets nuevos ≥44×44px (RED)
  - [ ] Configurar nombre → recargar → saludo persistido (RED)

## Phase 3 — Implementation

> Orden de arranque por riesgo: H (T-016, T-017) → M (T-018…T-025, T-027) → L (T-020, T-026)

### T-016 — Impl: schema V5 + migrate (userName, debtPayments)

- Type: impl · Layer: infra · Deps: T-005 · Size: M · Risk: H
- Covers: AC-1.3, TC-U-010, TC-I-014
- DoD:
  - [ ] `AppStateSchemaV5` (`settings.userName` ≤30 default '', `snapshots[].debtPayments` default 0); `migrations[5]`; `saveAppState`/`loadAppState` a V5
  - [ ] Tests T-005 migración GREEN; lint+typecheck

### T-017 — Impl: useMonthRollover + wiring boot + buildSnapshot.debtPayments

- Type: impl · Layer: infra · Deps: T-008, T-016 · Size: M · Risk: H
- Covers: EC-1, AC-2.1, AC-4.1, TC-U-009, TC-I-013, ADR-1
- DoD:
  - [ ] `buildSnapshot()` acepta `debtPayments` (desde `totalDebtObligation`)
  - [ ] `useMonthRollover` invocado en boot (`App.vue` onMounted): detect → build → append (guard por month) → resetAllSpent → setLastMonthSeen
  - [ ] Tests T-008 GREEN

### T-018 — Impl: lib spending-pace

- Type: impl · Layer: domain · Deps: T-006 · Size: S · Risk: M
- Covers: AC-2.1–2.4, EC-5, TC-U-004, TC-U-005, TC-U-012
- DoD:
  - [ ] `calcSpendingPace()` puro, sin imports de framework; T-006 GREEN; cobertura `lib/calculations` ≥80%

### T-019 — Impl: lib monthly-flow

- Type: impl · Layer: domain · Deps: T-007 · Size: S · Risk: M
- Covers: AC-4.1, EC-3, TC-U-006, TC-U-007, TC-U-011
- DoD:
  - [ ] `buildMonthlyFlow()` puro; T-007 GREEN

### T-020 — Impl: lib greeting

- Type: impl · Layer: domain · Deps: T-004 · Size: S · Risk: L
- Covers: AC-1.1, AC-1.2, TC-U-001, TC-U-002
- DoD:
  - [ ] `greetingKey()` puro; T-004 GREEN

### T-021 — Impl: settingsStore.userName + campo en SettingsView

- Type: impl · Layer: app · Deps: T-005, T-009, T-016 · Size: S · Risk: M
- Covers: AC-1.3, EC-2, TC-U-003, TC-I-002
- DoD:
  - [ ] `userName` + `setUserName` (trim, ≤30); campo opcional en ajustes con error copy; persistencia en payload V5
  - [ ] T-005 store + T-009 settings GREEN

### T-022 — Impl: useGreeting + DashboardGreeting

- Type: impl · Layer: app · Deps: T-009, T-020, T-021 · Size: S · Risk: M
- Covers: AC-1.1, AC-1.2, EC-2, TC-I-001
- DoD:
  - [ ] Saludo + fecha locale, una línea en 390px (truncate); T-009 greeting GREEN

### T-023 — Impl: useSpendingPace + SpendingPaceBadge + héroe

- Type: impl · Layer: app · Deps: T-001, T-010, T-018 · Size: M · Risk: M
- Covers: AC-2.1–2.4, TC-I-003–005, ADR-3
- DoD:
  - [ ] Composable une variableExpenses (spent actual) + snapshot mes anterior + fecha actual
  - [ ] Badge con semántica invertida (gasto: más = rojo) + línea contexto; integrado en `DashboardHero`
  - [ ] T-010 GREEN

### T-024 — Impl: useNetWorthSummary + NetWorthCards

- Type: impl · Layer: app · Deps: T-011 · Size: M · Risk: M
- Covers: AC-3.1–3.4, TC-U-008, TC-I-006, TC-I-007
- DoD:
  - [ ] Composable extraído del cálculo inline; `NetWorthView` refactorizado para consumirlo (sin duplicación)
  - [ ] 3 tarjetas RouterLink con color semántico + empty state; T-011 GREEN

### T-025 — Impl: useMonthlyFlow + CashFlowChart

- Type: impl · Layer: app · Deps: T-001, T-012, T-019 · Size: M · Risk: M
- Covers: AC-4.1–4.3, TC-I-008, TC-I-009, A-003
- DoD:
  - [ ] `Bar` de vue-chartjs registrado (`BarElement`, escalas) — verifica A-003
  - [ ] Tema vía `useChartTheme`; empty state <2 meses; T-012 GREEN

### T-026 — Impl: MonthActivityCard + FAB en dashboard

- Type: impl · Layer: app · Deps: T-013 · Size: S · Risk: L
- Covers: AC-5.1, AC-5.2, TC-I-010, TC-I-011
- DoD:
  - [ ] Top 5 por spent desc (empate alfabético) + "ver todo"; empty con CTA
  - [ ] `QuickAddFAB` montado en DashboardView (ya se auto-limita a `/`); T-013 GREEN

### T-027 — Impl: reorganización DashboardView

- Type: impl · Layer: app · Deps: T-014, T-015, T-022, T-023, T-024, T-025, T-026 · Size: M · Risk: M
- Covers: AC-6.1–6.4, TC-I-012, TC-E-001–004, A-005
- DoD:
  - [ ] Orden: greeting → DayOverview → hero → networth → grid 2 col `md:` (flow + activity) → toggle/tier-2 intactos
  - [ ] Fold 390×844 verificado (verifica A-005); touch targets ≥44px
  - [ ] T-014 + e2e T-015 GREEN

## Phase 4 — Regression

### T-LAST — Regression + coverage

- Type: test · Layer: cross · Deps: T-016–T-027 · Size: S
- DoD:
  - [ ] `npm test` + `npm run typecheck` + `npm run lint` verdes
  - [ ] Suites firmadas previas verdes sin modificación: `dashboard-tier2`, `day-*`, `DashboardHero`, `dashboard-hero-mobile`, `snapshot-rollover`
  - [ ] Coverage delta ≥ 0 (mínimos: 80% `lib/calculations`, 60% global)
  - [ ] E2E completo verde
