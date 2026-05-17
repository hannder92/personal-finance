---
description: Vue 3.5 + Pinia layers, store pattern, App.vue shell, CRUD completeness
---

# Vue Architecture Rules

## Principles

1. Dependency direction is **strictly inward**: `views → components → composables → stores → lib`. No reverse imports.
2. `lib/` is framework-free: zero Vue or Pinia imports. Testable with plain Node/Vitest.
3. State lives in Pinia stores. Components hold only ephemeral UI state (`showForm`, `pendingId`).
4. `App.vue` is the persistent layout shell — navigation, theme, and locale toggles live there.
5. Every domain view with a store `add()` action **MUST** expose a CTA + form; read-only views must document it.

## Layer Rules

### `lib/` — Pure Functions

✅ Pure, no framework:

```ts
export function calcDebtTimeline(debt: Debt): DebtTimeline {
  const months = monthsToPayoff(debt.balance, debt.apr, debt.minPayment)
  return {
    type: debt.type,
    months,
    totalInterest: Math.max(0, months * debt.minPayment - debt.balance),
  }
}
```

❌ Vue/Pinia import inside `lib/` — breaks testability (FORBIDDEN).

### `stores/` — Pinia Setup Stores

Pattern: `state = reactive({})` + boundary guards before mutations + `globalThis.crypto.randomUUID()` for IDs.

✅ Correct setup store:

```ts
export const useCardsStore = defineStore('cards', () => {
  const state = reactive<CardsState>({ items: [] })
  function addCard(input: Omit<CardDebt, 'id'>): void {
    if (!isValidName(input.name)) return // guard — discard invalid silently
    if (!isValidAmount(input.balance)) return
    state.items.push({ ...input, id: globalThis.crypto.randomUUID() })
  }
  return { state, addCard }
})
```

❌ `state.items.push({ id: state.items.length + 1 })` — sequential IDs collide on JSON import (FORBIDDEN).
❌ `cardsStore.state.items.push(...)` from a component — bypasses validation (FORBIDDEN).

### Accessing Store State

Access via `store.state.field` directly — `storeToRefs()` is NOT needed for the nested `state = reactive({})` object.
Use `storeToRefs()` only when destructuring top-level reactive `ref`s from a store.

### `composables/` — Store + Lib Bridge

Composables are the ONLY layer that may call both stores AND lib/calculations.
Views call composables. Views MUST NOT import from lib/calculations directly.

✅ Correct bridge pattern — domain logic goes through composable:

```ts
// src/composables/useNetIncome.ts
import { computed } from 'vue'
import { calcNetSalary } from '@/lib/calculations/net-income'
import { useIncomeStore } from '@/stores/incomeStore'

export function useNetIncome() {
  const income = useIncomeStore()
  const netIncome = computed(() =>
    calcNetSalary({
      grossSalary: income.state.grossSalary,
      deductions: income.state.deductions,
      nonSalaryBenefits: income.state.nonSalaryBenefits,
    })
  )
  return { netIncome }
}
```

❌ Calling lib directly from views — breaks architecture + untestable in isolation:

```ts
// src/views/DashboardView.vue — FORBIDDEN
import { calcNetSalary } from '@/lib/calculations/net-income'
import { useIncomeStore } from '@/stores/incomeStore'

const income = useIncomeStore()
const netIncome = computed(() => calcNetSalary({ grossSalary: income.state.grossSalary, ... }))
// Move this to a composable, not a view.
```

Use module-level singleton `ref` for composables shared across multiple instances:

✅ Shared theme state:

```ts
const sharedIsDark = ref(false) // module-level singleton
export function useTheme() {
  const settings = useSettingsStore()
  watch(() => settings.state.theme, applyHtmlClass, { immediate: true })
  return { isDark: sharedIsDark, setTheme }
}
```

## App.vue — Persistent Layout Shell

`App.vue` MUST contain the navigation shell. **Never leave it as a bare `<RouterView>`.**

