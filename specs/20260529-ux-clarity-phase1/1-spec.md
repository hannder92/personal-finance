# Spec: UX claridad — fase 1

> Spec version: **v1** · Mode: `solo`
> Slug: `20260529-ux-clarity-phase1` · Created: `2026-05-29`

## Problem

Los usuarios de la app de finanzas personales enfrentan demasiadas opciones de navegación al mismo nivel (diez secciones visibles en escritorio; en móvil solo cinco accesibles desde la barra inferior, dejando metas, gastos variables, patrimonio, distribución e historial sin acceso directo). En la pantalla de inicio, todas las métricas comparten el mismo peso visual, por lo que no pueden responder en pocos segundos cuánto dinero tienen realmente disponible este mes ni si su situación financiera es saludable. Parte del texto del inicio está fijo en un solo idioma y los gráficos muestran datos sin una frase que ayude a interpretarlos.

## Goals / Non-Goals

- **Goal 1:** El usuario identifica en la pantalla de inicio, sin desplazarse en un teléfono estándar, cuánto tiene disponible para usar este mes y cómo está su puntaje de salud financiera.
- **Goal 2:** La navegación principal agrupa las secciones por intención (resumen, dinero del mes, planificación, más opciones) en lugar de una lista plana de diez ítems.
- **Goal 3:** En móvil, el usuario accede a todas las secciones existentes de la app en como máximo dos interacciones desde la barra inferior.
- **Goal 4:** La pantalla de inicio respeta el idioma seleccionado en toda su interfaz visible.
- **Goal 5:** Los gráficos principales del inicio incluyen una línea de contexto que explica el dato mostrado en lenguaje cotidiano.
- **Non-Goal:** Rediseñar el sistema de colores, tipografías o tokens visuales globales (fase visual posterior).
- **Non-Goal:** Añadir animaciones, transiciones elaboradas o respeto de preferencias de movimiento reducido (fase motion posterior).
- **Non-Goal:** Cambiar fórmulas de cálculo financiero (ingreso neto, DTI, salud, proyecciones).
- **Non-Goal:** Añadir nuevas secciones, conexión bancaria o alertas proactivas automáticas.
- **Non-Goal:** Personalización de widgets o layouts guardados por el usuario.

## Personas

- **Empleado colombiano:** Revisa el disponible mensual después de deducciones para decidir si puede ahorrar o pagar deudas; usa el teléfono con una mano.
- **Usuario activo de finanzas:** Alterna entre ingresos, deudas, metas y patrimonio varias veces por semana; necesita encontrar cada sección sin perderse.

## User Stories

### US-1: Respuesta rápida en la pantalla de inicio

**As a** empleado colombiano, **I want** ver de inmediato cuánto me queda disponible este mes y mi puntaje de salud, **so that** sepa si puedo asignar dinero sin revisar cada sección por separado.

#### Acceptance Criteria

##### AC-1.1 — Métrica principal visible sin desplazamiento en móvil

| Field        | Value                                                                                                                                 |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Given**    | El usuario tiene ingreso neto y gastos configurados de forma que el disponible mensual es un valor numérico conocido                  |
| **When**     | Abre la pantalla de inicio en un viewport de 390×844 píxeles                                                                          |
| **Then**     | El monto disponible para el mes aparece en la zona visible superior (sin desplazar verticalmente) formateado en la moneda configurada |
| **Negative** | Ninguna otra métrica numérica del inicio usa un tamaño de texto mayor que el del disponible en esa misma vista                        |

##### AC-1.2 — Puntaje de salud secundario al disponible

| Field        | Value                                                                                                                                                                                        |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Given**    | El usuario tiene datos suficientes para calcular un puntaje de salud financiera                                                                                                              |
| **When**     | Abre la pantalla de inicio                                                                                                                                                                   |
| **Then**     | El puntaje de salud y su etiqueta cualitativa aparecen en la misma zona superior que el disponible, con jerarquía visual claramente inferior al disponible (menor tamaño o peso tipográfico) |
| **Negative** | El desglose detallado del puntaje no ocupa la posición más prominente de la pantalla por encima del disponible                                                                               |

##### AC-1.3 — Disponible sin ingreso configurado

