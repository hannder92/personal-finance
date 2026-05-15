# Spec: Personal Finance Dashboard — Edición Profesional

> Spec version: **v1** · Mode: `solo`
> Slug: `20260514-project-refactor` · Created: `2026-05-14`

---

## Problema

El dashboard de finanzas personales actual funciona, pero tiene tres brechas críticas de experiencia: (1) un usuario nuevo enfrenta formularios vacíos sin ninguna guía de qué completar primero ni por qué, (2) no hay manera de saber si la situación financiera mejoró o empeoró respecto al mes anterior, y (3) para conocer el estado de salud financiera hay que navegar a una sección separada en lugar de verlo inmediatamente al abrir la app. Adicionalmente, varias secciones tienen fricción evitable (sliders de asignación que deben sumar exactamente 100%, campo de notas en gastos que nadie usa, metas compartidas con múltiples participantes y sub-formularios por persona).

---

## Objetivos y No-Objetivos

**Objetivos:**

- Un usuario nuevo puede completar la configuración inicial y ver un dashboard con datos reales en menos de 5 minutos
- Cualquier usuario puede leer su estado de salud financiera en menos de 10 segundos desde el dashboard, sin navegar a otra sección
- Un usuario puede registrar un gasto variable desde cualquier parte de la app en menos de 5 taps/clics
- La app muestra si las finanzas mejoraron o empeoraron comparado con el mes anterior

**No-Objetivos:**

- Sincronización con cuentas bancarias o conexión a servicios externos
- Gestión de finanzas multi-usuario o cuentas compartidas
- Seguimiento de portafolio de inversiones más allá del registro manual de activos
- Generación de documentos tributarios oficiales o declaración de renta

---

## Personas

- **Juan** (28 años, Bogotá, empleado con contrato, moneda COP) — Quiere entender su ingreso neto real después de deducciones de nómina colombiana y saber cuándo terminará de pagar sus deudas. El dato que más necesita: cuánto dinero libre tiene cada mes después de todo.
- **Ana** (32 años, consultora independiente, COP/USD) — Tiene ingresos variables e irregulares (honorarios, proyectos, prima), necesita controlar sus gastos variables por categoría mes a mes y saber si sus metas de ahorro son alcanzables.
- **Marco** (30 años, cualquier país latinoamericano) — Rastreador de finanzas personales general, quiere un número único que le diga si está bien o mal financieramente, sin tener que interpretar cuatro métricas distintas.

---

## Historias de Usuario

---

### US-1: Primera configuración guiada

**Como** Marco (usuario nuevo), **quiero** recibir orientación sobre qué información ingresar primero al abrir la app por primera vez, **para** tener un dashboard útil en minutos sin adivinar por dónde empezar.

#### Criterios de Aceptación

- **AC-1.1** Dado que es la primera vez que abro la app (sin datos guardados), cuando carga el dashboard, entonces veo una pantalla de bienvenida con un paso a paso que me indica: 1) ingresar salario, 2) agregar gastos fijos, 3) registrar deudas.
- **AC-1.2** Dado que estoy en el onboarding, cuando completo cada paso y paso al siguiente, entonces la barra de progreso del onboarding avanza y muestra cuántos pasos quedan.
- **AC-1.3** Dado que ya tengo datos guardados, cuando abro la app, entonces el onboarding no aparece y voy directo al dashboard.
- **AC-1.4** Dado que estoy en el onboarding y quiero saltármelo, cuando presiono "Saltar configuración", entonces el onboarding desaparece y puedo usar la app libremente.
- **AC-1.5** Dado que terminé el onboarding (3 pasos), cuando completo el último paso, entonces veo el dashboard con mis datos y un mensaje de confirmación de que la configuración está lista.
- **AC-1.6** Dado que ya tengo datos pero quiero revisar el onboarding nuevamente, cuando accedo a configuración y presiono "Relanzar guía de configuración", entonces el onboarding se abre mostrando los pasos con los datos actuales precargados, sin borrar nada.

