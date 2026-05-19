// Returns a glossary term object given a known key. Used by tooltip components
// to render plain-language explanations of financial metrics. Strings are pulled
// from i18n so terms switch with the active locale.

import { i18n } from '@/i18n'

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

interface TermShape {
  good?: number
  risky?: number
  recommended?: number
  rangeMin?: number
  rangeMax?: number
}

const SHAPES: Record<GlossaryKey, TermShape> = {
  dti: { good: 20, risky: 36 },
  housing: { recommended: 30 },
  emergency: { rangeMin: 3, rangeMax: 6 },
  savings: {},
  healthScore: {},
}

export function useFinancialGlossary() {
  function getTerm(key: GlossaryKey): GlossaryTerm | null {
    const shape = SHAPES[key]
    if (!shape) return null
    const t = i18n.global.t
    return {
      title: t(`glossary.${key}.title`),
      body: t(`glossary.${key}.body`),
      ...shape,
    }
  }
  return { getTerm }
}
