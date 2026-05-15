// CFPB-aligned thresholds adapted for Latin American income volatility.
// Each component maps a raw indicator to a 0-100 sub-score.
// Reference: CFPB Financial Well-Being Scale + project clarification Q-2 (weights).

// DTI: ratio of monthly debt obligations to monthly income, as percent.
// 0% optimal, >36% considered high risk (CFPB).
export const DTI_THRESHOLDS = {
  good: 20, // <= 20% → top score
  warning: 36, // 20-36% → linear decline
  bad: 50, // >= 50% → 0
} as const

// Housing ratio: housing expense / income, as percent. 30% threshold widely cited.
export const HOUSING_THRESHOLDS = {
  good: 30,
  warning: 40,
  bad: 60,
} as const

// Savings rate: monthly saved / monthly income, as percent.
export const SAVINGS_THRESHOLDS = {
  bad: 0, // 0% → 0
  warning: 10, // 10% → 50
  good: 20, // 20% → 100
} as const

// Emergency fund: months of expenses covered by liquid savings.
export const EMERGENCY_THRESHOLDS = {
  bad: 0, // 0 months → 0
  warning: 3, // 3 months → 50
  good: 6, // 6+ months → 100
} as const

// Health-score weights per AC-11.2 (clarification Q-2).
export const HEALTH_WEIGHTS = {
  dti: 35,
  emergency: 30,
  housing: 20,
  savings: 15,
} as const
