# Post-Implementation Review: Métricas verificadas — runway, ingresos y cobertura

> Spec: [1-spec.md](./1-spec.md) · Plan: [2-plan.md](./2-plan.md) · Mode: solo

Tag each checklist item: **GREEN** | **YELLOW** | **RED** (RED blocks merge).

## Verify summary

| AC     | Status        | Evidence                                                                                                    |
| ------ | ------------- | ----------------------------------------------------------------------------------------------------------- |
| AC-1.1 | AUTO-VERIFIED | `financial-runway.test.ts` TC-U-001; `RunwayCard.test.ts` TC-C-060; `e2e/runway-dashboard.spec.ts` TC-E-020 |
| AC-1.2 | AUTO-VERIFIED | `financial-runway.test.ts` TC-U-001; `liquid-metrics.test.ts`; `useLiquidMetrics.test.ts`                   |
| AC-1.3 | AUTO-VERIFIED | `financial-runway.test.ts` TC-U-001; `liquid-metrics.test.ts` TC-U-002                                      |
| AC-1.4 | AUTO-VERIFIED | `financial-runway.test.ts` TC-U-001; `RunwayCard.test.ts` TC-C-060                                          |
| AC-2.1 | AUTO-VERIFIED | `useFinancialFreedom.test.ts` TC-C-061                                                                      |
| AC-2.2 | AUTO-VERIFIED | `liquid-metrics.test.ts` TC-U-002; `useFinancialFreedom.test.ts` TC-C-061                                   |
| AC-2.3 | AUTO-VERIFIED | `HealthScore.test.ts` TC-C-062                                                                              |
| AC-3.1 | AUTO-VERIFIED | `income-mix.test.ts` TC-U-003; `IncomeView.test.ts` TC-C-063                                                |
| AC-3.2 | AUTO-VERIFIED | `incomeStore.test.ts` TC-U-007; `IncomeView.test.ts`; `e2e/income-class.spec.ts` TC-E-021                   |
| AC-3.3 | AUTO-VERIFIED | `income-mix.test.ts` TC-U-003; `IncomeView.test.ts` TC-C-063                                                |
| AC-3.4 | AUTO-VERIFIED | `migrate.test.ts` TC-U-008; `incomeStore.test.ts` TC-U-007                                                  |
| AC-4.1 | AUTO-VERIFIED | `passive-coverage.test.ts` TC-U-005; `PassiveCoverageCompact.test.ts` TC-C-064                              |
| AC-4.2 | AUTO-VERIFIED | `passive-coverage.test.ts` TC-U-005; `PassiveCoverageCompact.test.ts` (`data-covered`)                      |
| AC-4.3 | AUTO-VERIFIED | `passive-coverage.test.ts` TC-U-005; `FlowCoverageBlock.test.ts` TC-C-064                                   |
| AC-4.4 | AUTO-VERIFIED | `FlowCoverageBlock.test.ts` TC-C-064; dashboard `PassiveCoverageCompact` + `FinancialFreedomCompact`        |
| AC-5.1 | AUTO-VERIFIED | `CardCard.test.ts` TC-C-065; `IconButton.test.ts` TC-C-065                                                  |
| AC-5.2 | AUTO-VERIFIED | `DebtsView.test.ts` TC-C-065                                                                                |
| AC-5.3 | AUTO-VERIFIED | `DebtsView.test.ts` TC-C-066; `e2e/debt-delete-card.spec.ts` TC-E-022                                       |
| AC-5.4 | AUTO-VERIFIED | `IconButton.test.ts` TC-C-065 (`common.delete` i18n)                                                        |
| AC-6.1 | AUTO-VERIFIED | `SavingsProjectionChart.test.ts` TC-C-067                                                                   |
| AC-6.2 | AUTO-VERIFIED | `settingsStore.test.ts` TC-U-006; `migrate.test.ts` TC-U-008; `e2e/projection-rate.spec.ts` TC-E-023        |
| AC-6.3 | AUTO-VERIFIED | `useSavingsProjection.test.ts` TC-U-009; `SavingsProjectionChart.test.ts` TC-C-067                          |
| AC-6.4 | AUTO-VERIFIED | `SavingsProjectionChart.test.ts` TC-C-067 (`data-series-count=2`)                                           |
| AC-6.5 | AUTO-VERIFIED | `SavingsProjectionChart.test.ts` TC-C-067 (hints need-rate / need-assets)                                   |
| AC-6.6 | AUTO-VERIFIED | `liquid-metrics.test.ts` TC-U-002; `useSavingsProjection.test.ts` TC-U-009                                  |

Rollback: ✅ · Assumptions: **7 verified**, 0 unverified

## Constitution quality gate

