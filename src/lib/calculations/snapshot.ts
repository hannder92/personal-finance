export interface SnapshotInputs {
  month: string
  netIncome: number
  totalFixedExpenses: number
  totalVariableSpent: number
  totalDebt: number
  /** Monthly debt obligation (min payments + installments) at month close. V5 field. */
  debtPayments: number
  dti: number
  savingsRate: number
  netWorth: number
  healthScore: number | null
}

export interface SnapshotRecord extends SnapshotInputs {
  id: string
  capturedAt: string
}

export function buildSnapshot(inputs: SnapshotInputs, now: Date): SnapshotRecord {
  return {
    id: crypto.randomUUID(),
    capturedAt: now.toISOString(),
    ...inputs,
  }
}

// FIFO cap: keep the most recent `max` snapshots sorted by month descending.
export function applySnapshotCap(
  snapshots: ReadonlyArray<SnapshotRecord>,
  max = 24
): SnapshotRecord[] {
  return [...snapshots]
    .sort((a, b) => (a.month < b.month ? 1 : a.month > b.month ? -1 : 0))
    .slice(0, max)
}
