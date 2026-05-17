# Technical Plan — Sprint 1: Personal Finance App Improvements

**Feature:** `20260516-sprint1-mejoras-finanzas`  
**Spec:** [1-spec.md](1-spec.md) (signed 2026-05-16)  
**Status:** Draft

---

## 1. Architecture Overview

Five user stories grouped by impact area. No new persisted state — all changes operate on existing arrays (`deductions[]`, `nonSalaryBenefits[]`) and existing entry points (`main.ts` boot cycle, dashboard/income views, Colombia preset library).

```
                                   ┌──────────────────────────────┐
                                   │  views/                      │
   ┌────────────────────────────┐  │  ├─ DashboardView   (US-2/3) │
   │  components/common/        │  │  └─ IncomeView      (US-5)   │
   │  └─ StorageErrorToast      │◄─┤                              │
   └──────────────▲─────────────┘  │  components/                 │
                  │                │  ├─ dashboard/               │
   ┌──────────────┴─────────────┐  │  │  ├─ KpiCard       (US-2)  │
   │  composables/              │◄─┤  │  ├─ HealthScore   (US-2)  │
   │  ├─ useStorageError (US-1) │  │  │  └─ EmptyStateGuide(US-3) │
   │  ├─ useDashboardGuide(US-3)│  │  └─ income/                  │
   │  ├─ useTransport… (US-5)   │  │     └─ TransportAllowance…   │
   │  └─ useFinancialGlossary…  │  │                       (US-5) │
   │           (US-2)           │  └──────────────────────────────┘
   └──────────────▲─────────────┘
                  │ reads
   ┌──────────────┴─────────────┐
   │  stores/                   │
   │  └─ incomeStore (US-4)     │   actions: applyColombiaPresets
   └──────────────▲─────────────┘
                  │ pure calls
   ┌──────────────┴─────────────┐
   │  lib/                      │
   │  └─ tax/colombia/          │
   │     ├─ constants.ts (NEW)  │   SMMLV_2025, AUXILIO_TRANSPORTE_2025
   │     └─ presets.ts (EXT)    │   adds solidarity fund branch
   └────────────────────────────┘

   main.ts (US-1): capture parseError from loadAppState → setError()
```

Data flow direction: arrows point inward (views consume composables consume stores consume lib). No reverse imports.

---

## 2. Component Matrix (AC Coverage)

| Component | Path | Type | Covers |
|---|---|---|---|
| `main.ts` parseError capture | `src/main.ts` | EXT | AC-1.1, AC-1.4 |
| `useStorageError` (extend) | `src/composables/useStorageError.ts` | EXT | AC-1.1, AC-1.2, AC-1.3, AC-1.4 |
| `StorageErrorToast` (verify) | `src/components/common/StorageErrorToast.vue` | EXT | AC-1.1, AC-1.2, AC-1.3 |
| `useFinancialGlossary` | `src/composables/useFinancialGlossary.ts` | NEW | AC-2.1, AC-2.2, AC-2.3, AC-2.4, AC-2.5 |
| `KpiCard` tooltip | `src/components/dashboard/KpiCard.vue` | EXT | AC-2.1, AC-2.6, AC-2.7 |
| `HealthScore` tooltips | `src/components/dashboard/HealthScore.vue` | EXT | AC-2.2, AC-2.3, AC-2.4, AC-2.5, AC-2.6, AC-2.7 |
| `useDashboardGuide` | `src/composables/useDashboardGuide.ts` | NEW | AC-3.1, AC-3.2, AC-3.3, AC-3.4 |
| `EmptyStateGuide` | `src/components/dashboard/EmptyStateGuide.vue` | NEW | AC-3.1, AC-3.2, AC-3.3, AC-3.4 |
| `DashboardView` (integrate) | `src/views/DashboardView.vue` | EXT | AC-3.1, AC-3.2, AC-3.4 |
| `tax/colombia/constants.ts` | `src/lib/tax/colombia/constants.ts` | EXT | AC-4.1, AC-5.1 |
| `tax/colombia/presets.ts` | `src/lib/tax/colombia/presets.ts` | EXT | AC-4.1, AC-4.2, AC-4.3, AC-4.4 |
| `incomeStore.applyColombiaPresets` | `src/stores/incomeStore.ts` | EXT | AC-4.1, AC-4.2, AC-4.3 |
| `useTransportAllowance` | `src/composables/useTransportAllowance.ts` | NEW | AC-5.1, AC-5.2, AC-5.3, AC-5.4, AC-5.5 |
| `TransportAllowanceSuggestion` | `src/components/income/TransportAllowanceSuggestion.vue` | NEW | AC-5.1, AC-5.2, AC-5.4, AC-5.5 |
| `IncomeView` (integrate) | `src/views/IncomeView.vue` | EXT | AC-5.1, AC-5.5 |
| i18n glossary keys | `src/i18n/es.json`, `src/i18n/en.json` | EXT | AC-2.1–2.5, AC-3.1–3.2, AC-5.1, AC-5.5 |

