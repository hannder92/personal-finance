# Spec: Planificación financiera integrada

> Spec version: **v1** · Mode: `solo`
> Slug: `20260529-planificacion-financiera-integrada` · Created: `2026-05-29`

## Problem

El usuario colombiano que registra ingreso neto, gastos fijos y deudas ve en la pantalla de inicio un **disponible** real (flujo de caja) y, al mismo tiempo, mensajes y gráficos basados en la **regla 50/30/20** y en proyecciones que no siempre coinciden (por ejemplo disponible $800.000 vs meta de ahorro $2.000.000 al 20%). No sabe si puede ahorrar lo que sugiere la regla, cuándo quedará libre de deudas, ni cómo se relacionan el crecimiento de lo que ya ahorró con tasa, el ahorro lineal “¿y si aparto el %?” y la proyección de flujo con prima. Necesita una narrativa única y accionable, no más cifras sueltas.

## Goals / Non-Goals

- **Goal 1:** El usuario distingue **ahorro objetivo** (regla % sobre ingreso neto), **ahorro factible** (disponible tras fijos y deudas) y la **brecha** entre ambos, con orientación cuando no es viable.
- **Goal 2:** Las proyecciones del inicio explican tres ideas distintas sin contradecirse: flujo de caja a 12 meses (con ingresos no mensuales), ahorro hipotético lineal al % configurado, y crecimiento del patrimonio líquido con tasa de rendimiento.
- **Goal 3:** En deudas, el usuario ve fecha estimada de salida global, impacto de pagos extra y estrategia de pago (avalancha o bola de nieve) reflejada en la experiencia.
- **Goal 4:** El usuario obtiene una vista inicial de **libertad financiera** (gasto de vida, patrimonio líquido, meta y horizonte) con datos ya capturados.
- **Non-Goal:** Asesoría fiscal/legal, cotizaciones en vivo de CDT/fondos, integración bancaria.
- **Non-Goal:** Escenarios guardados (“¿y si bajo arriendo?”), inflación IPC automática, curva única que combine aportes mensuales reinvertidos con tasa (fase posterior).
- **Non-Goal:** Cambiar las reglas de cálculo de ingreso neto, DTI o puntaje de salud ya definidas en features anteriores.

## Personas

- **Empleado con nómina COL:** Deducciones de salud y pensión; créditos y tarjetas; necesita saber cuánto puede ahorrar de verdad cada mes.
- **Usuario con metas y patrimonio:** Configura TEA en ahorros/inversiones; quiere alinear metas con capacidad real y ver horizonte de independencia financiera.

## User Stories

### US-1: Brecha entre ahorro objetivo y ahorro factible

**As a** empleado con nómina, **I want** ver en el resumen el ahorro que marca mi regla, el que puedo apartar después de gastos y deudas, y la diferencia entre ambos, **so that** no intente ahorrar una cifra imposible.

#### Acceptance Criteria

##### AC-1.1 — Tres cifras visibles en el resumen

| Field        | Value                                                                                                                                                                                                                                                                                    |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Given**    | El usuario tiene ingreso neto mayor que cero y porcentaje de ahorro configurado en distribución                                                                                                                                                                                          |
| **When**     | Abre la pantalla de inicio                                                                                                                                                                                                                                                               |
| **Then**     | Ve tres montos etiquetados de forma distinguible: **ahorro objetivo** (porcentaje de ahorro × ingreso neto), **ahorro factible** (disponible del mes tras gastos fijos y obligaciones de deuda) y **brecha** (diferencia no negativa entre objetivo y factible cuando objetivo es mayor) |
| **Negative** | Ninguna de las tres etiquetas usa el mismo texto que el monto “disponible” del héroe sin aclarar el rol                                                                                                                                                                                  |

##### AC-1.2 — Alerta cuando la regla no es viable

