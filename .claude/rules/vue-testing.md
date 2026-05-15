---
description: Vitest + @testing-library/vue + @pinia/testing patterns for Vue 3.5
---

# Vue Testing Rules

## Principles

1. **Test pyramid**: ~60% unit (pure functions + store actions) / ~30% component / ~10% E2E.
2. **Three distinct setups** — each layer has its own Pinia initialization pattern; mixing them produces silent failures.
3. Coverage gate: ≥80% on `lib/calculations/` and `lib/tax/`; ≥60% overall. Never decrease.
4. Test IDs reference spec ACs: `it('TC-U-009 (AC-5.1): ...')` — makes traceability automatic.
5. Component tests use `stubActions: false` so real store logic runs; spy on side effects, not actions.

---

## Patterns

### Level 1 — Unit Tests for `lib/` (pure functions)

No Pinia, no Vue. Plain `describe` + `expect`:

✅ Pure function test:

```ts
import { describe, expect, it } from 'vitest'
import { calcDebtTimeline, type CardDebt } from '@/lib/calculations/amortization'

describe('calcDebtTimeline', () => {
  it('TC-U-009 (AC-5.1): card with positive APR returns finite months > 0', () => {
    const card: CardDebt = { type: 'card', balance: 2_000_000, apr: 24, minPayment: 100_000 }
    const result = calcDebtTimeline(card)
    expect(result.months).toBeGreaterThan(0)
    expect(Number.isFinite(result.months)).toBe(true)
  })

  it('EC-10: APR=0 falls back to simple division — no NaN', () => {
    const card: CardDebt = { type: 'card', balance: 1_000_000, apr: 0, minPayment: 100_000 }
    expect(calcDebtTimeline(card).months).toBe(10)
  })
})
```

❌ Pinia in a lib/ test:

```ts
import { createPinia } from 'pinia'
setActivePinia(createPinia()) // UNNECESSARY for lib/ — adds noise, no value
```

### Level 2 — Unit Tests for Pinia Stores

`createPinia()` + `setActivePinia()` in `beforeEach`. Never mock sibling stores here.

✅ Store unit test:

```ts
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useIncomeStore } from '@/stores/incomeStore'

describe('incomeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('addDeduction rejects empty label (boundary guard)', () => {
    const store = useIncomeStore()
    store.addDeduction({ label: '', amount: 4, type: 'percent' })
    expect(store.state.deductions.length).toBe(0)
  })

  it('addDeduction with invalid type does not insert', () => {
    const store = useIncomeStore()
    // @ts-expect-error — testing runtime validation
    store.addDeduction({ label: 'X', amount: 4, type: 'invalid' })
    expect(store.state.deductions.length).toBe(0)
  })
})
```

❌ Sharing Pinia instance across tests:

```ts
const pinia = createPinia() // FORBIDDEN at module level — state bleeds between tests
setActivePinia(pinia)
```

### Level 3 — Component Tests with @testing-library/vue

Use `createTestingPinia({ stubActions: false, createSpy: vi.fn, initialState })`.
Never use `stubActions: true` — it silently prevents real store mutations, masking integration bugs.

✅ Component test with full store wiring:

```ts
import { fireEvent, render, screen } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { describe, expect, it, vi } from 'vitest'
import FixedExpenseList from '@/components/expenses/FixedExpenseList.vue'
import { useExpensesStore } from '@/stores/expensesStore'

function mount(initialItems = []) {
  return render(FixedExpenseList, {
    global: {
      plugins: [
        createTestingPinia({
          createSpy: vi.fn,
          stubActions: false,      // ← always false; test real action logic
          initialState: {
            settings: { state: { currency: 'COP', lang: 'es', theme: 'system', ... } },
            expenses: { state: { items: initialItems } },
          },
        }),
      ],
    },
  })
}

it('AC-4.1: submitted expense appears in list', async () => {
  mount()
  await fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Arriendo' } })
  await fireEvent.click(screen.getByRole('button', { name: /guardar/i }))
  expect(screen.getByText('Arriendo')).toBeInTheDocument()
})
```

❌ `stubActions: true` (default — hides real bugs):

```ts
createTestingPinia({ stubActions: true }) // actions become no-ops — mutations never happen
```

### Level 4 — E2E with Playwright

Use `fixtures.ts` helpers: `freshPage` (no localStorage → triggers onboarding guard) and `returningPage` (pre-seeds `finance_app_data` in localStorage then reloads). Never use raw `page.goto('/')` without a fixture.

## Anti-patterns

| Anti-pattern                            | Why it breaks                                                         | Fix                                              |
| --------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------ |
| `stubActions: true` in component tests  | Store mutations don't run → test passes even with broken action logic | Use `stubActions: false` always                  |
| Module-level `createPinia()`            | State leaks between tests in the same file                            | `setActivePinia(createPinia())` in `beforeEach`  |
| Testing lib/ functions with Pinia setup | Adds setup noise; pure functions have no store dependency             | Plain `describe` + `expect`, no Pinia            |
| Test IDs without AC reference           | Can't trace failures back to specs                                    | Prefix every it-string with `TC-U-NNN (AC-X.Y):` |
| Mocking `globalThis.crypto.randomUUID`  | Makes ID-equality assertions brittle                                  | Test ID shape with regex `/^[0-9a-f]{8}-/`       |

## initialState Shape for createTestingPinia

Always seed the `settings` store when rendering any component that reads currency or locale:

```ts
// Minimum settings seed — avoids "undefined is not a string" in formatCurrency
settings: {
  state: {
    lang: 'es',
    currency: 'COP',
    theme: 'system',
    payoffMethod: 'avalanche',
    lastMonthSeen: null,
    onboarding: { done: true, currentStep: 0, totalSteps: 3 },
  },
},
```

## Quality Checklist

- [ ] New lib/ function has ≥3 test cases: happy path, edge case, invalid input
- [ ] New store action has at least one test for each boundary guard (empty label, negative amount, invalid type)
- [ ] Component tests use `stubActions: false` — verify with `grep stubActions: true` (must be empty)
- [ ] All test names include `TC-xxx (AC-x.x):` or `EC-x:` prefix
- [ ] `setActivePinia(createPinia())` is in `beforeEach`, never at module level
- [ ] E2E tests use `freshPage` or `returningPage` fixtures, never raw `page.goto('/')`
- [ ] Coverage on `lib/calculations/` stays ≥ 80% after change (`npm run test:coverage`)