| Field        | Value                                                                                                                                                                                  |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Given**    | El usuario no ha registrado ingreso bruto (ingreso neto efectivo es cero)                                                                                                              |
| **When**     | Abre la pantalla de inicio                                                                                                                                                             |
| **Then**     | La zona del disponible muestra un mensaje orientador invitando a configurar ingresos (no un monto ambiguo sin etiqueta) y un enlace o botón visible que lleva a la sección de ingresos |
| **Negative** | No se muestra un monto positivo ficticio como si fuera disponible real                                                                                                                 |

##### AC-1.4 — Comparación temporal del puntaje visible

| Field        | Value                                                                                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Given**    | Existe al menos un registro histórico de puntaje de salud del mes anterior                                                                              |
| **When**     | El usuario ve el puntaje de salud en la pantalla de inicio                                                                                              |
| **Then**     | Aparece una indicación visible de cambio respecto al mes anterior (por ejemplo diferencia numérica o etiqueta “subió/bajó/sin cambio”) junto al puntaje |
| **Negative** | —                                                                                                                                                       |

##### AC-1.5 — Acceso rápido a asignar presupuesto

| Field        | Value                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------ |
| **Given**    | El usuario está en la pantalla de inicio con disponible mayor que cero                                             |
| **When**     | Busca la acción para repartir su dinero según necesidades, deseos y ahorros                                        |
| **Then**     | Hay un control visible (enlace o botón) en la zona superior que lleva a la sección de distribución del presupuesto |
| **Negative** | —                                                                                                                  |

### US-2: Métricas secundarias ordenadas

**As a** usuario activo de finanzas, **I want** que las demás cifras del inicio no compitan con el disponible, **so that** pueda profundizar solo si lo necesito.

#### Acceptance Criteria

##### AC-2.1 — Bloque de métricas secundarias bajo el resumen principal

| Field        | Value                                                                                                                                                                                         |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Given**    | El usuario abre la pantalla de inicio                                                                                                                                                         |
| **When**     | Observa la estructura vertical de la página                                                                                                                                                   |
| **Then**     | Ingreso neto, gastos fijos, pagos de deuda, DTI y disponible (si se repite como tarjeta secundaria) aparecen agrupados en un bloque situado debajo del resumen principal (disponible + salud) |
| **Negative** | Esas métricas no aparecen todas con el mismo tamaño tipográfico que el disponible principal                                                                                                   |

##### AC-2.2 — Desplazamiento horizontal de métricas en móvil

| Field        | Value                                                                                                                                                  |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Given**    | Viewport de ancho máximo 767 píxeles                                                                                                                   |
| **When**     | El usuario ve el bloque de métricas secundarias                                                                                                        |
| **Then**     | Las tarjetas de métricas se presentan en una fila desplazable horizontalmente (o equivalente que evite una cuadrícula apretada de más de dos columnas) |
| **Negative** | En ese viewport no se exige desplazamiento vertical solo para leer las cinco métricas secundarias antes de llegar a los gráficos                       |

### US-3: Navegación agrupada en escritorio

**As a** usuario activo de finanzas, **I want** que las secciones estén agrupadas por propósito en pantallas anchas, **so that** no tenga que escanear diez ítems iguales en la barra superior.

#### Acceptance Criteria

##### AC-3.1 — Cuatro grupos de navegación en escritorio

| Field        | Value                                                                                                                                                                                                                                                     |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Given**    | Viewport de ancho mínimo 768 píxeles                                                                                                                                                                                                                      |
| **When**     | El usuario ve la navegación principal superior                                                                                                                                                                                                            |
| **Then**     | Las secciones se organizan en exactamente cuatro grupos con etiquetas distinguibles: (1) Inicio, (2) Dinero del mes — ingresos, gastos fijos, gastos variables y distribución, (3) Plan — deudas y metas, (4) Más — patrimonio, historial y configuración |
| **Negative** | No aparece una fila plana de diez enlaces del mismo nivel sin agrupación                                                                                                                                                                                  |

##### AC-3.2 — Acceso a cada sección desde escritorio