| Field        | Value                                                                                                                                         |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Given**    | Ahorro objetivo es mayor que ahorro factible y ahorro factible es mayor que cero                                                              |
| **When**     | El usuario ve el bloque de brecha en el resumen                                                                                               |
| **Then**     | Aparece un mensaje visible que indica que no puede sostener el porcentaje de ahorro configurado sin reducir gastos, deudas o ajustar la regla |
| **Negative** | El mensaje no afirma que el usuario ya está ahorrando el monto objetivo                                                                       |

##### AC-1.3 — Sin ahorro factible positivo ficticio

| Field        | Value                                                                                                                                          |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Given**    | El disponible del mes es menor o igual a cero                                                                                                  |
| **When**     | El usuario ve el bloque de brecha                                                                                                              |
| **Then**     | El ahorro factible mostrado es cero o está claramente marcado como no disponible, y la brecha no sugiere un plan de ahorro positivo automático |
| **Negative** | No se muestra ahorro factible positivo solo porque el porcentaje de ahorro sobre el neto sea positivo                                          |

##### AC-1.4 — Distribución muestra montos sobre ingreso neto

| Field        | Value                                                                                                                 |
| ------------ | --------------------------------------------------------------------------------------------------------------------- |
| **Given**    | El usuario tiene salario bruto, deducciones y porcentajes de distribución configurados                                |
| **When**     | Abre la sección de distribución del presupuesto                                                                       |
| **Then**     | Los montos en pesos de necesidades, deseos y ahorros se calculan sobre el **ingreso neto**, no sobre el salario bruto |
| **Negative** | Los montos no coinciden con el bruto cuando hay deducciones                                                           |

##### AC-1.5 — Texto del donut no confunde con ahorro factible

| Field        | Value                                                                                                                                     |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Given**    | El usuario tiene datos para el gráfico de distribución y brecha con objetivo mayor que factible                                           |
| **When**     | Lee la frase interpretativa junto al gráfico circular de distribución                                                                     |
| **Then**     | La frase describe el monto **objetivo** según la regla (porcentaje × neto) y no dice que ese monto es lo que le queda disponible este mes |
| **Negative** | —                                                                                                                                         |

### US-2: Proyección de flujo de caja a doce meses

**As a** empleado con prima u otros ingresos no mensuales, **I want** una proyección de saldo que refleje mi neto y cuándo entran ingresos extra, **so that** anticipe meses fuertes y débiles.

#### Acceptance Criteria

##### AC-2.1 — Base de cálculo es ingreso neto

| Field        | Value                                                                                                                                           |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Given**    | El usuario tiene salario bruto con deducciones que reducen el neto de forma conocida                                                            |
| **When**     | Ve el gráfico de proyección de flujo de caja a 12 meses en el resumen                                                                           |
| **Then**     | El saldo del primer mes de la serie se deriva del ingreso **neto** menos gastos fijos y obligaciones de deuda registradas, no del salario bruto |
| **Negative** | —                                                                                                                                               |

##### AC-2.2 — Ingresos no mensuales en meses correctos

| Field        | Value                                                                                                                       |
| ------------ | --------------------------------------------------------------------------------------------------------------------------- |
| **Given**    | El usuario tiene un ingreso adicional semestral (por ejemplo prima) configurado                                             |
| **When**     | Observa los 12 meses del gráfico de flujo                                                                                   |
| **Then**     | Los meses en que corresponde recibir ese ingreso muestran un saldo acumulado mayor que los meses adyacentes sin ese ingreso |
| **Negative** | El ingreso semestral no aparece repartido en los 12 meses por igual                                                         |

##### AC-2.3 — Frase del gráfico de flujo describe flujo, no regla de ahorro

| Field        | Value                                                                                                                                               |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Given**    | El gráfico de flujo muestra una serie de saldo acumulado                                                                                            |
| **When**     | El usuario lee la frase interpretativa asociada a ese gráfico                                                                                       |
| **Then**     | La frase habla de **flujo de caja acumulado** (o equivalente claro) y no usa la misma redacción que la frase del ahorro hipotético al % configurado |
| **Negative** | —                                                                                                                                                   |

