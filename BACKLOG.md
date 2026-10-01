# Backlog

Technical debt and future improvements tracked here.

## DEBT

### DEBT-001 — Align `snapshotsStore.Snapshot` field names with `SnapshotSchema`

**Priority:** High  
**Effort:** S  
**Origin:** Post-review drift finding (2026-05-15)

**Problem:** `snapshotsStore.Snapshot` interface uses `fixedExpenses`, `debtPayments` as field names, but `AppStateSchemaV2.SnapshotSchema` uses `totalFixedExpenses`, `totalVariableSpent`, `totalDebt`, plus requires `dti` and `savingsRate`. The mismatch is currently bridged by an `as any` cast in `main.ts::hydrateStores()`.

**Fix:**

1. Update `snapshotsStore.Snapshot` to match the schema fields:
   ```ts
   export interface Snapshot {
     id: string
     capturedAt: string
     month: string
     netIncome: number
     totalFixedExpenses: number
     totalVariableSpent: number
     totalDebt: number
     dti: number
     savingsRate: number
     netWorth: number
     healthScore: number | null
   }
   ```
2. Update `SnapshotList.vue` to use the new field names if it renders any of them.
3. Remove the `as any` cast in `main.ts::hydrateStores()`.
4. Update E2E fixtures (already using schema-compliant names ✓).

**Acceptance:** `npm run typecheck` clean, `npm test` green, no `as any` in hydrateStores for snapshots.

---

### DEBT-002 — Align `cardsStore.CardDebt.dueDate` type with `CardSchema`

**Priority:** Medium  
**Effort:** S  
**Origin:** Post-review drift finding (2026-05-15)

**Problem:** `cardsStore.CardDebt.dueDate` is typed as `string | null` (ISO date string or null), but `CardSchema` expects `z.number().int().min(1).max(31)` (day of month, 1-31). The mismatch means:

- The cardsStore never validates `dueDate` as a number.
- `DueDateAlerts.vue` parses it as a string date (`new Date(c.dueDate)`), which won't work with a numeric day.

**Fix (choose one of two approaches):**

- **Option A (schema wins):** Change store type to `dueDate: number | null` (day of month); update `DueDateAlerts.vue` to compute the full date as `new Date(year, month, dueDate)` where month comes from current date.
- **Option B (store wins):** Change schema to `dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable()` — more ergonomic for the component and matches ISO conventions.

Recommend **Option B** (schema conforms to how the app actually uses it).

**Acceptance:** `CardSchema` and `cardsStore.CardDebt.dueDate` have matching types; E2E fixtures updated; `npm test` + `npm run typecheck` green.
