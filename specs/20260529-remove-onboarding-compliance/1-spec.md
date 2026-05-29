# Spec: `Eliminar onboarding y compliance v4`

> Spec version: **v1** · Mode: `solo`
> Slug: `20260529-remove-onboarding-compliance` · Created: `2026-05-29`

## Problem

El wizard de onboarding de 3 pasos solo permitía ingresar el salario bruto; los pasos de gastos fijos y deudas eran placeholders sin formularios, generando fricción sin valor. Además, la constitución v3 tenía inconsistencias internas (header v2, referencias a `pino`, `AppStateSchemaV2`), el código violaba reglas de i18n e iconos (`data-icon`), y el `package-lock.json` apuntaba a un registry corporativo inaccesible en entorno personal.

## Goals / Non-Goals

- **Goal 1:** Eliminar el flujo de onboarding; usuarios nuevos entran directo al dashboard.
- **Goal 2:** Alinear `constitution.md` a v4 con el código y decisiones actuales.
- **Goal 3:** Cumplir reglas de i18n en navegación y ThemeToggle.
- **Goal 4:** Cumplir regla de iconos con `lucide-vue-next`.
- **Goal 5:** Garantizar `npm install` reproducible con registry público.
- **Non-Goal:** Reemplazar el onboarding con un wizard nuevo.
- **Non-Goal:** Migrar schema de persistencia a v4 (se mantiene v3 + campo legacy `onboarding`).

## User Stories

### US-1: Acceso directo al dashboard

**As a** usuario nuevo, **I want** abrir la app y ver el dashboard inmediatamente, **so that** configure ingresos, gastos y deudas desde las secciones dedicadas.

#### Acceptance Criteria

- **AC-1.1** Given sesión nueva sin localStorage, when abro `/`, then veo el dashboard sin redirección a onboarding.
- **AC-1.2** Given datos existentes, when presiono "Reiniciar" y confirmo en Configuración, then todos los stores se limpian y navego a `/` (dashboard).
- **AC-1.3** Given la vista Configuración, when la abro, then no existe botón "Relanzar guía de configuración".

### US-2: Constitución v4 coherente

**As a** desarrollador, **I want** una constitución sin contradicciones, **so that** las reglas del agente coincidan con el stack real.

#### Acceptance Criteria

- **AC-2.1** Given `constitution.md`, when leo la sección Versioning, then el header dice v4 y el historial incluye la enmienda v4.
- **AC-2.2** Given `constitution.md`, when busco `pino`, then no aparece como dependencia requerida.
- **AC-2.3** Given las reglas Forbidden/Security de storage, when las leo, then referencian `AppStateSchemaV3.safeParse()`.

### US-3: i18n en shell de navegación

**As a** usuario bilingüe, **I want** que la navegación respete el idioma seleccionado, **so that** la UI sea consistente.

#### Acceptance Criteria

- **AC-3.1** Given `App.vue`, when renderizo la nav, then todos los labels usan `t('nav.*')`.
- **AC-3.2** Given cualquier clave `nav.*` o `theme.*`, when existe en `es.json`, then también existe en `en.json`.

### US-4: Iconos Lucide

**As a** desarrollador, **I want** iconos accesibles vía componentes Lucide, **so that** cumplimos la constitución.

#### Acceptance Criteria

- **AC-4.1** Given componentes con iconos (ThemeToggle, SemanticBadge, EmptyState, KpiCard, BottomNav), when inspecciono el DOM, then no hay atributos `data-icon` y se renderizan SVG de Lucide.

### US-5: Toolchain personal

**As a** desarrollador en entorno personal, **I want** instalar dependencias sin registry corporativo, **so that** el proyecto sea autónomo.

#### Acceptance Criteria

- **AC-5.1** Given `.npmrc` con `registry=https://registry.npmjs.org/`, when ejecuto `npm install`, then completa sin error 403.

### US-6: Regresión cero

**As a** mantenedor, **I want** tests verdes, **so that** el refactor no rompa funcionalidad existente.

#### Acceptance Criteria

- **AC-6.1** Given la suite Vitest, when ejecuto `npm test`, then 347 tests pasan con exit code 0.

## Sign-off

- [x] Author: `Johann Medina` — `2026-05-29`