| Field        | Value                                                                  |
| ------------ | ---------------------------------------------------------------------- |
| **Given**    | Viewport de escritorio                                                 |
| **When**     | El usuario abre cada grupo y selecciona cada destino listado en AC-3.1 |
| **Then**     | Llega a la pantalla correspondiente sin errores de navegación          |
| **Negative** | —                                                                      |

##### AC-3.3 — Indicación de sección activa en escritorio

| Field        | Value                                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------------------------- |
| **Given**    | El usuario está en cualquier sección secundaria (por ejemplo deudas)                                          |
| **When**     | Mira la navegación superior                                                                                   |
| **Then**     | El grupo que contiene esa sección y/o el ítem concreto aparecen resaltados de forma visible respecto al resto |
| **Negative** | —                                                                                                             |

##### AC-3.4 — Inicio como enlace directo en escritorio

| Field        | Value                                                                         |
| ------------ | ----------------------------------------------------------------------------- |
| **Given**    | Viewport de ancho mínimo 768 píxeles                                          |
| **When**     | El usuario activa el control **Inicio** en la navegación superior             |
| **Then**     | Navega a la pantalla de inicio sin que se abra un menú desplegable intermedio |
| **Negative** | —                                                                             |

##### AC-3.5 — Menús desplegables al clic para Dinero, Plan y Más

| Field        | Value                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------ |
| **Given**    | Viewport de escritorio                                                                           |
| **When**     | El usuario activa con clic el control de **Dinero del mes**, **Plan** o **Más**                  |
| **Then**     | Aparece un menú desplegable visible con todos los enlaces hijos de ese grupo definidos en AC-3.1 |
| **Negative** | El menú no se abre solo al pasar el cursor sin clic (hover-only)                                 |

##### AC-3.6 — Cierre del menú desplegable en escritorio

| Field        | Value                                                        |
| ------------ | ------------------------------------------------------------ |
| **Given**    | Un menú desplegable de escritorio está abierto               |
| **When**     | El usuario selecciona un enlace hijo o activa fuera del menú |
| **Then**     | El menú desplegable se cierra                                |
| **Negative** | —                                                            |

##### AC-3.7 — Texto legible en menús de navegación con tema oscuro

| Field        | Value                                                                                                                                                                 |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Given**    | El usuario tiene activado el tema oscuro de la aplicación                                                                                                             |
| **When**     | Abre un menú de destinos de la navegación principal (menú desplegable de **Dinero del mes**, **Plan** o **Más** en escritorio, o panel inferior equivalente en móvil) |
| **Then**     | Cada etiqueta de destino del menú (y el control para cerrar el panel en móvil, si existe) se lee con contraste claro respecto al fondo del menú                       |
| **Negative** | Ninguna etiqueta del menú usa un color de texto tan oscuro que se confunda con el fondo del menú en tema oscuro                                                       |

### US-4: Navegación móvil con iconos y acceso completo

**As a** empleado colombiano, **I want** una barra inferior clara con iconos y acceso a todas las secciones, **so that** use la app con el pulgar sin perder funciones.

#### Acceptance Criteria

##### AC-4.1 — Cuatro pestañas con icono en la barra inferior

| Field        | Value                                                                                                               |
| ------------ | ------------------------------------------------------------------------------------------------------------------- |
| **Given**    | Viewport móvil (ancho máximo 767 píxeles)                                                                           |
| **When**     | El usuario ve la barra de navegación inferior fija                                                                  |
| **Then**     | Hay exactamente cuatro pestañas, cada una con un icono reconocible y una etiqueta corta: Inicio, Dinero, Plan y Más |
| **Negative** | Ninguna pestaña inferior muestra solo texto sin icono                                                               |

##### AC-4.2 — Pestaña Dinero agrupa cuatro destinos

| Field        | Value                                                                         |
| ------------ | ----------------------------------------------------------------------------- |
| **Given**    | Viewport móvil                                                                |
| **When**     | El usuario activa la pestaña o acción “Dinero”                                |
| **Then**     | Puede elegir y abrir: ingresos, gastos fijos, gastos variables y distribución |
| **Negative** | —                                                                             |

##### AC-4.3 — Pestaña Plan agrupa deudas y metas

| Field        | Value                                        |
| ------------ | -------------------------------------------- |
| **Given**    | Viewport móvil                               |
| **When**     | El usuario activa la pestaña o acción “Plan” |
| **Then**     | Puede elegir y abrir: deudas y metas         |
| **Negative** | —                                            |

