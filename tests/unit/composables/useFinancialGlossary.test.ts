// Tests for composables/useFinancialGlossary.
// Feature: 20260516-sprint1-mejoras-finanzas · Covers AC-2.1..2.5 · TC-U-017..021.
//
// Tooltips on KpiCard and HealthScore consume getTerm() results. RED today
// because the stub returns null for every key.

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { i18n, setLocale } from '@/i18n'
import { useFinancialGlossary } from '@/composables/useFinancialGlossary'

describe('useFinancialGlossary (AC-2.1..2.5)', () => {
  beforeEach(() => {
    setLocale('es')
  })
  afterEach(() => {
    setLocale('es')
  })

  it('TC-U-017 (AC-2.1): DTI term has title, body, good and risky thresholds', () => {
    const { getTerm } = useFinancialGlossary()
    const term = getTerm('dti')
    expect(term).toBeTruthy()
    expect(term?.title.length ?? 0).toBeGreaterThan(0)
    expect(term?.body ?? '').toMatch(/deuda|debt/i)
    // Body should mention the percentage concept explicitly.
    expect(term?.body ?? '').toMatch(/%|porcentaje|percent/i)
    expect(term?.good).toBe(20)
    expect(term?.risky).toBe(36)
  })

  it('TC-U-018 (AC-2.2): housing term has title, body, recommended ceiling', () => {
    const { getTerm } = useFinancialGlossary()
    const term = getTerm('housing')
    expect(term).toBeTruthy()
    expect(term?.title.length ?? 0).toBeGreaterThan(0)
    expect(term?.body.length ?? 0).toBeGreaterThan(0)
    expect(term?.recommended).toBe(30)
  })

  it('TC-U-019 (AC-2.3): emergency term has title, body, months range 3..6', () => {
    const { getTerm } = useFinancialGlossary()
    const term = getTerm('emergency')
    expect(term).toBeTruthy()
    expect(term?.title.length ?? 0).toBeGreaterThan(0)
    expect(term?.body.length ?? 0).toBeGreaterThan(0)
    expect(term?.rangeMin).toBe(3)
    expect(term?.rangeMax).toBe(6)
  })

  it('TC-U-020 (AC-2.4): savings term mentions income percentage', () => {
    const { getTerm } = useFinancialGlossary()
    const term = getTerm('savings')
    expect(term).toBeTruthy()
    expect(term?.title.length ?? 0).toBeGreaterThan(0)
    expect(term?.body ?? '').toMatch(/ingres|income/i)
    expect(term?.body ?? '').toMatch(/%|porcentaje|percent/i)
  })

  it('TC-U-021 (AC-2.5): healthScore term mentions 0–100 scale and four components', () => {
    const { getTerm } = useFinancialGlossary()
    const term = getTerm('healthScore')
    expect(term).toBeTruthy()
    expect(term?.title.length ?? 0).toBeGreaterThan(0)
    // Mentions 0..100 scale.
    expect(term?.body ?? '').toMatch(/0[\s\-–—]*100|100/)
    // Mentions four components (DTI / vivienda / emergencia / ahorro).
    const body = term?.body ?? ''
    expect(body).toMatch(/dti|deuda/i)
    expect(body).toMatch(/vivienda|housing/i)
    expect(body).toMatch(/emergencia|emergency/i)
    expect(body).toMatch(/ahorro|saving/i)
  })
})

// Reference i18n import so vue-i18n is configured. setLang ensures es is active for assertions.
void i18n
