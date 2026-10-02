# Evals — personal-finance

This suite measures whether an agent configuration, skill, or permission policy
improves real work in this repository. It is not a delivery backlog.

## Running an eval

1. Start every run from the same commit in a disposable `git worktree`.
2. Use test-only local storage and test-safe fixtures. Never copy `.env*` files
   or use the active working tree.
3. Give each run to a fresh session with the complete task text from `TASKS.md`.
4. Run the listed commands and score every acceptance criterion, not only the
   final test result.
5. Append a human-readable row to `results.md` and one JSON record to
   `results.jsonl` following `run.schema.json`.

Run a baseline and candidate at least three times each before promoting an
instruction, skill, model, or permission-policy change. The workspace-wide
comparison rules are in `../docs/agent-environment/evaluation-protocol.md`.

## Scope

- storage schema and recovery
- Colombian payroll invariants
- layered Vue/Pinia architecture
- privacy and input validation
- critical mobile flows
- grounded architecture decisions