### US-3: Diferenciar ahorro hipotético y crecimiento con rendimiento

**As a** usuario con patrimonio en ahorros o inversiones, **I want** entender qué significa cada línea de la proyección de ahorro, **so that** no crea que el 20% del neto ya está compuesto en mi CDT.

#### Acceptance Criteria

##### AC-3.1 — Etiqueta de acumulación lineal al porcentaje

| Field        | Value                                                                                                                                               |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Given**    | Ingreso neto y porcentaje de ahorro mayores que cero                                                                                                |
| **When**     | Ve el gráfico de proyección de ahorro a 12 meses                                                                                                    |
| **Then**     | La serie de **ahorro hipotético** está etiquetada como acumulación mensual del porcentaje de ahorro sobre el neto **sin** rendimiento por intereses |
| **Negative** | La etiqueta no dice “interés compuesto” ni “rendimiento”                                                                                            |

##### AC-3.2 — Etiqueta de crecimiento del patrimonio con tasa

| Field        | Value                                                                                                                                                                                                    |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Given**    | El usuario tiene activos de tipo ahorro o inversión con tasa de rendimiento anual mayor que cero                                                                                                         |
| **When**     | Ve el mismo gráfico de proyección de ahorro                                                                                                                                                              |
| **Then**     | La serie de **crecimiento con rendimiento** está etiquetada como evolución del **saldo actual** de esos activos aplicando la tasa configurada, no como nuevos aportes mensuales del porcentaje de ahorro |
| **Negative** | —                                                                                                                                                                                                        |

##### AC-3.3 — Sin tasa: mensaje y una sola serie relevante

| Field        | Value                                                                                                                                      |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Given**    | El usuario no tiene activos de ahorro o inversión con tasa de rendimiento mayor que cero                                                   |
| **When**     | Ve la sección de proyección de ahorro en el resumen                                                                                        |
| **Then**     | Aparece un mensaje que indica cómo configurar una tasa en patrimonio para ver la curva de rendimiento, y la serie hipotética sigue visible |
| **Negative** | No se muestra una curva de rendimiento con valores idénticos a la hipotética sin aviso                                                     |

### US-4: Salida de deudas y simulación de pagos

**As a** usuario endeudado, **I want** saber cuándo termino de pagar todo y qué gano si pago de más, **so that** priorice correctamente.

#### Acceptance Criteria

##### AC-4.1 — Fecha estimada de estar libre de deudas

| Field        | Value                                                                                                                 |
| ------------ | --------------------------------------------------------------------------------------------------------------------- |
| **Given**    | El usuario tiene al menos una deuda con saldo y pago mínimo configurados                                              |
| **When**     | Abre la sección de deudas                                                                                             |
| **Then**     | Ve una fecha o mes estimado en el que la última deuda quedaría pagada siguiendo los pagos mínimos y tasas registradas |
| **Negative** | No se muestra fecha si no hay deudas con saldo positivo                                                               |

##### AC-4.2 — Simulador de pago extra

| Field        | Value                                                                                                           |
| ------------ | --------------------------------------------------------------------------------------------------------------- |
| **Given**    | El usuario tiene una tarjeta o crédito con saldo, tasa y pago mínimo                                            |
| **When**     | Ingresa un monto de pago extra mensual en el simulador y confirma                                               |
| **Then**     | Ve cuántos meses se acortan el plazo y cuánto interés deja de pagar, respecto al escenario solo con pago mínimo |
| **Negative** | Un pago extra de cero no cambia los resultados respecto al mínimo                                               |

##### AC-4.3 — Estrategia de pago seleccionable

