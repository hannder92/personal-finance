---
description: Vue 3.5 + Pinia architecture rules — layers, store pattern, App.vue shell, CRUD completeness
---

# Vue Architecture Rules

## Principles

1. Dependency direction is **strictly inward**: `views → components → composables → stores → lib`. No reverse imports.
2. `lib/` is framework-free: zero Vue or Pinia imports. Functions there are testable with plain Node.
3. State lives in Pinia stores. Components hold only ephemeral UI state (`showForm`, `pendingId`).
4. `App.vue` is the persistent layout shell — navigation, theme, and locale toggles are wired there, not in individual views.
5. Every domain view that exposes a list **MUST** also expose a create flow; read-only views must be documented as such.

---

## Layer Rules

### `lib/` — Pure Functions

✅ Zero side effects, zero framework imports:

```ts
// lib/calculations/amortization.ts
export function calcDebtTimeline(debt: Debt): DebtTimeline {
  const months = monthsToPayoff(debt.balance, debt.apr, debt.minPayment)
  return {
    type: debt.type,
    months,
    totalInterest: Math.max(0, months * debt.minPayment - debt.balance),
  }
}
```

❌ Vue/Pinia import inside lib/:

```ts
// lib/calculations/amortization.ts — FORBIDDEN
import { useCardsStore } from '@/stores/cardsStore' // breaks lib/ purity
```

### `stores/` — Pinia Setup Stores

Pattern: `state = reactive({})`, boundary guards before mutations, `globalThis.crypto.randomUUID()` for IDs.

✅ Setup store with boundary validation:

```ts
export const useCardsStore = defineStore('cards', () => {
  const state = reactive<CardsState>({ items: [] })

  function addCard(input: Omit<CardDebt, 'id'>): void {
    if (!isValidName(input.name)) return // guard — silently discard invalid input
    if (!isValidAmount(input.balance)) return
    state.items.push({ ...input, id: globalThis.crypto.randomUUID() })
  }

  return { state, addCard }
})
```

❌ Sequential IDs or Math.random():

```ts
state.items.push({ ...input, id: state.items.length + 1 }) // FORBIDDEN — predictable, collides on import
```

❌ Direct mutation from component:

```ts
// In a component — FORBIDDEN
cardsStore.state.items.push({ id: 'x', ... })  // bypasses validation and devtools
```

### Accessing Store State in Components

Setup stores expose `store.state.field` directly — `storeToRefs()` is NOT required for the nested `state` reactive object:

✅ Correct:

```ts
const cards = useCardsStore()
// In template: cards.state.items, cards.state.items.length
```

❌ Unnecessary (and potentially incorrect):

```ts
const { state } = storeToRefs(cardsStore) // storeToRefs on nested reactive doesn't add value
```

Use `storeToRefs()` only when destructuring **top-level** reactive refs directly from a store.

### `composables/` — Domain + Store Bridge

Composables connect stores to calculations and manage shared reactive state.
Use module-level singleton `ref` when the composable is meant to be shared across multiple component instances:

✅ Singleton pattern for global state (e.g., theme):

```ts
const sharedIsDark = ref(false) // module-level — one instance across all callers

export function useTheme() {
  const settings = useSettingsStore()
  watch(() => settings.state.theme, applyHtmlClass, { immediate: true })
  return { isDark: sharedIsDark, setTheme }
}
```

❌ Calling lib/ directly from a view:

```ts
// In DashboardView.vue — FORBIDDEN
import { calcHealthScore } from '@/lib/calculations/health-score'
const score = calcHealthScore(...)  // lib/ must be called from composables or stores, not views
```

---

## App.vue — Persistent Layout Shell

`App.vue` MUST contain the navigation shell. **Never leave it as a bare `<RouterView>`.**

✅ Required structure:

```vue
<template>
  <div class="min-h-screen bg-white dark:bg-slate-950">
    <!-- 1. Sticky top bar with logo + desktop nav + ThemeToggle + LanguageToggle -->
    <header v-if="!isOnboarding" class="sticky top-0 z-50 ...">
      <RouterLink to="/">MisFinanzas</RouterLink>
      <nav class="hidden md:block">
        <RouterLink v-for="item in ALL_NAV" :to="item.to" ...>{{ item.label }}</RouterLink>
      </nav>
      <ThemeToggle :model-value="theme" @update:model-value="setTheme" />
      <LanguageToggle :model-value="locale" @update:model-value="setLocale" />
    </header>

    <!-- 2. Main content with bottom padding for mobile nav -->
    <main :class="{ 'pb-16 md:pb-0': !isOnboarding }">
      <RouterView />
    </main>

    <!-- 3. Mobile bottom nav using RouterLink (SPA-correct) -->
    <nav v-if="!isOnboarding" class="fixed inset-x-0 bottom-0 md:hidden ...">
      <RouterLink v-for="item in MOBILE_NAV" :to="item.to" ...>{{ item.label }}</RouterLink>
    </nav>
  </div>
</template>
```

