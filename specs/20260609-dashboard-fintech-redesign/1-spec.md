# Spec: Dashboard fintech redesign (saludo, patrimonio, cash flow, actividad, comparación mensual)

> Spec version: **v1** · Mode: `solo`  
> Slug: `20260609-dashboard-fintech-redesign` · Created: `2026-06-09`  
> Discovery: [0-discovery.md](./0-discovery.md)

## Problem

El inicio actual responde "¿cubro hoy?" (Mi Día) y "¿cuánto me queda del mes?" (héroe), pero es frío y no responde "¿voy mejor o peor que el mes pasado?" ni "¿cuánto tengo y cuánto debo?" sin navegar a otras vistas. El usuario valoró de un benchmark fintech la calidez del saludo, la gráfica de flujo mensual, la vista de movimientos y la comparación porcentual contra el mes anterior — hoy ausentes del inicio.

## Goals / Non-Goals

- **Goal 1:** El inicio saluda con franja horaria (y nombre opcional) y muestra la fecha de hoy.
- **Goal 2:** El héroe mensual incluye una comparación de ritmo de gasto variable contra el mes anterior, con semántica verde/rojo y línea de contexto accionable.
- **Goal 3:** Tres tarjetas de patrimonio (Tengo / Debo / Neto) visibles en el inicio con drill-down a las vistas de detalle.
- **Goal 4:** Una gráfica de flujo mensual (ingresos vs gasto total) por mes cerrado, hasta 6 meses.
- **Goal 5:** Una sección "actividad del mes" con las categorías de mayor gasto variable y acceso al detalle.
- **Goal 6:** Mi Día y el bloque analítico colapsable conservan su comportamiento firmado (sin regresión).
- **Non-Goal:** Registro de movimientos individuales con fecha (ledger) — feature futuro.
- **Non-Goal:** Búsqueda de transacciones y sidebar de navegación (rechazados en discovery).
- **Non-Goal:** Cuentas bancarias conectadas o tarjeta por activo individual.
- **Non-Goal:** Cambiar el contenido interno del bloque analítico (tier 2) o sus reglas de expansión.

## Personas

- **Empleado colombiano (hábito diario):** Abre la app en la mañana; quiere sentirse recibido, confirmar cobertura y saber si va bien este mes.
- **Usuario power (fin de mes):** Revisa flujo histórico y patrimonio; quiere tendencia de 6 meses sin armar reportes.

## User Moments

> From [0-discovery.md](./0-discovery.md). Every user story references at least one `UM-N`.

| ID   | When                         | Question                                      | Horizon | P0 visible                                       |
| ---- | ---------------------------- | --------------------------------------------- | ------- | ------------------------------------------------ |
| UM-1 | Mañana, abre inicio          | ¿Estoy bien hoy y cuánto me queda este mes?   | today   | Saludo + fecha, cobertura Mi Día, héroe mensual  |
| UM-2 | Mitad de mes, tras registrar | ¿Estoy gastando más rápido que el mes pasado? | month   | Badge de ritmo junto al héroe                    |
| UM-3 | Vistazo recurrente           | ¿Cuánto tengo, cuánto debo y en qué quedo?    | month   | Tarjetas Tengo / Debo / Neto (P1, primer scroll) |
| UM-4 | Fin de mes / revisión        | ¿Mis meses cierran en verde?                  | month   | Gráfica ingresos vs gastos 6 meses (P1)          |
| UM-5 | Durante el mes               | ¿En qué se me está yendo el dinero?           | month   | Actividad del mes por categoría (P1)             |

## UI Intent

> What the user sees — observable in review, no framework names.

