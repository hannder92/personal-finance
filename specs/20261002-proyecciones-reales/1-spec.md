# Spec: Proyecciones reales (inflación, rentabilidad y aporte requerido)

## Spec version: v1

## Mode: solo

## Problem

Un empleado que ahorra cada mes en Colombia planea sus metas y su retiro con números que ignoran dos fuerzas: lo que rinde el dinero invertido y lo que la inflación le quita en poder de compra. Hoy los plazos se calculan como "faltante ÷ ahorro mensual", así que salen demasiado largos para lo que se invierte y demasiado cortos para lo que se compra a precios futuros. El usuario no sabe cuánto debe ahorrar al mes para llegar a tiempo ni cuánto le cambia invertir.

## Goals / Non-Goals

- **Goal 1:** En Libertad financiera, el usuario ve en años cuánto le falta y el aporte mensual necesario para lograrlo en el plazo que elija, usando sus supuestos de rentabilidad, inflación y tasa de retiro.
- **Goal 2:** En cada meta, el usuario ve la fecha estimada y el aporte mensual requerido para su fecha objetivo, con el monto ajustado por inflación y, si la meta se invierte, con rentabilidad.
- **Goal 3:** Los supuestos se configuran una sola vez, con valores de referencia para Colombia citando fuente y fecha, y sin cambiar ningún número para quien no los configure.
- **Non-goal:** Costo de esperar, desglose del crecimiento, portafolio por perfiles, CDT neto de retención (spec posterior).
- **Non-goal:** Tasas o inflación descargadas en línea; los valores de referencia viajan con la versión de la app.
- **Non-goal:** Recomendar productos, entidades o tipos de activo.
- **Non-goal:** Escenarios múltiples (conservador/base/optimista) por meta.

## Personas

- **Empleado que planea:** asalariado en Colombia con ahorro mensual estable que revisa sus metas y su retiro una vez al mes o al año.

## User Moments

> From [0-discovery.md](./0-discovery.md). Every user story references at least one `UM-N`.

| ID   | When                                      | Question                                                                                                | Horizon | P0 visible                                           |
| ---- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------- | ---------------------------------------------------- |
| UM-1 | Revisión mensual/anual del plan de retiro | ¿En cuántos años puedo vivir de mis inversiones y cuánto debo ahorrar al mes para lograrlo en mi plazo? | year    | Años para lograrlo (hero) + aporte mensual necesario |
| UM-2 | Al crear o revisar una meta               | ¿Llego a tiempo a mi meta y cuánto debo ahorrar al mes para lograrlo?                                   | year    | Fecha estimada + aporte requerido por meta           |
| UM-3 | Primera vez o cuando cambia la economía   | ¿Qué inflación y rentabilidad son razonables para Colombia?                                             | year    | Supuestos con rentabilidad real resultante           |

## UI Intent

| Priority | Content                                                                                                                                        | Hierarchy (label → hero → detail)                                       |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| P0       | Libertad financiera: años para lograrlo + aporte mensual necesario para el plazo deseado. Metas: fecha estimada + aporte requerido por tarjeta | "Años para lograrlo" → número de años → línea de contexto con supuestos |
| P1       | Beneficio de invertir ("llegas N antes", "$X menos al mes"); capital necesario en pesos de hoy con su equivalente nominal                      | Frase de beneficio → monto → detalle nominal en texto secundario        |
| P2       | Edición de supuestos, valores de referencia con fuente, aviso educativo                                                                        | Supuesto → valor → fuente/fecha                                         |

**Emotional target:** clarity + confidence

**Recommended layout:** Option A de discovery — supuestos globales en Ajustes, un número protagonista por tarjeta y comparación con/sin rentabilidad en lenguaje humano.

## Feedback Loops

| Loop                | States                                                                  | Closed by                                                                           |
| ------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Meta                | en camino → atrasada → (ajuste de aporte o fecha) → en camino → lograda | Usuario cambia aporte mensual, fecha objetivo o la opción "este dinero se invierte" |
| Libertad financiera | lejos → plazo deseado alcanzable con aporte X → progreso mensual        | Usuario ajusta plazo deseado o supuestos; ve cambiar años y aporte                  |
| Supuestos           | neutros → configurados → rentabilidad real razonable / optimista        | Usuario usa referencia o edita valores; aviso ámbar si es optimista                 |

