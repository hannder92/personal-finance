# Plan: `Eliminar onboarding y compliance v4`

> Plan version: **v1** · Mode: `solo` · Spec: [1-spec.md](./1-spec.md)

## Approach

Retrospective delivery: implementación ya completada; este plan documenta las decisiones tomadas.

### Onboarding removal (ADR implícito)

- **Decisión:** Eliminar UI/ruta/guard; mantener campo `settings.onboarding` en schema v3 con `done: true` al persistir.
- **Alternativa descartada:** Wizard de 3 pasos con formularios reales — scope mayor, duplica CRUD de vistas existentes.
- **Alternativa descartada:** Eliminar campo del schema → rompe migraciones y backups v2.

### Iconos

- Nuevo `LucideIcon.vue` con mapa kebab→componente Lucide.
- Sustituir `data-icon` en 5 componentes.

### Tests

- Mock global de `vue-chartjs` en `tests/setup.ts` para evitar teardown async de Chart.js en jsdom.
- Eliminar tests de onboarding; añadir `e2e/fresh-user.spec.ts`.

## Modules touched

| Área         | Archivos                                                     |
| ------------ | ------------------------------------------------------------ |
| Router       | `src/router/index.ts` — quitar `/onboarding` y guard         |
| Stores       | `settingsStore.ts` — quitar estado onboarding                |
| Views        | eliminar `OnboardingView`; `SettingsView` reset → `/`        |
| Shell        | `App.vue` — i18n nav, sin `isOnboarding`                     |
| Icons        | `LucideIcon.vue` + 5 componentes                             |
| i18n         | `es.json`, `en.json` — claves `nav.*`, `theme.*`             |
| Persistencia | `main.ts`, `migrate.ts`, `schema.ts` — defaults `done: true` |
| Toolchain    | `.npmrc`, `package-lock.json`                                |
| Docs         | `constitution.md` v4, `README.md`, `AGENTS.md`               |

## Rollback

1. Revertir merge del PR.
2. Usuarios con localStorage existente no se ven afectados (campo onboarding legacy ignorado).

## Sign-off

- [x] Author: `Johann Medina` — `2026-05-29`