---

### US-2: Registro de salario y cálculo de neto

**Como** Juan, **quiero** ingresar mi salario bruto y ver mi ingreso neto calculado automáticamente después de todas mis deducciones, **para** saber exactamente cuánto dinero real dispongo cada mes.

#### Criterios de Aceptación

- **AC-2.1** Dado que ingresé mi salario bruto, cuando agrego una deducción porcentual (ej. 4% pensión), entonces el campo muestra el monto equivalente en pesos calculado sobre el bruto en tiempo real.
- **AC-2.2** Dado que mi moneda es COP, cuando presiono "Cargar deducciones Colombia", entonces se agregan Salud (4%) y Pensión (4%) como deducciones porcentuales sin duplicar las que ya existen.
- **AC-2.3** Dado que tengo salario bruto y deducciones, cuando presiono "Calcular retención en la fuente", entonces se agrega o actualiza la retención estimada aplicando la tabla Art. 383 ET con UVT 2025, y veo una etiqueta que indica que es un estimado.
- **AC-2.4** Dado que ingreso un beneficio extrasalarial (ej. bono de conectividad), cuando lo agrego, entonces su monto se suma al neto final pero no altera la base para calcular las deducciones porcentuales ni la retención.
- **AC-2.5** Dado que cambio el salario bruto, cuando modifico el campo, entonces el neto, todas las deducciones porcentuales y la retención en la fuente se recalculan automáticamente.

---

### US-3: Ingresos con distinta frecuencia

**Como** Ana, **quiero** registrar ingresos que no son mensuales (honorarios trimestrales, prima semestral, bono anual) con su frecuencia real, **para** que la proyección de 12 meses los incluya en los meses correctos.

#### Criterios de Aceptación

- **AC-3.1** Dado que agrego un ingreso adicional, cuando selecciono su frecuencia (mensual, trimestral, semestral, anual), entonces el dashboard muestra su equivalente mensual promedio junto al monto original.
- **AC-3.2** Dado que tengo un ingreso semestral registrado, cuando veo la proyección de 12 meses, entonces ese ingreso aparece únicamente en los meses 6 y 12 de la proyección, no distribuido en los 12.
- **AC-3.3** Dado que mi moneda es COP y tengo salario registrado, cuando presiono "Cargar prima de servicios", entonces se agrega un ingreso semestral equivalente a medio salario bruto, sin duplicar si ya existe.

---

### US-4: Gastos fijos y categorización esencial

**Como** Marco, **quiero** registrar mis gastos fijos mensuales (arriendo, servicios, suscripciones, transporte) con nombre, monto y categoría, **para** saber cuánto de mi ingreso se va en compromisos fijos.

#### Criterios de Aceptación

- **AC-4.1** Dado que agrego un gasto fijo, cuando completo nombre, monto y categoría, entonces aparece en la lista y el total de gastos fijos se actualiza inmediatamente.
- **AC-4.2** Dado que tengo gastos fijos registrados, cuando veo la sección, entonces veo el total de gastos fijos y el restante disponible después de aplicarlos al ingreso neto.
- **AC-4.3** Dado que marco un gasto como categoría "Vivienda", cuando veo el indicador de salud financiera, entonces ese monto se usa para calcular el ratio de costo de vivienda.
- **AC-4.4** Dado que elimino un gasto fijo, cuando presiono el botón de eliminar y confirmo, entonces desaparece de la lista y los totales se recalculan.

> **Decisión UX/CX:** el campo "notas" por gasto se elimina. No aporta valor funcional medible y aumenta la densidad del formulario. Si se necesita contexto, el nombre del gasto es suficiente.

---

### US-5: Gestión de deudas y simulador de pago

