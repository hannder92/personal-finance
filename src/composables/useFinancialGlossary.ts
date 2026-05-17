// Stub for T-001 setup. Real implementation lands in T-010.
// Returns a glossary term object given a known key. Used by tooltip components
// to render plain-language explanations of financial metrics.

export interface GlossaryTerm {
  title: string
  body: string
  good?: number
  risky?: number
  recommended?: number
  rangeMin?: number
  rangeMax?: number
}

export type GlossaryKey = 'dti' | 'housing' | 'emergency' | 'savings' | 'healthScore'

export function useFinancialGlossary() {
  function getTerm(_key: GlossaryKey): GlossaryTerm | null {
    return null
  }
  return { getTerm }
}
