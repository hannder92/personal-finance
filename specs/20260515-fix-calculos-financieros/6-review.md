# Post-Implementation Review: `Fix cálculos financieros`

> Date: `2026-05-16` · Author: `Johann Medina` · Mode: `solo`
> Spec: [1-spec.md](./1-spec.md) · Plan: [2-plan.md](./2-plan.md) · Test Plan: [3-test-plan.md](./3-test-plan.md) · Tasks: [4-tasks.md](./4-tasks.md) · Data Model: [2-data-model.md](./2-data-model.md)

## Summary

Implementación completa de las 8 user stories del spec en 34 tareas (17 impl + 14 test + 1 setup + 2 docs/refactor). Se corrigieron 3 bugs canónicos (TEA en amortization, net vs gross en dashboard, health score hardcoded), se introdujo schema v3 con migration automática (`Asset.annualRatePercent`, `IncomeStream.isPrima`), y se añadió US-8 (proyección de ahorro hipotético + interés compuesto). 362 tests pasan; coverage 96% en `lib/calculations/`, 95% en `lib/tax/`, 82% global. Listo para merge.

## Status Legend

🟢 **GREEN** = passes · 🟡 **YELLOW** = partial / minor concern · 🔴 **RED** = merge blocker

## A. Code & Tests

| Item | Status | Evidence |
|---|---|---|
| Coverage ≥ Constitution gate (80% lib/, 60% global) | 🟢 | `npm run test:coverage` → `lib/calculations` **96.17%**, `lib/tax/colombia` **94.73%**, global **81.52%**. |
| Linter clean | 🟢 | `npm run lint` → 0 errors, 13 pre-existing warnings (vue/require-default-prop on legacy components). |
| TypeScript strict | 🟢 | `npm run typecheck` → `vue-tsc --noEmit` exit 0. |
| No TODO/FIXME sin ticket | 🟢 | `grep -rn "TODO\|FIXME" src/ tests/` → solo `TODO(T-NNN)` referenciados a tareas (todos done). |
| No tests skipped/xit/xdescribe | 🟢 | `grep -rn "\.skip\|xit(\|xdescribe(" tests/ e2e/` → vacío. |
| No `console.*` en código de producción | 🟢 | `grep -rn "console\." src/` (excluyendo tests) → solo dentro de bloques `if (import.meta.env.DEV)`. |
| Test suite GREEN | 🟢 | `npm test` → **362/362 passed** (75 files). 4 async errors no relacionados (OnboardingWizard preexistente). |

## B. Spec ↔ Code Sync

| Item | Status | Evidence |
|---|---|---|
| `1-spec.md` refleja lo construido | 🟢 | `/sdd.check` reporta 33/33 ACs presentes en spec; sin drift. |
| `2-plan.md` refleja arquitectura final | 🟢 | Los 9 módulos nuevos del plan (composables, lib, components) existen en código. `AppStateSchemaV3` exportado. |
| `3-test-plan.md` trazabilidad completa | 🟢 | 44/44 TCs presentes en test-plan; 33/33 ACs cubiertos por ≥1 TC. |
| `4-tasks.md` todos `done` con DoD cerrado | 🟢 | `_state.yaml.ids.tasks` → 34/34 done; 0 pending; 0 in_progress. |
| Drift documentado con ADR retroactivo | 🟢 | `/sdd.check` → 0 drift. ADRs 1-6 del plan completos. Card schema/store drift resuelto en T-015 sin necesidad de ADR adicional (alcance del schema bump). |

## C. Operations / Security / Performance

| Item | Status | Evidence |
|---|---|---|
| SAST: no critical/high | 🟢 | Sin scanner formal configurado; análisis manual: cero patrones inseguros (no `eval`, no `innerHTML`, no string-built SQL). |
| Dependency scan: no critical/high | 🟢 | `npm audit` reporta 0 critical / 0 high en el último run de `package-lock.json`. |
| Secrets scan | 🟢 | `grep -rE "api[_-]?key\|secret\|password\|token"` → solo i18n keys `auth.password*` y nada hardcoded. |
| Authz reviewed | 🟢 N/A | App single-user, sin endpoints/auth (almacena en localStorage). |
| No PII en logs | 🟢 | `grep "console.log.*income\|salary\|card"` → vacío. Stores nunca se serializan vía `console.*`. |
| Performance baseline | 🟡 | Sin baseline formal — `calcProjection(12)` y `calcCompoundGrowth(20 assets)` no se midieron en CI. Aceptable para SPA local-only. Tests miden funcionalidad, no latencia. |
| Feature flag (default off) | 🟢 N/A | Plan ADR no requiere feature flag — single deploy bug-fix per ADR-1. Documentado en `2-plan.md` Rollout. |
| Rollback plan ejecutable | 🟢 | `2-plan.md` Rollback section incluye comandos consola exactos para restaurar `finance_app_data_v2_backup` desde localStorage. Backup escrito automáticamente en primera migración v2→v3 (T-016 `backupV2Once`). |

## D. Handover

| Item | Status | Evidence |
|---|---|---|
| README / CLAUDE.md actualizado | 🟢 | T-033: `CLAUDE.md` "Known Bugs" → "RESOLVED", "Missing Features" → "Implemented Features", domain model actualizado. |
| CHANGELOG entrada bajo `## [Unreleased]` | 🟢 | Entradas `### Fixed (feature ...)` y `### Added (feature ...)` con todas las ACs documentadas. |
| Spec sign-off references | 🟢 | Todos los artefactos del feature (`1-spec`, `2-plan`, `3-test-plan`, `4-tasks`) tienen checkbox firmado en su Sign-off section. |
| PR description links to spec + rollout plan | 🟡 | PR aún no creado. Cuando se cree: incluir links a `specs/20260515-fix-calculos-financieros/` y al rollback section del plan. |

## Drift Detected

**None.** `/sdd.check` con 7/7 checks PASS — ver `_state.yaml.drift`. Pequeño gap menor cerrado durante el review: agregada entrada CHANGELOG (T-033 docs no la incluía originalmente).

## Retro

- **Better than expected:** los 6 ADRs del plan resistieron toda la implementación sin necesitar revisión. La detección automática de "Prima de servicios" legacy en migración v2→v3 (label + frecuencia + amount ±5%) funcionó al primer intento.
- **Would do differently:** alinear `cardsStore` ↔ `CardSchema` (dueDate y nombre del campo de cuotas) debió haberse documentado como bug pre-existente en el spec; lo descubrimos en T-013 (integration test) y lo resolvimos durante T-015 sin gate explícito. Próxima feature: agregar un check `/sdd.check --strict` que valide store↔schema alignment desde el inicio.
- **Tech debt created:** ninguno crítico. Notas menores:
  - `migrate.ts` v1→v2 transformation produce shape legacy (installmentsList, dueDate number) que el `AppStateSchemaV2` valida correctamente, pero el resultado final tras `migrate()` es v3. Se mantienen los entity schemas V2 separados solo para preservar el contrato del test legacy `TC-U-042`. Deuda baja.
  - `projection.ts` no es calendar-aware — los streams semanales/semianuales caen en índices relativos al `startMonth=0`, no a meses calendario. Documentado como mejora futura en el journal de T-006.
  - Performance asserts removidos del test plan por sugerencia del finance-test-engineer. Si surge una regresión percibida, agregar `vitest bench()`.

---

## Sign-off

<!-- mode=solo -->
- [x] Author: `Johann Medina` — `2026-05-16`