| Priority | Content                                                                       | Hierarchy (label → hero → detail)                |
| -------- | ----------------------------------------------------------------------------- | ------------------------------------------------ |
| P0       | Saludo por franja horaria (+nombre opcional) y fecha de hoy                   | Saludo como encabezado; fecha secundaria         |
| P0       | Mi Día (cobertura, pagos hoy) — sin cambios                                   | Igual que spec Mi Día                            |
| P0       | Héroe disponible mensual + badge de ritmo vs mes anterior + línea de contexto | Disponible = héroe; badge y contexto secundarios |
| P1       | Tres tarjetas patrimonio: Tengo / Debo / Neto                                 | Label → monto héroe por tarjeta; color semántico |
| P1       | Gráfica flujo mensual: barras ingresos vs gasto total, hasta 6 meses cerrados | Título + leyenda; verde ingresos / rojo gastos   |
| P1       | Actividad del mes: top categorías de gasto variable + enlace a detalle        | Lista ≤5 filas; monto por fila; CTA "ver todo"   |
| P2       | Bloque analítico colapsable existente (KPIs, runway, salud, proyecciones)     | Sin cambios; debajo de las secciones nuevas      |

**Emotional target:** clarity + confidence (comparación temporal) + relief (saludo cálido, cobertura)

**Recommended layout:** Option A discovery — refresh en capas: saludo → Mi Día → héroe enriquecido → patrimonio → flujo + actividad (2 columnas en ≥768px) → toggle analítico intacto.

## Feedback Loops

| Loop           | States                                                                         | Closed by    |
| -------------- | ------------------------------------------------------------------------------ | ------------ |
| Ritmo de gasto | gasto del mes → ritmo vs mes anterior → verde (por debajo) / rojo (adelantado) | UM-2, AC-2.x |
| Flujo mensual  | mes cerrado → barra ingresos vs gastos → tendencia 6 meses                     | UM-4, AC-4.x |
| Patrimonio     | tengo / debo → neto → drill-down a detalle                                     | UM-3, AC-3.x |
| Actividad      | registrar gasto → categoría sube en actividad → revisar / ajustar              | UM-5, AC-5.x |

## Decision Surfaces

| Decision                        | Scenarios                          | Benefit visible to user                                                |
| ------------------------------- | ---------------------------------- | ---------------------------------------------------------------------- |
| ¿Debo frenar el gasto este mes? | Ritmo actual vs ritmo mes anterior | Copy de ritmo: "Llevas X% del gasto del mes pasado y va el Y% del mes" |

## User Stories

### US-1: Saludo cálido al abrir

**Ref:** UM-1  
**As a** empleado colombiano, **I want** que la app me salude por franja horaria con mi nombre si lo configuré, **so that** abrir la app cada mañana se sienta personal y no contable.

#### Acceptance Criteria

##### AC-1.1 — Saludo por franja horaria con fecha

| Field        | Value                                                                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Given**    | Usuario sin nombre configurado; hora local 8:00                                                                                                   |
| **When**     | Abre la pantalla de inicio                                                                                                                        |
| **Then**     | El encabezado muestra el texto de la clave i18n `dashboard.greeting.morning` (es: "Buenos días") y la fecha de hoy formateada en el idioma activo |
| **Negative** | No aparece el título plano anterior ("Resumen"/"Dashboard") como encabezado principal                                                             |

##### AC-1.2 — Saludo incluye nombre configurado

| Field        | Value                                                                |
| ------------ | -------------------------------------------------------------------- |
| **Given**    | Usuario configuró el nombre "Johann" en ajustes; hora local 20:00    |
| **When**     | Abre la pantalla de inicio                                           |
| **Then**     | El encabezado muestra el equivalente i18n de "Buenas noches, Johann" |
| **Negative** | El nombre no aparece duplicado ni concatenado sin espacio            |

##### AC-1.3 — Campo de nombre opcional en ajustes

| Field        | Value                                                                                                                |
| ------------ | -------------------------------------------------------------------------------------------------------------------- |
| **Given**    | Usuario en la pantalla de ajustes                                                                                    |
| **When**     | Escribe un nombre de hasta 30 caracteres y guarda                                                                    |
| **Then**     | El nombre persiste tras recargar la app y el saludo del inicio lo incluye; si lo borra, el saludo vuelve al genérico |
| **Negative** | El campo no es obligatorio ni bloquea ninguna otra función si está vacío                                             |

### US-2: Ritmo de gasto vs mes anterior

**Ref:** UM-2  
**As a** empleado colombiano, **I want** ver si voy gastando más rápido o más lento que el mes pasado, **so that** ajuste mi gasto variable antes de que el mes se dañe.

#### Acceptance Criteria

##### AC-2.1 — Badge de ritmo visible con histórico