**NEW** = new file · **EXT** = existing file extended.

Coverage check: all 24 ACs from spec mapped to ≥1 component above. ✅

---

## 3. Architecture Decision Records

### ADR-1: Tooltip via radix-vue (TooltipProvider/Root/Trigger/Content)

**Context:** Need accessible tooltips for 5 financial terms (DTI, housing, emergency, savings, health score) with keyboard support and viewport-aware positioning on mobile (375 px).

**Alternatives considered:**

| Option | Pros | Cons |
|---|---|---|
| **A. radix-vue Tooltip** (chosen) | Already in stack; ARIA + keyboard built-in; collision detection | Adds 1 extra wrapper per metric |
| B. Custom Tooltip.vue + `aria-describedby` | No new dependency | Need to implement collision detection (R-3 risk); ~120 LOC |
| C. Pure CSS `:hover` pseudo + `title` attr | Zero JS | No keyboard focus support → fails AC-2.7; no mobile tap support |

**Decision:** Use `radix-vue` `TooltipRoot` / `TooltipTrigger` / `TooltipContent` components.

**Consequences:** All tooltip content lives in i18n keys (`glossary.dti.title`, `glossary.dti.body`). The `useFinancialGlossary` composable returns the translated object per term. Single `<TooltipProvider>` at App.vue root (one-time setup).

---

### ADR-2: Solidarity fund as a regular deduction entry with reserved id `__solidarity__`

**Context:** Solidaridad pensional (1%) needs to be idempotent across multiple `applyColombiaPresets` calls (AC-4.3) and identifiable for future updates (e.g. multi-tier rates above 16 SMMLV).

**Alternatives considered:**

| Option | Pros | Cons |
|---|---|---|
| **A. Reserved id `__solidarity__`** (chosen) | Consistent with existing `__prima__` pattern (ADR-6 of previous feature); upsert is trivial via `findIndex(id)` | Reserved IDs are a convention, not a type guarantee |
| B. New `isSolidarity` flag on deduction shape | Type-safe | Schema migration required (v3→v4); risk of breaking existing data |
| C. Match by label "Fondo de Solidaridad" | No schema change | Label-based equality is fragile (locale, casing) |

**Decision:** Use reserved id `__solidarity__` — mirrors the prima pattern, no schema migration.

**Consequences:** `incomeStore` schema accepts id as `union(UUID, '__prima__', '__solidarity__')`. Idempotency is enforced in the preset function via id lookup.

---

### ADR-3: Empty-state banner is inline at top of dashboard, not full-screen overlay

**Context:** New user dashboard shows zeros across all KPIs. Need guidance without hiding the dashboard structure entirely.

**Alternatives considered:**

| Option | Pros | Cons |
|---|---|---|
| **A. Inline banner above KPI grid** (chosen) | User sees app structure + clear CTA; non-disruptive once data starts to flow | One more visual element on the dashboard |
| B. Full-screen overlay until first income entered | Maximum focus on next action | Hides health-score-zero state which is itself a learning signal; harder to dismiss |
| C. Modal dialog | Familiar pattern | Disruptive; tap-to-dismiss vs. CTA confusion |

**Decision:** Inline banner. Disappears automatically (AC-3.3) as soon as the missing data is added.

**Consequences:** `EmptyStateGuide.vue` is a simple `v-if`-rendered card. No state to persist — the banner re-derives visibility on each render from `useDashboardGuide` (`{ shouldShow, ctaTarget, ctaLabel }`).

---

### ADR-4: Banner dismissals stored in module-level `ref`, not `sessionStorage`

**Context:** AC-5.4 says the transport-allowance banner stays dismissed for "the remainder of the session." Need a session-scoped store of dismissals.

**Alternatives considered:**

| Option | Pros | Cons |
|---|---|---|
| **A. Module-level `ref<boolean>` in composable** (chosen) | Zero new persistence layer; simpler tests | Reload restores banner — but spec says "session" so this is correct |
| B. `sessionStorage` | Survives accidental tab refresh | Adds another persistence vector that bypasses Zod validation (Constitution risk); test setup heavier |
| C. New field in `settings` store | Persistent | "Session" requirement explicitly excludes persistence |

**Decision:** Module-level singleton `ref` inside `useTransportAllowance`. Tests reset by re-importing the module via `vi.resetModules()`.

**Consequences:** Banner re-appears on page reload if salary still ≤ 2 SMMLV and benefit not added. This matches the spec's "session" wording.

---

### ADR-5: Colombian payroll constants live in `lib/tax/colombia/constants.ts` with inline legal citations

**Context:** SMMLV ($1,423,500), Auxilio de transporte ($200,000), UVT (already $49,799) are all annually-revised legal constants. Hardcoding without citation creates silent staleness.

**Alternatives considered:**