❌ Bare RouterView (no navigation, no toggles):

```vue
<template>
  <div>
    <RouterView />
    <!-- FORBIDDEN as the complete App.vue — users have no way to navigate -->
  </div>
</template>
```

**When adding a new route**: always add it to `ALL_NAV` in `App.vue` on the same task/PR. A route unreachable from the UI is incomplete.

**Use `RouterLink`, not `<a href>`**: `<a href="/income">` causes a full-page reload in SPA mode. `RouterLink` uses the History API.

---

## CRUD Completeness in Domain Views

Every view whose domain store exposes an `add()` / `addCard()` / `addLoan()` action **MUST** have a visible CTA and an add form before the task can be marked done.

✅ Complete domain view:

```vue
<template>
  <section>
    <header class="flex items-center justify-between">
      <h1>Deudas</h1>
      <button @click="showForm = !showForm">+ Agregar</button>
      <!-- CTA required -->
    </header>

    <form v-if="showForm" @submit.prevent="onSubmit">...</form>
    <!-- form required -->

    <div v-if="cards.state.items.length === 0 && !showForm" class="...">
      Sin deudas registradas.
      <!-- empty state required -->
    </div>

    <CardCard v-for="item in cards.state.items" ... />
  </section>
</template>
```

❌ Incomplete domain view (list only, no add flow):

```vue
<template>
  <section>
    <h1>Deudas</h1>
    <!-- no CTA, no form — INCOMPLETE -->
    <CardCard v-for="item in cards.state.items" ... />
  </section>
</template>
```

**Exempt views** (read-only by design, must be documented as such in task DoD):

- `DashboardView` — aggregate display
- `HistoryView` — snapshot archive (auto-generated)
- `AllocationView` — derived from income/expenses ratios

---

## CSS Grid Alignment in Inline Forms

When a form grid has a button or control column alongside labeled inputs, use an **invisible label spacer** to align controls with the input fields — not `align-self: end`.

✅ Invisible spacer for alignment:

```vue
<div class="grid grid-cols-2 gap-2 items-start">
  <label class="flex flex-col gap-1">
    <span class="text-xs">Nombre</span>
    <input ... />
    <span class="text-xs text-slate-400">Hint text below</span>  <!-- extra height here -->
  </label>

  <div class="flex flex-col gap-1">
    <span class="text-xs invisible">_</span>   <!-- invisible spacer matches label height -->
    <button type="button">✕</button>
  </div>
</div>
```

❌ `align-self: end` (breaks when sibling has hint text):

```vue
<div class="grid grid-cols-2 gap-2 items-start">
  <label class="flex flex-col gap-1">
    <span class="text-xs">Nombre</span>
    <input ... />
    <span class="text-xs text-slate-400">Hint text</span>
  </label>
  <button class="self-end">✕</button>  <!-- pushes to bottom, misaligns with input -->
</div>
```

---

## Anti-patterns

| Anti-pattern                                | Why it's wrong                             | Fix                                                     |
| ------------------------------------------- | ------------------------------------------ | ------------------------------------------------------- |
| Bare `<RouterView>` in App.vue              | No navigation = users can't reach any view | Add layout shell with RouterLink nav                    |
| `<a :href>` instead of `RouterLink`         | Causes full-page reload, breaks SPA        | Use `RouterLink :to`                                    |
| View with list but no add CTA               | Store has `add()` but it's inaccessible    | Add button + inline form                                |
| `lib/` importing from `@/stores/`           | Breaks testability, couples domain logic   | Move logic to composable or store                       |
| Sequential IDs                              | Predictable, collides on JSON import       | Use `globalThis.crypto.randomUUID()`                    |
| Calling store action without boundary guard | Silent data corruption                     | Add `isValidName()` / `isValidAmount()` at action entry |

---

## Quality Checklist

- [ ] `lib/` files have zero Vue/Pinia imports (verifiable with `grep`)
- [ ] Each new store action has at least one boundary guard before `state.items.push()`
- [ ] All new entity IDs use `globalThis.crypto.randomUUID()`
- [ ] New route is added to `ALL_NAV` / `MOBILE_NAV` in `App.vue`
- [ ] View with `add()` store action has visible CTA + form + empty state
- [ ] `RouterLink` used for all in-app navigation (no `<a href>` for internal routes)
- [ ] CSS grid button columns use invisible label spacers when sibling has hint text