| Field        | Value                                                                                                                                  |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Given**    | Existe gasto variable total del mes anterior > 0 y gasto variable registrado este mes                                                  |
| **When**     | Abre la pantalla de inicio                                                                                                             |
| **Then**     | Junto al héroe mensual es visible un badge con porcentaje y flecha (↑/↓) que compara el ritmo de gasto variable contra el mes anterior |
| **Negative** | El badge no compara contra el total del mes en curso sin ajustar por días transcurridos                                                |

##### AC-2.2 — Ritmo adelantado en rojo con contexto

| Field        | Value                                                                                                                                         |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Given**    | El % del gasto variable del mes pasado ya consumido supera el % de días naturales transcurridos del mes actual                                |
| **When**     | El usuario ve el héroe mensual                                                                                                                |
| **Then**     | El badge usa semántica roja y una línea de contexto muestra el equivalente i18n de "Llevas el X% del gasto del mes pasado y va el Y% del mes" |
| **Negative** | No se muestra solo el porcentaje sin línea de contexto                                                                                        |

##### AC-2.3 — Ritmo por debajo en verde

| Field        | Value                                                                                                     |
| ------------ | --------------------------------------------------------------------------------------------------------- |
| **Given**    | El % del gasto variable del mes pasado ya consumido es menor o igual al % de días naturales transcurridos |
| **When**     | El usuario ve el héroe mensual                                                                            |
| **Then**     | El badge usa semántica verde y la línea de contexto confirma que va por debajo del ritmo del mes pasado   |
| **Negative** | Verde no se usa cuando el ritmo va adelantado                                                             |

##### AC-2.4 — Sin histórico: estado neutro

| Field        | Value                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------ |
| **Given**    | No existe total de gasto variable del mes anterior (primer mes de uso)                                             |
| **When**     | Abre la pantalla de inicio                                                                                         |
| **Then**     | No hay badge de ritmo; una línea neutra muestra el equivalente i18n de "Desde el próximo mes verás tu comparación" |
| **Negative** | No aparece "0%", "NaN" ni un badge vacío                                                                           |

### US-3: Patrimonio de un vistazo

**Ref:** UM-3  
**As a** usuario recurrente, **I want** ver cuánto tengo, cuánto debo y el neto en el inicio, **so that** conozca mi posición sin navegar a otras vistas.

#### Acceptance Criteria

##### AC-3.1 — Tres tarjetas con jerarquía

| Field        | Value                                                                                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Given**    | Usuario con al menos un activo y una deuda registrados                                                                                                  |
| **When**     | Hace scroll bajo el héroe mensual                                                                                                                       |
| **Then**     | Son visibles exactamente tres tarjetas — Tengo, Debo, Neto — cada una con label y monto en moneda activa; el monto es el texto más grande de su tarjeta |
| **Negative** | No aparece una tarjeta por cada activo individual                                                                                                       |

##### AC-3.2 — Drill-down a detalle

| Field        | Value                                                                                 |
| ------------ | ------------------------------------------------------------------------------------- |
| **Given**    | Tarjetas de patrimonio visibles                                                       |
| **When**     | El usuario activa la tarjeta Tengo, Debo o Neto                                       |
| **Then**     | Navega a la vista de detalle correspondiente (patrimonio o deudas) en la misma sesión |
| **Negative** | La tarjeta no es un elemento estático sin affordance de navegación                    |

##### AC-3.3 — Semántica de color y neto negativo

| Field        | Value                                                                                           |
| ------------ | ----------------------------------------------------------------------------------------------- |
| **Given**    | Deudas totales superan activos totales                                                          |
| **When**     | El usuario ve la tarjeta Neto                                                                   |
| **Then**     | El monto neto se muestra en semántica roja con signo negativo; con neto ≥ 0 usa semántica verde |
| **Negative** | El rojo/verde no se usa como decoración en las otras tarjetas sin estado que lo justifique      |

##### AC-3.4 — Empty state de patrimonio

