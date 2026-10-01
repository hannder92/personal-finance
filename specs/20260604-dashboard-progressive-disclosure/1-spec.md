# Spec: Dashboard progressive disclosure (mobile hierarchy)

> Spec version: **v1** · Mode: `solo`  
> Slug: `20260604-dashboard-progressive-disclosure` · Created: `2026-06-04`  
> Discovery: [0-discovery.md](./0-discovery.md)

## Problem

Tras integrar Mi Día en la pantalla de inicio, el usuario operativo ya responde “¿cubro hoy?” en segundos — pero el bloque analítico mensual (KPIs, runway, gráficos, salud) sigue apilado debajo y obliga a scroll largo en móvil. Eso compite con el hábito diario: quien solo quiere confirmar cobertura y disponible mensual debe pasar por ocho bloques más antes de cerrar la app.

## Goals / Non-Goals

- **Goal 1:** En móvil (390×844), el usuario completa el chequeo diario (Mi Día + disponible mensual) sin ver métricas analíticas hasta que las pida explícitamente.
- **Goal 2:** Un único control expande/colapsa todo el bloque “Análisis del mes” con copy específico e i18n.
- **Goal 3:** La preferencia de expansión se recuerda solo durante la sesión del navegador — no en datos financieros persistidos.
- **Goal 4:** En viewport ancho (≥768px), el analítico permanece siempre visible sin toggle.
- **Non-Goal:** Nueva ruta o tab de navegación (Option B discovery — diferido).
- **Non-Goal:** Eliminar bloques analíticos del inicio — solo reorganizar jerarquía.
- **Non-Goal:** Acordeones múltiples por sección (Option C — rechazada).
- **Non-Goal:** Cambiar fórmulas, stores o contenido de las cards analíticas existentes.
- **Non-Goal:** Montaje diferido de gráficos (spec separado IMP-006).

## Personas

- **Empleado colombiano (hábito diario):** Abre la app en la mañana; quiere cobertura + disponible en <10s y cerrar.
- **Usuario power (fin de mes):** Revisa KPIs y proyección ocasionalmente; acepta un tap extra para expandir analítico en móvil.

## User Moments

| ID   | When                          | Question                                   | Horizon | P0 visible                                        |
| ---- | ----------------------------- | ------------------------------------------ | ------- | ------------------------------------------------- |
| UM-1 | Mañana, abre inicio           | ¿Estoy bien hoy y cuánto me queda?         | today   | Mi Día + disponible mensual                       |
| UM-2 | Fin de semana / cierre de mes | ¿Cómo va mi salud financiera y proyección? | month   | Bloque analítico bajo toggle                      |
| UM-3 | Sesión recurrente mismo día   | ¿Recuerda si ya expandí el análisis?       | today   | Estado colapsado/expandido coherente en la sesión |

## UI Intent

| Priority | Content                                                                   | Hierarchy                                                   |
| -------- | ------------------------------------------------------------------------- | ----------------------------------------------------------- |
| P0       | Mi Día (cobertura, pagos hoy, agenda 3 días)                              | Sin cambio respecto spec Mi Día                             |
| P0       | Disponible del mes (hero existente)                                       | Inmediatamente debajo de Mi Día                             |
| P0       | Control “Ver análisis del mes” + hint opcional                            | Debajo del hero; estilo secundario (outline)                |
| P1       | Bloque analítico agrupado (KPIs, runway, health, gráficos, FIRE compacto) | Visible solo expandido en móvil; siempre visible en desktop |

**Emotional target:** relief + clarity + confidence (analítico accesible, no intrusivo)

**Recommended layout:** Option A — un solo bloque colapsable (discovery).

## Feedback Loops

| Loop           | States                                                                 | Closed by    |
| -------------- | ---------------------------------------------------------------------- | ------------ |
| Chequeo rápido | abrir inicio → tier 1 visible → cerrar app                             | UM-1, AC-1.x |
| Profundización | tier 1 → expandir → tier 2 → navegar a pantalla dedicada               | UM-2, AC-2.x |
| Sesión         | colapsado ↔ expandido → persistido en sesión → reset al cerrar pestaña | UM-3, AC-3.x |

## Decision Surfaces

> No aplica — feature de jerarquía/layout, no comparación A vs B.

## User Stories

### US-1: Chequeo diario sin ruido analítico

**Ref:** UM-1  
**As a** empleado colombiano, **I want** ver solo Mi Día y mi disponible mensual al abrir inicio en el teléfono, **so that** complete mi revisión matutina sin scroll innecesario.

