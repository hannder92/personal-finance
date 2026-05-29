# Test Plan: UX claridad — fase 1

> Spec: [1-spec.md](./1-spec.md) · Plan: [2-plan.md](./2-plan.md) · IDs: [\_ids.yaml](./_ids.yaml)  
> Mode: `solo` · Created: `2026-05-29`

## Pyramid

| Capa      | Objetivo                                           | ~% esfuerzo |
| --------- | -------------------------------------------------- | ----------- |
| Unit      | `nav-config`, `useDashboardInsights`, paridad i18n | 55%         |
| Component | Hero, nav, sheet, KPI strip, dashboard i18n        | 35%         |
| E2E       | Navegación 2 toques + héroe móvil                  | 10%         |

Sin mocks de cálculos financieros: `createTestingPinia()` con fixtures de stores para componentes.

## Spec Challenge Log

| AC     | Resultado | Notas                                                                       |
| ------ | --------- | --------------------------------------------------------------------------- |
| AC-1.1 | OK        | Viewport 390×844 verificable en component test (`resizeTo` / clase wrapper) |
| AC-1.2 | OK        | Jerarquía tipográfica observable por clases / orden DOM                     |
| AC-1.3 | OK        | Mensaje + enlace con `href` o `RouterLink` a ingresos                       |
| AC-1.4 | OK        | `ComparisonBadge` ya existe; integrar en hero                               |
| AC-1.5 | OK        | CTA visible cuando `freeForAllocation > 0`                                  |
| AC-2.1 | OK        | Orden DOM hero antes que strip                                              |
| AC-2.2 | OK        | Clases `overflow-x-auto` / scrollWidth > clientWidth                        |
| AC-3.1 | OK        | Cuatro grupos en DOM desktop                                                |
| AC-3.2 | OK        | Navegación vía `RouterLink` + router de prueba                              |
| AC-3.3 | OK        | `aria-current` o clase activa en grupo/ítem                                 |
| AC-3.4 | OK        | Clic Inicio sin panel dropdown                                              |
| AC-3.5 | OK        | Dropdown visible tras clic, no hover-only                                   |
| AC-3.6 | OK        | Panel oculto tras selección / clic fuera                                    |
| AC-3.7 | OK        | Clases `dark:text-slate-200` en enlaces dropdown y sheet                    |
| AC-4.1 | OK        | Cuatro tabs + SVG Lucide                                                    |
| AC-4.2 | OK        | Sheet lista 4 rutas Dinero                                                  |
| AC-4.3 | OK        | Sheet lista deudas + metas                                                  |
| AC-4.4 | OK        | Sheet lista patrimonio + historial + config                                 |
| AC-4.5 | OK        | `main` con clase `pb-16` en móvil                                           |
| AC-4.6 | OK        | Tab Inicio no emite `open-sheet`                                            |
| AC-4.7 | OK        | `role="dialog"` / panel visible                                             |
| AC-4.8 | OK        | Cierre y navegación                                                         |
| AC-5.1 | OK        | `locale` switch + textos dashboard                                          |
| AC-5.2 | OK        | Test unitario recorre claves `dashboard.*`                                  |
| AC-6.1 | OK        | String insight con monto formateado                                         |
| AC-6.2 | OK        | String insight proyección M12                                               |
| AC-6.3 | OK        | Empty state sin cifra inventada                                             |

**SPEC-CHALLENGE:** ninguno. **SPEC-GAP:** ninguno propuesto.

## Traceability Matrix