| Field        | Value                                                                                                           |
| ------------ | --------------------------------------------------------------------------------------------------------------- |
| **Given**    | Usuario sin activos ni deudas registrados                                                                       |
| **When**     | Ve la sección de patrimonio en el inicio                                                                        |
| **Then**     | Aparece un estado vacío con icono y copy i18n invitando a registrar activos o deudas (no tres tarjetas en "$0") |
| **Negative** | No se muestra "No data" sin contexto                                                                            |

### US-4: Flujo mensual histórico

**Ref:** UM-4  
**As a** usuario power, **I want** una gráfica de ingresos vs gasto total por mes cerrado, **so that** vea la tendencia de mis últimos meses de un vistazo.

#### Acceptance Criteria

##### AC-4.1 — Barras por mes cerrado hasta 6 meses

| Field        | Value                                                                                                                       |
| ------------ | --------------------------------------------------------------------------------------------------------------------------- |
| **Given**    | Existen resúmenes de al menos 2 meses cerrados                                                                              |
| **When**     | El usuario ve la sección de flujo mensual                                                                                   |
| **Then**     | Una gráfica de barras muestra por cada mes cerrado (máximo 6) un par ingresos vs gasto total, con etiqueta de mes y leyenda |
| **Negative** | El mes en curso (incompleto) no aparece como mes cerrado                                                                    |

##### AC-4.2 — Semántica de color consistente

| Field        | Value                                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------------- |
| **Given**    | Gráfica de flujo visible                                                                                |
| **When**     | El usuario distingue las series                                                                         |
| **Then**     | Ingresos usan semántica verde y gastos roja, consistente con el resto de la app, y la leyenda lo indica |
| **Negative** | No se invierten los colores ni se usan colores decorativos sin significado                              |

##### AC-4.3 — Empty state de flujo

| Field        | Value                                                                                                  |
| ------------ | ------------------------------------------------------------------------------------------------------ |
| **Given**    | Existen menos de 2 meses cerrados con resumen                                                          |
| **When**     | El usuario ve la sección de flujo mensual                                                              |
| **Then**     | Aparece un estado vacío con copy i18n explicando que la gráfica se construye con el cierre de cada mes |
| **Negative** | No se renderiza una gráfica con una sola barra o ejes vacíos                                           |

### US-5: Actividad del mes

**Ref:** UM-5  
**As a** empleado colombiano, **I want** ver en qué categorías se me está yendo el gasto variable este mes, **so that** detecte fugas sin abrir el detalle completo.

#### Acceptance Criteria

##### AC-5.1 — Top categorías del mes

| Field        | Value                                                                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Given**    | Usuario con gasto variable registrado en ≥1 categoría este mes                                                                              |
| **When**     | Ve la sección de actividad del mes                                                                                                          |
| **Then**     | Aparecen hasta 5 categorías ordenadas por gasto descendente, cada una con nombre y monto del mes, más un enlace "ver todo" hacia el detalle |
| **Negative** | No se listan categorías con gasto cero por encima de categorías con gasto                                                                   |

##### AC-5.2 — Empty state de actividad con CTA

| Field        | Value                                                                                                 |
| ------------ | ----------------------------------------------------------------------------------------------------- |
| **Given**    | Sin gasto variable registrado este mes                                                                |
| **When**     | Ve la sección de actividad del mes                                                                    |
| **Then**     | Aparece estado vacío con copy i18n neutro y una acción visible para registrar el primer gasto del mes |
| **Negative** | La sección no desaparece sin explicación                                                              |

### US-6: Layout y no regresión

**Ref:** UM-1  
**As a** usuario móvil habitual, **I want** que el rediseño respete mi chequeo diario y el toggle de análisis, **so that** la nueva información no me cueste el hábito ya ganado.

#### Acceptance Criteria

##### AC-6.1 — P0 sin scroll en móvil

| Field        | Value                                                                                                      |
| ------------ | ---------------------------------------------------------------------------------------------------------- |
| **Given**    | Usuario recurrente con ingresos configurados; viewport 390×844                                             |
| **When**     | Abre la pantalla de inicio                                                                                 |
| **Then**     | Saludo, badge de cobertura de Mi Día y monto héroe del disponible mensual son visibles sin scroll vertical |
| **Negative** | Las tarjetas de patrimonio no desplazan a Mi Día fuera del fold                                            |

##### AC-6.2 — Orden de secciones y dos columnas en desktop