## Decision Surfaces

| Decision                                     | Scenarios                                               | Benefit visible to user                                                   |
| -------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------- |
| ¿Invertir el dinero de una meta?             | Con rentabilidad vs sin rentabilidad                    | "Invirtiendo llegas N meses antes" / "ahorras $X menos al mes"            |
| ¿Cuánto ahorrar para la libertad financiera? | Aporte actual vs aporte necesario para el plazo deseado | "Para lograrlo en 20 años ahorra $X/mes (hoy $Y)"                         |
| ¿Invertir para el retiro?                    | Con rentabilidad vs sin rentabilidad                    | "Con rentabilidad llegas N años antes" o "Sin invertir no lo alcanzarías" |

## Reglas de dominio (cálculo)

Aplican a todas las ACs. Ejemplos numéricos redondeados al peso.

- **R-1 Tasas:** rentabilidad e inflación se expresan como tasa efectiva anual (E.A.); su equivalente mensual es (1 + tasa)^(1/12) − 1.
- **R-2 Aportes:** el aporte mensual es fijo en pesos nominales (no sube con la inflación) y se suma al final de cada mes.
- **R-3 Montos objetivo en pesos de hoy:** el monto que escribe el usuario (meta, capital de libertad financiera) está en pesos de hoy; a una fecha futura equivale a monto × (1 + inflación)^(años).
- **R-4 Alcance:** el plazo es el primer mes en que el saldo proyectado (saldo actual y aportes creciendo a la rentabilidad) es ≥ al monto objetivo ajustado por inflación a ese mes. Horizonte máximo de búsqueda: 100 años; si no se alcanza, el plazo es "no alcanzable".
- **R-5 Rentabilidad real:** (1 + rentabilidad) / (1 + inflación) − 1.
- **R-6 Neutralidad:** con inflación 0% y rentabilidad 0%, todo resultado es idéntico al cálculo actual (faltante ÷ aporte, redondeado hacia arriba en meses).

## User Stories

### US-1: Configurar supuestos una sola vez

**Ref:** UM-3
**As a** empleado que planea, **I want** definir inflación, rentabilidad esperada y tasa de retiro en un solo lugar, con valores de referencia para Colombia, **So that** todas mis proyecciones usen los mismos supuestos razonables.

#### Acceptance Criteria

##### AC-1.1 — Valores neutros al actualizar

| Field        | Value                                                                                                                                                                                                                                                                                                                    |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Given**    | Un usuario con datos guardados antes de esta versión y tasa de proyección de ahorro en 6%                                                                                                                                                                                                                                |
| **When**     | Abre la app actualizada y entra a Ajustes → Supuestos                                                                                                                                                                                                                                                                    |
| **Then**     | Ve inflación 0%, rentabilidad esperada 6%, tasa de retiro 4% y plazo deseado de libertad financiera 20 años; fechas y aportes de todas las metas son idénticos a la versión anterior (todas con "este dinero se invierte" apagado); libertad financiera usa la rentabilidad de 6% y muestra un plazo más corto que antes |
| **Negative** | No se pierde ninguna meta, activo ni configuración existente; si la tasa de proyección previa era 0%, libertad financiera también es idéntica a la versión anterior                                                                                                                                                      |

##### AC-1.2 — Usar valores de referencia para Colombia

| Field        | Value                                                                                                                                                                        |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Given**    | Supuestos con cualquier valor                                                                                                                                                |
| **When**     | El usuario toca "Usar valores de referencia para Colombia"                                                                                                                   |
| **Then**     | Inflación pasa a 5%, rentabilidad esperada a 9% y tasa de retiro a 4%; se muestra el texto de fuente "DANE y Banco de la República, consultado oct 2026" junto a los valores |
| **Negative** | El plazo deseado de libertad financiera no cambia                                                                                                                            |

##### AC-1.3 — Rangos válidos

| Field        | Value                                                                                                                               |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Given**    | Ajustes → Supuestos abierto                                                                                                         |
| **When**     | El usuario escribe inflación fuera de 0–30%, rentabilidad fuera de 0–100%, tasa de retiro fuera de 1–10% o plazo fuera de 5–40 años |
| **Then**     | Aparece un mensaje de error bajo el campo indicando el rango permitido y el valor guardado sigue siendo el anterior                 |
| **Negative** | Ninguna proyección se recalcula con el valor inválido                                                                               |

