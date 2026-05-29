# Technical Plan: UX claridad — fase 1

> Plan version: **v1** · Mode: `solo` · Spec: [1-spec.md](./1-spec.md)  
> Slug: `20260529-ux-clarity-phase1`

## Summary

Reorganizar el **shell de navegación** (escritorio híbrido + móvil con 4 pestañas, iconos y bottom sheet) y la **pantalla de inicio** (héroe “disponible”, salud secundaria, KPIs en franja horizontal, i18n completo, frases de contexto en gráficos). Sin cambios en stores de dominio, esquema de persistencia ni fórmulas en `lib/calculations/`. Toda la lógica de montos reutiliza composables existentes (`useNetIncome`, `useHealthScore`, `useDTI`, `useAllocationStore`).

## Architecture

```text
┌──────────────────────────────────────────────────────────────────┐
│  App.vue (layout shell)                                          │
│    ├─ AppHeader.vue          ← logo, DesktopNav, theme, locale   │
│    ├─ RouterView             ← views/*                           │
│    └─ MobileBottomNav.vue    ← 4 tabs + NavBottomSheet           │
│                                                                  │
│  lib/navigation/nav-config.ts  ← única fuente de grupos/rutas    │
│  composables/useNavActive.ts   ← grupo/ítem activo por route.name│
│                                                                  │
│  DashboardView.vue                                             │
│    ├─ DashboardHero.vue      ← disponible + salud + CTA          │
│    ├─ KpiStrip.vue           ← KpiCard[] scroll-x móvil          │
│    ├─ BudgetDonut + insight                                      │
│    ├─ ProjectionChart + insight                                  │
│    └─ SavingsProjectionChart (sin cambio de layout mayor)        │
│                                                                  │
│  composables/useDashboardInsights.ts  ← textos derivados (app)   │
└──────────────────────────────────────────────────────────────────┘

Dependency rule (constitution): views → components → composables → stores → lib.
nav-config.ts vive en lib/ sin imports Vue; solo datos estáticos + tipos.
```

### Components

| Component / module                         | Responsibility                                                                                                                  | Layer | Covers                                             |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- | ----- | -------------------------------------------------- |
| `lib/navigation/nav-config.ts`             | Define 4 grupos (Inicio, Dinero, Plan, Más), hijos con `routeName`, `path`, `icon`, claves i18n                                 | cross | AC-3.1, AC-3.2, AC-4.2, AC-4.3, AC-4.4             |
| `composables/useNavActive.ts`              | Dado `route.name`, expone `activeGroupId`, `activeItemId`, si Inicio es directo                                                 | app   | AC-3.3                                             |
| `components/common/DesktopNav.vue`         | Nav escritorio: enlace Inicio + 3 triggers dropdown (clic, no hover-only)                                                       | app   | AC-3.1, AC-3.4, AC-3.5, AC-3.6                     |
| `components/common/NavDropdownMenu.vue`    | Panel hijos con `RouterLink`; cierre al navegar o clic fuera (`onClickOutside`)                                                 | app   | AC-3.2, AC-3.5, AC-3.6                             |
| `components/common/MobileBottomNav.vue`    | 4 tabs con `LucideIcon` + `t('nav.groups.*')`; emite abrir sheet o navega Inicio                                                | app   | AC-4.1, AC-4.6                                     |
| `components/common/NavBottomSheet.vue`     | Panel fijo inferior (`role="dialog"`), lista de destinos, swipe/cerrar                                                          | app   | AC-4.7, AC-4.8                                     |
| `App.vue`                                  | Integra `DesktopNav` + `MobileBottomNav`; `main` con `pb-16 md:pb-0`; elimina listas planas `ALL_NAV` / `MOBILE_NAV` duplicadas | app   | AC-3.2, AC-4.5, EC-2                               |
| `components/dashboard/DashboardHero.vue`   | Zona superior: disponible (`text-3xl+`), salud compacta, `ComparisonBadge`, CTA distribución, empty sin ingreso                 | app   | AC-1.1, AC-1.2, AC-1.3, AC-1.4, AC-1.5, EC-1, EC-4 |
| `components/dashboard/KpiStrip.vue`        | Contenedor `overflow-x-auto flex gap-3` con `KpiCard` tamaño secundario; excluye duplicar “Disponible” como héroe               | app   | AC-2.1, AC-2.2                                     |
| `composables/useDashboardInsights.ts`      | `donutInsight`, `projectionInsight`, `hasDonutData`, `hasProjectionData` desde stores/composables                               | app   | AC-6.1, AC-6.2, AC-6.3                             |
| `components/dashboard/BudgetDonut.vue`     | Slot o prop `insight` + `emptyMessage` vía i18n                                                                                 | app   | AC-6.1, AC-6.3                                     |
| `components/dashboard/ProjectionChart.vue` | Idem insight / empty                                                                                                            | app   | AC-6.2, AC-6.3                                     |
| `components/dashboard/HealthScore.vue`     | Prop `variant="compact"` — desglose colapsado por defecto en héroe                                                              | app   | AC-1.2                                             |
| `views/DashboardView.vue`                  | Orquesta hero → strip → charts; sin strings hardcodeadas                                                                        | app   | AC-1._, AC-2._, AC-5.1, AC-6.\*                    |
| `src/i18n/es.json`, `en.json`              | Claves `dashboard.*`, `nav.groups.*`, `nav.sheet.*`                                                                             | infra | AC-5.1, AC-5.2                                     |
| Tests component/e2e                        | DesktopNav, NavBottomSheet, DashboardHero, KpiStrip, i18n dashboard                                                             | infra | (traceados en test-plan)                           |