| AC ID              | TC IDs                       | Kind             | Test file / método                                               |
| ------------------ | ---------------------------- | ---------------- | ---------------------------------------------------------------- |
| AC-1.1             | TC-C-001                     | component        | `tests/component/DashboardHero.test.ts`                          |
| AC-1.2             | TC-C-001, TC-C-002           | component        | `DashboardHero.test.ts`, `HealthScore.test.ts` (variant compact) |
| AC-1.3             | TC-C-003                     | component        | `DashboardHero.test.ts`                                          |
| AC-1.4             | TC-C-004                     | component        | `DashboardHero.test.ts`                                          |
| AC-1.5             | TC-C-005                     | component        | `DashboardHero.test.ts`                                          |
| AC-2.1             | TC-C-006                     | component        | `tests/component/KpiStrip.test.ts`                               |
| AC-2.2             | TC-C-007                     | component        | `KpiStrip.test.ts` (viewport estrecho)                           |
| AC-3.1             | TC-C-010, TC-U-001           | component + unit | `DesktopNav.test.ts`, `tests/unit/navigation/nav-config.test.ts` |
| AC-3.2             | TC-U-001, TC-C-011           | unit + component | `nav-config.test.ts`, `DesktopNav.test.ts`                       |
| AC-3.3             | TC-C-011                     | component        | `DesktopNav.test.ts` + `useNavActive.test.ts`                    |
| AC-3.4             | TC-C-012                     | component        | `DesktopNav.test.ts`                                             |
| AC-3.5             | TC-C-013                     | component        | `DesktopNav.test.ts`                                             |
| AC-3.6             | TC-C-014                     | component        | `DesktopNav.test.ts`                                             |
| AC-3.7             | TC-C-033, TC-C-034           | component        | `DesktopNav.test.ts`, `NavBottomSheet.test.ts`                   |
| AC-4.1             | TC-C-020                     | component        | `tests/component/MobileBottomNav.test.ts`                        |
| AC-4.2             | TC-C-021                     | component        | `NavBottomSheet.test.ts`                                         |
| AC-4.3             | TC-C-022                     | component        | `NavBottomSheet.test.ts`                                         |
| AC-4.4             | TC-C-023                     | component        | `NavBottomSheet.test.ts`                                         |
| AC-4.5             | TC-C-024                     | component        | `tests/component/AppShell.test.ts` (wrapper App layout)          |
| AC-4.6             | TC-C-025                     | component        | `MobileBottomNav.test.ts`                                        |
| AC-4.7             | TC-C-026                     | component        | `NavBottomSheet.test.ts`                                         |
| AC-4.8             | TC-C-027                     | component        | `NavBottomSheet.test.ts`                                         |
| AC-5.1             | TC-C-030                     | component        | `tests/component/DashboardViewReactive.test.ts` (ampliar)        |
| AC-5.2             | TC-U-002                     | unit             | `tests/unit/i18n/dashboard-keys-parity.test.ts`                  |
| AC-6.1             | TC-U-010, TC-C-031           | unit + component | `useDashboardInsights.test.ts`, `BudgetDonut.test.ts`            |
| AC-6.2             | TC-U-011, TC-C-032           | unit + component | `useDashboardInsights.test.ts`, `ProjectionChart.test.ts`        |
| AC-6.3             | TC-U-012, TC-C-031, TC-C-032 | unit + component | insights vacíos + donut/projection empty                         |
| ALL                | TC-I-001                     | integration      | `npm test` suite completa (regresión)                            |
| AC-3.2, AC-4.2–4.4 | TC-E-001                     | e2e              | `e2e/nav-groups.spec.ts`                                         |
| AC-1.1, AC-4.5     | TC-E-002                     | e2e              | `e2e/dashboard-hero-mobile.spec.ts`                              |

**Cobertura:** 24/24 AC con ≥1 TC.

## Acceptance Scenarios

### TC-U-001 — Config de navegación (AC-3.1, AC-3.2)

```gherkin
Given el módulo nav-config exportado
When leo los cuatro grupos y sus hijos
Then el grupo money incluye routeName income, expenses, variable, allocation
And el grupo plan incluye debts, goals
And el grupo more incluye networth, history, settings
And cada routeName coincide con una ruta declarada en el router de la app
```

### TC-U-002 — Paridad i18n dashboard (AC-5.2)

```gherkin
Given las claves bajo el prefijo dashboard en es.json
When comparo con en.json
Then cada clave existe en ambos archivos con valor no vacío
```

### TC-U-010 — Insight donut (AC-6.1)

```gherkin
Given allocation needs 50 wants 30 savings 20 y netIncome 10_000_000
When llamo useDashboardInsights().donutInsight
Then el texto incluye el monto de ahorros 2_000_000 formateado y el 20%
```

### TC-U-011 — Insight proyección (AC-6.2)

```gherkin
Given freeForAllocation 1_000_000
When llamo useDashboardInsights().projectionInsight
Then el texto menciona el acumulado a 12 meses de 12_000_000 (o equivalente en copy i18n)
```

### TC-U-012 — Sin insight sin datos (AC-6.3)

```gherkin
Given grossSalary 0 y allocation en cero
When hasDonutData y hasProjectionData
Then hasDonutData es false y donutInsight es null
And el componente muestra clave dashboard.empty.donut
```

### TC-C-001 — Héroe visible en móvil (AC-1.1, AC-1.2)

```gherkin
Given Pinia con ingreso y gastos; viewport wrapper 390x844
When renderizo DashboardHero
Then el elemento [data-testid="hero-available"] está en el documento
And su font-size computado es mayor que el de [data-testid="hero-health-score"]
```

