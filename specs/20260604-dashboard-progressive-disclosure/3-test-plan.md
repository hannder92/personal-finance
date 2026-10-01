# Test Plan: Dashboard progressive disclosure (mobile hierarchy)

> Spec: [1-spec.md](./1-spec.md) · Plan: [2-plan.md](./2-plan.md) · IDs: [\_ids.yaml](./_ids.yaml)  
> Mode: `solo` · Created: `2026-06-04`

## Pyramid

| Capa      | Objetivo                                                                          | ~%  |
| --------- | --------------------------------------------------------------------------------- | --- |
| Unit      | `dashboard-tier2-storage.ts`, lógica pura `tier2Visible` / guards                 | 45% |
| Component | `useDashboardTier2`, `DashboardTier2Toggle`, `DashboardView` mobile/desktop       | 40% |
| E2E       | Collapse default, expand/collapse, nav persist, desktop visible, Mi Día regresión | 15% |

**Principio:** testear lógica de visibilidad en unit/composable con `sessionStorage` mock; component tests con `useMediaQuery` mockeado; E2E solo flujos críticos observables.

## Spec Challenge Log

| AC     | Resultado | Notas                                                                                 |
| ------ | --------- | ------------------------------------------------------------------------------------- |
| AC-1.1 | OK        | Observable: `[data-testid="dashboard-tier-2"]` absent + KPI strip no en DOM (`v-if`)  |
| AC-1.2 | OK        | Regresión E2E existente `day-overview.spec.ts`; badge cobertura visible 390×844       |
| AC-1.3 | OK        | Hint i18n `dashboard.tier2.hint` visible cuando colapsado                             |
| AC-2.1 | OK        | Texto botón = `t('dashboard.tier2.expand')`; TC-C verifica es + en                    |
| AC-2.2 | OK        | Post-click `dashboard-tier-2` visible + KPI strip dentro                              |
| AC-2.3 | OK        | Post-collapse `dashboard-tier-2` not in DOM; botón muestra `dashboard.tier2.collapse` |
| AC-2.4 | OK        | Assert `getBoundingClientRect` o clases `min-h-11 min-w-full` ≥44px                   |
| AC-3.1 | OK        | sessionStorage key + E2E navegación `/income` → `/`                                   |
| AC-3.2 | OK        | Nuevo `BrowserContext` sin seed sessionStorage                                        |
| AC-4.1 | OK        | `canToggle === false` cuando `isDesktop`; toggle absent en DOM                        |
| AC-4.2 | OK        | Desktop: tier2 visible sin click                                                      |
| AC-5.1 | OK        | `grossSalary === 0` fuerza `tier2Visible=false` y `canToggle=false`                   |

**SPEC-CHALLENGE:** ninguno.

**SPEC-GAP:**

| Gap                             | Resolución                                                       |
| ------------------------------- | ---------------------------------------------------------------- |
| AC-1.1 “sin scroll” para tier 2 | **Component + E2E** — tier2 not in DOM (más estricto que hidden) |
| EC-1 resize móvil→desktop       | TC-C-089 simula `isDesktop` true → tier2 aparece                 |
| EC-2 resize desktop→móvil       | TC-U-027 colapsa si no expanded en session                       |
| A-005 chart remount             | **Manual DEFERRED** en verify; no TC automatizado v1             |

## Product Challenge Log

| ID   | Challenge                      | Spec answer                                                         | Resolved?                 |
| ---- | ------------------------------ | ------------------------------------------------------------------- | ------------------------- |
| PC-1 | ¿Acción clara en 30s?          | Tier 1 responde “hoy + disponible”; toggle explícito para analítico | ✅ AC-1.1, AC-2.1         |
| PC-2 | ¿Retorno diario (habit)?       | Colapsado por defecto reduce fricción                               | ✅ AC-1.1, discovery UM-1 |
| PC-3 | ¿Beneficio visible (decision)? | N/A — layout/habit, no comparador                                   | ✅ N/A                    |
| PC-4 | ¿Empty state con tono?         | Fresh user: tier 2 oculto evita gráficos vacíos                     | ✅ AC-5.1                 |
| PC-5 | ¿Loop nuevo vs dashboard?      | Reorganiza jerarquía sin métricas nuevas                            | ✅ discovery §7           |

## Traceability Matrix

