# Spec: Métricas verificadas — runway, ingresos y cobertura

> Spec version: **v2** · Mode: `solo`  
> Slug: `20260529-metricas-runway-ingresos` · Created: `2026-05-29` · Updated: `2026-05-29`  
> Research: [2-research.md](./2-research.md) — fórmulas auditadas antes de implementar  
> v2: añade US-5 (UX deudas) y US-6 (tasa en gráfico compuesto) — **no implementar fuera de esta feature**

## Problem

El usuario que ya registra ingresos, gastos, activos y deudas ve en distintas pantallas cifras de **patrimonio líquido** y **meses de reserva** que no coinciden entre sí. Quiere saber cuántos meses puede sostener su estilo de vida actual (runway), qué parte de sus ingresos depende del trabajo activo versus ingresos residuales o pasivos, y si esos últimos ya cubren sus gastos — usando fórmulas estándar y verificables.

Además, la sección de **deudas** tiene acciones de eliminar fuera de la tarjeta que desalinean el layout, y la **proyección de interés compuesto** en el inicio no permite configurar la tasa anual de rendimiento, por lo que la serie compuesta queda inutilizable si el usuario no registró tasas en patrimonio.

## Goals / Non-Goals

- **Goal 1:** El usuario ve **meses de autonomía (runway)** calculados como patrimonio líquido ÷ gasto de vida mensual, con definiciones explícitas de ambos términos.
- **Goal 2:** El patrimonio líquido usado en runway y en la vista de libertad financiera (meta 25×) es **el mismo número** en la misma sesión.
- **Goal 3:** El usuario clasifica cada fuente de ingreso como **lineal**, **residual** o **pasivo** y ve cuánto aporta cada clase al mes.
- **Goal 4:** El usuario ve **cobertura por flujo**: qué porcentaje de su gasto de vida cubren ingresos pasivos + residuales, y cuánto falta para llegar al 100%.
- **Goal 5:** En deudas, eliminar una tarjeta o préstamo es **consistente visualmente** con el resto de cards (icono dentro de la tarjeta, alturas uniformes).
- **Goal 6:** En el gráfico de proyección de ahorro, el usuario **configura la tasa anual (TEA)** de rendimiento y ve la curva compuesta actualizada sin ir a otra pantalla.
- **Non-Goal:** Test de creencias, termostato financiero, afirmaciones o contenido pseudocientífico del curso.
- **Non-Goal:** Reemplazar la meta FIRE 25× ni modificar reglas de ingreso neto, DTI o brecha de ahorro ya entregadas.
- **Non-Goal:** Calculadora de costo de oportunidad, detector de suscripciones, hitos históricos, simulador compuesto con tasa variable por año o “valle de la decepción” (features posteriores).

## Personas

- **Empleado con nómina COL:** Ingreso principal lineal; quiere saber cuántos meses aguanta sin salario si pierde el empleo.
- **Usuario en transición E→I:** Tiene rentas, regalías o dividendos además del salario; quiere medir avance hacia cubrir gastos sin trabajo activo.
- **Usuario con deudas múltiples:** Necesita eliminar entradas obsoletas sin romper el layout de la lista.

## User Stories

### US-1: Meses de autonomía (runway)

**As a** usuario con activos y gastos registrados, **I want** ver cuántos meses puedo mantener mi gasto de vida actual con mi patrimonio líquido, **so that** entienda mi margen real ante pérdida de ingreso.

#### Acceptance Criteria

##### AC-1.1 — Runway visible en el resumen

| Field        | Value                                                                                                                                                                            |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Given**    | El usuario tiene al menos un activo líquido con valor mayor que cero y gastos fijos registrados con total mayor que cero                                                         |
| **When**     | Abre la pantalla de inicio                                                                                                                                                       |
| **Then**     | Ve un indicador etiquetado de forma distinguible (por ejemplo “Meses de autonomía” o equivalente traducido) con un valor numérico en meses, redondeado a una decimal como máximo |
| **Negative** | El indicador no reutiliza la etiqueta “Disponible este mes” del héroe sin aclarar que mide meses, no pesos                                                                       |

##### AC-1.2 — Fórmula runway = líquido ÷ gasto de vida

| Field        | Value                                                                                                                  |
| ------------ | ---------------------------------------------------------------------------------------------------------------------- |
| **Given**    | Patrimonio líquido total de $30.000.000 y gasto de vida mensual de $5.000.000                                          |
| **When**     | El usuario consulta el indicador de meses de autonomía                                                                 |
| **Then**     | El valor mostrado es **6** meses (30 ÷ 5)                                                                              |
| **Negative** | El valor no se calcula dividiendo solo entre gastos fijos sin incluir variables del mes cuando estas están registradas |