##### AC-1.4 — Rentabilidad real y aviso de optimismo

| Field        | Value                                                                                                                                                                                                  |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Given**    | Inflación 5%                                                                                                                                                                                           |
| **When**     | El usuario fija rentabilidad esperada en 9%, y luego en 13%                                                                                                                                            |
| **Then**     | Con 9% se muestra "Rentabilidad real: 3,81%" sin aviso; con 13% se muestra "Rentabilidad real: 7,62%" con un aviso ámbar "Supuesto optimista: una rentabilidad real mayor a 7% es difícil de sostener" |
| **Negative** | El aviso no aparece cuando la rentabilidad real es ≤ 7%                                                                                                                                                |

##### AC-1.5 — Una sola tasa de rentabilidad

| Field     | Value                                                                                                                       |
| --------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Given** | Rentabilidad esperada en 9%                                                                                                 |
| **When**  | El usuario cambia la tasa desde el control de la proyección de ahorro del inicio a 7%                                       |
| **Then**  | Ajustes → Supuestos muestra rentabilidad esperada 7% y las proyecciones de metas y libertad financiera se recalculan con 7% |

##### AC-1.6 — Los supuestos persisten y viajan en el respaldo

| Field        | Value                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------- |
| **Given**    | Supuestos 5% / 9% / 4% / 20 años y una meta con "este dinero se invierte" encendido         |
| **When**     | El usuario recarga la app, o exporta un respaldo y lo importa en otro navegador             |
| **Then**     | Los cuatro supuestos y la opción de la meta conservan sus valores                           |
| **Negative** | Importar un respaldo de una versión anterior no falla: aplica los valores neutros de AC-1.1 |

### US-2: Libertad financiera con rentabilidad e inflación

**Ref:** UM-1
**As a** empleado que planea, **I want** ver en cuántos años puedo vivir de mis inversiones y cuánto debo ahorrar para lograrlo en mi plazo, **So that** sepa si mi ahorro actual alcanza.

Ejemplo base de esta historia: gasto mensual $4.000.000, activos líquidos $50.000.000, ahorro mensual factible $2.000.000.

##### AC-2.1 — Capital necesario según tasa de retiro

| Field     | Value                                                                                       |
| --------- | ------------------------------------------------------------------------------------------- |
| **Given** | El ejemplo base                                                                             |
| **When**  | La tasa de retiro es 4%, y luego 3,5%                                                       |
| **Then**  | Capital necesario mostrado en pesos de hoy: $1.200.000.000 con 4% y $1.371.428.571 con 3,5% |

##### AC-2.2 — Años para lograrlo con supuestos

| Field        | Value                                                                                           |
| ------------ | ----------------------------------------------------------------------------------------------- |
| **Given**    | El ejemplo base, retiro 4%                                                                      |
| **When**     | Los supuestos son rentabilidad 9% e inflación 5%                                                |
| **Then**     | El número protagonista es "35,8 años" (430 meses), en la tipografía más grande de la sección    |
| **Negative** | Con rentabilidad 0% e inflación 0% muestra "47,9 años" (575 meses), igual a la versión anterior |

##### AC-2.3 — Aporte mensual necesario para el plazo deseado

| Field        | Value                                                                                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Given**    | El ejemplo base, supuestos 9% / 5% / 4%                                                                                                                 |
| **When**     | El plazo deseado es 20 años, y luego el usuario lo cambia a 10 años en la misma pantalla                                                                |
| **Then**     | Muestra "Para lograrlo en 20 años ahorra $4.545.244/mes (hoy $2.000.000)"; con 10 años muestra $9.679.098/mes; el plazo elegido se conserva al recargar |
| **Negative** | Si el aporte actual ya alcanza para el plazo, muestra "Tu ahorro actual alcanza para lograrlo en N años" en verde en lugar del aporte                   |

##### AC-2.4 — Beneficio de invertir

| Field        | Value                                                                                                                                                                                                                      |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Given**    | El ejemplo base, supuestos 9% / 5% / 4%                                                                                                                                                                                    |
| **When**     | Se muestra la sección de libertad financiera                                                                                                                                                                               |
| **Then**     | Aparece la línea "Sin invertir no lo alcanzarías; invirtiendo lo logras en 35,8 años". Si ambos escenarios son alcanzables, la línea dice "Con rentabilidad llegas N años antes" con N = diferencia en años con un decimal |
| **Negative** | Con rentabilidad 0% no aparece la línea de beneficio; aparece la invitación "Agrega una rentabilidad esperada para ver un plazo más realista" con enlace a Supuestos                                                       |