### TC-C-003 — Sin ingreso (AC-1.3)

```gherkin
Given incomeStore grossSalary 0
When renderizo DashboardHero
Then no aparece monto positivo de disponible
And aparece enlace con destino /income
```

### TC-C-005 — CTA distribución (AC-1.5)

```gherkin
Given freeForAllocation 500_000
When renderizo DashboardHero
Then existe enlace o botón [data-testid="cta-allocation"] con href /allocation
```

### TC-C-007 — KPI strip horizontal (AC-2.2)

```gherkin
Given viewport 375px de ancho
When renderizo KpiStrip con 4 tarjetas
Then el contenedor tiene overflow-x-auto
And el scrollWidth del contenedor es mayor que clientWidth
```

### TC-C-013 — Dropdown al clic (AC-3.5)

```gherkin
Given DesktopNav en viewport md
When hago clic en el trigger "nav.groups.money" sin hover previo
Then el menú [data-testid="nav-dropdown-money"] es visible
```

### TC-C-014 — Cierre dropdown (AC-3.6)

```gherkin
Given menú money abierto
When hago clic en un RouterLink hijo o fuera del menú
Then el menú no es visible
```

### TC-C-033 / TC-C-034 — Legibilidad en tema oscuro (AC-3.7)

```gherkin
Given document.documentElement con clase "dark"
When abro el menú desplegable money en DesktopNav
Then el enlace "Ingresos" incluye estilo de texto claro para tema oscuro (p. ej. dark:text-slate-200)
When abro NavBottomSheet con groupId money
Then cada enlace de destino y el botón Cerrar incluyen estilo de texto claro para tema oscuro
```

### TC-C-026 / TC-C-027 — Bottom sheet (AC-4.7, AC-4.8)

```gherkin
Given MobileBottomNav
When hago clic en tab Plan
Then NavBottomSheet muestra role dialog y enlaces /debts y /goals
When hago clic en /goals
Then el sheet se cierra y router push a goals
```

### TC-C-030 — Idioma en dashboard (AC-5.1)

```gherkin
Given DashboardView con locale es
When cambio locale a en
Then el título y etiquetas KPI usan strings en inglés (ej. "Available" no "Disponible")
```

### TC-E-001 — Dos toques a metas (AC-3.2, AC-4.3)

```gherkin
Given app en viewport móvil 390x844
When abro la app en /
And toco tab Plan
And toco Metas en el sheet
Then la URL contiene /goals
```

### TC-E-002 — Héroe sin scroll (AC-1.1, AC-4.5)

```gherkin
Given usuario con datos de ingreso en localStorage fixture
When navego a /
Then [data-testid="hero-available"] está en viewport según boundingBox
And el footer nav no solapa el último elemento del main al scroll end
```

### TC-I-001 — Regresión suite (todos los AC)

```gherkin
Given rama feature con cambios UX
When ejecuto npm test
Then exit code 0 y cobertura global no disminuye respecto a baseline
```

## Mocking Strategy

| Dependency        | Real / Mock                                  | Why                             |
| ----------------- | -------------------------------------------- | ------------------------------- |
| Pinia stores      | Real (`createTestingPinia` + `initialState`) | AC dependen de montos derivados |
| vue-router        | Real (`createRouter` memory history)         | AC navegación                   |
| vue-i18n          | Real plugin con `es.json`/`en.json`          | AC-5.x                          |
| Chart.js          | Mock global existente en `tests/setup.ts`    | Evitar teardown async           |
| radix-vue portals | Real en jsdom                                | Validar dialog/sheet a11y       |
| localStorage E2E  | Fixture Playwright `storageState`            | Persistencia E2E                |

## Performance

No hay AC de latencia. **Manual opcional:** Lighthouse en `/` móvil — sin umbral bloqueante en esta fase (out of spec).

## Security

Sin AC de auth. Verificar que insights y hero usan `{{ }}` / `t()` — **no** `v-html` con datos de store (constitution).

## Assumption verification (plan → tests)

| ID    | Verificado por                                                       |
| ----- | -------------------------------------------------------------------- |
| A-001 | TC-C-001, TC-C-005 con fixture `freeForAllocation` conocido          |
| A-002 | TC-C-004 con 0 y 1 snapshot                                          |
| A-003 | TC-C-013 (import radix en DesktopNav) — falla temprano si API cambia |
| A-004 | TC-C-007, TC-E-002 viewports                                         |
| A-005 | TC-C-006 assert no KpiCard type=free en strip                        |

## Sign-off

- [x] Author: `Johann Medina` — `2026-05-29`