### AC coverage matrix (quick reference)

| AC         | Primary owner                                            |
| ---------- | -------------------------------------------------------- |
| AC-1.1–1.5 | `DashboardHero.vue`                                      |
| AC-2.1–2.2 | `KpiStrip.vue` + `DashboardView.vue`                     |
| AC-3.1–3.6 | `DesktopNav.vue`, `NavDropdownMenu.vue`, `nav-config.ts` |
| AC-4.1–4.8 | `MobileBottomNav.vue`, `NavBottomSheet.vue`, `App.vue`   |
| AC-5.1–5.2 | `DashboardView.vue` + i18n                               |
| AC-6.1–6.3 | `useDashboardInsights.ts` + donut/projection components  |

## Data Model

**Sin cambios de persistencia.** No se añaden campos a `AppStateSchemaV3`. Los datos mostrados provienen de stores existentes:

| Dato UI               | Fuente actual                                          |
| --------------------- | ------------------------------------------------------ |
| Disponible héroe      | `useNetIncome().freeForAllocation`                     |
| Ingreso neto (KPI)    | `useNetIncome().netIncome`                             |
| Salud + desglose      | `useHealthScore().result`                              |
| Delta vs mes anterior | `snapshotsStore` + `ComparisonBadge`                   |
| Insight donut         | `allocationStore` % + `netIncome` → monto ahorros      |
| Insight proyección    | `projectionMonths` / `freeForAllocation` acumulado M12 |

## Contracts

### Nav config (`lib/navigation/nav-config.ts`)

```ts
export type NavGroupId = 'home' | 'money' | 'plan' | 'more'

export interface NavItem {
  id: string
  routeName: string // Vue Router name
  path: string
  i18nKey: string
  icon: string // lucide kebab name
}

export interface NavGroup {
  id: NavGroupId
  i18nKey: string
  icon?: string
  directLink?: boolean // true solo para home en desktop
  children: NavItem[]
}
```

**Grupos (v1):**