**Como** Juan, **quiero** registrar mis tarjetas y préstamos con sus tasas, saldos y pagos mínimos, y ver cuándo terminaré de pagarlos, **para** tener claridad sobre mi carga de deuda y motivarme a pagarlas más rápido.

#### Criterios de Aceptación

- **AC-5.1** Dado que registro una tarjeta con saldo, tasa EA, pago mínimo y fecha de corte, cuando veo la tarjeta, entonces muestra la línea de tiempo de pago estimada ("X meses") y la barra de utilización del cupo.
- **AC-5.2** Dado que registro un préstamo (no una tarjeta), cuando indico su tipo como "préstamo", entonces el formulario muestra campo de plazo en cuotas en lugar de fecha de corte, y la línea de tiempo muestra "cuotas restantes".
- **AC-5.3** Dado que ingreso un monto extra en el simulador de una tarjeta, cuando escribo el valor, entonces veo inmediatamente cuántos meses me ahorraría y cuánto interés ahorraría pagando ese extra cada mes.
- **AC-5.4** Dado que selecciono el método de pago "Avalancha", cuando veo el resumen de deudas, entonces las tarjetas aparecen ordenadas de mayor a menor tasa EA, con indicación visual de cuál atacar primero.
- **AC-5.5** Dado que selecciono el método "Bola de nieve", cuando veo el resumen, entonces las tarjetas se ordenan de menor a mayor saldo.
- **AC-5.6** Dado que tengo deudas registradas, cuando veo el resumen de deudas, entonces veo: obligación mensual total, saldo total, utilización global, DTI en un medidor visual, y la fecha estimada en que estaré libre de deudas si mantengo los pagos actuales.
- **AC-5.7** Dado que una tarjeta tiene fecha de corte en los próximos 7 días, cuando abro la app, entonces aparece una alerta de pago próximo en el dashboard con el monto mínimo.

---

### US-6: Cuotas activas en tarjetas

**Como** Juan, **quiero** registrar las compras en cuotas de mis tarjetas de crédito, **para** ver cuánto de mi pago mensual corresponde a cuotas activas y no solo al saldo general.

#### Criterios de Aceptación

- **AC-6.1** Dado que tengo una tarjeta registrada, cuando agrego una cuota activa con nombre, total y número de cuotas, entonces el sistema calcula automáticamente el monto mensual de esa cuota.
- **AC-6.2** Dado que tengo cuotas activas en una tarjeta, cuando veo la tarjeta, entonces la obligación mensual mostrada incluye el pago mínimo más la suma de todas las cuotas mensuales activas.
- **AC-6.3** Dado que una cuota tiene cuotas pagadas registradas, cuando veo la tarjeta, entonces el progreso de esa cuota es visible (pagadas / total).

---

### US-7: Metas de ahorro

**Como** Ana, **quiero** definir metas de ahorro con un monto objetivo, un aporte mensual y una fecha límite opcional, **para** saber si mi ritmo de ahorro es suficiente para lograrlas y en qué fecha las alcanzaré.

#### Criterios de Aceptación

- **AC-7.1** Dado que creo una meta con nombre, monto objetivo, monto ya ahorrado y aporte mensual, cuando veo la meta, entonces muestra: porcentaje de progreso con barra visual, monto ya ahorrado vs. objetivo, y la fecha estimada de llegada.
- **AC-7.2** Dado que establezco una fecha límite en una meta, cuando veo la meta, entonces el aporte mensual necesario se recalcula para llegar a la fecha indicada.
- **AC-7.3** Dado que el total de aportes mensuales de todas mis metas supera mi presupuesto de ahorro, cuando veo el resumen de metas, entonces aparece una advertencia que indica el monto de exceso.
- **AC-7.4** Dado que el monto ya ahorrado alcanza el objetivo, cuando veo la meta, entonces aparece como completada con indicador visual celebratorio.
- **AC-7.5** Dado que tengo varias metas, cuando las veo en la lista, entonces puedo reordenarlas para indicar prioridad.

