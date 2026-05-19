# Post-Implementation Review — Sprint 1 mejoras finanzas personales

**Feature slug:** `20260516-sprint1-mejoras-finanzas`
**Branch:** `feature/20260516-sprint1-mejoras-finanzas`
**Reviewed:** 2026-05-18 · **Mode:** solo

---

## 1. Summary

Sprint 1 delivers five user-visible quality-of-life upgrades to the personal-finances app, all rooted in concrete user pain or Colombian payroll-law gaps surfaced during dogfooding:

| US | Story | Status |
|---|---|---|
| US-1 | Visible load/save error notification (`useStorageError` kind discriminator) | GREEN |
| US-2 | Financial-term tooltips on KpiCard & HealthScore (radix-vue) | GREEN |
| US-3 | Dashboard empty-state guide CTAs (income / expenses) | GREEN |
| US-4 | Fondo de solidaridad pensional 1% above 4 SMMLV in Colombia presets | GREEN |
| US-5 | Auxilio de transporte ≤ 2 SMMLV suggestion + above-threshold notice | GREEN |

**Counts:** GREEN 18 · YELLOW 2 · RED 0.

---

## 2. Evidence

### 2.1 Test gate
- **Command:** `npm test -- --run`
- **Result:** 405 tests passed (77 files); 0 failed; 4 pre-existing uncaught errors in `OnboardingWizard.test.ts` and Chart.js jsdom (unrelated to this sprint, also present on `feature/20260514-project-refactor`).

### 2.2 Coverage gate
- **Command:** `npm run test:coverage`
- **Result (path → statements %):**
  - `src/lib/calculations` — **96.17%** (gate ≥ 80 ✅)
  - `src/lib/tax/colombia` — **95.65%** (gate ≥ 80 ✅)
  - Global — **82.69%** (gate ≥ 60 ✅)
  - `src/composables` — 78.25% (no gate; new composables `useFinancialGlossary`, `useDashboardGuide`, `useTransportAllowance` all individually ≥ 90%)
  - `src/stores` — 97.03%

### 2.3 Static analysis
- `npm run typecheck` → exit 0 (0 errors).
- `npm run lint` → exit 0 (0 errors, 2 pre-existing warnings unrelated to sprint scope: `CardCard.vue` and `GoalCard.vue` missing `default` for non-required props).

### 2.4 E2E specs registered
- `npx playwright test --list` confirms 3 new specs:
  - `e2e/persistence-error.spec.ts` → TC-E-001 (AC-1.1, 1.2, 1.4)
  - `e2e/colombia-presets-solidarity.spec.ts` → TC-E-002 (AC-4.1, 4.3)
  - `e2e/transport-allowance.spec.ts` → TC-E-003 (AC-5.1, 5.2)

### 2.5 Constitution compliance
- `grep -rn "from 'vue'\|from 'pinia'" src/lib/` → no matches.
- `lib/` layer purity preserved.

### 2.6 SAST / secrets
- Manual scan: no secrets committed, no API tokens, no plaintext credentials. All payroll constants cite their legal source.

### 2.7 Drift
- `/sdd.check` (run 2026-05-18 11:55): 6 checks, 6 PASS, 0 WARN, 0 FAIL.

---

## 3. Acceptance Criteria coverage (24 ACs)