| Field        | Value                                                                                                                                                          |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Given**    | El usuario tiene dos o más deudas con saldo                                                                                                                    |
| **When**     | Cambia la preferencia entre estrategia **avalancha** (mayor tasa primero) y **bola de nieve** (menor saldo primero) en configuración o en la sección de deudas |
| **Then**     | La preferencia queda guardada y visible en la siguiente visita                                                                                                 |
| **Negative** | —                                                                                                                                                              |

##### AC-4.4 — Orden sugerido coherente con la estrategia

| Field        | Value                                                                            |
| ------------ | -------------------------------------------------------------------------------- |
| **Given**    | Estrategia avalancha activa y deudas con tasas distintas                         |
| **When**     | El usuario ve la lista ordenada de deudas para priorizar pagos                   |
| **Then**     | La deuda con mayor tasa aparece antes que las de menor tasa                      |
| **Negative** | Con estrategia bola de nieve activa, el orden no sigue el criterio de mayor tasa |

### US-5: Vista de libertad financiera

**As a** usuario que planea independencia financiera, **I want** un resumen en el inicio y el detalle en Plan, **so that** vea el horizonte de un vistazo y profundice cuando lo necesite.

#### Acceptance Criteria

##### AC-5.1 — Gasto de vida mensual visible

| Field        | Value                                                                                                                                         |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Given**    | El usuario tiene gastos fijos registrados                                                                                                     |
| **When**     | Abre la vista **detallada** de libertad financiera en la sección Plan                                                                         |
| **Then**     | Ve un **gasto de vida mensual** igual a la suma de sus gastos fijos registrados (más gastos variables del mes si están disponibles en la app) |
| **Negative** | El gasto no se calcula solo como porcentaje teórico de la regla 50/30/20                                                                      |

##### AC-5.2 — Patrimonio líquido visible

| Field        | Value                                                                                         |
| ------------ | --------------------------------------------------------------------------------------------- |
| **Given**    | El usuario tiene activos de tipos efectivo, ahorros e inversión con valores registrados       |
| **When**     | Ve la vista detallada de libertad financiera en Plan                                          |
| **Then**     | Ve el total de **patrimonio líquido** (suma de esos activos) excluyendo inmuebles y vehículos |
| **Negative** | No incluye el valor de inmuebles o vehículos en ese total                                     |

##### AC-5.3 — Meta de independencia con regla 25×

| Field        | Value                                                                                           |
| ------------ | ----------------------------------------------------------------------------------------------- |
| **Given**    | Gasto de vida mensual mayor que cero                                                            |
| **When**     | Ve la vista detallada de libertad financiera en Plan                                            |
| **Then**     | Ve una **meta de patrimonio** igual a 25 veces el gasto de vida anualizado (gasto mensual × 12) |
| **Negative** | —                                                                                               |

##### AC-5.4 — Horizonte con ahorro factible

| Field        | Value                                                                                                            |
| ------------ | ---------------------------------------------------------------------------------------------------------------- |
| **Given**    | Meta de patrimonio mayor que patrimonio líquido actual y ahorro factible mensual mayor que cero                  |
| **When**     | Ve la vista detallada de libertad financiera en Plan                                                             |
| **Then**     | Ve un **horizonte estimado** (meses o años) para alcanzar la meta si aportara cada mes el ahorro factible actual |
| **Negative** | Si ahorro factible es cero, el horizonte no muestra un número finito positivo sin advertencia                    |

##### AC-5.5 — Resumen compacto en el inicio

| Field        | Value                                                                                                                                                                            |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Given**    | El usuario tiene datos suficientes para calcular patrimonio líquido y meta 25×                                                                                                   |
| **When**     | Abre la pantalla de inicio                                                                                                                                                       |
| **Then**     | Ve un bloque compacto de libertad financiera con al menos: patrimonio líquido actual, meta de patrimonio y porcentaje de avance hacia la meta (o equivalente visual de progreso) |
| **Negative** | El bloque compacto no duplica el desglose completo de gasto de vida (eso queda en Plan)                                                                                          |