##### AC-2.5 — Línea de contexto y aviso educativo

| Field     | Value                                                                                                                                                                                                          |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Given** | Supuestos 9% / 5% / 4%                                                                                                                                                                                         |
| **When**  | Se muestra la sección                                                                                                                                                                                          |
| **Then**  | Bajo el número protagonista aparece "Con rentabilidad 9% E.A., inflación 5% y retiro 4%. Montos en pesos de hoy." y al final de la sección el texto "Simulación educativa, no es una promesa de rentabilidad." |

##### AC-2.6 — No alcanzable

| Field        | Value                                                                                                                                  |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Given**    | Rentabilidad 0%, inflación 5%, ahorro mensual factible $2.000.000, capital necesario $1.200.000.000                                    |
| **When**     | Se muestra la sección                                                                                                                  |
| **Then**     | En lugar de años aparece en ámbar "No alcanzable con tus supuestos actuales" y el aporte necesario para el plazo deseado sigue visible |
| **Negative** | No aparece un número de años ni una fecha                                                                                              |

##### AC-2.7 — P0 en móvil

| Field     | Value                                                                             |
| --------- | --------------------------------------------------------------------------------- |
| **Given** | Pantalla de 390×844 y el ejemplo base                                             |
| **When**  | El usuario abre Libertad financiera                                               |
| **Then**  | Los años para lograrlo y el aporte mensual necesario son visibles sin desplazarse |

### US-3: Metas con inflación, rentabilidad y aporte requerido

**Ref:** UM-2
**As a** empleado que planea, **I want** ver para cada meta cuándo llego y cuánto debo ahorrar al mes para llegar a tiempo, **So that** ajuste mi aporte antes de atrasarme.

Ejemplo base de esta historia: meta $100.000.000 en pesos de hoy, ahorrado $20.000.000, aporte $1.500.000/mes, fecha objetivo a 60 meses, supuestos 9% / 5%.

##### AC-3.1 — Opción "este dinero se invierte"

| Field     | Value                                                                                                                                                                                                                   |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Given** | Metas existentes y una meta nueva en creación                                                                                                                                                                           |
| **When**  | El usuario abre el formulario de nueva meta, o mira la tarjeta de una meta existente                                                                                                                                    |
| **Then**  | En ambos ve el interruptor "Este dinero se invierte", apagado por defecto (en metas existentes tras actualizar y en el formulario nuevo), con el texto de ayuda "Usa tu rentabilidad esperada para proyectar esta meta" |

##### AC-3.2 — Monto ajustado por inflación

| Field        | Value                                                                                                       |
| ------------ | ----------------------------------------------------------------------------------------------------------- |
| **Given**    | El ejemplo base                                                                                             |
| **When**     | Se muestra la tarjeta de la meta                                                                            |
| **Then**     | Muestra el monto $100.000.000 como principal y el detalle "Equivale a $127.628.156 en {mes y año objetivo}" |
| **Negative** | Con inflación 0% el detalle no aparece                                                                      |

##### AC-3.3 — Fecha estimada con y sin inversión

| Field     | Value                                                                                                                                                        |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Given** | El ejemplo base                                                                                                                                              |
| **When**  | "Este dinero se invierte" está encendido, y luego apagado                                                                                                    |
| **Then**  | Encendido: fecha estimada a 53 meses. Apagado: fecha estimada a 79 meses (solo inflación). Con inflación 0% y apagado: 54 meses, igual a la versión anterior |

##### AC-3.4 — Aporte requerido para la fecha objetivo

| Field        | Value                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------ |
| **Given**    | El ejemplo base                                                                                                    |
| **When**     | "Este dinero se invierte" está encendido, y luego apagado                                                          |
| **Then**     | Encendido: "Aporte requerido: $1.296.025/mes". Apagado: $1.793.803/mes. Con inflación 0% y apagado: $1.333.333/mes |
| **Negative** | Si la meta no tiene fecha objetivo, no se muestra aporte requerido                                                 |

##### AC-3.5 — Estado en camino / atrasada

