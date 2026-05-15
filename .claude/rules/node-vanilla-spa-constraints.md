---
description: Zero-dependency and canvas constraints for the vanilla JS SPA
---

# Zero-dependency & Canvas Constraints

## Principles

1. **No external dependencies.** No npm packages, no CDN `<script>` tags, no `import` statements. The corporate npm registry (`npm.artifacts.furycloud.io`) blocks installs. Everything must be browser built-ins or Node.js built-ins.
2. **Charts use the native Canvas API only.** No Chart.js, D3, or any charting library. Extend `drawDonut()` or `drawDTIGauge()` for new visualizations.
3. **Currency formatting uses `Intl.NumberFormat`.** COP and CLP use 0 decimal places (configured in `getCurrencyConfig()`). Never format currency with `.toFixed()` directly.
4. **`server.js` is zero-dependency.** It uses only `http`, `fs`, `path` built-ins. Do not add middleware or require any npm package in it.

## Examples

✅ Correct chart extension:
```js
// Extend drawDonut() to add a new segment — pass a new entry in the segments array
const segments = [
  { label: t('dash.needs'), value: needs, color: '#3b82f6' },
  { label: t('dash.newCategory'), value: newVal, color: '#f59e0b' },
  ...
];
drawDonut('donut-chart', segments);
```

✅ Correct currency formatting:
```js
const { locale, decimals, symbol } = getCurrencyConfig();
new Intl.NumberFormat(locale, {
  style: 'currency', currency: state.currency,
  minimumFractionDigits: decimals, maximumFractionDigits: decimals
}).format(amount);
```

❌ Adding a charting library:
```html
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>  <!-- WRONG -->
```

❌ Installing an npm package:
```json
"dependencies": { "express": "^4" }   // WRONG — registry blocks it
```

❌ Raw `.toFixed()` for currency display:
```js
`$${amount.toFixed(2)}`   // WRONG — ignores locale, symbol, and COP 0-decimals rule
```

## Anti-patterns

- Reaching for a utility library (lodash, dayjs, uuid) instead of a 3-line vanilla alternative
- Adding `type="module"` to `<script>` (breaks the single-file pattern; no module system needed)
- Generating IDs with `Math.random().toString(36)` without ensuring uniqueness — use `Date.now() + Math.random()` inline as the codebase already does
- Guessing Colombian payroll constants (ARL rate, UVT, retención percentages) — see `node-colombia-payroll.md` for verified values
