# Spec: Mi Día — cobertura y vencimientos

> Spec version: **v1** · Mode: `solo`  
> Slug: `20260530-mi-dia-cobertura` · Created: `2026-05-29`  
> Discovery: [0-discovery.md](./0-discovery.md)

## Problem

El usuario no puede responder en los primeros segundos de la app si su liquidez cubre los pagos que vencen **hoy**. Debe navegar a deudas, revisar patrimonio y hacer mentalmente la resta. La pantalla de inicio prioriza el disponible **mensual** y métricas analíticas (runway, FIRE, gráficos), pero no el momento **operativo del día** — a diferencia de referencias como [Black Control](https://blackwebdigital.com/Lab/Control/), donde “Pagos de hoy” y cobertura están arriba del fold.

## Goals / Non-Goals

- **Goal 1:** En móvil estándar, el usuario ve sin scroll si cubre o no los vencimientos de hoy y cuánto falta en caso contrario.
- **Goal 2:** El usuario ve la lista de pagos con vencimiento hoy o un empty state aliviado si no hay ninguno.
- **Goal 3:** El usuario anticipa vencimientos de los próximos 3 días con conteo y monto total por día.
- **Goal 4:** La UI usa cards cálidas, jerarquía clara (badge héroe → detalle) y color semántico según constitution v5.
- **Non-Goal:** Objetivo diario de ahorro en porcentaje (spec futuro).
- **Non-Goal:** Día de vencimiento en gastos fijos (OQ-1 → fase 2).
- **Non-Goal:** Notificaciones push o alertas automáticas.
- **Non-Goal:** Cambiar fórmulas de disponible mensual, runway o health score.
- **Non-Goal:** Nueva ruta `/today` ni tab dedicado (Option B discovery — diferido).

## Personas

- **Empleado colombiano:** Revisa el teléfono en la mañana antes de salir; quiere saber si alcanza para el pago mínimo de la tarjeta que vence hoy.
- **Usuario activo de finanzas:** Ya cargó deudas y patrimonio; quiere un recordatorio operativo sin perder el dashboard analítico más abajo.

## User Moments

| ID   | When                | Question                         | Horizon | P0 visible              |
| ---- | ------------------- | -------------------------------- | ------- | ----------------------- |
| UM-1 | Mañana, abre inicio | ¿Cubro lo que vence hoy?         | today   | Badge cubro / faltan $X |
| UM-2 | Mismo momento       | ¿Qué debo pagar hoy exactamente? | today   | Lista pagos hoy         |
| UM-3 | Planificación corta | ¿Qué se viene en 72h?            | week    | Agenda 3 días           |

## UI Intent

| Priority | Content                                                      | Hierarchy                                  |
| -------- | ------------------------------------------------------------ | ------------------------------------------ |
| P0       | Card Cobertura: badge estado + liquidez operativa secundaria | Label → badge/monto héroe → línea contexto |
| P0       | Card Pagos hoy: lista o empty aliviado                       | Título sección → ítems o empty             |
| P1       | Card Próximos 3 días: filas por día                          | Día → N pagos → monto                      |
| P1       | Disponible mensual (bloque hero existente)                   | Debajo del bloque Mi Día                   |

**Emotional target:** relief + clarity (+ urgency si shortfall)

**Recommended layout:** Option A — bloque Mi Día (tres cards) encima del disponible mensual (ver discovery).

## Feedback Loops

| Loop             | States                                                              | Closed by    |
| ---------------- | ------------------------------------------------------------------- | ------------ |
| Cobertura diaria | liquidez vs pendiente hoy → cubierto / shortfall / sin vencimientos | UM-1, AC-1.x |

## User Stories

### US-1: Cobertura de vencimientos de hoy

**Ref:** UM-1  
**As a** empleado colombiano, **I want** ver de inmediato si mi liquidez cubre lo que vence hoy, **so that** no entre en sobregiro por olvido.

#### Acceptance Criteria

##### AC-1.1 — Badge de cobertura visible sin scroll en móvil

| Field        | Value                                                                                                          |
| ------------ | -------------------------------------------------------------------------------------------------------------- |
| **Given**    | El usuario tiene tarjetas con vencimiento hoy cuyos pagos mínimos suman $500.000 y liquidez operativa $800.000 |
| **When**     | Abre la pantalla de inicio en viewport 390×844                                                                 |
| **Then**     | Un badge visible en la zona superior indica que cubre lo pendiente de hoy (mensaje i18n `day.coverage.ok`)     |
| **Negative** | El badge no aparece debajo del primer gráfico ni requiere scroll vertical                                      |

##### AC-1.2 — Shortfall con monto faltante

| Field        | Value                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------- |
| **Given**    | Vencimientos hoy suman $600.000; liquidez operativa $400.000                                |
| **When**     | Abre la pantalla de inicio                                                                  |
| **Then**     | Badge visible indica shortfall con monto faltante $200.000 formateado en moneda configurada |
| **Negative** | No muestra solo $400.000 de liquidez sin el gap                                             |

##### AC-1.3 — Sin vencimientos hoy

| Field        | Value                                                                           |
| ------------ | ------------------------------------------------------------------------------- |
| **Given**    | Ninguna deuda tiene vencimiento hoy                                             |
| **When**     | Abre la pantalla de inicio                                                      |
| **Then**     | Mensaje aliviado equivalente a “Sin pagos para hoy” (i18n `day.payments.empty`) |
| **Negative** | No muestra badge de shortfall ni monto faltante                                 |

##### AC-1.4 — Liquidez secundaria con contexto

| Field        | Value                                                                                                                                                      |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Given**    | Liquidez operativa es un valor conocido                                                                                                                    |
| **When**     | El usuario ve la card de cobertura                                                                                                                         |
| **Then**     | La liquidez aparece con etiqueta secundaria y una línea de contexto que explica que incluye efectivo y equivalentes líquidos (i18n `day.coverage.context`) |
| **Negative** | La liquidez no usa tipografía más grande que el badge de estado                                                                                            |

##### AC-1.5 — Sin activos líquidos configurados

| Field        | Value                                                                                    |
| ------------ | ---------------------------------------------------------------------------------------- |
| **Given**    | Liquidez operativa es cero y hay vencimientos hoy                                        |
| **When**     | Abre la pantalla de inicio                                                               |
| **Then**     | Mensaje orientador invita a registrar patrimonio líquido con enlace visible a patrimonio |
| **Negative** | No muestra badge verde de cobertura                                                      |

### US-2: Pagos de hoy

**Ref:** UM-2  
**As a** usuario activo de finanzas, **I want** ver qué pagos vencen hoy con sus montos, **so that** sepa qué transferir sin abrir la sección de deudas.

#### Acceptance Criteria

##### AC-2.1 — Lista de vencimientos de hoy

| Field        | Value                                                            |
| ------------ | ---------------------------------------------------------------- |
| **Given**    | Dos tarjetas vencen hoy con pagos mínimos $200.000 y $150.000    |
| **When**     | El usuario ve la card “Pagos de hoy”                             |
| **Then**     | Aparecen dos ítems con nombre de deuda y monto mínimo formateado |
| **Negative** | No incluye deudas que vencen mañana                              |

##### AC-2.2 — Enlace a deudas

| Field        | Value                                                |
| ------------ | ---------------------------------------------------- |
| **Given**    | Hay al menos un pago hoy                             |
| **When**     | El usuario activa el control “Ver deudas” en la card |
| **Then**     | Navega a la sección de deudas                        |
| **Negative** | —                                                    |

##### AC-2.3 — Estilo card cálida

| Field        | Value                                                                       |
| ------------ | --------------------------------------------------------------------------- |
| **Given**    | Cualquier estado de la card Pagos de hoy                                    |
| **When**     | Viewport móvil 390×844                                                      |
| **Then**     | La card usa bordes redondeados, padding generoso e icono de sección visible |
| **Negative** | No presenta la lista como tabla densa sin espaciado                         |

### US-3: Agenda próximos 3 días

**Ref:** UM-3  
**As a** empleado colombiano, **I want** ver qué vence en los próximos tres días, **so that** pueda anticipar transferencias.

#### Acceptance Criteria

##### AC-3.1 — Tres filas por día

| Field        | Value                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------ |
| **Given**    | Un vencimiento mañana por $100.000 y ninguno pasado mañana                                       |
| **When**     | El usuario ve la card de agenda                                                                  |
| **Then**     | Muestra exactamente tres filas (día 1, 2, 3 desde hoy) con conteo de pagos y monto total por día |
| **Negative** | No muestra más de 3 días                                                                         |

##### AC-3.2 — Día sin vencimientos

| Field        | Value                                                      |
| ------------ | ---------------------------------------------------------- |
| **Given**    | Un día sin vencimientos en el rango                        |
| **When**     | El usuario ve esa fila                                     |
| **Then**     | Indica cero pagos con copy neutro (i18n `day.agenda.none`) |
| **Negative** | —                                                          |

### US-4: Integración en inicio sin romper analítico

**Ref:** UM-1, UM-2, UM-3  
**As a** usuario activo de finanzas, **I want** seguir viendo mi disponible mensual y salud debajo del resumen diario, **so that** no pierda el contexto mensual al ganar el hábito diario.

#### Acceptance Criteria

##### AC-4.1 — Orden vertical Mi Día antes de hero mensual

| Field        | Value                                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------------- |
| **Given**    | El usuario abre inicio con ingresos configurados                                                        |
| **When**     | Observa la estructura vertical                                                                          |
| **Then**     | El bloque Mi Día (cobertura + pagos + agenda) aparece encima del bloque de disponible mensual existente |
| **Negative** | Mi Día no aparece debajo de gráficos                                                                    |

##### AC-4.2 — i18n completo

| Field        | Value                                                                     |
| ------------ | ------------------------------------------------------------------------- |
| **Given**    | Idioma inglés seleccionado                                                |
| **When**     | El usuario ve Mi Día                                                      |
| **Then**     | Todos los textos visibles del bloque usan claves i18n (es + en presentes) |
| **Negative** | No hay strings fijos en español en templates                              |

## Edge Cases

- **EC-1:** Vencimiento hoy a medianoche local → cuenta como hoy según fecha del dispositivo.
- **EC-2:** Préstamo con vencimiento hoy → incluido igual que tarjeta si tiene `dueDate` y monto mínimo.
- **EC-3:** Liquidez exactamente igual a pendiente hoy → badge cubierto (no shortfall).

## Success Metrics

- Usuario responde “¿cubro hoy?” en ≤10 s en prueba moderada (5 usuarios internos).
- 0 regresiones en tests de dashboard existentes.

## Out of Scope

- Objetivo diario %, calendario mensual completo, gastos fijos con día de vencimiento, tab `/today`.

## Open Questions

- [x] **OQ-1:** Gastos fijos dueDay → fase 2 (ver discovery).
- [x] **OQ-2:** Liquidez operativa = misma definición que métricas runway (ver discovery).

## Clarifications

- OQ-1 → fase 2 spec separado.
- OQ-2 → misma definición de liquidez operativa que runway (sin nueva fórmula).

## Sign-off

- [x] Author — Johann Medina — 2026-06-04