##### AC-4.4 — Pestaña Más agrupa patrimonio, historial y configuración

| Field        | Value                                                       |
| ------------ | ----------------------------------------------------------- |
| **Given**    | Viewport móvil                                              |
| **When**     | El usuario activa la pestaña o acción “Más”                 |
| **Then**     | Puede elegir y abrir: patrimonio, historial y configuración |
| **Negative** | —                                                           |

##### AC-4.5 — Contenido no oculto tras la barra inferior

| Field        | Value                                                                                                                                                      |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Given**    | Viewport móvil en cualquier sección                                                                                                                        |
| **When**     | El usuario desplaza hasta el final del contenido                                                                                                           |
| **Then**     | El último elemento interactivo o de texto queda completamente visible por encima de la barra inferior (existe espacio de reserva inferior en el contenido) |
| **Negative** | —                                                                                                                                                          |

##### AC-4.6 — Inicio sin panel en móvil

| Field        | Value                                                                 |
| ------------ | --------------------------------------------------------------------- |
| **Given**    | Viewport móvil                                                        |
| **When**     | El usuario activa la pestaña **Inicio** en la barra inferior          |
| **Then**     | Navega a la pantalla de inicio sin abrir un panel inferior deslizable |
| **Negative** | —                                                                     |

##### AC-4.7 — Panel inferior al activar Dinero, Plan o Más

| Field        | Value                                                                                                                                                          |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Given**    | Viewport móvil                                                                                                                                                 |
| **When**     | El usuario activa la pestaña **Dinero**, **Plan** o **Más**                                                                                                    |
| **Then**     | Aparece un panel inferior deslizable visible desde la parte baja de la pantalla con la lista completa de destinos de ese grupo (según AC-4.2, AC-4.3 o AC-4.4) |
| **Negative** | No se usa una pantalla de lista que reemplace toda la vista principal ni un diálogo centrado                                                                   |

##### AC-4.8 — Cierre del panel inferior en móvil

| Field        | Value                                                                                     |
| ------------ | ----------------------------------------------------------------------------------------- |
| **Given**    | Un panel inferior deslizable está abierto en móvil                                        |
| **When**     | El usuario selecciona un destino de la lista o desliza el panel hacia abajo para cerrarlo |
| **Then**     | El panel se cierra; si seleccionó un destino, navega a esa sección                        |
| **Negative** | —                                                                                         |

### US-5: Pantalla de inicio bilingüe

**As a** usuario bilingüe, **I want** que la pantalla de inicio cambie de idioma con el resto de la app, **so that** no vea textos mezclados.

#### Acceptance Criteria

##### AC-5.1 — Cambio de idioma en el inicio

| Field        | Value                                                                                                                                                                          |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Given**    | El usuario está en la pantalla de inicio con idioma español seleccionado                                                                                                       |
| **When**     | Cambia el idioma a inglés desde el control global de idioma                                                                                                                    |
| **Then**     | Todos los textos visibles del inicio (título, etiquetas de métricas, mensajes de gráficos, botones y mensaje sin ingreso) aparecen en inglés sin permanecer cadenas en español |
| **Negative** | —                                                                                                                                                                              |

##### AC-5.2 — Paridad de claves de traducción del inicio

| Field        | Value                                                                                                       |
| ------------ | ----------------------------------------------------------------------------------------------------------- |
| **Given**    | Cualquier clave de traducción usada en la pantalla de inicio bajo el prefijo acordado para dashboard/inicio |
| **When**     | Se revisan los archivos de idioma español e inglés                                                          |
| **Then**     | Cada clave existe en ambos idiomas con valor no vacío                                                       |
| **Negative** | —                                                                                                           |

### US-6: Contexto en los gráficos del inicio

**As a** usuario activo de finanzas, **I want** una frase que explique cada gráfico principal, **so that** entienda qué significa sin ser experto en finanzas.

#### Acceptance Criteria

##### AC-6.1 — Contexto en la distribución 50/30/20