| Command                 | Result | Evidence                                                              |
| ----------------------- | ------ | --------------------------------------------------------------------- |
| `npm test`              | ✅     | 452/452 passed                                                        |
| `npm run lint`          | ⚠️     | 0 errors, 8 warnings (pre-existing vue rules)                         |
| `npm run typecheck`     | ✅     | clean                                                                 |
| `npm run build`         | ✅     | `vite build` OK                                                       |
| `npm run test:coverage` | ✅     | `lib/calculations` **96.89%** lines (≥80%); overall **90.69%** (≥60%) |
| `npm run e2e`           | ✅     | 30/30 Chromium (T-LAST)                                               |

## A. Code & Tests

| Item                           | Tag        | Notes                                                                                                                |
| ------------------------------ | ---------- | -------------------------------------------------------------------------------------------------------------------- |
| Coverage ≥ constitution        | **GREEN**  | `lib/calculations` 96.89%; overall 90.69%                                                                            |
| Linter clean                   | **YELLOW** | 8 ESLint warnings, 0 errors (mostly `vue/max-attributes-per-line`, `vue/require-default-prop` — pre-feature)         |
| No orphan TODO/FIXME           | **GREEN**  | Ninguno en archivos del feature                                                                                      |
| No skipped tests without issue | **YELLOW** | `FinancialFreedomView.test.ts:78` — `describe.skip` vacío (stub T-001); tests reales de FI pasan en bloque principal |

## B. Sync (spec ↔ code)

| Item                         | Tag       | Notes                                                       |
| ---------------------------- | --------- | ----------------------------------------------------------- |
| 1-spec.md accurate           | **GREEN** | Comportamiento alineado con US-1…US-6                       |
| 2-plan.md accurate           | **GREEN** | ADR-1…5 implementados; schema v4 activo                     |
| Traceability matrix complete | **GREEN** | 26 AC ↔ 22 TC en `3-test-plan.md`                           |
| 4-tasks.md all done + DoD    | **GREEN** | 31/31 done; T-LAST gates documentados en `_journal.yaml`    |
| Drift → retro ADR if needed  | **GREEN** | `_state.yaml` drift: `[]`; sin desviaciones no documentadas |

## C. Operations / Security / Performance

| Item                                    | Tag       | Notes                                                                                    |
| --------------------------------------- | --------- | ---------------------------------------------------------------------------------------- |
| SAST + secrets clean                    | **GREEN** | App local-first; sin secrets en repo; sin `console.*` en `lib/calculations`              |
| Authz on new endpoints                  | **GREEN** | N/A — SPA sin backend                                                                    |
| Performance baseline (if critical path) | **GREEN** | O(n) assets/streams; sin regresión perf en test plan                                     |
| Feature flag + rollback                 | **GREEN** | Sin flag (local-first); rollback git + caveat v4 localStorage documentado en `2-plan.md` |

## D. Assumptions

| Item                        | Tag       | Notes                                   |
| --------------------------- | --------- | --------------------------------------- |
| Unverified A-NNN documented | **GREEN** | A-001…A-007 → `verified` en `_ids.yaml` |
| No violated without T-REG   | **GREEN** | Ninguna `violated`                      |

## E. Handover

| Item                    | Tag        | Notes                                                                                               |
| ----------------------- | ---------- | --------------------------------------------------------------------------------------------------- |
| Docs / CHANGELOG        | **YELLOW** | `CHANGELOG.md` no incluye aún entrada `20260529-metricas-runway-ingresos` bajo `[Unreleased]`       |
| PR links spec + rollout | **YELLOW** | PR pendiente de crear; incluir link a `specs/20260529-metricas-runway-ingresos/` y nota rollback v4 |

## F. Retro

- **Better than expected:** Patrón `SEED_ONCE_INIT_SCRIPT` en E2E resolvió persistencia tras `reload` en toda la suite (30/30).
- **Would do differently:** Eliminar el `describe.skip` vacío de `FinancialFreedomView` en setup o reemplazarlo por tests de `FlowCoverageBlock` desde el inicio.
- **Tech debt:** Dashboard más denso en móvil 375px — mitigado con `overflow-x-hidden` en `<main>`; KpiStrip mantiene scroll horizontal intencional.

## Verdict

- [ ] GREEN — merge ready
- [x] **YELLOW** — merge with noted risks
- [ ] RED — block merge

**Rationale:** Gates constitutionales y 26/26 AC verificados. Blockers menores de handover (CHANGELOG, PR) y deuda cosmética (lint warnings, `describe.skip` vacío). Ningún RED.

### Pre-merge checklist (YELLOW → GREEN)

1. Añadir sección en `CHANGELOG.md` `[Unreleased]` para este feature.
2. Crear PR con enlace a spec + nota rollback schema v4.
3. (Opcional) Quitar `describe.skip` vacío o implementar tests flow coverage en `FinancialFreedomView`.

## Sign-off

- [x] Author — Johann Medina — 2026-05-29
- [ ] Reviewer — date
