# Fixed tasks — personal-finance

Run these only in disposable worktrees. Do not adapt the task text between a
baseline and candidate run.

## EV-01 — storage: persisted field and migration

**Goal:** add one persisted setting to the active app state, with a versioned
migration from V5 and recovery behavior for malformed storage.

**Acceptance criteria**

- [ ] Updates the active Zod schema and adds exactly one migration step.
- [ ] Preserves existing state and IDs; it does not reset local data.
- [ ] Adds tests for successful migration and invalid JSON recovery.
- [ ] Does not write sensitive data to logs.

**Verification:** `npm test -- tests/unit/storage tests/integration/persistence.test.ts && npm run typecheck && npm run lint`

**Trap measured:** a persisted-shape change that updates only TypeScript or
only the migration leaves existing users with invalid local state.

## EV-02 — payroll: employee deductions

**Goal:** add a pure calculation or preset behavior for Colombian employee
payroll without treating ARL as an employee deduction.

**Acceptance criteria**

- [ ] Reads the existing Colombian-tax modules and uses `UVT_2025`; no magic
      UVT values or guessed legal rates.
- [ ] Keeps health and pension at 4% each and ARL out of employee deductions.
- [ ] Adds test-first coverage with the required AC/TC naming convention.
- [ ] Keeps the calculation layer free of Vue and Pinia imports.

**Verification:** `npm test -- tests/unit/tax/colombia tests/unit/calculations && npm run typecheck && npm run lint`

**Trap measured:** plausible but legally wrong payroll arithmetic.

## EV-03 — frontend: financial route with complete shell integration

**Goal:** add a small read-only financial insight route using the existing
Vue/Pinia/composable layers.

**Acceptance criteria**

- [ ] The view uses a composable rather than importing `src/lib/**` directly.
- [ ] Registers the route and both desktop and mobile navigation entries.
- [ ] Adds keys to both `src/i18n/es.json` and `src/i18n/en.json`; no hardcoded
      user-facing strings.
- [ ] Provides a mobile-first empty state and a context sentence for its metric.

**Verification:** `npm test && npm run typecheck && npm run lint && npm run build`

**Trap measured:** a visually complete page that violates the dependency
direction, i18n, or navigation shell.

## EV-04 — privacy: hostile import payload

**Goal:** harden the import/storage boundary against malformed or oversized
user-supplied JSON without exposing financial data.

**Acceptance criteria**

- [ ] Uses the existing Zod boundary and returns a typed failure path.
- [ ] Leaves the last valid saved state intact on failure.
- [ ] Adds regression tests for malformed JSON and invalid schema input.
- [ ] Adds no analytics, external API call, `console.*`, or `v-html` path.

**Verification:** `npm test -- tests/unit/storage tests/integration/persistence.test.ts && npm run typecheck && npm run lint`

**Trap measured:** handling only valid fixture data and losing a user's local
financial state after a failed import.

## EV-05 — state: month rollover and dashboard persistence

**Goal:** change a month-dependent dashboard behavior while preserving the
boot, migration, and local-storage sequence.

**Acceptance criteria**

- [ ] Traces `main.ts`, storage loading, and the affected store before editing.
- [ ] Adds a focused unit or integration test plus a Playwright regression test.
- [ ] The behavior survives browser reload without duplicate rollover work.
- [ ] No direct Pinia state mutation occurs outside a store action.

**Verification:** `npm test && npm run typecheck && npm run lint && npm run e2e`

**Trap measured:** a pass in memory that fails only after reload or a new month.

## EV-06 — accessibility: destructive local reset

**Goal:** improve the existing local-data reset flow so a keyboard and screen
reader user can understand and confirm the consequence safely.

**Acceptance criteria**

- [ ] Uses the existing accessible dialog primitives and maintains focus.
- [ ] States that data is local and irreversible before confirmation.
- [ ] Does not add a bypass that clears data without explicit confirmation.
- [ ] Adds a component or E2E test for keyboard confirmation/cancel.

**Verification:** `npm test && npm run typecheck && npm run lint && npm run e2e`

**Trap measured:** a polished control that weakens the only protection against
accidental local-data loss.

## EV-07 — architecture: local-only data boundary (no code)

**Goal:** assess a proposal to add a cloud analytics SDK for financial-event
tracking.

**Acceptance criteria**

- [ ] Gives a clear recommendation backed by `constitution.md` and the actual
      storage architecture.
- [ ] Identifies the PII and external-transmission conflict precisely.
- [ ] Proposes a local-only measurement alternative if useful.
- [ ] Makes no code or configuration change.

**Verification:** manual review against the criteria, with cited repository
paths.
