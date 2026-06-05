# Technical Plan: Dashboard progressive disclosure (mobile hierarchy)

> Spec: [1-spec.md](./1-spec.md) · Discovery: [0-discovery.md](./0-discovery.md) · Mode: `solo`  
> Plan version: **v1** · Created: `2026-06-04`

## Summary

Reorganizamos `DashboardView` en **Tier 1** (fijo: `DayOverview` + `DashboardHero`) y **Tier 2** (analítico existente envuelto en contenedor colapsable en móvil). Un composable `useDashboardTier2` gestiona estado expandido/colapsado, `sessionStorage` (solo UI), breakpoint `md` (768px) y guard `grossSalary === 0`. Sin cambio de schema, stores de dominio ni contenido de cards analíticas.

**No schema bump** — sessionStorage key aislada de `finance_app_data`.

## Architecture

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ views/                                                                      │
│  DashboardView [MODIFY]                                                     │
│    ├─ Tier 1 (always visible)                                               │
│    │    DayOverview [EXIST]                                                   │
│    │    DashboardHero [EXIST]                                                 │
│    │    DashboardTier2Toggle [NEW]  — v-if mobile + hasIncome                 │
│    └─ Tier 2 [wrapper div data-testid="dashboard-tier-2"]                   │
│         v-show / v-if tier2Visible                                            │
│         SavingsGapCard, KpiStrip, FinancialFreedomCompact, RunwayCard,        │
│         PassiveCoverageCompact, HealthScore, BudgetDonut, ProjectionChart,    │
│         SavingsProjectionChart [ALL EXIST — move only]                        │
│         │                                                                     │
│         ▼ composables                                                         │
│  useDashboardTier2 [NEW]                                                      │
│    — isDesktop (matchMedia md / @vueuse/useMediaQuery)                        │
│    — isExpanded (ref + sessionStorage sync)                                   │
│    — tier2Visible = isDesktop || (hasIncome && isExpanded)                    │
│    — canToggle = !isDesktop && hasIncome                                      │
│    — toggle(), read/write SESSION_KEY                                         │
│         │                                                                     │
│  incomeStore [READ]  — grossSalary > 0 → hasIncome                           │
│  i18n es.json + en.json [MODIFY] — dashboard.tier2.*                          │
│  e2e/dashboard-tier2.spec.ts [NEW]                                            │
│  tests/component/DashboardView.test.ts [MODIFY]                               │
│  tests/unit/composables/useDashboardTier2.test.ts [NEW]                       │
└────────────────────────────────────────────────────────────────────────────┘
```

### Components

| Component                   | Responsibility                                                                                                              | Layer                      | Covers                                                  |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ------------------------------------------------------- |
| `useDashboardTier2`         | Breakpoint ≥768px; sessionStorage read/write; `hasIncome` guard; expone `tier2Visible`, `canToggle`, `isExpanded`, `toggle` | `composables`              | AC-1.1, AC-3.1–AC-3.2, AC-4.1–AC-4.2, AC-5.1, EC-1–EC-3 |
| `DashboardTier2Toggle.vue`  | Botón outline ≥44px; copy `dashboard.tier2.expand/collapse`; hint `dashboard.tier2.hint`; `aria-expanded`                   | `components/dashboard`     | AC-1.3, AC-2.1, AC-2.3, AC-2.4, AC-4.1                  |
| `DashboardView` [MODIFY]    | Tier 1 sin cambio de orden; wrapper `data-testid="dashboard-tier-2"`; toggle entre hero y tier 2                            | `views`                    | AC-1.1–AC-1.2, AC-2.2, AC-4.2                           |
| `DayOverview`               | Sin cambios funcionales                                                                                                     | `components/dashboard/day` | AC-1.2 (regresión)                                      |
| `DashboardHero`             | Sin cambios funcionales                                                                                                     | `components/dashboard`     | AC-1.1 (tier 1)                                         |
| Cards tier 2 (8 existentes) | Sin cambios internos; solo reubicadas dentro del wrapper                                                                    | `components/dashboard`     | AC-2.2                                                  |
| `i18n`                      | `dashboard.tier2.expand`, `.collapse`, `.hint`                                                                              | `infra`                    | AC-2.1, AC-1.3                                          |
| `dashboard-tier2.spec.ts`   | E2E mobile collapse/expand + desktop visible                                                                                | `e2e`                      | AC-1.1, AC-2.2, AC-3.1, AC-4.2                          |

### Moment → component map

| User Moment | UI block                                | Covers                       |
| ----------- | --------------------------------------- | ---------------------------- |
| UM-1        | Tier 1: `DayOverview` + `DashboardHero` | AC-1.1, AC-1.2, AC-5.1       |
| UM-2        | Tier 2 wrapper + `DashboardTier2Toggle` | AC-2.1–AC-2.4, AC-4.1–AC-4.2 |
| UM-3        | `useDashboardTier2` sessionStorage      | AC-3.1, AC-3.2               |

## Existing assets & reuse

| Existing module                                | Reuse / extend / replace | Notes                                                               |
| ---------------------------------------------- | ------------------------ | ------------------------------------------------------------------- |
| `DashboardView.vue`                            | **Extend**               | Envolver líneas 55–92 actuales en tier 2; tier 1 = L51–53           |
| `DayOverview`, `DashboardHero`                 | **Reuse**                | Orden intacto (Mi Día antes de hero)                                |
| `SavingsGapCard` … `SavingsProjectionChart`    | **Reuse**                | Mismo orden interno que hoy dentro de tier 2                        |
| `useDashboardInsights`, `useHealthScore`, etc. | **Reuse**                | Composables del view sin cambio                                     |
| `incomeStore.state.grossSalary`                | **Read**                 | `hasIncome = grossSalary > 0` para AC-5.1                           |
| Tailwind `md:` breakpoint (768px)              | **Reuse**                | Alineado con spec OQ-1 y grids existentes en view                   |
| `@vueuse/core`                                 | **Extend**               | `useMediaQuery('(min-width: 768px)')` — ya dependencia del proyecto |
| `e2e/day-overview.spec.ts`                     | **Reuse**                | Regresión AC-1.2; no modificar asserts de cobertura                 |
| `tests/component/DashboardView.test.ts`        | **Extend**               | Tier 2 hidden mobile; visible desktop stub                          |

**No tocar:** lógica de cálculos, stores Pinia, schema Zod, rutas nav.

## Security & privacy

| Surface                 | Threat / concern                        | Mitigation                                                         | TC ref |
| ----------------------- | --------------------------------------- | ------------------------------------------------------------------ | ------ |
| sessionStorage          | Escritura UI fuera de schema financiero | Key dedicada `pf_dashboard_tier2_expanded`; boolean string; no PII | TC-U   |
| Persistencia financiera | Contaminar localStorage                 | **Prohibido** escribir preferencia en `finance_app_data`           | AC-3.2 |
| XSS                     | Copy i18n en toggle                     | `t()` keys estáticas; sin `v-html`                                 | TC-C   |
| Tests                   | —                                       | Fixtures sin datos reales                                          | TC-U/C |

No APIs, auth ni migración.

## Data Model

Sin cambios en `AppStateSchemaV3`.

| Fuente           | Campo / key                                           | Uso                          |
| ---------------- | ----------------------------------------------------- | ---------------------------- |
| `incomeStore`    | `grossSalary`                                         | Guard tier 2 expand (AC-5.1) |
| `sessionStorage` | `pf_dashboard_tier2_expanded` = `"true"` \| `"false"` | Memoria de sesión (AC-3.x)   |

## Contracts

```typescript
// composables/useDashboardTier2.ts

