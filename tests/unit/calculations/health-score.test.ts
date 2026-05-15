import { describe, expect, it } from 'vitest'
import { calcHealthScore } from '@/lib/calculations/health-score'

describe('lib/calculations/health-score', () => {
  it('TC-U-024 (AC-11.1, AC-11.2): full inputs return score 0-100 and a descriptive label', () => {
    const result = calcHealthScore({
      dti: 20,
      emergencyMonths: 4,
      housingRatio: 28,
      savingsRate: 22,
    })
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
    expect(['critical', 'at-risk', 'regular', 'good', 'excellent']).toContain(result.label)
    expect(result.missing).toEqual([])
  })

  it('TC-U-025 (AC-11.4): missing emergency → renormalizes; missing[] includes "emergency"', () => {
    const result = calcHealthScore({
      dti: 20,
      emergencyMonths: null,
      housingRatio: 28,
      savingsRate: 22,
    })
    expect(result.missing).toContain('emergency')
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
    expect(result.components.emergency).toBeNull()
  })

  it('TC-U-026 (EC-2): DTI > 100% → dti component scores 0, total score < 50', () => {
    const result = calcHealthScore({
      dti: 150,
      emergencyMonths: 4,
      housingRatio: 28,
      savingsRate: 22,
    })
    expect(result.components.dti).toBe(0)
    expect(result.score).toBeLessThan(50)
  })

  it('TC-U-027 (AC-11.1): best-case → label=excellent, score>=90', () => {
    const result = calcHealthScore({
      dti: 0,
      emergencyMonths: 6,
      housingRatio: 10,
      savingsRate: 30,
    })
    expect(result.label).toBe('excellent')
    expect(result.score).toBeGreaterThanOrEqual(90)
  })

  it('TC-U-027 (AC-11.1): worst-case → label=critical, score<=20', () => {
    const result = calcHealthScore({
      dti: 100,
      emergencyMonths: 0,
      housingRatio: 60,
      savingsRate: 0,
    })
    expect(result.label).toBe('critical')
    expect(result.score).toBeLessThanOrEqual(20)
  })

  it('AC-11.4: all inputs missing → score 0, all components null, missing has 4', () => {
    const result = calcHealthScore({
      dti: null,
      emergencyMonths: null,
      housingRatio: null,
      savingsRate: null,
    })
    expect(result.missing).toHaveLength(4)
    expect(result.score).toBe(0)
  })
})
