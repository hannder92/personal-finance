---
description: i18n rules for the vanilla JS SPA — all user-visible strings must be translatable
---

# i18n (Español / English)

## Principles

1. **All user-visible strings go through `t('key')`** in JS. Never hardcode Spanish or English text in render functions.
2. **Every key must exist in both `TRANSLATIONS.es` AND `TRANSLATIONS.en`.** Adding to only one silently falls back to the key string on the other language.
3. **Static HTML uses `data-i18n="key"` attributes.** `applyI18n()` patches them on language switch — it does not call render functions.
4. **`currentLang` is the module-level source of truth** for the active language. Never read `state.lang` inside render functions; use `currentLang`.

## Examples

✅ Adding a new label:
```js
// 1. TRANSLATIONS object (top of app.js)
es: { ..., 'mySection.label': 'Etiqueta' },
en: { ..., 'mySection.label': 'Label' },

// 2. In JS render function
span.textContent = t('mySection.label');

// 3. In HTML (static elements)
<label data-i18n="mySection.label">Etiqueta</label>
```

✅ Dynamic string with interpolation (no helper exists — build inline):
```js
`${t('goals.monthsLeft')}: ${months}`
```

❌ Hardcoded Spanish in a render function:
```js
cell.textContent = 'Total gastos';   // WRONG — breaks EN mode
```

❌ Key in `es` only:
```js
es: { 'income.newField': 'Nuevo campo' },
// en missing → English users see "income.newField" literally
```

❌ Reading `state.lang` in render functions:
```js
if (state.lang === 'es') { ... }   // WRONG — use currentLang
```

## Anti-patterns

- Using `innerHTML` with embedded language-specific text
- Conditional text based on `state.currency` instead of a translation key
- Keys that include the language ("label_es", "label_en") rather than a single neutral key
