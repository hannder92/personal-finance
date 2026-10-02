# Test Plan: Proyecciones reales

> Spec: [1-spec.md](./1-spec.md) · Plan: [2-plan.md](./2-plan.md)

## Pyramid

- Unit ~70% (pure calculations, migration, stores) · Component/Integration ~20% · E2E ~10%

## Spec Challenge Log

| AC     | Challenge raised                                                                 | Resolution                                                                          |
| ------ | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| AC-3.1 | No edit form exists for goals; "formulario de cualquier meta" was not observable | Clarified in spec v1 (edit in place): toggle on new-goal form and on each goal card |
| AC-1.1 | "Valores idénticos" contradicted OQ-4 for users with projection rate > 0         | Spec states the consequence explicitly                                              |
| AC-2.4 | Benefit line when only one scenario reachable                                    | Spec defines the "Sin invertir no lo alcanzarías" copy                              |
| Others | —                                                                                | No challenges                                                                       |

## Product Challenge Log

| ID   | Challenge                    | Spec answer                                                            | Resolved?              |
| ---- | ---------------------------- | ---------------------------------------------------------------------- | ---------------------- |
| PC-1 | Knows what to do within 30s? | Reference button fills assumptions in one tap; FI links to assumptions | Yes                    |
| PC-2 | Why reopen?                  | Monthly review loop: status per goal changes as contributions change   | Yes (decision feature) |
| PC-3 | Benefit visible?             | AC-2.4, AC-3.6 benefit lines                                           | Yes                    |
| PC-4 | Empty state tone?            | AC-2.4 invitation; EC-2 amber copy                                     | Yes                    |
| PC-5 | Duplicates dashboard?        | Dashboard projection untouched; new loop is goals/FI                   | Yes                    |

## Traceability Matrix

| AC ID  | Unit                                          | Component / Integration | E2E      |
| ------ | --------------------------------------------- | ----------------------- | -------- |
| AC-1.1 | TC-U-020 (migrate), TC-U-030 (store defaults) | TC-C-001                | —        |
| AC-1.2 | TC-U-031                                      | TC-C-002                | TC-E-001 |
| AC-1.3 | TC-U-032                                      | TC-C-003                | —        |
| AC-1.4 | TC-U-001                                      | TC-C-004                | —        |
| AC-1.5 | —                                             | TC-C-005                | —        |
| AC-1.6 | TC-U-021, TC-U-022                            | TC-I-001                | TC-E-001 |
| AC-2.1 | TC-U-010                                      | —                       | —        |
| AC-2.2 | TC-U-011                                      | TC-C-010                | —        |
| AC-2.3 | TC-U-012                                      | TC-C-011                | TC-E-002 |
| AC-2.4 | TC-U-013                                      | TC-C-012                | —        |
| AC-2.5 | —                                             | TC-C-013                | —        |
| AC-2.6 | TC-U-014                                      | TC-C-014                | —        |
| AC-2.7 | —                                             | —                       | TC-E-002 |
| AC-3.1 | TC-U-033                                      | TC-C-020                | TC-E-003 |
| AC-3.2 | TC-U-002                                      | TC-C-021                | —        |
| AC-3.3 | TC-U-003                                      | TC-C-022                | —        |
| AC-3.4 | TC-U-004                                      | TC-C-022                | —        |
| AC-3.5 | TC-U-005                                      | TC-C-023                | TC-E-003 |
| AC-3.6 | TC-U-006                                      | TC-C-024                | —        |
| AC-3.7 | —                                             | —                       | TC-E-003 |

## Acceptance Scenarios (key numbers)

- TC-U-001: real(9,5)=3.81%, real(13,5)=7.62% → optimistic when > 7.
- TC-U-002: inflateToMonth(100M, 60, 5) = 127,628,156.
- TC-U-003: monthsToReach(100M, 20M, 1.5M, 9, 5)=53; (0,5)=79; (0,0)=54.
- TC-U-004: requiredMonthlyFor(100M, 20M, 60, 9, 5)=1,296,025; (0,5)=1,793,803; (0,0)=1,333,333.
- TC-U-010: capital(4M, 4%)=1,200,000,000; (4M, 3.5%)=1,371,428,571.
- TC-U-011: FI months (50M, 2M/mo, 9/5)=430; (0/0)=575.
- TC-U-012: FI required 20y=4,545,244; 10y=9,679,098.
- TC-U-014: FI (0% return, 5% inflation) → null (unreachable).
- TC-U-020: V6 fixture → V7 with inflation 0, withdrawal 4, fiDesiredYears 20, goals.invested false; projection rate preserved.

## Mocking Strategy

| Dependency   | Real or Mock            | Why                      |
| ------------ | ----------------------- | ------------------------ |
| Pinia stores | Real (fresh pinia)      | Project convention       |
| Date         | Injected `now`          | Deterministic month math |
| localStorage | jsdom / Playwright real | Persistence tests        |

## Performance

A-001: loop ≤1200 iterations per goal; no explicit perf test.

## Security

Constitution-driven: TC-U-032 (range validation at store boundary), TC-U-022 (Zod V7 rejects out-of-range values).

## Sign-off

- [x] Author — Claude — 2026-10-02