> **Decisión UX/CX:** las metas compartidas con múltiples participantes se eliminan del alcance v1. La complejidad (formularios por participante, ingresos variables, porcentajes de contribución) supera el valor para un uso personal. Puede ser considerado como feature independiente en el futuro.

---

### US-8: Seguimiento de gastos variables del mes

**Como** Ana, **quiero** registrar cuánto he gastado en cada categoría variable (restaurantes, ropa, entretenimiento) frente a un presupuesto mensual, **para** saber si estoy dentro de mis límites antes de que se acabe el mes.

#### Criterios de Aceptación

- **AC-8.1** Dado que creo una categoría de gasto variable con nombre, icono y presupuesto mensual, cuando ingreso un monto gastado, entonces veo la barra de progreso visual que cambia de verde a ámbar al pasar el 80% y a rojo al superar el 100%.
- **AC-8.2** Dado que una categoría supera su presupuesto, cuando abro el dashboard, entonces aparece una alerta con el nombre de la categoría, el monto gastado y el monto excedido.
- **AC-8.3** Dado que estoy en el dashboard o en la sección de gastos variables, cuando presiono el botón flotante de registro rápido, entonces aparece un panel que me permite seleccionar categoría e ingresar el monto gastado sin navegar a la sección completa. En las demás secciones el botón flotante no aparece.
- **AC-8.4** Dado que el mes cambia (primer día del mes), cuando abro la app, entonces el sistema me pregunta si quiero reiniciar los montos gastados de todas las categorías para el nuevo mes, conservando los presupuestos.
- **AC-8.5** Dado que veo el resumen del mes, cuando el total gastado en variables supera el total presupuestado, entonces el exceso se muestra en rojo con el porcentaje de sobrecosto.

---

### US-9: Patrimonio neto

**Como** Marco, **quiero** registrar mis activos (ahorros, inversiones, propiedades, vehículos) y ver mi patrimonio neto calculado automáticamente, **para** tener una foto de mi riqueza real más allá de los ingresos y deudas.

#### Criterios de Aceptación

- **AC-9.1** Dado que registro un activo con nombre, tipo y valor, cuando lo guardo, entonces aparece en la lista y el total de activos se actualiza.
- **AC-9.2** Dado que tengo deudas registradas, cuando veo la sección de patrimonio, entonces los saldos de todas las deudas aparecen automáticamente como pasivos sin necesidad de ingresarlos nuevamente.
- **AC-9.3** Dado que tengo activos y pasivos, cuando veo el banner de patrimonio, entonces muestra el patrimonio neto (activos − pasivos) en positivo verde o negativo rojo, junto con los totales de cada lado.
- **AC-9.4** Dado que el patrimonio neto es negativo, cuando veo el dashboard, entonces el indicador de salud financiera refleja este dato en su puntuación compuesta.

---

### US-10: Dashboard como panel de control principal

**Como** Marco, **quiero** ver en el dashboard todos los indicadores clave de mi situación financiera sin tener que navegar a otras secciones, **para** tener un diagnóstico completo en menos de 10 segundos.

#### Criterios de Aceptación

- **AC-10.1** Dado que abro la app, cuando llego al dashboard, entonces veo en una sola pantalla: ingreso bruto, ingreso neto, gastos fijos, pagos de deuda, libre para asignar, total metas/mes, y el puntaje de salud financiera.
- **AC-10.2** Dado que tengo datos en múltiples secciones, cuando veo el dashboard, entonces los gráficos de distribución del presupuesto (donut) y proyección de 12 meses (gráfico visual, no tabla) están visibles sin hacer scroll excesivo.
- **AC-10.3** Dado que algún indicador está en zona de riesgo (DTI > 36%, ahorro < 20%, vivienda > 30%), cuando veo el dashboard, entonces ese indicador tiene un color de alerta y hay un mensaje de contexto breve que explica qué significa y qué hacer.
- **AC-10.4** Dado que todos mis datos están en verde, cuando veo el dashboard, entonces el estado visual general transmite claramente que la situación es saludable.