| Field     | Value                                                                                                                                                        |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Given** | El ejemplo base                                                                                                                                              |
| **When**  | "Este dinero se invierte" está encendido (53 meses ≤ 60), y luego apagado (79 > 60)                                                                          |
| **Then**  | Encendido: badge verde "En camino" y "Llegas 7 meses antes". Apagado: badge ámbar "Atrasada" y "Para llegar a tiempo ahorra $1.793.803/mes (hoy $1.500.000)" |

##### AC-3.6 — Beneficio de invertir la meta

| Field        | Value                                                                                  |
| ------------ | -------------------------------------------------------------------------------------- |
| **Given**    | El ejemplo base con "este dinero se invierte" encendido y rentabilidad > 0%            |
| **When**     | Se muestra la tarjeta                                                                  |
| **Then**     | Aparece la línea "Invirtiendo llegas 26 meses antes y necesitas $497.778 menos al mes" |
| **Negative** | Con el interruptor apagado o rentabilidad 0% la línea no aparece                       |

##### AC-3.7 — P0 por tarjeta en móvil

| Field     | Value                                                                                                                                                       |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Given** | Pantalla de 390×844 y una meta con fecha objetivo                                                                                                           |
| **When**  | El usuario abre Metas                                                                                                                                       |
| **Then**  | En la primera tarjeta, la fecha estimada y el aporte requerido son visibles sin desplazarse; el monto de la meta usa la tipografía más grande de la tarjeta |

## Edge Cases

- **EC-1:** Meta ya lograda (ahorrado ≥ monto de la meta) → badge verde "Lograda", sin aporte requerido ni fecha estimada.
- **EC-2:** Meta sin aporte mensual → "Define un aporte mensual para estimar la fecha" en ámbar; el aporte requerido sí se muestra si hay fecha objetivo.
- **EC-3:** Fecha objetivo en el pasado o en el mes actual → aporte requerido = faltante ajustado completo; badge "Vencida" como hoy.
- **EC-4:** Gasto mensual de vida 0 → libertad financiera muestra el estado vacío actual, sin años ni aporte.
- **EC-5:** Plazo > 100 años en cualquier proyección → se trata como "No alcanzable".
- **EC-6:** Rentabilidad menor que inflación (rentabilidad real negativa) → se calcula normalmente; la rentabilidad real se muestra negativa en rojo en Supuestos.
- **EC-7:** Idioma inglés → todos los textos nuevos existen en inglés con el mismo significado.

## Success Metrics

- 100% de los ejemplos numéricos de este spec reproducidos por pruebas automatizadas con error ≤ $1 y ≤ 0 meses.
- Con supuestos neutros, 0 diferencias en meses y aportes frente a la versión anterior para el conjunto de metas de prueba.
- Cobertura de líneas de las nuevas reglas de cálculo ≥ el umbral del proyecto.
- Sin regresión en las pruebas existentes de metas, libertad financiera y proyección de ahorro.

## Out of Scope

- Costo de esperar, desglose del crecimiento, portafolio por perfiles, CDT neto de retención.
- Descarga en línea de inflación o tasas.
- Escenarios múltiples por meta y tasas distintas por meta.
- Aportes que crecen con la inflación o el salario.
- Impuestos sobre rendimientos.

## Open Questions

_Ninguna abierta._

## Clarifications

- OQ-1 → Opción por meta "este dinero se invierte"; apagada en metas existentes.
- OQ-2 → El monto de la meta está en pesos de hoy y se ajusta por inflación hasta la fecha.
- OQ-3 → Defaults neutros (inflación 0%, rentabilidad = tasa de proyección actual, retiro 4%) + atajo de valores de referencia.
- OQ-4 → La rentabilidad esperada es la misma tasa de la proyección de ahorro. Consecuencia aceptada: quien ya tenía una tasa de proyección > 0% ve un plazo de libertad financiera más corto al actualizar (AC-1.1).
- OQ-5 → Aporte mensual fijo en pesos nominales.
- OQ-6 → Plazo deseado de libertad financiera editable (5–40 años), 20 años por defecto, persistido.
- OQ-7 → En metas nuevas "este dinero se invierte" viene apagado.
- Valores de referencia confirmados: inflación 5%, rentabilidad 9% E.A., retiro 4% (discovery §9).

## Sign-off

- [x] Author — Claude (borrador) — 2026-10-02
- [x] Johann Medina — 2026-10-02