#### Acceptance Criteria

##### AC-1.1 — Analítico oculto por defecto en móvil

| Field        | Value                                                                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Given**    | Usuario recurrente con ingresos configurados; viewport 390×844; primera visita a inicio en esta sesión de navegador                              |
| **When**     | Abre la pantalla de inicio                                                                                                                       |
| **Then**     | Ningún bloque del tier analítico (KPI strip, runway, gráficos de dona/proyección, health score desplegable) es visible sin scroll ni interacción |
| **Negative** | El KPI strip no aparece entre Mi Día y el hero mensual                                                                                           |

##### AC-1.2 — Mi Día permanece above the fold

| Field        | Value                                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------------------------ |
| **Given**    | Usuario con deudas que vencen hoy y liquidez suficiente                                                      |
| **When**     | Abre inicio en viewport 390×844 con tier analítico colapsado                                                 |
| **Then**     | El badge de cobertura diaria (i18n `day.coverage.ok` o equivalente shortfall) es visible sin scroll vertical |
| **Negative** | Mi Día no queda debajo del bloque analítico                                                                  |

##### AC-1.3 — Hint bajo el control colapsado

| Field        | Value                                                                                                           |
| ------------ | --------------------------------------------------------------------------------------------------------------- |
| **Given**    | Tier analítico colapsado en móvil                                                                               |
| **When**     | El usuario ve el control de expansión                                                                           |
| **Then**     | Una línea de texto secundario indica el contenido del bloque (equivalente i18n a “KPIs, gráficos y proyección”) |
| **Negative** | El hint no usa tipografía más grande que el label del control                                                   |

### US-2: Expandir u ocultar análisis del mes

**Ref:** UM-2  
**As a** usuario power, **I want** expandir un solo bloque con todo el analítico mensual, **so that** profundice cuando lo necesite sin perder el acceso en fin de mes.

#### Acceptance Criteria

##### AC-2.1 — Control con copy específico i18n

| Field        | Value                                                                                                                                    |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Given**    | Tier analítico colapsado en móvil                                                                                                        |
| **When**     | El usuario ve el control de expansión                                                                                                    |
| **Then**     | El texto visible del control coincide con la clave i18n `dashboard.tier2.expand` (es: “Ver análisis del mes”; en: equivalente en inglés) |
| **Negative** | No usa copy genérico “Ver más” sin contexto                                                                                              |

##### AC-2.2 — Expansión revela bloque analítico completo

| Field        | Value                                                                                                                         |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| **Given**    | Tier analítico colapsado; usuario con datos suficientes para mostrar KPI strip                                                |
| **When**     | El usuario activa el control de expansión                                                                                     |
| **Then**     | Un contenedor identificable (`data-testid="dashboard-tier-2"`) es visible e incluye KPI strip y al menos un gráfico analítico |
| **Negative** | Solo parte del analítico aparece; el resto queda en otro toggle                                                               |

##### AC-2.3 — Colapsar oculta tier 2 y actualiza copy

| Field        | Value                                                                                                                                    |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Given**    | Tier analítico expandido en móvil                                                                                                        |
| **When**     | El usuario activa el control de colapso                                                                                                  |
| **Then**     | El contenedor `dashboard-tier-2` deja de ser visible y el control muestra texto i18n `dashboard.tier2.collapse` (es: “Ocultar análisis”) |
| **Negative** | El KPI strip sigue visible tras colapsar                                                                                                 |

##### AC-2.4 — Área táctil del control ≥44px

| Field        | Value                                                |
| ------------ | ---------------------------------------------------- |
| **Given**    | Viewport móvil 390×844                               |
| **When**     | El usuario inspecciona el control expandir/colapsar  |
| **Then**     | El área interactiva efectiva del control es ≥44×44px |
| **Negative** | Solo el texto es clicable sin padding suficiente     |

### US-3: Memoria de sesión del navegador

**Ref:** UM-3  
**As a** usuario que expandió el analítico, **I want** que la app recuerde mi elección mientras navego, **so that** no tenga que re-expandir al volver a inicio en la misma sesión.

#### Acceptance Criteria

##### AC-3.1 — Persistencia al navegar dentro de la app

| Field        | Value                                                      |
| ------------ | ---------------------------------------------------------- |
| **Given**    | Usuario expandió tier 2 en móvil en esta pestaña           |
| **When**     | Navega a Ingresos y regresa a inicio sin cerrar la pestaña |
| **Then**     | Tier 2 sigue expandido y `dashboard-tier-2` es visible     |
| **Negative** | El estado vuelve a colapsado al regresar                   |