| Option | Pros | Cons |
|---|---|---|
| **A. Extend existing `constants.ts` with citations + year suffix** (chosen) | One file for all CO payroll constants; cite Decreto/Resolución inline; existing pattern with UVT_2025 | Annual update touches one file (acceptable) |
| B. Separate `smmlv.ts` / `transport.ts` files | Smaller files | Splits a logically cohesive group; more imports |
| C. Externalize to JSON/config | "Data not code" | Loses TypeScript typing; runtime parsing overhead; no autocomplete |

**Decision:** Add `SMMLV_2025 = 1_423_500` (cite Decreto 1572 de 2024) and `AUXILIO_TRANSPORTE_2025 = 200_000` (cite Decreto 1572 de 2024) to existing `constants.ts`. Suffix `_2025` makes annual updates explicit.

**Consequences:** Annual maintenance task documented in CLAUDE.md. Test verifies `SOLIDARITY_THRESHOLD === SMMLV_2025 * 4`.

---

## 4. Risks

| ID | Risk | Severity | Mitigation |
|---|---|---|---|
| R-1 | SMMLV / Auxilio transporte change yearly — constants become stale | Medium | Inline `// SMMLV 2025 — Decreto 1572/2024` comments; T-LAST verifies constants present; annual reminder noted in CLAUDE.md |
| R-2 | radix-vue Tooltip portal may render outside theme `<div>` → wrong dark-mode colors | Low | TooltipContent uses Tailwind dark variants directly; manual smoke test in both themes |
| R-3 | Keyboard focus on metric labels conflicts with surrounding `<button>` focus order | Low | Add `tabindex="0"` to label spans; test with `userEvent.tab()` in component tests |
| R-4 | User adds transport allowance manually with custom amount ($150K) — suggestion banner could surprise them by offering $200K | Low | AC-5.3: if any `nonSalaryBenefit` with label matching `/^auxilio.*transporte/i` exists, banner is suppressed |
| R-5 | Empty-state banner could oscillate (show/hide) if user is mid-typing and the form auto-saves | Low | `useDashboardGuide` reads committed store state, not draft form state |

---

## 5. Constitution Compliance

- ✅ `lib/tax/colombia/constants.ts` and `presets.ts` — pure functions, no Vue/Pinia.
- ✅ All UI strings via `t('key')`; i18n keys to be added in both `es.json` and `en.json` before component impl tasks run.
- ✅ Colombian payroll constants cite legal source inline (Decreto 1572/2024).
- ✅ No new `v-html` usage; tooltip content rendered via `{{ }}` interpolation.
- ✅ No new sequential or `Math.random()` IDs; reserved `__solidarity__` is a string literal, not a generated ID.
- ✅ No `console.log` in production paths.
- ✅ No `lib/` import of Vue or Pinia.
- ✅ No `Options API` usage.

**Constitution Exceptions:** none.

---

## 6. Rollback Plan

Each user story is independently revertable. To roll back the whole feature:

```bash
git checkout main
git branch -D feature/20260516-sprint1-mejoras-finanzas
```

Per-story partial rollback (if a single AC breaks):

| Story | Files to revert |
|---|---|
| US-1 | `src/main.ts`, `src/composables/useStorageError.ts` |
| US-2 | `src/composables/useFinancialGlossary.ts`, `src/components/dashboard/KpiCard.vue`, `src/components/dashboard/HealthScore.vue`, glossary keys in `src/i18n/*.json` |
| US-3 | `src/composables/useDashboardGuide.ts`, `src/components/dashboard/EmptyStateGuide.vue`, `src/views/DashboardView.vue` (revert just the EmptyStateGuide import + render block) |
| US-4 | `src/lib/tax/colombia/presets.ts`, `src/lib/tax/colombia/constants.ts` (revert `SMMLV_2025` + threshold constant), `src/stores/incomeStore.ts` (revert applyColombiaPresets signature change) |
| US-5 | `src/composables/useTransportAllowance.ts`, `src/components/income/TransportAllowanceSuggestion.vue`, `src/views/IncomeView.vue` (revert just the suggestion component render) |

No data migration required → no rollback risk from corrupted persisted state.

---

## 7. Dependencies

No new runtime dependencies. All required libraries (`radix-vue` Tooltip primitives, `lucide-vue-next` for the `Info` icon) already in `package.json`.

Dev/test dependencies: existing `@testing-library/vue`, `@pinia/testing`, `Vitest`, `Playwright` cover all new components and composables.

---

## 8. Out of Scope (carried from spec)

- Multi-tier solidarity rates above 16 SMMLV (>$22.7M).
- Auto-removal of solidarity / transport entries when thresholds are crossed.
- Tooltip content in English (Spanish only this sprint; structural i18n keys present in both files for future EN).
- Persistent banner dismissals across reloads.

---

## 9. Open Questions

None — all decisions resolved in ADRs above.

---

## Sign-off

- [x] Author: Johann Medina — 2026-05-16