| AC ID        | TC IDs                       | Kind                   | Test file (planned)                                                                       |
| ------------ | ---------------------------- | ---------------------- | ----------------------------------------------------------------------------------------- |
| AC-1.1       | TC-U-020, TC-C-080, TC-E-030 | unit + component + e2e | `dashboard-tier2-storage.test.ts`, `DashboardView.test.ts`, `e2e/dashboard-tier2.spec.ts` |
| AC-1.2       | TC-C-081, TC-E-031           | component + e2e        | `DashboardView.test.ts`, `e2e/day-overview.spec.ts`                                       |
| AC-1.3       | TC-C-082                     | component              | `DashboardTier2Toggle.test.ts`                                                            |
| AC-2.1       | TC-C-083, TC-C-084           | component              | `DashboardTier2Toggle.test.ts`                                                            |
| AC-2.2       | TC-C-085, TC-E-032           | component + e2e        | `DashboardView.test.ts`, `e2e/dashboard-tier2.spec.ts`                                    |
| AC-2.3       | TC-C-086, TC-E-033           | component + e2e        | idem                                                                                      |
| AC-2.4       | TC-C-087                     | component              | `DashboardTier2Toggle.test.ts`                                                            |
| AC-3.1       | TC-U-021, TC-U-022, TC-E-034 | unit + e2e             | `useDashboardTier2.test.ts`, `e2e/dashboard-tier2.spec.ts`                                |
| AC-3.2       | TC-U-023, TC-E-035           | unit + e2e             | idem                                                                                      |
| AC-4.1       | TC-U-024, TC-C-088, TC-E-036 | unit + component + e2e | idem                                                                                      |
| AC-4.2       | TC-U-024, TC-C-089, TC-E-036 | unit + component + e2e | idem                                                                                      |
| AC-5.1       | TC-U-025, TC-C-090           | unit + component       | `useDashboardTier2.test.ts`, `DashboardView.test.ts`                                      |
| EC-1         | TC-U-024, TC-C-089           | unit + component       | resize → desktop tier2 visible                                                            |
| EC-2         | TC-U-027                     | unit                   | desktop→mobile respects session                                                           |
| EC-3         | TC-C-090                     | component              | post-income configure tier2 expandable                                                    |
| A-001        | TC-U-024, TC-C-088           | unit + component       | breakpoint 768                                                                            |
| A-002        | TC-U-025                     | unit                   | grossSalary guard                                                                         |
| constitution | TC-U-026, TC-C-091           | unit + component       | sessionStorage key isolation; no v-html                                                   |
| ALL          | TC-I-020                     | integration            | T-LAST: `npm test` + `npm run e2e`                                                        |

**Cobertura:** 12/12 AC con ≥1 TC · EC-1, EC-2, EC-3 cubiertos · A-005 manual en verify.

## Acceptance Scenarios

### TC-U-020 — Storage helper (AC-1.1, AC-3.2)

```gherkin
Given sessionStorage empty
When readTier2Expanded executes
Then returns false

Given sessionStorage pf_dashboard_tier2_expanded = "true"
When readTier2Expanded executes
Then returns true

When writeTier2Expanded(session, true)
Then session.getItem(key) = "true"
```

### TC-U-021 — tier2Visible mobile collapsed default (AC-1.1)

```gherkin
Given isDesktop = false, hasIncome = true, isExpanded = false
When computeTier2Visible executes
Then tier2Visible = false
```

### TC-U-022 — Session write on toggle (AC-3.1)

```gherkin
Given mobile, hasIncome, collapsed
When toggle() executes
Then isExpanded = true
And sessionStorage pf_dashboard_tier2_expanded = "true"
```

### TC-U-023 — New session reads collapsed (AC-3.2)

```gherkin
Given new MockStorage with no key
When useDashboardTier2 initializes mobile hasIncome
Then isExpanded = false
And tier2Visible = false
```

### TC-U-024 — Desktop always visible (AC-4.1, AC-4.2, EC-1, A-001)

```gherkin
Given isDesktop = true and hasIncome = true and isExpanded = false
When computeTier2Visible executes
Then tier2Visible = true
And canToggle = false
```

### TC-U-025 — No income guard (AC-5.1, A-002)

```gherkin
Given hasIncome = false and sessionStorage expanded = "true"
When computeTier2Visible mobile
Then tier2Visible = false
And canToggle = false
```

### TC-U-026 — Constitution: no finance_app_data write (AC-3.2 negative)

```gherkin
When toggle() and writeTier2Expanded run
Then localStorage finance_app_data unchanged
And only pf_dashboard_tier2_expanded key touched
```

### TC-U-027 — Desktop to mobile resize (EC-2)

```gherkin
Given isDesktop becomes false, session expanded = false
When tier2Visible recomputes
Then tier2Visible = false on mobile
```

### TC-C-080 — Tier 2 hidden mobile default (AC-1.1)

```gherkin
Given DashboardView rendered with mobile viewport mock, returning user income
When page loads
Then queryByTestId("dashboard-tier-2") is null
And KpiStrip stub not rendered
```

### TC-C-081 — Mi Día order preserved (AC-1.2)

```gherkin
Given DashboardView rendered mobile collapsed
When DOM queried
Then [data-day-overview] precedes [data-dashboard-hero]
And [data-dashboard-hero] precedes [data-testid="dashboard-tier2-toggle"]
```

### TC-C-082 — Hint when collapsed (AC-1.3)

```gherkin
Given DashboardTier2Toggle isExpanded = false
When rendered
Then text dashboard.tier2.hint visible
And hint uses text-sm or smaller than button label
```

### TC-C-083 — Expand copy es (AC-2.1)

```gherkin
Given locale es, collapsed
When DashboardTier2Toggle renders
Then button text = "Ver análisis del mes"
And aria-expanded = false
```

### TC-C-084 — Expand copy en (AC-2.1)

```gherkin
Given locale en, collapsed
When DashboardTier2Toggle renders
Then button text matches en.json dashboard.tier2.expand
And no hardcoded Spanish in HTML
```