##### AC-1.3 — Activos ilíquidos excluidos del numerador

| Field        | Value                                                                                           |
| ------------ | ----------------------------------------------------------------------------------------------- |
| **Given**    | El usuario tiene $100.000.000 en inmueble o vehículo y $10.000.000 en efectivo o ahorro         |
| **When**     | Consulta meses de autonomía con gasto de vida de $2.000.000                                     |
| **Then**     | El cálculo usa **$10.000.000** como patrimonio líquido (resultado **5** meses), no $110.000.000 |
| **Negative** | Inmuebles o vehículos no incrementan el numerador del runway                                    |

##### AC-1.4 — Gasto de vida cero o líquido cero

| Field        | Value                                                                                                                   |
| ------------ | ----------------------------------------------------------------------------------------------------------------------- |
| **Given**    | Patrimonio líquido es cero, o gasto de vida mensual es cero                                                             |
| **When**     | El usuario consulta meses de autonomía                                                                                  |
| **Then**     | Se muestra un estado explícito (“Sin datos”, “Indefinido” o equivalente) en lugar de un número engañoso o error visible |
| **Negative** | No se muestra un número positivo de meses cuando el numerador es cero                                                   |

### US-2: Patrimonio líquido coherente entre métricas

**As a** usuario que revisa libertad financiera y el resumen, **I want** que el patrimonio líquido sea el mismo en ambos lugares, **so that** no pierda confianza en las cifras.

#### Acceptance Criteria

##### AC-2.1 — Mismo líquido en resumen y libertad financiera

| Field        | Value                                                                                                                           |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| **Given**    | El usuario tiene activos de efectivo, ahorro e inversión con valores conocidos, y activos ilíquidos adicionales                 |
| **When**     | Ve el patrimonio líquido en el bloque compacto de libertad financiera del inicio y en la vista detallada de libertad financiera |
| **Then**     | Ambos muestran el **mismo monto en pesos** de patrimonio líquido                                                                |
| **Negative** | El monto no incluye inmuebles ni vehículos                                                                                      |

##### AC-2.2 — Runway y libertad financiera comparten definición de líquido

| Field        | Value                                                                                                                        |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| **Given**    | El usuario tiene $50.000.000 en inversiones líquidas, $0 en efectivo/ahorro, gasto de vida $4.000.000 y meta FIRE ya visible |
| **When**     | Compara patrimonio líquido en libertad financiera con el usado implícitamente en meses de autonomía                          |
| **Then**     | El numerador del runway es **$50.000.000** — coherente con el líquido mostrado en libertad financiera                        |
| **Negative** | Runway no usa solo efectivo/ahorro si inversiones líquidas están registradas                                                 |

##### AC-2.3 — Fondo de emergencia del puntaje de salud permanece distinguible

| Field        | Value                                                                                                                                                                                                                         |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Given**    | El usuario ve el desglose del puntaje de salud financiera y el indicador de meses de autonomía en el resumen                                                                                                                  |
| **When**     | Lee las etiquetas de ambos                                                                                                                                                                                                    |
| **Then**     | El componente de emergencia del puntaje de salud **no** usa la misma etiqueta que meses de autonomía; si ambos muestran meses, incluye texto que aclara que miden cosas distintas (reserva mínima vs estilo de vida completo) |
| **Negative** | No se elimina ni se oculta el componente de emergencia existente del puntaje de salud                                                                                                                                         |

### US-3: Clasificación de ingresos por tipo

**As a** usuario con salario e ingresos adicionales, **I want** marcar cada fuente como lineal, residual o pasiva, **so that** vea cuánto de mi ingreso mensual depende del trabajo activo.

#### Acceptance Criteria

##### AC-3.1 — Salario principal clasificado como lineal

| Field        | Value                                                                                                 |
| ------------ | ----------------------------------------------------------------------------------------------------- |
| **Given**    | El usuario tiene salario bruto registrado                                                             |
| **When**     | Abre la sección de ingresos                                                                           |
| **Then**     | El ingreso por nómina aparece como **lineal** (explícito o por convención documentada en ayuda breve) |
| **Negative** | El salario no se cuenta como pasivo ni residual por defecto                                           |

##### AC-3.2 — Ingresos adicionales con clase seleccionable

