# Test Plan: `Eliminar onboarding y compliance v4`

> Traceability: spec [1-spec.md](./1-spec.md) · IDs [\_ids.yaml](./_ids.yaml)

## Matrix

| AC         | TC              | Kind        | Test file                                                          |
| ---------- | --------------- | ----------- | ------------------------------------------------------------------ |
| AC-1.1     | TC-E-001        | e2e         | `e2e/fresh-user.spec.ts`                                           |
| AC-1.1     | TC-U-002        | unit        | `tests/unit/storage/migrate.test.ts`                               |
| AC-1.2     | TC-E-002        | e2e         | manual / SettingsView (no e2e dedicado — cubierto por impl review) |
| AC-1.3     | TC-C-001        | component   | `tests/component/SettingsPanel.test.ts` (ausencia de relaunch)     |
| AC-2.1–2.3 | TC-U-001        | unit        | revisión manual + `schema.test.ts`                                 |
| AC-3.1     | TC-C-001        | component   | `App.vue` + i18n plugin en tests futuros                           |
| AC-3.2     | TC-C-005        | component   | `ThemeToggle.test.ts` con plugin i18n                              |
| AC-4.1     | TC-C-002–004    | component   | `EmptyState`, `SemanticBadge`, `KpiCard`                           |
| AC-5.1     | —               | manual      | `npm install` con `.npmrc`                                         |
| AC-6.1     | TC-I-001, T-012 | integration | `npm test` full suite                                              |

## Scenarios

### TC-E-001 (AC-1.1)

Given localStorage vacío, when navego a `/`, then veo "Dashboard" y no "Salario bruto" del wizard.

### TC-C-005 (AC-3.2)

Given ThemeToggle con locale es, when renderizo, then aria-label contiene "Tema".

## Sign-off

- [x] Author: `Johann Medina` — `2026-05-29`
