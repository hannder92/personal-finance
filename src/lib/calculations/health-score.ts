import {
  DTI_THRESHOLDS,
  EMERGENCY_THRESHOLDS,
  HEALTH_WEIGHTS,
  HOUSING_THRESHOLDS,
  SAVINGS_THRESHOLDS,
} from '../health/thresholds'

export type HealthLabel = 'critical' | 'at-risk' | 'regular' | 'good' | 'excellent'

export interface HealthScoreInputs {
  dti: number | null
  emergencyMonths: number | null
  housingRatio: number | null
  savingsRate: number | null
}

export interface HealthScoreResult {
  score: number
  label: HealthLabel
  components: {
    dti: number | null
    emergency: number | null
    housing: number | null
    savings: number | null
  }
  missing: string[]
}

// Linear interpolation between two (x, y) pairs, clamped to the endpoints.
function lerp(x: number, x0: number, y0: number, x1: number, y1: number): number {
  if (x <= Math.min(x0, x1)) return x0 <= x1 ? y0 : y1
  if (x >= Math.max(x0, x1)) return x0 <= x1 ? y1 : y0
  return y0 + ((x - x0) * (y1 - y0)) / (x1 - x0)
}

function scoreDTI(dti: number): number {
  if (dti <= DTI_THRESHOLDS.good) return 100
  if (dti >= DTI_THRESHOLDS.bad) return 0
  // 20% → 100, 36% → 50, 50% → 0 (piecewise linear).
  if (dti <= DTI_THRESHOLDS.warning) {
    return lerp(dti, DTI_THRESHOLDS.good, 100, DTI_THRESHOLDS.warning, 50)
  }
  return lerp(dti, DTI_THRESHOLDS.warning, 50, DTI_THRESHOLDS.bad, 0)
}

function scoreEmergency(months: number): number {
  if (months <= EMERGENCY_THRESHOLDS.bad) return 0
  if (months >= EMERGENCY_THRESHOLDS.good) return 100
  if (months <= EMERGENCY_THRESHOLDS.warning) {
    return lerp(months, EMERGENCY_THRESHOLDS.bad, 0, EMERGENCY_THRESHOLDS.warning, 50)
  }
  return lerp(months, EMERGENCY_THRESHOLDS.warning, 50, EMERGENCY_THRESHOLDS.good, 100)
}

function scoreHousing(ratio: number): number {
  if (ratio <= HOUSING_THRESHOLDS.good) return 100
  if (ratio >= HOUSING_THRESHOLDS.bad) return 0
  if (ratio <= HOUSING_THRESHOLDS.warning) {
    return lerp(ratio, HOUSING_THRESHOLDS.good, 100, HOUSING_THRESHOLDS.warning, 50)
  }
  return lerp(ratio, HOUSING_THRESHOLDS.warning, 50, HOUSING_THRESHOLDS.bad, 0)
}

function scoreSavings(rate: number): number {
  if (rate <= SAVINGS_THRESHOLDS.bad) return 0
  if (rate >= SAVINGS_THRESHOLDS.good) return 100
  if (rate <= SAVINGS_THRESHOLDS.warning) {
    return lerp(rate, SAVINGS_THRESHOLDS.bad, 0, SAVINGS_THRESHOLDS.warning, 50)
  }
  return lerp(rate, SAVINGS_THRESHOLDS.warning, 50, SAVINGS_THRESHOLDS.good, 100)
}

function labelFor(score: number): HealthLabel {
  if (score <= 20) return 'critical'
  if (score <= 40) return 'at-risk'
  if (score <= 60) return 'regular'
  if (score <= 80) return 'good'
  return 'excellent'
}

// Per ADR-6: when components are missing, re-normalize the remaining weights to sum to 1.
export function calcHealthScore(inputs: HealthScoreInputs): HealthScoreResult {
  const components = {
    dti: inputs.dti === null ? null : scoreDTI(inputs.dti),
    emergency: inputs.emergencyMonths === null ? null : scoreEmergency(inputs.emergencyMonths),
    housing: inputs.housingRatio === null ? null : scoreHousing(inputs.housingRatio),
    savings: inputs.savingsRate === null ? null : scoreSavings(inputs.savingsRate),
  }

  const missing: string[] = []
  if (components.dti === null) missing.push('dti')
  if (components.emergency === null) missing.push('emergency')
  if (components.housing === null) missing.push('housing')
  if (components.savings === null) missing.push('savings')

  const entries: ReadonlyArray<readonly [number | null, number]> = [
    [components.dti, HEALTH_WEIGHTS.dti],
    [components.emergency, HEALTH_WEIGHTS.emergency],
    [components.housing, HEALTH_WEIGHTS.housing],
    [components.savings, HEALTH_WEIGHTS.savings],
  ]

  const presentWeightSum = entries.reduce((acc, [val, w]) => (val === null ? acc : acc + w), 0)

  if (presentWeightSum === 0) {
    return { score: 0, label: labelFor(0), components, missing }
  }

  const weightedSum = entries.reduce((acc, [val, w]) => (val === null ? acc : acc + val * w), 0)
  let score = Math.round(weightedSum / presentWeightSum)

  // Catastrophic DTI cap (EC-2): when monthly debt obligations exceed income, the
  // user is insolvent regardless of how good other components look. Cap at 40
  // (boundary of `at-risk`) so other positives can't mask the severity.
  if (inputs.dti !== null && inputs.dti > 100 && score > 40) {
    score = 40
  }

  return { score, label: labelFor(score), components, missing }
}