---

### US-11: Puntuación de salud financiera

**Como** Marco, **quiero** ver un puntaje único de salud financiera que resuma mi situación en un número, **para** saber de un vistazo si estoy mejorando o empeorando sin tener que interpretar cuatro métricas distintas.

#### Criterios de Aceptación

- **AC-11.1** Dado que tengo al menos ingreso y gastos registrados, cuando veo el dashboard, entonces aparece un puntaje de salud financiera entre 0 y 100 con una etiqueta descriptiva (Crítico / En riesgo / Regular / Bueno / Excelente).
- **AC-11.2** Dado que veo el puntaje, cuando presiono sobre él, entonces aparece un desglose de los 4 componentes con sus pesos: DTI (35% del puntaje), fondo de emergencia (30%), ratio de vivienda (20%) y tasa de ahorro (15%), cada uno con su valor actual, umbral ideal y estado semáforo (verde/ámbar/rojo).
- **AC-11.3** Dado que el puntaje cambia entre el mes actual y el mes anterior guardado, cuando veo el puntaje, entonces hay una flecha y diferencia numérica que indica si mejoró o empeoró.
- **AC-11.4** Dado que no tengo suficientes datos para calcular algún componente del puntaje, cuando veo el puntaje, entonces ese componente aparece como "sin datos" y el puntaje se calcula solo con los componentes disponibles.

---

### US-12: Proyección visual de 12 meses

**Como** Ana, **quiero** ver una proyección visual de cómo evolucionará mi balance acumulado en los próximos 12 meses, **para** anticipar meses difíciles y saber si mis metas son alcanzables dado mi ritmo actual.

#### Criterios de Aceptación

- **AC-12.1** Dado que tengo ingreso, gastos y deudas registrados, cuando veo la proyección, entonces aparece un gráfico de barras o línea con los 12 meses siguientes mostrando el balance acumulado positivo (verde) o negativo (rojo).
- **AC-12.2** Dado que tengo ingresos no mensuales (trimestral, semestral, anual), cuando veo la proyección, entonces esos ingresos aparecen como picos visibles en los meses en que efectivamente se reciben.
- **AC-12.3** Dado que el balance proyectado de algún mes futuro es negativo, cuando veo el gráfico, entonces ese mes aparece destacado visualmente como un punto de riesgo.
- **AC-12.4** Dado que cambio cualquier dato de ingreso, gasto o meta, cuando regreso al dashboard, entonces la proyección se recalcula automáticamente.

---

### US-13: Historial mensual y comparación

**Como** Juan, **quiero** que la app guarde una foto de mis métricas clave al final de cada mes, **para** poder comparar si mi DTI, tasa de ahorro y patrimonio mejoraron respecto al mes anterior.

#### Criterios de Aceptación

- **AC-13.1** Dado que es el primer día de un nuevo mes, cuando abro la app, entonces el sistema guarda automáticamente el snapshot del mes anterior en silencio (sin pedir confirmación) y muestra una notificación breve no bloqueante de que el resumen fue guardado.
- **AC-13.2** Dado que acepto guardar el resumen mensual, cuando se guarda, entonces el sistema almacena localmente: fecha, ingreso neto, total gastos, total deudas, DTI, tasa de ahorro, patrimonio neto y puntaje de salud.
- **AC-13.3** Dado que tengo al menos dos snapshots mensuales guardados, cuando veo el puntaje de salud o los indicadores del dashboard, entonces aparece una comparación simple (+/−) respecto al mes anterior.
- **AC-13.4** Dado que quiero ver el historial, cuando navego a la sección de historial, entonces veo una lista de los snapshots guardados con sus métricas clave, ordenados del más reciente al más antiguo.

---

### US-14: Asignación de presupuesto simplificada