| Field        | Value                                                                                                                                                                             |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Given**    | El usuario tiene porcentajes de necesidades, deseos y ahorros configurados                                                                                                        |
| **When**     | Ve el gráfico circular de distribución en la pantalla de inicio                                                                                                                   |
| **Then**     | Debajo o junto al gráfico aparece una frase en el idioma activo que indica el monto en moneda local asignado a ahorros (o la categoría principal de ahorro) además del porcentaje |
| **Negative** | La frase no contradice los porcentajes mostrados en el gráfico                                                                                                                    |

##### AC-6.2 — Contexto en la proyección de flujo

| Field        | Value                                                                                                                                                            |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Given**    | El usuario tiene un disponible mensual calculado distinto de cero                                                                                                |
| **When**     | Ve el gráfico de proyección a doce meses en la pantalla de inicio                                                                                                |
| **Then**     | Aparece una frase en el idioma activo que resume la tendencia (por ejemplo acumulado al mes doce o ritmo mensual) usando valores derivados de sus datos actuales |
| **Negative** | —                                                                                                                                                                |

##### AC-6.3 — Sin frases engañosas sin datos

| Field        | Value                                                                                                                            |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| **Given**    | Faltan datos para calcular un gráfico (por ejemplo distribución en cero o sin ingreso)                                           |
| **When**     | El usuario ve ese bloque en el inicio                                                                                            |
| **Then**     | Se muestra un mensaje de estado vacío o invitación a configurar datos en lugar de una frase interpretativa con cifras inventadas |
| **Negative** | —                                                                                                                                |

## Edge Cases

- **EC-1:** Montos muy largos en pesos colombianos → el disponible principal se trunca o reduce tamaño tipográfico sin desbordar horizontalmente el viewport móvil.
- **EC-2:** Usuario solo en escritorio (sin barra inferior) → cumple AC de grupos de escritorio; la barra inferior no se muestra.
- **EC-3:** Usuario cambia de idioma estando en otra sección y vuelve al inicio → AC-5.1 sigue cumpliéndose al entrar de nuevo.
- **EC-4:** Puntaje de salud sin datos parciales → el resumen superior muestra el puntaje calculado con componentes disponibles; el desglose indica “sin datos” donde corresponda sin ocultar el disponible.

## Success Metrics

- En prueba moderada con al menos tres usuarios internos, el 100 % identifica el monto disponible en menos de 5 segundos en viewport móvil 390×844 sin ayuda verbal.
- El 100 % de las secciones preexistentes de la app son alcanzables desde móvil en ≤ 2 toques desde la barra inferior (verificado con checklist de rutas).
- Cero cadenas de texto del inicio en español fijo cuando el idioma activo es inglés (inspección manual o prueba automatizada de claves).

## Out of Scope

- Rediseño de tokens, sombras, bordes redondeados globales y tipografía de marca.
- Animaciones de entrada, contadores animados y `prefers-reduced-motion`.
- Gráficos Sankey, alertas proactivas, presets de layout del inicio.
- Modificar reglas de negocio de cálculos financieros o persistencia.
- Eliminar rutas existentes o fusionar pantallas en una sola vista.

## Open Questions

- [x] **OQ-1:** En escritorio, ¿los cuatro grupos se presentan como menús desplegables al pasar el cursor o como secciones con títulos y enlaces siempre visibles?
- [x] **OQ-2:** En móvil, ¿la pestaña “Dinero” y “Plan” abren un panel inferior deslizable, un menú superpuesto centrado, o una pantalla intermedia de lista?

## Clarifications

- **OQ-1 →** En escritorio (≥768px), patrón **híbrido**: **Inicio** es un enlace directo sin menú desplegable; **Dinero del mes**, **Plan** y **Más** son controles que, al activarse con clic, muestran un menú desplegable con sus enlaces hijos (los listados en AC-3.1). El menú se cierra al elegir un destino o al activar fuera del menú.
- **OQ-2 →** En móvil (≤767px), las pestañas **Dinero**, **Plan** y **Más** abren un **panel inferior deslizable** (bottom sheet) que sube desde la barra inferior con la lista de destinos del grupo. La pestaña **Inicio** navega directamente sin abrir panel. El panel se cierra al elegir un destino o al deslizarlo hacia abajo.

## Sign-off

- [x] Author: `Johann Medina` — `2026-05-29`
