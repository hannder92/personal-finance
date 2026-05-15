# Project Constitution — personal-finances

> Immutable rules. Amend only via `/sdd.constitution --update`. Each amendment requires fresh sign-off.

## Stack

- Language: `Vanilla JavaScript (ES2020+ browser built-ins only)`
- Runtime: `Node.js 18+ LTS` — static file server only (`http`, `fs`, `path`)
- Framework: `None` — single HTML/CSS/JS SPA, no module system
- Database: `localStorage` — single key `finance_app_data`, schema v1
- Testing: `Manual browser testing only` — no test runner, no test files
- Build: `None` — no transpiler, no bundler, no build step
- Server: `server.js` — zero-dependency static file server

## Architecture

- Pattern: **Single-file SPA** — one `state` object, event handlers, render functions
- State: **MUST** live in a single global `state` object (`buildDefaultState()` shape)
- Render: **MUST** be pure view-from-state; render functions **MUST NOT** produce side effects
- Mutations: **MUST** happen only in event handlers, never in render functions
- Render cycle: **MUST** follow the pattern: mutate `state` → call targeted `render*()` → call `updateDashboardPartial()` → call `saveState()`
- Full re-render (`render()`): **MUST** be called only on boot, language switch, currency switch, and data import — never on field edits
- Schema evolution: **MUST** update both `buildDefaultState()` AND `migrate()` when `state` shape changes

## Testing Policy

- Mode: **Manual browser testing only** — no automated test runner
- Coverage minimum: **N/A** — enforced through code review of render/handler purity
- Verification gate: before declaring a feature done, the golden path **MUST** be exercised manually in a running browser session (`npm start`)
- Edge cases: happy path + at least one error/empty-state path **MUST** be manually verified
- Regression: when fixing a bug, the fix **MUST** be verified in the same section and in the dashboard summary cards
- Test-first: **N/A** for this project (manual-only policy); spec-first writing **SHOULD** be applied instead

## Code Style

- Formatting: no linter or formatter enforced — **MUST** match the indentation style of the surrounding code
- Identifiers: **MUST** be in `camelCase` for variables/functions; `UPPER_SNAKE_CASE` for constants
- Comments: **MUST NOT** describe what the code does; only WHY — hidden constraints, legal references, workarounds
- i18n strings: **MUST** go through `t('key')` — **MUST NOT** hardcode Spanish or English in render functions
- Translation keys: **MUST** exist in both `TRANSLATIONS.es` AND `TRANSLATIONS.en` before use
- Currency formatting: **MUST** use `Intl.NumberFormat` via `getCurrencyConfig()` — **MUST NOT** use `.toFixed()` directly
- Colombian payroll constants: **MUST** cite legal source (UVT, article, Ley); **MUST NOT** be guessed or magic-numbered

## Security

- Secrets: **MUST NOT** be hardcoded anywhere in the codebase
- Input parsing: **MUST** use `parseFloat() || 0` or equivalent safe coercion at every form input boundary
- Data persistence: `localStorage` only — **MUST NOT** send financial data to any external server
- ID generation: **MUST** use `Date.now() + Math.random()` inline as the codebase already does — **MUST NOT** use sequential integers for item IDs
- PII: **MUST NOT** log `state` contents to `console` in production paths (debug logs in development only)

## Forbidden

- **External dependencies** — No npm packages, no CDN `<script>` tags, no `import` statements. The corporate registry (`npm.artifacts.furycloud.io`) blocks installs; adding any breaks the zero-dependency contract.
- **Charting libraries** — No Chart.js, D3, Highcharts, or equivalent. All visualizations **MUST** use the native Canvas API, extending `drawDonut()` or `drawDTIGauge()`.
- **Full `render()` on field edits** — Calling `render()` on individual input changes forces a full DOM rebuild. Use targeted `render*()` + `updateDashboardPartial()` instead.
- **State mutation in render functions** — `renderX()` functions are read-only projections of `state`. Writing to `state` inside them creates unpredictable re-entrant cycles.
- **Hardcoded i18n strings in render functions** — `cell.textContent = 'Total gastos'` breaks English mode silently. Every user-visible string **MUST** go through `t('key')`.
- **`innerHTML` with embedded language text** — Embeds untranslated literals that survive language switches. Use DOM API + `t('key')` + `textContent`.
- **Reading DOM values as state source of truth** — `document.getElementById('x').value` as ground truth diverges from `state`. Always read from `state`.
- **ARL as an employee deduction** — ARL is 100% employer cost (Art. 16 Ley 1562/2012). **MUST NOT** appear in employee deduction presets.
- **`type="module"` on `<script>` tags** — Breaks the single-file no-module-system pattern and requires a bundler.
- **Adding a state field only in `buildDefaultState()` without `migrate()`** — Existing users with localStorage data get `undefined` on the new field; both edits are **MANDATORY**.
- **`render()` inside loops, `setInterval`, or `requestAnimationFrame`** — Causes unbounded DOM rebuilds; use targeted updaters on specific timers if needed.
- **Guessing Colombian payroll percentages** — Always reference `node-colombia-payroll.md` and cite the legal source (UVT 2025 = $49,799, Art. 383 ET, etc.).

## Versioning

- Constitution version: **v1** (this document)
- Amendments: recorded as `v{N+1}` with date + diff summary in the Amendment History section below

---

## Sign-off

- [ ] Author: `Johann Medina` — `2026-05-14`

---

## Amendment History

| Version | Date | Author | Summary |
|---|---|---|---|
| v1 | 2026-05-14 | Johann Medina | Initial Constitution. |