##### AC-5.6 — Enlace del resumen al detalle en Plan

| Field        | Value                                                                        |
| ------------ | ---------------------------------------------------------------------------- |
| **Given**    | El bloque compacto de libertad financiera está visible en el inicio          |
| **When**     | El usuario activa el control “ver detalle” (o equivalente) del bloque        |
| **Then**     | Navega a la vista detallada de libertad financiera dentro de la sección Plan |
| **Negative** | —                                                                            |

### US-6: Metas alineadas a capacidad real

**As a** usuario con metas de ahorro, **I want** que el cupo de metas respete lo que puedo apartar, **so that** no planifique aportes imposibles.

#### Acceptance Criteria

##### AC-6.1 — Alerta si aportes superan el menor entre objetivo y factible

| Field        | Value                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------ |
| **Given**    | La suma de aportes mensuales a metas supera el menor entre (ahorro objetivo por regla) y (ahorro factible del mes) |
| **When**     | El usuario ve la sección de metas                                                                                  |
| **Then**     | Aparece una alerta visible con ambos topes y el total de aportes                                                   |
| **Negative** | La alerta solo compara con el porcentaje del neto ignorando el disponible                                          |

##### AC-6.2 — Cupo normativo y tope factible en metas

| Field        | Value                                                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------------------------------------- |
| **Given**    | Ingreso neto y distribución con porcentaje de ahorro configurados                                                         |
| **When**     | El usuario abre la sección de metas sin haber disparado la alerta de exceso                                               |
| **Then**     | Ve el **cupo según regla** (porcentaje × neto) y el **tope factible** (disponible del mes) como referencias distinguibles |
| **Negative** | —                                                                                                                         |

## Edge Cases

- **EC-1:** Disponible negativo → ahorro factible en cero; brecha y libertad financiera sin horizonte positivo engañoso.
- **EC-2:** Sin ingreso neto → bloques de brecha, flujo y libertad financiera en estado vacío con orientación a configurar ingresos.
- **EC-3:** Tasa de rendimiento 0% en activos → curva de crecimiento plana sobre saldo inicial, sin error.
- **EC-4:** Una sola deuda → fecha libre de deudas coincide con timeline de esa deuda.
- **EC-5:** Meta de ahorro ya alcanzada (patrimonio líquido ≥ meta 25×) → mensaje de meta alcanzada o horizonte cero, no cuenta regresiva infinita.

## Success Metrics

- En prueba moderada (≥3 usuarios internos), 100% identifica correctamente “ahorro objetivo” vs “ahorro factible” en el resumen sin ayuda verbal.
- 100% distingue, en el gráfico de ahorro a 12 meses, cuál serie es “si aparto el %” y cuál es “mi patrimonio con rendimiento”.
- Cero reportes de “el gráfico me dice que ahorro 2M pero solo me quedan 800K” sin ver la brecha o alerta correspondiente.

## Out of Scope

- Inflación IPC, retención en la fuente avanzada, cotización de tasas en mercado.
- Simulador con refinanciación, consolidación de deudas o tasas que cambian cada mes.
- Curva única que sume aportes mensuales factibles reinvertidos a tasa (post v1).
- Escenarios hipotéticos guardados por el usuario.

## Open Questions

- [x] **OQ-1:** ¿La vista de libertad financiera vive solo en el resumen, en patrimonio, o en una subsección nueva bajo Plan?

## Clarifications

- **OQ-1 →** Patrón **híbrido**: en el **Resumen (inicio)** un bloque **compacto** (patrimonio líquido, meta 25×, avance y horizonte resumido); vista **detallada** (gasto de vida, desglose completo, horizonte con supuestos) en **Plan**, alcanzable desde un enlace visible en el bloque compacto. Patrimonio sigue siendo donde se editan activos y tasas; no duplica esa pantalla.

## Sign-off

- [x] Author: Johann Medina — 2026-05-29