| Field        | Value                                                                                                      |
| ------------ | ---------------------------------------------------------------------------------------------------------- |
| **Given**    | El usuario crea o edita un ingreso adicional (por ejemplo arriendo recibido o regalías)                    |
| **When**     | Guarda el registro                                                                                         |
| **Then**     | Puede elegir entre **lineal**, **residual** y **pasivo**, y la elección persiste al recargar la aplicación |
| **Negative** | No existe opción vacía sin valor por defecto en ingresos nuevos                                            |

##### AC-3.3 — Equivalente mensual por clase visible

| Field        | Value                                                                                                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Given**    | Ingreso lineal neto equivalente $8.000.000/mes, ingreso pasivo $1.000.000/mes y residual $500.000/mes (incluyendo streams no mensuales convertidos a equivalente mensual) |
| **When**     | El usuario abre la sección de ingresos o el bloque de cobertura por flujo                                                                                                 |
| **Then**     | Ve tres totales mensuales distinguibles: lineal **$8.000.000**, pasivo **$1.000.000**, residual **$500.000**                                                              |
| **Negative** | Los streams semestrales o anuales no se muestran como monto bruto del periodo sin convertir a mensual en estos totales                                                    |

##### AC-3.4 — Ingresos existentes migran a lineal

| Field        | Value                                                                                           |
| ------------ | ----------------------------------------------------------------------------------------------- |
| **Given**    | El usuario tenía ingresos adicionales guardados antes de esta funcionalidad, sin clase asignada |
| **When**     | Abre la aplicación tras la actualización                                                        |
| **Then**     | Esos ingresos se tratan como **lineal** hasta que el usuario cambie la clase                    |
| **Negative** | Ningún ingreso previo queda sin clase operativa que bloquee cálculos                            |

### US-4: Cobertura por flujo (pasivo + residual vs gastos)

**As a** usuario en transición hacia independencia financiera, **I want** saber qué porcentaje de mis gastos cubren ingresos pasivos y residuales, **so that** mida avance hacia libertad por flujo sin confundirlo con la meta FIRE 25×.

#### Acceptance Criteria

##### AC-4.1 — Porcentaje de cobertura visible

| Field        | Value                                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------------- |
| **Given**    | Ingresos pasivos equivalentes $2.000.000/mes, residuales $1.000.000/mes y gasto de vida $10.000.000/mes |
| **When**     | El usuario consulta cobertura por flujo (en resumen o vista de libertad financiera)                     |
| **Then**     | Ve cobertura **30%** ((2+1) ÷ 10 × 100)                                                                 |
| **Negative** | El ingreso lineal no entra en el numerador                                                              |

##### AC-4.2 — Estado al alcanzar 100% o más

| Field        | Value                                                                                                                                 |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Given**    | Ingresos pasivos + residuales suman $12.000.000/mes y gasto de vida es $10.000.000/mes                                                |
| **When**     | El usuario consulta cobertura por flujo                                                                                               |
| **Then**     | Ve cobertura **120%** (o “100%+”) y un mensaje o indicador visual que indica que los ingresos no lineales **cubren** el gasto de vida |
| **Negative** | No se muestra brecha positiva cuando la cobertura es ≥ 100%                                                                           |

##### AC-4.3 — Brecha mensual cuando cobertura < 100%

| Field        | Value                                                                                    |
| ------------ | ---------------------------------------------------------------------------------------- |
| **Given**    | Ingresos pasivos + residuales $3.000.000/mes y gasto de vida $10.000.000/mes             |
| **When**     | El usuario consulta cobertura por flujo                                                  |
| **Then**     | Ve brecha **$7.000.000/mes** (gasto de vida − (pasivo + residual)) además del porcentaje |
| **Negative** | La brecha no incluye ingreso lineal en el lado de “ingresos que cubren”                  |

##### AC-4.4 — Cobertura y meta FIRE son métricas separadas

| Field        | Value                                                                                                                                                                                                                   |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Given**    | El usuario ve cobertura por flujo y progreso hacia meta 25× en la misma sesión                                                                                                                                          |
| **When**     | Lee las etiquetas y valores                                                                                                                                                                                             |
| **Then**     | Cobertura por flujo se expresa como **porcentaje del gasto de vida** cubierto por ingresos no lineales; la meta FIRE se expresa como **patrimonio objetivo o progreso hacia 25× gasto anual** — con etiquetas distintas |
| **Negative** | Un solo indicador no mezcla porcentaje de cobertura con meses hacia FIRE                                                                                                                                                |

### US-5: Eliminar deudas con UX consistente

**As a** usuario que gestiona tarjetas y préstamos, **I want** un botón de eliminar con icono dentro de cada tarjeta de deuda, **so that** todas las cards tengan el mismo tamaño y el patrón sea coherente con el resto de la aplicación.