| AC | Description | TCs | Tasks | Status |
|---|---|---|---|---|
| AC-1.1 | Load error → visible notification | TC-U-026, TC-C-001, TC-E-001 | T-002, T-005, T-006 | GREEN |
| AC-1.2 | Notification persists (no auto-dismiss) | TC-C-002 | T-006 | GREEN |
| AC-1.3 | Save failure → notification + retry | TC-C-003 | T-006 | GREEN |
| AC-1.4 | Dismiss → app fully usable | TC-U-002, TC-C-004, TC-E-001 | T-002, T-005, T-006 | GREEN |
| AC-2.1 | DTI tooltip with definition + thresholds 20/36 | TC-U-017, TC-C-005 | T-010, T-011 | GREEN |
| AC-2.2 | Housing tooltip with 30% cap | TC-U-018, TC-C-006 | T-010, T-012 | GREEN |
| AC-2.3 | Emergency tooltip with 3–6 month range | TC-U-019, TC-C-007 | T-010, T-012 | GREEN |
| AC-2.4 | Savings rate tooltip | TC-U-020, TC-C-008 | T-010, T-012 | GREEN |
| AC-2.5 | Health score tooltip (0–100, four components) | TC-U-021, TC-C-009 | T-010, T-012 | GREEN |
| AC-2.6 | Tooltips visible on 375px viewport | TC-C-010 | T-011, T-012 | GREEN |
| AC-2.7 | Tooltip on keyboard focus | TC-C-011 | T-011, T-012 | GREEN |
| AC-3.1 | No income → income CTA | TC-U-003, TC-C-012 | T-015, T-016 | GREEN |
| AC-3.2 | Income + no expenses → expenses CTA | TC-U-004, TC-C-013 | T-015, T-016 | GREEN |
| AC-3.3 | CTA disappears reactively | TC-U-005, TC-C-014 | T-015, T-016 | GREEN |
| AC-3.4 | Partial data: KPI + prompt coexist | TC-U-006, TC-C-015 | T-015, T-016 | GREEN |
| AC-4.1 | Salary > 4 SMMLV → solidarity 1% added | TC-U-007, TC-U-022, TC-U-024, TC-E-002 | T-020, T-021 | GREEN |
| AC-4.2 | Salary ≤ 4 SMMLV → no solidarity | TC-U-008 | T-020 | GREEN |
| AC-4.3 | Idempotent on second apply | TC-U-009, TC-E-002 | T-020 | GREEN |
| AC-4.4 | Solidarity persists when salary later drops | TC-U-025 | T-021 | GREEN |
| AC-5.1 | Salary ≤ 2 SMMLV + no benefit → banner | TC-U-011, TC-U-014, TC-U-023, TC-C-016, TC-E-003 | T-026, T-027 | GREEN |
| AC-5.2 | Accept → adds $200,000 benefit + hides banner | TC-C-017, TC-E-003 | T-027 | GREEN |
| AC-5.3 | Benefit already present → no banner | TC-U-012 | T-026 | GREEN |
| AC-5.4 | Dismiss → session-scoped suppression | TC-U-015, TC-C-018 | T-026, T-027 | GREEN |
| AC-5.5 | Salary rises above threshold → one-time notice | TC-U-016, TC-C-019 | T-027 | GREEN |

---

## 4. Checklist

### 4.1 Architecture & layering — GREEN
- [x] No Vue/Pinia imports in `src/lib/` — confirmed via grep.
- [x] Composables bridge stores and lib (e.g. `useDashboardGuide`, `useTransportAllowance`).
- [x] `App.vue` has `TooltipProvider` at the layout shell root.
- [x] New routes: none added (no nav update required).
- [x] All entity IDs use `globalThis.crypto.randomUUID()` except the reserved `__solidarity__` slug (documented like the existing `__prima__`).

### 4.2 CRUD completeness — GREEN
- [x] `EmptyStateGuide` is a read-only inline guide on DashboardView; no CRUD impact.
- [x] `TransportAllowanceSuggestion` triggers `incomeStore.addBenefit` via composable.accept(), which already validates input at the store boundary.
- [x] Solidarity preset goes through `applyColombiaPresets` lib function with `SOLIDARITY_PRESET_ID = '__solidarity__'` reserved id (idempotent).

### 4.3 i18n coverage — GREEN
- [x] New namespaces added to both `es.json` and `en.json`:
  - `storage.errorToast.load.{title,invalidJson,invalidState,dismissedNote}`
  - `glossary.{dti,housing,emergency,savings,healthScore}.{title,body}`
  - `dashboard.guide.{income,expenses}.{title,body,cta}`
  - `income.transport.{label,suggestion.{title,body,accept,dismiss},notice.aboveThreshold}`
- [x] No hardcoded user-facing Spanish strings introduced (verified by audit of new files).

### 4.4 Colombian payroll correctness — GREEN
- [x] `SMMLV_2025 = 1_423_500` cites Decreto 1572 de 2024.
- [x] `SOLIDARITY_THRESHOLD = SMMLV_2025 × 4` cites Ley 100/1993 Art. 20 (modified by Ley 797/2003).
- [x] `TRANSPORT_THRESHOLD = SMMLV_2025 × 2` cites Ley 15/1959 Art. 2 + Decreto 1572/2024.
- [x] `AUXILIO_TRANSPORTE_2025 = 200_000` cites Decreto 1572 de 2024.
- [x] ARL is not added to any deduction preset (employer-only per Art. 16 Ley 1562/2012).
- [x] Transport allowance is added via `addBenefit` (non-salary path, excluded from contribution bases per Art. 128 CST).
- [x] Solidarity uses reserved id `__solidarity__` and never auto-removes (AC-4.4 explicit).
- [x] Boundary semantics: solidarity strictly `>` (exclusive), transport `≤` (inclusive). Both verified by EC tests.

### 4.5 Tests — GREEN
- [x] Test pyramid respected: 26 unit + 19 component + 3 e2e for this sprint.
- [x] All new tests use `TC-X-NNN (AC-X.Y):` naming for traceability.
- [x] Component tests use `createTestingPinia({ stubActions: false })`.
- [x] Tooltip tests wrap `KpiCard` / `HealthScore` in `TooltipProvider` via test wrapper to mirror App.vue.

### 4.6 Persistence — GREEN
- [x] `useStorageError` discriminated `kind: 'load' | 'save'`; load reasons get the load-specific message.
- [x] `main.ts` hydrateStores forwards `parseError` from `loadAppState` into `setError(parseError)` before stores are mutated.
- [x] No schema change — `AppStateSchemaV3` unchanged. No migration entry added.

