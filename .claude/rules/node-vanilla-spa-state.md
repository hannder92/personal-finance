---
description: State mutation and render cycle rules for the vanilla JS SPA
---

# State & Render Cycle

## Principles

1. **Never mutate state in render functions.** State changes only happen in event handlers. Render functions are pure view-from-state.
2. **Targeted partials, not full re-render.** Full `render()` only on: boot, language switch, currency switch, import. All other mutations call a focused `render*()` + `updateDashboardPartial()`.
3. **Always call `saveState()` after mutating state.** It is debounced 300 ms — never call it inside a loop.
4. **State shape changes require two edits:** `buildDefaultState()` for new data AND `migrate()` for existing saved data. Missing either breaks users who have localStorage data.
5. **One source of truth.** The `state` object drives all renders. Never store display state in DOM attributes and read it back; read from `state`.

## Examples

✅ Correct mutation + partial render:
```js
state.income.grossSalary = parseFloat(e.target.value) || 0;
renderDeductions();           // targeted
updateDashboardPartial();     // keep summary in sync
saveState();
```

✅ Correct schema evolution:
```js
// buildDefaultState()
variableExpenses: [],   // new field added

// migrate()  ← ALSO required
if (!s.variableExpenses) s.variableExpenses = [];
```

❌ Mutating state from a render function:
```js
function renderGoals() {
  state.goals.push({ ... });   // WRONG — side-effect in render
}
```

❌ Calling full render on a field edit:
```js
grossSalaryInput.addEventListener('input', () => {
  state.income.grossSalary = ...;
  render();   // WRONG — forces full DOM rebuild for a number change
});
```

❌ Adding a state field only in `buildDefaultState()` without `migrate()`:
```js
// buildDefaultState() updated ✓
// migrate() not updated ✗ → existing users get undefined on the new field
```

## Anti-patterns

- Reading DOM values as state (`document.getElementById('x').value` treated as ground truth)
- Calling `render()` inside a `setInterval` or `requestAnimationFrame` loop
- Using `setTimeout` to defer state saves beyond the existing 300 ms debounce
- Accessing `state` from inside a `draw*()` canvas function (pass computed values as args instead)