#### Acceptance Criteria

##### AC-5.1 — Icono de eliminar dentro de la card

| Field        | Value                                                                                                                                                                                   |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Given**    | El usuario tiene al menos una deuda registrada (tarjeta o préstamo)                                                                                                                     |
| **When**     | Ve la lista de deudas                                                                                                                                                                   |
| **Then**     | Cada card muestra un control de eliminar **dentro** del borde de la card (cabecera o pie), representado por un **icono** reconocible (no solo texto “Eliminar” suelto fuera de la card) |
| **Negative** | No hay botón de eliminar flotando fuera de la card que ensanche una fila respecto a otra                                                                                                |

##### AC-5.2 — Cards de altura uniforme en la lista

| Field        | Value                                                                                                             |
| ------------ | ----------------------------------------------------------------------------------------------------------------- |
| **Given**    | El usuario tiene dos o más deudas en la lista                                                                     |
| **When**     | Compara las cards una junto a otra                                                                                |
| **Then**     | Todas ocupan el **mismo ancho** de contenedor (100% del listado) y ninguna fila es más ancha por un botón externo |
| **Negative** | Ninguna card tiene un control de eliminar que la haga visualmente más grande que las demás                        |

##### AC-5.3 — Confirmación antes de borrar

| Field        | Value                                                                 |
| ------------ | --------------------------------------------------------------------- |
| **Given**    | El usuario pulsa el icono de eliminar en una deuda                    |
| **When**     | Confirma en el diálogo de confirmación                                |
| **Then**     | La deuda desaparece de la lista y ya no afecta totales ni simuladores |
| **Negative** | Un toque accidental en el icono no elimina sin confirmación           |

##### AC-5.4 — Accesibilidad del control de eliminar

| Field        | Value                                                                                                                 |
| ------------ | --------------------------------------------------------------------------------------------------------------------- |
| **Given**    | Un usuario de lector de pantalla enfoca el control de eliminar                                                        |
| **When**     | Escucha la etiqueta accesible                                                                                         |
| **Then**     | Existe un **nombre accesible** traducido (por ejemplo “Eliminar deuda”) asociado al icono, no solo un glifo sin texto |
| **Negative** | —                                                                                                                     |

### US-6: Tasa anual en proyección de interés compuesto

**As a** usuario que revisa la proyección de ahorro en el inicio, **I want** indicar la tasa anual (TEA) a la que renta mi patrimonio líquido, **so that** la serie de interés compuesto sea útil aunque no haya configurado tasas en patrimonio.

#### Acceptance Criteria

##### AC-6.1 — Campo de tasa visible en el gráfico

| Field        | Value                                                                                                                                                               |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Given**    | El usuario abre la pantalla de inicio con el bloque de proyección de ahorro a 12 meses                                                                              |
| **When**     | Busca cómo configurar el rendimiento anual                                                                                                                          |
| **Then**     | Ve un campo numérico etiquetado como **tasa anual (TEA %)** (o equivalente traducido) **en o junto al** gráfico de proyección, no solo en la pantalla de patrimonio |
| **Negative** | La serie compuesta no depende exclusivamente de tasas ingresadas al crear activos en patrimonio                                                                     |

##### AC-6.2 — Tasa persiste al recargar

| Field        | Value                                                                              |
| ------------ | ---------------------------------------------------------------------------------- |
| **Given**    | El usuario ingresa **10** en el campo de TEA % del gráfico y recarga la aplicación |
| **When**     | Vuelve a abrir la pantalla de inicio                                               |
| **Then**     | El campo muestra **10** (o el valor guardado equivalente)                          |
| **Negative** | El valor no se pierde al cerrar pestaña si los demás ajustes persisten             |

##### AC-6.3 — Serie compuesta reacciona al cambiar la tasa

| Field        | Value                                                                                                      |
| ------------ | ---------------------------------------------------------------------------------------------------------- |
| **Given**    | Patrimonio líquido elegible para proyección de **$10.000.000** y TEA configurada en **12%**                |
| **When**     | El usuario observa el valor acumulado de la serie compuesta al mes 12                                      |
| **Then**     | El valor es **mayor** que el saldo inicial ($10.000.000) y **mayor** que el mismo escenario con TEA **0%** |
| **Negative** | Cambiar la TEA no deja la serie compuesta idéntica al escenario sin tasa                                   |

##### AC-6.4 — Serie compuesta visible con tasa y patrimonio válidos