export const DASHBOARD_TIER2_SESSION_KEY = 'pf_dashboard_tier2_expanded'

export interface UseDashboardTier2 {
  /** Tier 2 content should render (desktop always true when hasIncome; mobile when expanded) */
  tier2Visible: ComputedRef<boolean>
  /** Toggle button visible (mobile + hasIncome only) */
  canToggle: ComputedRef<boolean>
  isExpanded: Ref<boolean>
  isDesktop: ComputedRef<boolean>
  hasIncome: ComputedRef<boolean>
  toggle: () => void
}

export function useDashboardTier2(): UseDashboardTier2
```

```typescript
// lib/dashboard-tier2-storage.ts (optional pure helper for unit tests)

export function readTier2Expanded(session: Storage | null): boolean
export function writeTier2Expanded(session: Storage | null, expanded: boolean): void
```

**UI testids:** `data-testid="dashboard-tier-2"`, `data-testid="dashboard-tier2-toggle"`.

**i18n keys:**

| Key                        | es                          | en (sketch)                 |
| -------------------------- | --------------------------- | --------------------------- |
| `dashboard.tier2.expand`   | Ver análisis del mes        | View monthly analysis       |
| `dashboard.tier2.collapse` | Ocultar análisis            | Hide analysis               |
| `dashboard.tier2.hint`     | KPIs, gráficos y proyección | KPIs, charts and projection |

## ADRs

### ADR-1: Estado de colapso en composable vs inline en view

- **Context:** 12 ACs tocan visibilidad, sessionStorage, breakpoint e income guard.
- **Options:**
  1. **`useDashboardTier2` composable** — testeable en unit; view delgado.
  2. **Lógica inline en `DashboardView`** — menos archivos; tests component más pesados.
- **Decision:** Option 1 (constitution: composables encapsulan lógica UI+store).
- **Consequences:** +1 composable + helper storage opcional. Reversal cost: low.
- **Covers:** AC-3.x, AC-4.x, AC-5.1

### ADR-2: sessionStorage vs localStorage vs Pinia para preferencia UI

- **Context:** Spec prohíbe persistir en datos financieros; discovery pide memoria de sesión.
- **Options:**
  1. **sessionStorage** — sobrevive navegación SPA; reset al cerrar pestaña (spec AC-3.2).
  2. **localStorage** — persiste entre sesiones (viola AC-3.2 negative).
  3. **Pinia store sin persist** — se pierde al recargar página dentro de sesión (viola AC-3.1 parcialmente si F5).
- **Decision:** Option 1 — sessionStorage.
- **Consequences:** F5 en misma pestaña mantiene estado (aceptable); nueva pestaña colapsada. Reversal cost: trivial (delete key).
- **Covers:** AC-3.1, AC-3.2

### ADR-3: Detección desktop — CSS-only vs JS `matchMedia`

- **Context:** AC-4.1 requiere ocultar toggle en desktop; AC-4.2 requiere tier 2 visible sin interacción.
- **Options:**
  1. **`useMediaQuery('(min-width: 768px)')`** — coherente con Tailwind `md`; maneja resize EC-1/EC-2.
  2. **Solo clases `hidden md:block`** — toggle podría quedar en DOM oculto; tests e2e ambiguos para AC-4.1.
- **Decision:** Option 1 — JS media query en composable + `v-if="canToggle"` en toggle.
- **Consequences:** Hidratación SSR N/A (SPA Vite). Reversal cost: low.
- **Covers:** AC-4.1, AC-4.2, EC-1, EC-2

### ADR-4: `v-if` vs `v-show` en tier 2 wrapper

- **Context:** Charts Chart.js costosos; spec IMP-006 difiere lazy mount.
- **Options:**
  1. **`v-if="tier2Visible"`** — desmonta charts al colapsar; menos DOM; remount al expandir.
  2. **`v-show`** — mantiene charts en DOM oculto; viola espíritu AC-1.1 (presente pero hidden).
- **Decision:** Option 1 — `v-if` para tier 2 en móvil colapsado.
- **Consequences:** Expandir re-inicializa charts (aceptable v1); alinea con “no visible”. Reversal cost: low.
- **Covers:** AC-1.1, AC-2.2, AC-2.3

## Assumption Register

| ID    | Assumption                                              | Impact if wrong                    | Verify by                               | Status     |
| ----- | ------------------------------------------------------- | ---------------------------------- | --------------------------------------- | ---------- |
| A-001 | Breakpoint desktop = 768px (`md` Tailwind)              | Toggle visible en tablet landscape | TC-C viewport 767 vs 768                | unverified |
| A-002 | `grossSalary > 0` define “usuario con ingresos”         | Fresh user ve tier 2 expandible    | AC-5.1 test + income fixture            | unverified |
| A-003 | sessionStorage disponible (no private mode block)       | Preferencia no persiste navegación | E2E AC-3.1; fallback: default collapsed | unverified |
| A-004 | Tier 1 (Mi Día + hero) cabe above fold con toggle extra | AC-1.2 regresión                   | E2E day-overview + visual 390×844       | unverified |
| A-005 | Remount charts al expandir no causa error visible       | UX glitch                          | Manual verify + component test stub     | unverified |

## Dependencies

- `@vueuse/core` (`useMediaQuery`) — ya en stack
- Pinia `incomeStore` hidratado
- Sin paquetes nuevos

## Rollout / Rollback

- **Feature flag:** No.
- **Rollout:** Merge → `npm test` → `npm run e2e` (dashboard-tier2 + day-overview) → verify 390×844 manual.
- **Rollback:**
  1. Revert `DashboardView` a layout plano (tier 2 sin wrapper).
  2. Eliminar `useDashboardTier2`, `DashboardTier2Toggle`, e2e spec.
  3. `sessionStorage.removeItem('pf_dashboard_tier2_expanded')` — opcional cleanup doc.
  4. Sin migración — localStorage financiero intacto.

## Risks

| Risk                                    | Impact | Mitigation                                                          |
| --------------------------------------- | ------ | ------------------------------------------------------------------- |
| Regresión Mi Día above fold             | Alto   | E2E day-overview en T-LAST; no insertar tier 2 antes de DayOverview |
| Chart remount flicker al expandir       | Medio  | ADR-4 aceptado; IMP-006 lazy mount futuro                           |
| sessionStorage blocked (Safari private) | Bajo   | Degradar a collapsed each navigation; AC-3.1 best-effort            |
| DashboardView tests break (orden DOM)   | Medio  | Actualizar stubs; tier 2 hidden by default mobile viewport mock     |

## AC traceability (quick)

| AC            | Primary owner                                         |
| ------------- | ----------------------------------------------------- |
| AC-1.1        | `DashboardView` + `useDashboardTier2` + `v-if` tier 2 |
| AC-1.2        | Regresión `DayOverview` order — no change             |
| AC-1.3        | `DashboardTier2Toggle` hint                           |
| AC-2.1–AC-2.4 | `DashboardTier2Toggle`                                |
| AC-2.2        | Wrapper `dashboard-tier-2`                            |
| AC-3.1–AC-3.2 | `useDashboardTier2` sessionStorage                    |
| AC-4.1–AC-4.2 | `useMediaQuery` + `canToggle` false desktop           |
| AC-5.1        | `hasIncome` guard overrides sessionStorage            |

## Sign-off

- [x] Author — Johann Medina — 2026-06-04

## Next

`/sdd-signoff plan` → `/sdt-test-plan`