| Grupo | `directLink` desktop  | Hijos (`routeName`)                    |
| ----- | --------------------- | -------------------------------------- |
| home  | sí → `/`              | —                                      |
| money | no (dropdown / sheet) | income, expenses, variable, allocation |
| plan  | no                    | debts, goals                           |
| more  | no                    | networth, history, settings            |

### i18n keys (nuevas)

```text
nav.groups.home | money | plan | more
nav.sheet.titleMoney | titlePlan | titleMore
dashboard.title
dashboard.hero.availableLabel | emptyIncome | ctaAllocation
dashboard.kpi.netIncome | fixedExpenses | debtPayments | dti
dashboard.insight.donut | projection
dashboard.health.labelOk | labelWarn | ...
```

Todas las claves deben existir en `es.json` y `en.json` antes de merge (constitution).

### Bottom sheet behavior

- Estado: `openSheet: NavGroupId | null` en `MobileBottomNav` (UI local, no Pinia).
- Abrir: tap en Dinero / Plan / Más.
- Cerrar: selección de `RouterLink`, botón cerrar, clic en overlay, tecla Escape (accesibilidad).
- “Swipe down”: implementación mínima — botón cerrar + overlay; arrastre opcional si `@vueuse/core` `useSwipe` encaja sin nueva dependencia (ADR-2).

## ADRs

### ADR-1: Fuente única de configuración de navegación

- **Context:** Hoy `App.vue` y `BottomNav.vue` duplican ítems; la spec exige 4 grupos y distinto comportamiento desktop/móvil.
- **Options:**
  1. **`lib/navigation/nav-config.ts`** — un array exportado; App y nav components lo importan. Pros: DRY, tests unitarios del mapa; Contras: archivo nuevo cross-layer.
  2. **Mantener arrays en `App.vue`** — Pros: menos archivos; Contras: duplicación, riesgo de desincronizar móvil/escritorio.
- **Decision:** Opción 1.
- **Consequences:** Cualquier ruta nueva exige una entrada en `nav-config` + test de cobertura de rutas.
- **Covers:** AC-3.1, AC-3.2, AC-4.2–AC-4.4

### ADR-2: Primitivas radix-vue para dropdown y bottom sheet

- **Context:** Constitution exige `radix-vue` para diálogos accesibles; el proyecto aún no lo usa en producción (solo `ConfirmDialog` custom).
- **Options:**
  1. **`DropdownMenuRoot` (desktop) + `DialogRoot` (sheet móvil)** con estilos Tailwind — foco, Escape, aria. Pros: accesibilidad, alineado a constitution; Contras: curva de aprendizaje.
  2. **HTML/CSS custom** (`<details>`, div fixed) — Pros: rápido; Contras: peor a11y, más tests manuales.
  3. **Reutilizar solo `BottomNav.vue` existente** sin sheet — Pros: mínimo diff; Contras: no cumple AC-4.7/4.8.
- **Decision:** Opción 1.
- **Consequences:** `ConfirmDialog` puede quedarse; nav usa radix por separado. Documentar patrón en componentes para fase visual posterior.
- **Covers:** AC-3.5, AC-3.6, AC-4.7, AC-4.8

### ADR-3: Composable `useDashboardInsights` vs strings en vista

- **Context:** AC-6.x exige frases derivadas de datos reales y vacío sin inventar cifras.
- **Options:**
  1. **`useDashboardInsights`** — centraliza copy + `formatCurrency`. Pros: testeable, vista delgada; Contras: un archivo más.
  2. **Inline en `DashboardView`** — Pros: menos archivos; Contras: difícil de testear, mezcla layout y copy.
- **Decision:** Opción 1.
- **Consequences:** Tests unitarios del composable con `createTestingPinia` y fixtures de allocation/net income.
- **Covers:** AC-6.1, AC-6.2, AC-6.3

### ADR-4: `DashboardHero` vs extender solo `KpiCard`