| Field        | Value                                                                                                                                                                 |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Given**    | TEA **> 0%** y patrimonio líquido elegible **> 0**                                                                                                                    |
| **When**     | El usuario ve el gráfico de proyección                                                                                                                                |
| **Then**     | La leyenda incluye la serie de **crecimiento con tasa** (no solo la línea hipotética lineal) y el mensaje de “sin tasa configurada” **no** oculta el gráfico completo |
| **Negative** | Con tasa y patrimonio válidos no se muestra únicamente el estado vacío de AC-6.5                                                                                      |

##### AC-6.5 — Orientación cuando falta tasa o patrimonio

| Field        | Value                                                                                                                                                                         |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Given**    | TEA es **0%** o patrimonio líquido elegible es **0**                                                                                                                          |
| **When**     | El usuario ve el bloque de proyección                                                                                                                                         |
| **Then**     | Aparece un texto breve que indica qué falta (configurar TEA, registrar patrimonio líquido, o ambos) mientras la serie **hipotética lineal** sigue visible si hay ingreso neto |
| **Negative** | El bloque entero no queda en blanco cuando solo falta la tasa o el patrimonio para la serie compuesta                                                                         |

##### AC-6.6 — Base del compuesto = patrimonio líquido elegible

| Field        | Value                                                                               |
| ------------ | ----------------------------------------------------------------------------------- |
| **Given**    | $8.000.000 en ahorro, $2.000.000 en inversión, $50.000.000 en inmueble, TEA **10%** |
| **When**     | El usuario consulta la serie compuesta al mes 1                                     |
| **Then**     | El crecimiento parte de **$10.000.000** (líquido elegible), no de $60.000.000       |
| **Negative** | Inmuebles o vehículos no entran en la base del compuesto                            |

## Edge Cases

- **EC-1:** Gasto de vida incluye fijos más total de variables **registradas en el mes corriente**; si no hay variables registradas, usa solo fijos → runway puede variar intra-mes (documentar en ayuda).
- **EC-2:** Cobertura > 100% no implica meta FIRE alcanzada — son criterios independientes.
- **EC-3:** Prima y streams no mensuales aportan al equivalente mensual de su clase, no al runway directamente.
- **EC-4:** Usuario sin ingresos adicionales: cobertura pasiva + residual = 0%; brecha = gasto de vida completo.
- **EC-5:** Eliminar la última deuda deja el estado vacío con CTA de agregar, sin cards huérfanas.
- **EC-6:** TEA fuera de rango (negativa o > 100%) no se acepta; el campo mantiene el último valor válido o muestra error visible.
- **EC-7:** Si existen tasas por activo en patrimonio **y** tasa en el gráfico, prevalece la **tasa del gráfico** para la proyección del inicio (ver OQ-3).

## Success Metrics

- El 100% de AC verificables con datos de prueba numéricos fijos (sin subjetividad).
- Tras implementación, cero reportes de “líquido distinto” entre resumen y libertad financiera en pruebas de regresión.
- Usuario puede completar clasificación de un ingreso adicional en ≤ 3 interacciones (crear → elegir clase → guardar).
- Usuario puede configurar TEA en el gráfico y ver serie compuesta en ≤ 2 interacciones (ingresar tasa → ver leyenda activa).
- Lista de deudas: todas las cards mismo ancho en viewport móvil y escritorio (inspección visual en prueba manual).

## Out of Scope

- Runway con “burn neto” (gasto − ingresos pasivos/residuales) — fase posterior.
- Historial mes a mes de runway o cobertura en snapshots.
- Inferencia automática de clase de ingreso (solo elección del usuario).
- Costo de oportunidad, suscripciones, fases de consciencia 1–4.

## Open Questions

_(Ninguna pendiente — resueltas en Clarifications.)_

## Clarifications

| ID         | Decisión                                                                                                                                                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **OQ-1** → | **Inversiones registradas cuentan como líquido** para runway y patrimonio líquido unificado (efectivo, ahorro, inversión). Inmueble, vehículo y “otro” ilíquido quedan fuera.                                                                     |
| **OQ-2** → | **Gasto de vida = gastos fijos mensuales + variables registradas en el mes corriente.** Alineado con la vista de libertad financiera existente.                                                                                                   |
| **OQ-3** → | **La TEA configurada en el gráfico del inicio es la fuente de verdad** para la serie compuesta del dashboard. Las tasas por activo en patrimonio no sustituyen esa tasa en este bloque (pueden seguir usándose en patrimonio para otro contexto). |

## Sign-off

- [x] Johann Medina — 2026-05-29