**Como** Marco, **quiero** asignar qué porcentaje de mi ingreso destino a necesidades, deseos y ahorro, **para** seguir una estrategia de presupuesto sin la fricción de hacer que tres controles sumen exactamente 100%.

#### Criterios de Aceptación

- **AC-14.1** Dado que veo el panel de asignación, cuando ajusto el porcentaje de "Necesidades" y "Deseos", entonces "Ahorro" se calcula automáticamente como el complemento (100 − necesidades − deseos), sin que yo tenga que ajustarlo manualmente.
- **AC-14.2** Dado que intento asignar necesidades + deseos > 100%, cuando el total supera 100, entonces el campo del porcentaje en conflicto se pone en rojo y no permite ese valor.
- **AC-14.3** Dado que tengo asignación configurada, cuando veo el panel, entonces cada bucket muestra el porcentaje y el monto equivalente en mi moneda basado en mi ingreso neto total.
- **AC-14.4** Dado que mis pagos de deuda superan mi bucket de ahorro asignado, cuando veo la asignación, entonces aparece un aviso de que las deudas están consumiendo el presupuesto de ahorro.

---

### US-15: Portabilidad de datos

**Como** Juan, **quiero** exportar todos mis datos como archivo descargable e importarlos en otro dispositivo, **para** no perder mis registros si cambio de navegador o dispositivo.

#### Criterios de Aceptación

- **AC-15.1** Dado que presiono "Exportar", cuando descargo el archivo, entonces obtengo un archivo con todos mis datos financieros que puedo abrir y leer.
- **AC-15.2** Dado que tengo un archivo exportado previamente, cuando lo importo, entonces todos mis datos (ingresos, gastos, deudas, metas, activos, historial) se restauran exactamente como estaban.
- **AC-15.3** Dado que intento importar un archivo inválido o corrupto, cuando el proceso falla, entonces aparece un mensaje de error claro y mis datos actuales no se modifican.
- **AC-15.4** Dado que quiero borrar todo y empezar desde cero, cuando presiono "Reiniciar" y confirmo, entonces todos los datos se eliminan y la app vuelve al estado inicial de onboarding.

---

### US-16: Accesibilidad y experiencia móvil

**Como** cualquier usuario, **quiero** usar la app desde mi teléfono con la misma comodidad que desde una computadora, **para** registrar gastos y revisar mi situación financiera en cualquier momento y lugar.

#### Criterios de Aceptación

- **AC-16.1** Dado que accedo desde un teléfono, cuando navego entre secciones, entonces la navegación es accesible con el pulgar (menú inferior o hamburguesa accesible) sin necesidad de hacer scroll para llegar a los controles principales.
- **AC-16.2** Dado que uso la app, cuando navego con teclado (Tab, Enter), entonces todos los controles interactivos son alcanzables y el foco visual es visible en todo momento.
- **AC-16.3** Dado que cambio entre modo claro y modo oscuro, cuando aplico el cambio, entonces toda la interfaz (incluyendo gráficos y formularios) cambia correctamente sin texto ilegible ni fondos invertidos.
- **AC-16.4** Dado que la app está en español, cuando cambio a inglés, entonces todo el texto visible (etiquetas, placeholders, mensajes de error, alertas) aparece en inglés. El cambio inverso funciona igual.

---

### US-17: Interfaz visual coherente, legible y sin solapamientos

**Como** cualquier usuario, **quiero** una interfaz que se vea bien tanto en modo claro como oscuro, sin elementos que se enciman ni colores ilegibles, **para** usar la app cómodamente en cualquier condición de luz y en cualquier dispositivo sin que la interfaz me genere fricción visual.

#### Criterios de Aceptación