✅ Required structure:

```vue
<template>
  <div class="min-h-screen bg-white dark:bg-slate-950">
    <header v-if="!isOnboarding" class="sticky top-0 z-50">
      <RouterLink to="/">MisFinanzas</RouterLink>
      <nav class="hidden md:block">
        <RouterLink v-for="item in ALL_NAV" :to="item.to">{{ item.label }}</RouterLink>
      </nav>
      <ThemeToggle :model-value="theme" @update:model-value="setTheme" />
      <LanguageToggle :model-value="locale" @update:model-value="setLocale" />
    </header>
    <main :class="{ 'pb-16 md:pb-0': !isOnboarding }"><RouterView /></main>
    <nav v-if="!isOnboarding" class="fixed inset-x-0 bottom-0 md:hidden">
      <RouterLink v-for="item in MOBILE_NAV" :to="item.to">{{ item.label }}</RouterLink>
    </nav>
  </div>
</template>
```

❌ `<div><RouterView /></div>` as the complete App.vue — no navigation means no view is reachable (FORBIDDEN).

**New route rule**: add it to `ALL_NAV` / `MOBILE_NAV` on the same PR. Use `RouterLink :to`, never `<a href>` (causes full-page reload).

## CRUD Completeness in Domain Views

Every view whose domain store has `add()` / `addCard()` / `addLoan()` **MUST** include CTA + form + empty state.

✅ Complete view:

```vue
<header class="flex items-center justify-between">
  <h1>Deudas</h1>
  <button @click="showForm = !showForm">+ Agregar</button>        <!-- CTA required -->
</header>
<form v-if="showForm" @submit.prevent="onSubmit">...</form>
<!-- form required -->
<div v-if="!items.length && !showForm">Sin deudas registradas.</div>
<!-- empty state -->
```

❌ `<h1>Deudas</h1><CardCard v-for="..." />` with no CTA — list-only view is INCOMPLETE.

**Exempt (read-only, must be documented in DoD):** `DashboardView`, `HistoryView`, `AllocationView`.

## CSS Grid Alignment in Inline Forms

When a button/control column sits next to labeled inputs in a grid, use an **invisible label spacer** — not `align-self: end`.

✅ Spacer approach (works even when sibling has hint text):

```vue
<div class="grid grid-cols-2 gap-2 items-start">
  <label class="flex flex-col gap-1">
    <span class="text-xs">Nombre</span><input /><span class="text-xs text-slate-400">Hint</span>
  </label>
  <div class="flex flex-col gap-1">
    <span class="invisible text-xs">_</span>  <!-- matches label height -->
    <button>✕</button>
  </div>
</div>
```

❌ `<button class="self-end">✕</button>` — pushes below inputs when sibling has hint text.

## Anti-patterns

| Anti-pattern                        | Fix                                     |
| ----------------------------------- | --------------------------------------- |
| Bare `<RouterView>` in App.vue      | Add full layout shell                   |
| `<a href>` for internal links       | Use `RouterLink :to`                    |
| List view with no add CTA           | Add button + form + empty state         |
| `lib/` importing Vue/Pinia          | Move to composable                      |
| Sequential or `Math.random()` IDs   | Use `crypto.randomUUID()`               |
| Store action without boundary guard | Add `isValidName()` / `isValidAmount()` |

## Quality Checklist

- [ ] `lib/` files: `grep -r "from 'vue'\|from 'pinia'" src/lib/` returns empty
- [ ] Every new store action has at least one boundary guard before `state.items.push()`
- [ ] All new entity IDs use `globalThis.crypto.randomUUID()`
- [ ] New route added to `ALL_NAV` / `MOBILE_NAV` in `App.vue`
- [ ] View with `add()` store action has CTA + inline form + empty state message
- [ ] `RouterLink` used for all in-app navigation
- [ ] Grid button columns use invisible spacer when sibling label has hint text
