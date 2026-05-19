// Tests for src/lib/tax/colombia/constants.
// Feature: 20260516-sprint1-mejoras-finanzas · Covers AC-4.1 invariant, AC-5.1 invariant.
// TCs: TC-U-022, TC-U-023.

import { describe, expect, it } from 'vitest'
import { SMMLV_2025, SOLIDARITY_THRESHOLD, TRANSPORT_THRESHOLD } from '@/lib/tax/colombia/constants'

describe('lib/tax/colombia/constants — Sprint 1 thresholds', () => {
  it('TC-U-022 (AC-4.1 invariant): SOLIDARITY_THRESHOLD === SMMLV_2025 * 4', () => {
    expect(SMMLV_2025).toBeGreaterThan(0)
    expect(SOLIDARITY_THRESHOLD).toBe(SMMLV_2025 * 4)
  })

  it('TC-U-023 (AC-5.1 invariant): TRANSPORT_THRESHOLD === SMMLV_2025 * 2', () => {
    expect(TRANSPORT_THRESHOLD).toBe(SMMLV_2025 * 2)
  })

  it('SMMLV_2025 matches Decreto 1572 de 2024 ($1.423.500)', () => {
    expect(SMMLV_2025).toBe(1_423_500)
  })
})