- **AC-17.1** Dado que activo el modo oscuro, cuando navego por todas las secciones (dashboard, ingresos, gastos, deudas, metas, patrimonio, variables), entonces todo el texto tiene un contraste suficiente para ser legible — ningún texto claro sobre fondo claro ni texto oscuro sobre fondo oscuro.
- **AC-17.2** Dado que activo el modo oscuro, cuando veo los gráficos (donut, barra de DTI, proyección, barras de progreso), entonces los colores de los gráficos son los mismos o equivalentes visibles en modo oscuro — no aparecen fondos blancos ni bordes sin estilo alrededor de los gráficos.
- **AC-17.3** Dado que uso la app en una pantalla de 375px de ancho (móvil pequeño), cuando recorro cada sección, entonces ningún elemento se superpone con otro — formularios, botones, etiquetas y valores tienen espacio suficiente y no se cortan ni enciman.
- **AC-17.4** Dado que uso la app en una pantalla de 768px (tablet) o 1280px (escritorio), cuando recorro todas las secciones, entonces el layout aprovecha el espacio disponible sin dejar áreas vacías excesivas ni elementos que se desbordan fuera de sus contenedores.
- **AC-17.5** Dado que hay múltiples tipos de información en el dashboard (cards, alertas, gráfico, proyección), cuando los veo, entonces la jerarquía visual es clara: el puntaje de salud y los indicadores clave son más prominentes que los detalles secundarios.
- **AC-17.6** Dado que los indicadores usan colores semáforo (verde/ámbar/rojo), cuando los veo, entonces el estado también se comunica con un ícono o etiqueta de texto — el color no es el único diferenciador, para usuarios con dificultades de visión al color.
- **AC-17.7** Dado que interactúo con cualquier botón, input o elemento clickeable, cuando paso el cursor encima (escritorio) o lo presiono (móvil), entonces el elemento da retroalimentación visual clara: cambio de color, elevación o borde de enfoque visible.
- **AC-17.8** Dado que veo una sección con datos vacíos (sin gastos, sin metas, sin deudas), cuando llego a ella, entonces el estado vacío muestra un mensaje amigable con un ícono ilustrativo y una acción sugerida ("+ Agregar primer gasto"), no solo un espacio en blanco.
- **AC-17.9** Dado que navego entre secciones, cuando cambio de una a otra, entonces la transición es suave y no hay saltos bruscos de layout ni flashes de contenido sin estilo.
- **AC-17.10** Dado que los tooltips de ayuda (?) están presentes en campos como APR, DTI, fecha de corte, cuando presiono el ícono de ayuda en móvil, entonces el tooltip aparece dentro del viewport sin quedar cortado por los bordes de la pantalla.

---

## Casos Borde

- **EC-1** — Salario bruto = 0 y hay deducciones porcentuales → Las deducciones muestran $0, el ingreso neto es $0 sin error ni NaN visible.
- **EC-2** — DTI > 100% (deudas superan el ingreso) → El medidor de DTI muestra 100% con alerta roja; el puntaje de salud muestra 0 en ese componente.
- **EC-3** — Meta con fecha límite ya pasada → La meta muestra "fecha vencida" en lugar de un ETA futuro; no arroja error.
- **EC-4** — Todos los gastos variables en $0 gastado → Las barras de progreso muestran 0% en verde; no hay alertas de exceso.
- **EC-5** — Importar un archivo de una versión anterior del esquema de datos → El sistema migra los datos al formato actual y muestra un aviso de "datos actualizados al formato más reciente".
- **EC-6** — El almacenamiento local está lleno → Al intentar guardar, aparece una alerta clara indicando que no hay espacio disponible y los datos NO se pierden (el cambio no se persiste).
- **EC-7** — Retención en la fuente calculada cuando el salario está por debajo del umbral → El sistema muestra un mensaje informativo ("salario por debajo del umbral") en lugar de agregar un item de $0.
- **EC-8** — Proyección de 12 meses con ingreso = 0 → El gráfico muestra todos los meses en rojo (déficit) sin crashear.
- **EC-9** — El usuario cierra el onboarding a la mitad → Los datos parcialmente ingresados se guardan; al volver, el onboarding retoma desde donde quedó.
- **EC-10** — Tasa EA de 0% en una deuda → El cálculo de plazo funciona (división simple) y la línea de tiempo se muestra correctamente.