### 4.7 Observability / rollback — YELLOW
- [x] StorageErrorToast logs nothing to the console; toast is the sole user-facing signal.
- [ ] No remote telemetry (project is local-first, no observability backend). Rollback strategy: revert the merge commit; localStorage schema unchanged so no data loss. **Acceptable** for this project's scope but flagged as YELLOW because there's no automated way to detect that the load-error toast actually fires for end users in the wild.

### 4.8 Performance — YELLOW
- [x] Tooltips use radix-vue with `delay-duration={0}` and a single global `TooltipProvider` — no extra layout cost when triggers are closed.
- [x] `useDashboardGuide` is a pure computed chain over two store fields — O(1) re-evaluation.
- [ ] No baseline Lighthouse / bundle-size run captured for this sprint. **YELLOW** because bundle-size impact of radix-vue Tooltip was not measured (radix-vue was already a dep; only the Tooltip sub-modules were newly imported).

### 4.9 Constitution v3 — GREEN
- [x] No banned patterns introduced. No `Math.random()` for IDs, no `<a href>` for in-app navigation, no `lib/` framework imports, no `stubActions: true`.

---

## 5. Drift

`/sdd.check` ran 2026-05-18 11:55 with all 6 checks PASS:
- ID-INTEGRITY · COVERAGE-CHAIN · TEST-FIRST · TASK-STRUCTURE · SIGNOFF-FRESHNESS · CONSTITUTION

No drift detected between spec, plan, test-plan, tasks, and code. No spec edits required.

---

## 6. Retro

### What worked
- **Test-first batch.** The user's instruction to "run prerequisites first, then the rest" produced a clean topological order (T-003 → T-005 → T-006 → … → T-027 → leaves). No back-tracking; every impl task had its red test queued first.
- **Discriminated useStorageError kind.** Adding `kind: 'load' | 'save'` instead of widening the reason union let StorageErrorToast switch on a single boolean — cleaner than maintaining parallel switch statements.
- **TooltipProvider self-wrapping in KpiCard.** Making the component self-sufficient (own `TooltipProvider`) avoided breaking unrelated DashboardView tests that didn't set up the provider context.
- **Reserved id slug for solidarity (`__solidarity__`).** Mirrors the existing `__prima__` pattern; idempotency comes for free and the slug is searchable from UI for future removal flows.

### What was painful
- **Duplicate empty `glossary: {}` in `es.json` / `en.json` (line 66) silently overrode the new keys at line 2.** Cost ~3 minutes of debugging. Lesson: JSON's last-key-wins is silent in Node. A `jq`-based JSON schema validator pre-commit would have caught it.
- **`useI18n()` requires Vue setup context.** Switched from `useI18n()` to `i18n.global.t` in `useFinancialGlossary` after the unit tests failed. Worth a project rule: composables that need i18n should use `i18n.global` so they're callable outside `<script setup>`.
- **Test-side multiple `role='tooltip'` matches.** Radix-vue renders a visually-hidden screen-reader tooltip in addition to the visible portal tooltip, so `queryByRole('tooltip')` throws on "multiple elements". Switched to `queryAllByRole` and joined `textContent`.
- **`Write` blocked on un-read stub file.** The harness rule "Read before Write" caught me twice (`EmptyStateGuide.vue`, `CHANGELOG.md`). Adding a `Read` call up-front would have saved two retries.

### What we'd change
- Add a JSON schema validator (`zod` or `jq`) to lint `src/i18n/*.json` for duplicate keys.
- Document the i18n.global vs useI18n choice in `.claude/rules/vue-architecture.md`.
- Add a test-utility wrapper `mountWithTooltipProvider()` so future component tests don't repeat the setup.

### Timeline (from `_journal.yaml`)
- 2026-05-16 18:00 — feature initialized
- 2026-05-16 18:05–19:05 — spec, plan, test-plan, tasks generated and signed off (5 sign-off events)
- 2026-05-16 19:10–19:20 — T-001 setup, T-002 useStorageError tests written
- 2026-05-18 11:12–11:52 — 27-task batch executed in deps-priority order; closed with T-028 docs + T-LAST regression gate
- 2026-05-18 11:55 — /sdd.check all PASS

---

## 7. Sign-off (solo mode)

| Role | Name | Date | Signature |
|---|---|---|---|
| Author | Johann Medina | 2026-05-18 | ✅ Approved |

---

## 8. Open YELLOW items (not blocking merge)

1. **Observability for load-error toast** — no telemetry to verify the toast actually fires in the wild. Acceptable for a local-first app; revisit when remote tracking is added.
2. **No bundle-size baseline** — radix-vue Tooltip sub-modules added; should run `npm run build && du -sh dist/` against `feature/20260514-project-refactor` baseline before merging if bundle size is a constraint for the host project.
