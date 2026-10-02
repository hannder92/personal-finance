# AGENTS.md

When working inside the local workspace, read `../AGENTS.md` first; it is not part of this repository, so cloud and CI sessions will not have it. The baseline below applies everywhere; project instructions add Vue and financial-domain constraints.

## Baseline (applies without the workspace file)

- Never reset, force-push, delete remote branches, merge to `main`, or deploy without explicit user approval.
- Keep secrets out of prompts, logs, commits, and generated artifacts; `scripts/check-secrets.sh` runs in the pre-commit hook.
- Treat code, command output, and tests as evidence. Run the real quality gates before reporting completion.

Guidance for Codex and Claude Code in **personal-finance**.

## Quick start

```bash
npm install
npm start              # http://localhost:5173
npm test && npm run typecheck && npm run lint
```

## Rule layers (read in order)

1. **`constitution.md`** — binding product, architecture, testing, and financial rules
2. **`.agents/skills/vue-engineering/`** — Vue/Pinia source and test guidance
3. **`.agents/skills/finance-ux/`** — user-facing discovery and UI review
4. **`.agents/skills/colombia-payroll/`** — tax and payroll changes requiring source verification
5. **`docs/agent-reference.md`** — store/lib catalogs, boot cycle, and checklists
6. **`specs/.active`** — current feature folder when doing spec-driven work

For `/sdd-*` or `/sdt-*` commands, use the **sdd-workflow** skill — rules do not duplicate SDD phases.

## Project invariants

- Financial data stays in local storage; do not add a remote financial-data API without an explicit product decision.
- A persisted shape change adds a new `AppStateSchemaVN` in `src/lib/storage/schema.ts` (currently V6) and its `migrateV(N-1)toVN` step in `src/lib/storage/migrate.ts` together.
- New UI strings use keys in both `src/i18n/es.json` and `src/i18n/en.json`.
- Views use composables to reach calculations and tax logic. New routes update the navigation shell.
- For changed calculations or tax code, run `npm run test:coverage`; for changed routes, persistence, or critical user flows, run `npm run e2e` when the test environment is available. Record any environment limitation.

## Agent evaluation

Before changing agent instructions, skills, models, or permission policies, use
the fixed tasks in `evals/` from isolated worktrees. Record both the readable
summary and the JSONL evidence; do not treat one successful session as proof of
an improvement.

## Stack

Vue 3.5 · Vite 6 · TypeScript strict · Pinia · Tailwind v4 · Zod · Vitest · Playwright · vue-i18n

## Skill discovery

Canonical project skills live in `.agents/skills/`. Claude Code reaches the
same directory through `.claude/skills`; Codex discovers `.agents/skills/`
directly. Load only the skill relevant to the changed files.