- **Context:** AC-1.1 exige jerarquía tipográfica que `KpiCard` actual no modela.
- **Options:**
  1. **Nuevo `DashboardHero.vue`** — Pros: semántica clara (`<header>` héroe); Contras: componente adicional.
  2. **Prop `size="hero"` en `KpiCard`** — Pros: reutiliza tarjeta; Contras: mezcla patrones card/hero, HealthScore sigue aparte.
- **Decision:** Opción 1 — hero compone monto + `HealthScore` compact + badge + CTA.
- **Covers:** AC-1.1, AC-1.2, AC-1.3, AC-1.5

## Assumption Register

| ID    | Assumption                                                                                                       | Impact if wrong | Verify by                                                                    | Status     |
| ----- | ---------------------------------------------------------------------------------------------------------------- | --------------- | ---------------------------------------------------------------------------- | ---------- |
| A-001 | `freeForAllocation` del composable `useNetIncome` es el “disponible” que debe mostrar el héroe                   | H               | Comparar con spec de cálculos financieros; test componente con Pinia fixture | unverified |
| A-002 | `ComparisonBadge` con `previousScore` del último snapshot es aceptable como “vs mes anterior” para salud         | M               | AC-1.4 manual + test con 0/1 snapshots                                       | unverified |
| A-003 | `radix-vue` 1.9 expone `DropdownMenu` y `Dialog` estables en Vue 3.5                                             | M               | Spike en T-setup o import en Story/test                                      | unverified |
| A-004 | Breakpoint `md` (768px) de Tailwind alinea con spec (767 móvil / 768 escritorio)                                 | L               | Tests con viewport Playwright 390 y 1024                                     | unverified |
| A-005 | No hace falta retirar `Disponible` del grid si el héroe ya lo muestra — se omite tarjeta duplicada en `KpiStrip` | L               | Revisión visual AC-2.1                                                       | unverified |

Registrar en `_ids.yaml` como entradas `assumptions[]`.

## Dependencies

- Sin nuevas dependencias npm.
- Usa: `radix-vue`, `lucide-vue-next`, `@vueuse/core` (opcional swipe), `vue-i18n`, composables/stores existentes.

## Rollout / Rollback

- **Feature flag:** ninguno (cambio UI directo).
- **Rollout:** merge a `main` → build estático habitual.
- **Rollback:**
  1. `git revert <merge-commit>`
  2. `npm run build && npm test` en la rama revertida
  3. Usuarios: sin migración de datos; solo cambia shell/nav/dashboard

## Risks

| Risk                                          | Impact | Mitigation                                                      |
| --------------------------------------------- | ------ | --------------------------------------------------------------- |
| Regresión E2E de rutas (`e2e/*.spec.ts`)      | M      | Actualizar selectores nav; checklist 10 rutas en verify         |
| Radix sheet bloquea scroll del body           | L      | `pointer-events` / `body` scroll lock solo cuando sheet abierto |
| Hero no cabe en 390×844 con fuente grande COP | M      | `tabular-nums`, `text-clamp` / `min(text-3xl, …)` (EC-1)        |
| Tests `BottomNav.test.ts` obsoletos           | M      | Reemplazar por `MobileBottomNav` + `NavBottomSheet`             |
| Duplicar “Disponible” en hero y strip         | L      | `KpiStrip` excluye `type="free"` (A-005)                        |

## Testing strategy (preview for test-plan)

| Área                                      | Tipo sugerido      |
| ----------------------------------------- | ------------------ |
| `nav-config` rutas ↔ router names         | unit               |
| `useDashboardInsights` vacío vs datos     | unit               |
| `DashboardHero` empty income, CTA         | component          |
| `DesktopNav` abre/cierra dropdown clic    | component          |
| `NavBottomSheet` destinos Dinero/Plan/Más | component          |
| i18n dashboard keys paridad               | unit o grep script |
| Navegación móvil 2 toques a `/goals`      | e2e Playwright     |

## Sign-off

- [x] Author: `Johann Medina` — `2026-05-29`