| Field        | Value                                                                                                                                |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Given**    | Viewport ≥768px                                                                                                                      |
| **When**     | Abre la pantalla de inicio                                                                                                           |
| **Then**     | El orden visible es: saludo → Mi Día → héroe → patrimonio → flujo mensual y actividad lado a lado en dos columnas → bloque analítico |
| **Negative** | Flujo y actividad no quedan apilados a una columna en desktop                                                                        |

##### AC-6.3 — Toggle analítico sin regresión

| Field        | Value                                                                                                                                     |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Given**    | Viewport móvil 390×844; usuario recurrente con ingresos                                                                                   |
| **When**     | Abre inicio y expande/colapsa el control "Ver análisis del mes"                                                                           |
| **Then**     | El bloque analítico (`dashboard-tier-2`) conserva las reglas firmadas: oculto por defecto en móvil, expandible, siempre visible en ≥768px |
| **Negative** | Las secciones nuevas (patrimonio, flujo, actividad) no quedan dentro del bloque colapsable                                                |

##### AC-6.4 — Touch targets en elementos nuevos

| Field        | Value                                                                               |
| ------------ | ----------------------------------------------------------------------------------- |
| **Given**    | Viewport móvil 390×844                                                              |
| **When**     | El usuario inspecciona tarjetas de patrimonio, enlace "ver todo" y CTA de actividad |
| **Then**     | Cada control interactivo nuevo tiene área táctil efectiva ≥44×44px                  |
| **Negative** | Ningún control nuevo depende de un área menor al mínimo táctil                      |

## Edge Cases

- **EC-1:** Cambio de mes → el mes recién cerrado aparece en la gráfica de flujo y se vuelve la base de comparación del ritmo; la actividad del mes se reinicia.
- **EC-2:** Nombre configurado de más de 30 caracteres → se rechaza en ajustes con mensaje; el saludo nunca desborda a dos líneas en 390px.
- **EC-3:** Histórico parcial (2–5 meses cerrados) → la gráfica muestra solo los meses disponibles sin huecos ni placeholders falsos.
- **EC-4:** Redimensionar móvil ↔ desktop → el layout de columnas y las reglas del toggle analítico se reacomodan según specs previos (EC-1/EC-2 de progressive disclosure).
- **EC-5:** Gasto variable del mes anterior = 0 con histórico existente → se trata como sin base de comparación (estado neutro de AC-2.4, no división por cero).

## Success Metrics

- Prueba automatizada móvil 390×844: saludo + cobertura Mi Día + héroe visibles sin scroll (AC-6.1).
- Regresión: specs `20260530-mi-dia-cobertura` y `20260604-dashboard-progressive-disclosure` siguen verdes.
- Prueba automatizada: badge de ritmo correcto (rojo/verde/neutro) en fixtures de adelantado, por debajo y sin histórico.
- Prueba automatizada: gráfica de flujo renderiza N pares de barras para N meses cerrados (2 ≤ N ≤ 6).

## Out of Scope

- Ledger de movimientos individuales con fecha y su búsqueda.
- Sidebar de navegación o cambios en la navegación inferior.
- Cuentas bancarias conectadas; tarjeta por activo individual.
- Cambios al contenido interno o reglas del bloque analítico (tier 2).
- Notificaciones o recordatorios derivados del ritmo de gasto.

## Open Questions

- _(ninguna — resueltas en Clarifications)_

## Clarifications

| OQ       | Decisión                                                                                                                                                        |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **OQ-1** | Actividad del mes por categoría (sin fechas individuales); ledger fuera de alcance.                                                                             |
| **OQ-2** | Badge héroe = ritmo de gasto variable vs mes anterior ajustado por días naturales transcurridos; gráfica = gasto total por mes cerrado; sin histórico → neutro. |
| **OQ-3** | Nombre opcional en ajustes (≤30 caracteres) + fallback por franja horaria; dato local en el dispositivo.                                                        |
| **OQ-4** | Tres tarjetas fijas Tengo / Debo / Neto con drill-down; no una por activo.                                                                                      |

## Sign-off

- [x] Author — Johann Medina — 2026-06-09
- [x] Tech lead — _(solo mode)_