##### AC-3.2 — Nueva sesión inicia colapsado en móvil

| Field        | Value                                                                                          |
| ------------ | ---------------------------------------------------------------------------------------------- |
| **Given**    | Usuario había expandido tier 2 en una sesión anterior (pestaña cerrada o navegador reiniciado) |
| **When**     | Abre inicio en viewport móvil en sesión nueva                                                  |
| **Then**     | Tier 2 inicia colapsado y `dashboard-tier-2` no es visible                                     |
| **Negative** | La preferencia de UI se lee desde datos financieros persistidos del usuario                    |

### US-4: Desktop sin toggle

**Ref:** UM-2  
**As a** usuario en pantalla ancha, **I want** ver todo el analítico sin pasos extra, **so that** aproveche el espacio horizontal en revisión de fin de mes.

#### Acceptance Criteria

##### AC-4.1 — Viewport ancho sin control de toggle

| Field        | Value                                                             |
| ------------ | ----------------------------------------------------------------- |
| **Given**    | Viewport ≥768px de ancho                                          |
| **When**     | El usuario abre inicio                                            |
| **Then**     | No aparece el control “Ver análisis del mes” / “Ocultar análisis” |
| **Negative** | El control de toggle es visible en desktop                        |

##### AC-4.2 — Analítico siempre visible en desktop

| Field        | Value                                              |
| ------------ | -------------------------------------------------- |
| **Given**    | Viewport ≥768px; usuario con ingresos configurados |
| **When**     | Abre inicio sin interacción previa                 |
| **Then**     | `dashboard-tier-2` es visible e incluye KPI strip  |
| **Negative** | Requiere expandir manualmente en desktop           |

### US-5: Usuario sin ingresos

**Ref:** UM-1  
**As a** usuario nuevo sin salario configurado, **I want** no ver una muralla de gráficos vacíos, **so that** me enfoque en configurar ingresos primero.

#### Acceptance Criteria

##### AC-5.1 — Tier 2 forzado colapsado sin ingresos

| Field        | Value                                                                                                                        |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| **Given**    | Salario bruto es cero; sesión del navegador tenía tier 2 expandido previamente                                               |
| **When**     | Abre inicio en viewport móvil                                                                                                |
| **Then**     | Tier 2 permanece colapsado y `dashboard-tier-2` no es visible aunque el usuario intente expandir desde sessionStorage previo |
| **Negative** | Gráficos vacíos ocupan pantalla bajo el hero                                                                                 |

## Edge Cases

- **EC-1:** Usuario redimensiona de móvil a ≥768px → tier 2 se muestra automáticamente; control toggle desaparece.
- **EC-2:** Usuario redimensiona de desktop a móvil → tier 2 respeta reglas móvil (colapsado por defecto salvo sesión expandida y con ingresos).
- **EC-3:** Usuario configura ingresos por primera vez en la sesión → tras guardar, reglas de tier 2 móvil aplican (colapsado por defecto; expandible).

## Success Metrics

- En prueba automatizada móvil: tier 2 oculto por defecto para usuario recurrente (`dashboard-tier-2` not visible).
- En prueba automatizada móvil: regresión Mi Día — badge cobertura visible sin scroll (spec `20260530-mi-dia-cobertura` AC-1.1 sigue verde).
- En prueba automatizada: expandir revela `dashboard-tier-2` en ≤1 interacción.

## Out of Scope

- Tab o ruta dedicada para analítico.
- Acordeones múltiples por sub-sección.
- Persistir preferencia de UI en almacenamiento financiero del usuario.
- Cambiar orden interno de cards dentro de tier 2 (mismo orden que hoy).
- Lazy mount de Chart.js (IMP-006).

## Open Questions

- _(ninguna — resueltas en Clarifications)_

## Clarifications

| OQ       | Decisión                                                                                                |
| -------- | ------------------------------------------------------------------------------------------------------- |
| **OQ-1** | Viewport ≥768px: tier 2 siempre expandido; sin control toggle.                                          |
| **OQ-2** | Salario bruto cero: tier 2 siempre colapsado en móvil; ignora sessionStorage expandido.                 |
| **OQ-3** | Copy específico vía i18n `dashboard.tier2.expand` / `dashboard.tier2.collapse` (no “Ver más” genérico). |

## Sign-off

- [x] Author — Johann Medina — 2026-06-04
- [x] Tech lead — _(solo mode)_
