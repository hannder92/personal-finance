// Verifies every key in es.json exists in en.json and vice versa.
// Run via: npx tsx scripts/i18n-check.ts
import es from '../src/i18n/es.json' with { type: 'json' }
import en from '../src/i18n/en.json' with { type: 'json' }

type JsonValue = string | number | boolean | null | { [k: string]: JsonValue } | JsonValue[]

function flatten(obj: JsonValue, prefix = ''): string[] {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) return [prefix]
  return Object.entries(obj).flatMap(([k, v]) =>
    flatten(v as JsonValue, prefix ? `${prefix}.${k}` : k)
  )
}

const esKeys = new Set(flatten(es as JsonValue))
const enKeys = new Set(flatten(en as JsonValue))

const missingInEn = [...esKeys].filter((k) => !enKeys.has(k))
const missingInEs = [...enKeys].filter((k) => !esKeys.has(k))

if (missingInEn.length === 0 && missingInEs.length === 0) {
  console.warn('i18n: all keys present in both locales.')
  process.exit(0)
}

if (missingInEn.length > 0) console.error('Missing in en.json:', missingInEn)
if (missingInEs.length > 0) console.error('Missing in es.json:', missingInEs)
process.exit(1)
