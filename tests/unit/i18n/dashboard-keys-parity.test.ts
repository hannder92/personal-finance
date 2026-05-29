import { describe, expect, it } from 'vitest'
import en from '@/i18n/en.json'
import es from '@/i18n/es.json'

function collectKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = []
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...collectKeys(value as Record<string, unknown>, path))
    } else {
      keys.push(path)
    }
  }
  return keys
}

function dashboardKeys(messages: Record<string, unknown>): string[] {
  return collectKeys(messages).filter((k) => k.startsWith('dashboard.'))
}

describe('dashboard i18n parity (TC-U-002)', () => {
  it('every dashboard.* key exists in es and en with non-empty values', () => {
    const esKeys = dashboardKeys(es as Record<string, unknown>)
    const enKeys = new Set(dashboardKeys(en as Record<string, unknown>))

    expect(esKeys.length).toBeGreaterThan(0)
    for (const key of esKeys) {
      expect(enKeys.has(key)).toBe(true)
      const parts = key.split('.')
      let esVal: unknown = es
      let enVal: unknown = en
      for (const p of parts) {
        esVal = (esVal as Record<string, unknown>)[p]
        enVal = (enVal as Record<string, unknown>)[p]
      }
      expect(typeof esVal).toBe('string')
      expect(typeof enVal).toBe('string')
      expect((esVal as string).length).toBeGreaterThan(0)
      expect((enVal as string).length).toBeGreaterThan(0)
    }
  })
})