---

## Métricas de Éxito

- Primer uso: un usuario nuevo puede llegar a un dashboard con datos reales (ingreso + al menos un gasto) en menos de 5 minutos siguiendo el onboarding.
- Legibilidad del dashboard: todos los indicadores de estado de salud financiera son visibles sin hacer scroll en una pantalla de 375px de ancho (iPhone SE).
- Registro de gasto rápido: desde el botón flotante, el flujo de registrar un gasto variable toma máximo 3 interacciones (abrir panel → seleccionar categoría → ingresar monto → confirmar).
- Sin datos corruptos: ningún campo del dashboard muestra "NaN", "undefined" o valores vacíos ante cualquier combinación de datos vacíos/parciales.
- Cálculos correctos: la retención en la fuente para un salario de $5.000.000 COP con solo Salud y Pensión como deducciones debe coincidir con la tabla Art. 383 ET UVT 2025.

---

## Fuera de Alcance (v1)

- **Metas compartidas con participantes** — El sistema de metas colaborativas (múltiples personas con aportes individuales, seguimiento por participante) queda fuera del alcance. Se puede crear como feature separado si hay demanda.
- **Campo "Notas" en gastos fijos** — Eliminado. El nombre del gasto es suficiente identificador.
- **Historial de transacciones individuales** — La app trabaja con totales mensuales, no con registro transacción por transacción.
- **Sincronización con bancos o APIs financieras** — Todo es ingreso manual. Sin integraciones externas.
- **Notificaciones push o recordatorios programados** — Los alertas son visuales dentro de la app al abrirla, no notificaciones del sistema operativo.
- **Exportación a PDF** — El formato de exportación es solo el archivo de respaldo de datos. Un resumen imprimible puede considerarse en v2.
- **Más de 2 idiomas (es/en)** — El soporte de idioma se limita a español e inglés.

---

## Preguntas Abiertas

- [x] **Q-1** — _Resuelto:_ El snapshot mensual se guarda automáticamente en silencio, sin confirmación. Una notificación breve no bloqueante confirma que se guardó. (→ AC-13.1)
- [x] **Q-2** — _Resuelto:_ Pesos basados en literatura de finanzas personales y CFPB: DTI 35% (mayor predictor de estrés financiero), fondo de emergencia 30% (red de seguridad crítica, especialmente con volatilidad económica latinoamericana), ratio de vivienda 20% (estabilidad de largo plazo), tasa de ahorro 15% (acumulación de riqueza, subordinada a estabilidad). (→ AC-11.2)
- [x] **Q-3** — _Resuelto:_ El botón flotante de registro rápido aparece únicamente en el dashboard y en la sección de gastos variables. (→ AC-8.3)
- [x] **Q-4** — _Resuelto:_ El onboarding es relanzable desde el menú de configuración, con datos actuales precargados, sin borrar nada. (→ AC-1.6)

## Clarificaciones

- **Q-1 → AC-13.1:** Snapshot automático silencioso. Elimina la pregunta de confirmación. Motivo: menos fricción para el usuario recurrente.
- **Q-2 → AC-11.2:** Pesos DTI 35% / Emergencia 30% / Vivienda 20% / Ahorro 15%. Fuente: estándares CFPB + contexto latinoamericano de volatilidad de ingresos.
- **Q-3 → AC-8.3:** FAB visible solo en Dashboard y Gastos Variables. En otras secciones no aparece para no crear confusión sobre qué se está registrando.
- **Q-4 → AC-1.6:** Onboarding relanzable desde configuración con datos precargados. No es destructivo.

---

## Sign-off

- [x] Author: `Johann Medina` — `2026-05-14`
