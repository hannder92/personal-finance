# AGENTS.md

Guidance for AI agents (Cursor, Codex, Claude Code) in **personal-finance**.

## Quick start

```bash
npm install
npm start              # http://localhost:5173
npm test && npm run typecheck && npm run lint
```

## Rule layers (read in order)

1. **`.cursor/rules/00-project-context.mdc`** — always on: commands, doc map, SDD pointers
2. **`.cursor/rules/*.mdc`** — path-scoped: Vue architecture, testing, Colombia payroll
3. **`constitution.md`** — immutable MUST/MUST NOT (amend via `/sdd.constitution` only)
4. **`CLAUDE.md`** — deep reference: stores, lib modules, boot cycle, checklists
5. **`specs/.active`** — current feature folder when doing spec-driven work

For `/sdd-*` or `/sdt-*` commands, use the **sdd-workflow** skill — rules do not duplicate SDD phases.

## Stack

Vue 3.5 · Vite 6 · TypeScript strict · Pinia · Tailwind v4 · Zod · Vitest · Playwright · vue-i18n

## Legacy

`.claude/rules/` stubs point to `.cursor/rules/` — edit `.mdc` files only.
