# .claude/rules — Finance Dashboard

Rules for Claude Code when working in this vanilla JS SPA project.

| File | Lines | Topic |
|------|-------|-------|
| [node-vanilla-spa-state.md](node-vanilla-spa-state.md) | ~60 | State mutation contract, render cycle, schema evolution |
| [node-vanilla-spa-i18n.md](node-vanilla-spa-i18n.md) | ~54 | i18n: translation keys, `t()`, `data-i18n` attributes |
| [node-vanilla-spa-constraints.md](node-vanilla-spa-constraints.md) | ~57 | Zero dependencies, Canvas API, Intl currency formatting |
| [node-colombia-payroll.md](node-colombia-payroll.md) | ~65 | Colombian payroll/tax constants (ARL, retención, UVT 2025) |

**Context budget:** ~236 lines total (well under 3000-line limit)

**Recent changes (2026-05-11):** Added `node-colombia-payroll.md` — 3 session corrections on ARL employer-only cost, retención base (salud+pensión), and renta exenta 240 UVT cap.

See `CLAUDE.md` in the project root for architecture overview and key calculation functions.