### TC-C-085 — Expand reveals tier 2 (AC-2.2)

```gherkin
Given mobile hasIncome collapsed DashboardView
When user clicks [data-testid="dashboard-tier2-toggle"]
Then getByTestId("dashboard-tier-2") visible
And KpiStrip within tier 2 visible
```

### TC-C-086 — Collapse hides tier 2 (AC-2.3)

```gherkin
Given mobile expanded
When user clicks toggle (collapse label)
Then queryByTestId("dashboard-tier-2") null
And button text = dashboard.tier2.collapse
```

### TC-C-087 — Touch target 44px (AC-2.4)

```gherkin
Given DashboardTier2Toggle rendered mobile
When measuring button element
Then offsetHeight >= 44 and effective click area >= 44×44
```

### TC-C-088 — No toggle desktop (AC-4.1)

```gherkin
Given useMediaQuery min-width 768px = true
When DashboardView renders
Then queryByTestId("dashboard-tier2-toggle") null
```

### TC-C-089 — Desktop tier 2 visible (AC-4.2, EC-1)

```gherkin
Given viewport desktop mock hasIncome
When DashboardView renders without interaction
Then getByTestId("dashboard-tier-2") visible
```

### TC-C-090 — Fresh user forced collapse (AC-5.1, EC-3)

```gherkin
Given grossSalary = 0 and sessionStorage expanded = "true"
When DashboardView renders mobile
Then queryByTestId("dashboard-tier-2") null
And queryByTestId("dashboard-tier2-toggle") null
```

### TC-C-091 — Constitution XSS toggle (security)

```gherkin
Given i18n strings static
When DashboardTier2Toggle renders
Then no v-html in component
And copy from t() only
```

### TC-E-030 — E2E tier 2 hidden default (AC-1.1)

```gherkin
Given returningPage 390×844 with income seeded
When goto "/"
Then dashboard-tier-2 not visible
And KPI text (e.g. runway label) not visible without expand
```

### TC-E-031 — E2E Mi Día regresión (AC-1.2)

```gherkin
Given returningPage card due today + liquid assets
When goto "/" at 390×844
Then coverage badge (day.coverage.ok or shortfall) visible without scroll
# Reuses e2e/day-overview.spec.ts — must stay green in T-LAST
```

### TC-E-032 — E2E expand flow (AC-2.2)

```gherkin
Given mobile returning user
When click "Ver análisis del mes"
Then dashboard-tier-2 visible within 2s
```

### TC-E-033 — E2E collapse flow (AC-2.3)

```gherkin
Given tier 2 expanded
When click "Ocultar análisis"
Then dashboard-tier-2 not visible
```

### TC-E-034 — E2E nav persist (AC-3.1)

```gherkin
Given mobile expanded tier 2
When goto "/income" then goto "/"
Then dashboard-tier-2 still visible
```

### TC-E-035 — E2E fresh context collapsed (AC-3.2)

```gherkin
Given new browser context (no sessionStorage seed) mobile returning user
When goto "/"
Then dashboard-tier-2 not visible
```

### TC-E-036 — E2E desktop (AC-4.1, AC-4.2)

```gherkin
Given viewport 1280×720 returning user
When goto "/"
Then dashboard-tier-2 visible
And "Ver análisis del mes" not visible
```

### TC-I-020 — T-LAST regression gate

```gherkin
When npm test && npm run e2e
Then all green including day-overview + dashboard-tier2 specs
And coverage lib/ delta >= 0
```

## Mocking Strategy

| Dependency                | Real or Mock                        | Why                               |
| ------------------------- | ----------------------------------- | --------------------------------- |
| `dashboard-tier2-storage` | **Real**                            | Pure functions — unit without Vue |
| `sessionStorage`          | **Mock** (`Storage` stub)           | Deterministic AC-3.x              |
| `useMediaQuery`           | **Mock** via `@vueuse/core` vi.mock | Control mobile/desktop            |
| Pinia `incomeStore`       | **Real** (`createTestingPinia`)     | AC-5.1 grossSalary                |
| Chart.js / tier 2 cards   | **Stub** in component tests         | Isolate collapse logic            |
| DayOverview internals     | **Stub** optional                   | Order tests only need testids     |

## Performance

- Sin benchmark obligatorio; `v-if` tier 2 reduce DOM inicial en móvil (ADR-4).
- T-LAST tiempo total ≤ baseline + 15s (nuevos specs).

## Security

| Check                      | TC                | Criterio                    |
| -------------------------- | ----------------- | --------------------------- |
| sessionStorage key aislada | TC-U-026          | No write `finance_app_data` |
| Sin PII en sessionStorage  | TC-U-020          | Solo boolean string         |
| Sin `v-html` en toggle     | TC-C-091          | grep + render               |
| Sin cambio schema Zod      | Review + TC-U-026 | No migrate task             |
| Fixtures genéricos         | All               | Sin salarios reales         |

## Sign-off

- [x] Author — Johann Medina — 2026-06-04

## Next

`/sdd-signoff test_plan` → `/sdd-tasks`
