# Spec: `Fix cálculos financieros`

> Spec version: **v1** · Mode: `solo`
> Slug: `20260515-fix-calculos-financieros` · Created: `2026-05-15`

## Problem

La aplicación de finanzas personales muestra métricas financieras incorrectas porque todos los cálculos de distribución, DTI, disponible y metas usan el salario bruto en lugar del ingreso neto real. Adicionalmente, los datos ingresados (salario, deducciones, deudas) se pierden silenciosamente al recargar la página cuando el usuario tiene deudas registradas. El puntaje de salud financiera muestra valores estáticos en lugar de reflejar la situación real del usuario.

## Goals / Non-Goals

- **Goal 1:** Todos los datos ingresados persisten correctamente entre sesiones, sin pérdida silenciosa.
- **Goal 2:** Todos los cálculos de distribución, disponible, DTI y metas usan el ingreso neto (bruto menos deducciones), no el bruto.
- **Goal 3:** El puntaje de salud financiera refleja datos reales del usuario (fondo de emergencia real, gastos de vivienda reales, tasa de ahorro real basada en contribuciones a metas).
- **Goal 4:** Los cálculos de deuda usan la tasa de interés mensual correcta derivada de la tasa efectiva anual, e incluyen cuotas de compras activas en el DTI.
- **Goal 5:** La proyección de flujo de caja incorpora el ingreso neto y los ingresos no mensuales en los meses en que corresponden.
- **Goal 6:** El usuario puede visualizar cuánto acumularía en 12 meses si ahorra el porcentaje configurado de su ingreso neto (proyección hipotética) y cuánto crecerían sus ahorros reales aplicando su tasa de rendimiento actual (interés compuesto).
- **Non-Goal:** Cambiar el diseño visual o la navegación de la aplicación.
- **Non-Goal:** Conectar la aplicación con servicios externos o bancos.
- **Non-Goal:** Calcular impuestos sobre rendimientos de inversiones.

## Personas

- **Empleado colombiano** — Asalariado con deducciones de nómina (salud, pensión), necesita ver su ingreso real disponible después de deducciones y calcular correctamente su capacidad de ahorro y pago de deudas.
- **Usuario activo de finanzas** — Registra deudas, metas y gastos regularmente; depende de que la información persista entre sesiones para tomar decisiones financieras confiables.

## User Stories

---

### US-1: Persistencia confiable de todos los datos

**As a** usuario activo de finanzas, **I want** que todos mis datos (salario, deducciones, deudas, metas, gastos, activos) queden guardados correctamente después de cualquier cambio, **so that** no pierda información al recargar la página o cerrar el navegador.

#### Acceptance Criteria

- **AC-1.1** Given que el usuario tiene datos registrados de cualquier tipo (salario, deducción, deuda, meta, gasto o activo), when recarga la página, then todos los datos aparecen exactamente como fueron ingresados, sin que ningún campo desaparezca o cambie de valor.

- **AC-1.2** Given que el usuario agrega una deuda nueva, when recarga la página inmediatamente después, then la deuda aparece en la lista con todos sus campos (nombre, saldo, tasa de interés, pago mínimo, fecha de corte) tal como fueron ingresados.

- **AC-1.3** Given que el usuario tiene una deuda registrada y luego agrega una deducción de nómina, when recarga la página, then tanto la deuda como la deducción aparecen correctamente, sin que una haga desaparecer a la otra.

- **AC-1.4** Given que ocurre un error al intentar guardar los datos (por ejemplo, almacenamiento del navegador lleno o datos en formato inválido), when el error sucede, then aparece un mensaje de aviso visible informando que los datos no se pudieron guardar, mientras los datos permanecen visibles en la sesión actual.

---

### US-2: Métricas financieras basadas en ingreso neto

**As a** empleado colombiano, **I want** que todos los cálculos de distribución, disponible mensual, DTI y cupo de ahorro se basen en mi ingreso neto (lo que realmente recibo después de deducciones), **so that** los montos reflejen el dinero real que puedo usar cada mes.

#### Acceptance Criteria

- **AC-2.1** Given que el usuario tiene salario bruto $12.100.000 y deducciones de salud 4% y pensión 4%, when ve el resumen de ingreso neto, then el valor mostrado es $11.132.000.

- **AC-2.2** Given que el usuario tiene deducciones configuradas, when ve el panel de distribución (necesidades / deseos / ahorros), then los montos en pesos de cada categoría se calculan sobre el ingreso neto, no sobre el salario bruto.

- **AC-2.3** Given que el usuario tiene deducciones configuradas, when ve el monto "disponible para distribuir" o "libre" en el dashboard, then ese valor se obtiene de: ingreso neto menos gastos fijos menos obligaciones de deuda.

- **AC-2.4** Given que el usuario tiene beneficios extrasalariales registrados, when se calcula el ingreso neto, then los beneficios extrasalariales se suman después de restar las deducciones al salario bruto (no entran en la base de deducciones).

- **AC-2.5** Given que el usuario no tiene deducciones configuradas, when el sistema calcula el ingreso neto, then el ingreso neto es igual al salario bruto y ningún cálculo produce error.

---

### US-3: Puntaje de salud financiera basado en datos reales

**As a** usuario activo de finanzas, **I want** que el puntaje de salud financiera y sus cuatro componentes (deuda, emergencia, vivienda, ahorro) reflejen mis datos reales, **so that** pueda tomar decisiones con información veraz y no con valores de ejemplo.

#### Acceptance Criteria

- **AC-3.1** Given que el usuario tiene gastos fijos con categoría "vivienda" registrados, when ve el componente de vivienda en el desglose del puntaje, then el valor mostrado es el porcentaje que representan los gastos de vivienda sobre el ingreso neto del usuario.

- **AC-3.2** Given que el usuario tiene activos de tipo efectivo o ahorros registrados, when ve el componente de fondo de emergencia en el desglose del puntaje, then el valor refleja cuántos meses de gastos mensuales totales cubren esos activos, donde gastos mensuales totales = gastos fijos + obligaciones de deuda mínimas (pago mínimo + cuotas activas).

- **AC-3.3** Given que el usuario tiene contribuciones mensuales configuradas en al menos una meta de ahorro e ingreso neto mayor a cero, when ve el componente de tasa de ahorro en el desglose del puntaje, then el valor mostrado es la suma de todas las contribuciones mensuales a metas dividida entre el ingreso neto, expresada como porcentaje (lo que realmente está ahorrando, no lo que planea ahorrar según la distribución).

- **AC-3.4** Given que el usuario no tiene activos registrados, when ve el desglose del puntaje de salud, then el componente de fondo de emergencia muestra "sin datos" y el puntaje total se calcula solo con los componentes disponibles (sin usar el valor faltante).

- **AC-3.5** Given que el usuario agrega un activo líquido nuevo, when el puntaje de salud se recalcula, then el componente de emergencia cambia para reflejar el nuevo total de activos.

- **AC-3.6** Given que el usuario agrega un gasto de categoría "vivienda", when el puntaje de salud se recalcula, then el componente de vivienda cambia para reflejar el nuevo gasto.

---

### US-4: Cálculo correcto de deudas y DTI

**As a** empleado colombiano con deudas, **I want** que el tiempo de liquidación de mis deudas se calcule con la tasa de interés mensual correcta derivada de la tasa efectiva anual, y que el DTI incluya todas mis obligaciones mensuales reales (incluyendo cuotas de compras), **so that** mi plan de deudas sea realista.

#### Acceptance Criteria

- **AC-4.1** Given que el usuario registra una deuda con tasa efectiva anual (TEA) del 30%, when el sistema calcula el tiempo de liquidación, then el número de meses resultante es **menor** que el que se obtendría dividiendo 30% entre 12 meses directamente — porque la tasa mensual equivalente correcta `(1 + TEA)^(1/12) − 1 ≈ 2.21%` es inferior a la tasa nominal simple `30%/12 = 2.5%`, lo que reduce el costo mensual de intereses. El campo APR acepta **TEA** (Tasa Efectiva Anual), que es el estándar de la Superfinanciera de Colombia para productos de crédito al consumidor.

- **AC-4.2** Given que el usuario tiene una tarjeta de crédito con cuotas de compras activas, when ve el total de pagos mensuales de deuda en el dashboard, then ese total incluye tanto el pago mínimo de la tarjeta como la suma de las cuotas mensuales de todas las compras a cuotas activas en esa tarjeta.

- **AC-4.3** Given que el usuario tiene cuotas activas que aumentan el pago mensual total de deuda, when se calcula el DTI, then el DTI refleja el pago total real (mínimo + cuotas) dividido entre el ingreso neto.

- **AC-4.4** Given que el pago mínimo de una deuda no alcanza a cubrir los intereses mensuales, when el sistema muestra el tiempo de liquidación, then muestra que la deuda no se liquida (tiempo indefinido) en lugar de un número de meses incorrecto.

---

### US-5: Proyección de flujo de caja con ingresos irregulares

**As a** empleado colombiano con prima de servicios y otros ingresos no mensuales, **I want** que la proyección a 12 meses muestre los meses en que recibo ingresos adicionales y use mi ingreso neto como base, **so that** pueda identificar cuándo tengo excedente y cuándo debo ser más cuidadoso.

#### Acceptance Criteria

- **AC-5.1** Given que el usuario tiene un ingreso adicional de frecuencia semestral (ej. prima), when ve la proyección de 12 meses, then los meses en que corresponde recibir ese ingreso muestran un saldo acumulado mayor que los meses adyacentes sin ese ingreso.

- **AC-5.2** Given que el usuario tiene ingresos adicionales de distintas frecuencias (mensual, trimestral, semestral, anual), when ve la proyección, then cada ingreso adicional aparece únicamente en los meses en que le corresponde, no en todos los meses.

- **AC-5.3** Given que el usuario tiene salario bruto y deducciones configuradas, when ve la proyección de flujo de caja, then la base del cálculo mensual usa el ingreso neto (no el bruto).

---

### US-6: Cupo de ahorro para metas basado en distribución configurada

**As a** usuario activo de finanzas que configuró su distribución de ahorro, **I want** que el cupo disponible para metas de ahorro use el porcentaje de ahorro que yo configuré aplicado sobre mi ingreso neto, **so that** sepa con precisión cuánto tengo disponible para mis metas cada mes.

#### Acceptance Criteria

- **AC-6.1** Given que el usuario configuró un porcentaje de ahorro del 20% en la distribución y tiene ingreso neto de $11.132.000, when ve la sección de metas, then el cupo disponible para metas muestra $2.226.400 (20% del ingreso neto), no un valor basado en porcentaje genérico o en el salario bruto.

- **AC-6.2** Given que el usuario cambia el porcentaje de ahorro en la distribución, when vuelve a la sección de metas, then el cupo disponible para metas se actualiza automáticamente reflejando el nuevo porcentaje aplicado al ingreso neto.

---

### US-7: Prima de servicios siempre refleja el salario actual

**As a** empleado colombiano cuyo salario varía, **I want** que el botón de prima de servicios siempre agregue o actualice la prima con mi salario actual, y que pueda editarla o eliminarla si lo necesito, **so that** las proyecciones de ingresos siempre usen el valor correcto sin que yo deba calcular manualmente.

#### Acceptance Criteria

- **AC-7.1** Given que el usuario no tiene prima de servicios registrada y presiona el botón "Cargar prima de servicios", when el botón es presionado, then se agrega una entrada de ingreso semestral con monto igual a la mitad del salario bruto actual.

- **AC-7.2** Given que el usuario ya tiene una prima de servicios registrada y presiona nuevamente el botón "Cargar prima de servicios", when el botón es presionado, then el monto de la prima existente se actualiza a la mitad del salario bruto actual (sin crear un duplicado).

- **AC-7.3** Given que la prima de servicios está en la lista de ingresos adicionales, when el usuario edita su monto o la elimina, then el cambio se guarda correctamente y persiste al recargar la página.

> **Limitación conocida (out of scope):** el botón calcula la prima completa para 6 meses laborados (Art. 306 CST: `bruto / 2`). La prima proporcional para períodos incompletos no se calcula automáticamente — el usuario debe ajustar el monto manualmente si lleva menos de un semestre en el cargo.

---

---

### US-8: Visualización de proyección de ahorro e interés compuesto

**As a** usuario activo de finanzas, **I want** ver cuánto acumularía si ahorro el porcentaje que configuré de mi ingreso neto durante un año, y cuánto crecerían mis ahorros reales con la tasa de rendimiento actual, **so that** pueda evaluar el impacto real de mis hábitos de ahorro a mediano plazo.

> **Nota técnica:** esta US requiere un módulo nuevo `src/lib/calculations/savings-projection.ts` — no existe actualmente. El `projection.ts` existente solo cubre flujo de caja lineal y no debe modificarse para este propósito. El nuevo módulo debe exponer dos funciones puras: `calcHypotheticalSavings(netIncome, savingsRatePercent, months)` y `calcCompoundGrowth(assets: { balance, annualRatePercent }[], months)`.

#### Acceptance Criteria

- **AC-8.1** Given que el usuario tiene ingreso neto mayor a cero y un porcentaje de ahorro configurado en la distribución, when ve la sección de proyección de ahorro, then una visualización muestra la acumulación mes a mes durante 12 meses si ahorra ese porcentaje mensualmente (sin incluir rendimientos — acumulación lineal pura).

- **AC-8.2** Given que el usuario tiene activos de tipo ahorro o inversión con una tasa de rendimiento anual configurada, when ve la proyección de interés compuesto, then la visualización muestra cómo crecerían esos activos mes a mes durante 12 meses aplicando esa tasa compuesta mensualmente.

- **AC-8.3** Given que ambas proyecciones (hipotética y con interés compuesto) están disponibles, when el usuario las ve simultáneamente, then puede distinguir visualmente cuál es la acumulación hipotética (si ahorra X% desde cero) y cuál es el crecimiento de sus ahorros reales actuales.

- **AC-8.4** Given que el usuario cambia el porcentaje de ahorro en la distribución, when vuelve a la proyección hipotética, then los valores actualizados reflejan el nuevo porcentaje automáticamente sin recargar.

- **AC-8.5** Given que el usuario no tiene activos con tasa de rendimiento configurada, when ve la sección de interés compuesto, then el sistema muestra un mensaje indicando que debe configurar una tasa de rendimiento en sus activos de ahorro para ver esta proyección.

- **AC-8.6** Given que el usuario tiene activos de ahorro con tasa configurada, when ve el valor proyectado al mes 12 en la curva de interés compuesto, then ese valor es mayor que el saldo inicial de los activos (el crecimiento por interés es visible).

## Edge Cases

- **EC-1** — Usuario sin deducciones configuradas → el ingreso neto es igual al salario bruto; ningún cálculo falla por lista de deducciones vacía.
- **EC-2** — Salario bruto = 0 → todos los porcentajes (DTI, tasa de ahorro, ratio de vivienda) muestran 0 o "sin datos"; no ocurre ningún error de división por cero.
- **EC-3** — Pago mínimo de deuda insuficiente para cubrir intereses → el sistema muestra "tiempo de liquidación: indefinido" en lugar de un número incorrecto o error.
- **EC-4** — Sin activos líquidos → el componente de fondo de emergencia en el puntaje de salud muestra "sin datos"; el puntaje total se calcula con los componentes disponibles.
- **EC-5** — Distribución de ahorro = 0% → el cupo disponible para metas es $0; la sección de metas muestra un aviso de que no hay ahorro configurado.
- **EC-6** — Deuda con tasa 0% → el tiempo de liquidación se calcula por división simple (saldo / pago mínimo) sin producir división por cero.
- **EC-7** — Usuario agrega una deuda y luego agrega una deducción en la misma sesión → ambas persisten correctamente al recargar.
- **EC-8** — Tasa de rendimiento = 0% → la proyección de interés compuesto muestra línea plana (el saldo no crece) sin error.
- **EC-9** — Sin metas con contribución mensual → el componente de ahorro del puntaje de salud muestra "sin datos" (contribuciones reales = 0).
- **EC-10** — Usuario con activos pero sin tasa de rendimiento configurada → la proyección hipotética sigue visible; solo la curva de interés compuesto muestra "sin datos".

## Success Metrics

1. Tras recargar la página con cualquier combinación de datos (incluyendo deudas), **0 campos** desaparecen o cambian de valor.
2. Para salario bruto $12.100.000 con deducciones salud 4% + pensión 4%: el ingreso neto mostrado es **$11.132.000** y cada deducción muestra **$484.000**.
3. El panel de distribución muestra montos calculados sobre **$11.132.000** (no sobre $12.100.000) cuando hay deducciones del 8%.
4. El puntaje de salud financiera **cambia** cuando el usuario agrega o modifica activos líquidos (componente de emergencia), sin requerir recarga manual.
5. El puntaje de salud financiera **cambia** cuando el usuario agrega o modifica gastos de vivienda (componente de vivienda).
6. La proyección a 12 meses muestra **valores distintos** en los meses de prima (mes 6 y mes 12) respecto a los demás meses cuando la prima está configurada.
7. El DTI **aumenta** cuando el usuario agrega cuotas de compras a una tarjeta, reflejando el mayor compromiso mensual.
8. Cuando se registra un error de guardado, el usuario ve **un aviso visible** dentro de los 5 segundos siguientes al cambio.
9. La proyección hipotética de ahorro muestra un valor de acumulación en el mes 12 **igual a ingreso_neto × % ahorro × 12** (sin rendimiento).
10. La proyección de interés compuesto en el mes 12 muestra un valor **mayor** que el saldo inicial de activos de ahorro cuando la tasa de rendimiento es mayor a 0.

## Out of Scope

- Integración con bancos o sistemas externos de nómina.
- Importación automática de extractos.
- Cálculo de retención en la fuente (ya funciona correctamente según el análisis).
- Cambios en la navegación o estructura de rutas de la aplicación.
- Cálculo de impuestos sobre rendimientos de inversiones (gravámenes de capital, GMF).
- Proyecciones a más de 12 meses en esta versión.
- Prima proporcional para períodos laborados menores a 6 meses (el botón calcula siempre la prima completa; el ajuste proporcional es manual).

## Open Questions

- [x] **OQ-1** — *(Resuelto — ver Clarifications)*
- [x] **OQ-2** — *(Resuelto — ver Clarifications)*
- [x] **OQ-3** — *(Resuelto — ver Clarifications)*

## Clarifications

**OQ-1 — Prima de servicios al cambiar salario** *(respondido 2026-05-16)*
El botón "Cargar prima de servicios" siempre agrega o actualiza la prima con el salario actual al momento de ser presionado. Si ya existe una prima registrada, se actualiza su monto (sin duplicar). El usuario puede editar el monto manualmente o eliminar la entrada en cualquier momento. No hay actualización automática al cambiar el salario — el usuario controla cuándo aplicar el recálculo.

**OQ-2 — Componente de ahorro del puntaje de salud y proyecciones** *(respondido 2026-05-16)*
Se implementan ambas dimensiones:
1. **Componente de ahorro del health score (AC-3.3)**: usa la tasa real = suma de contribuciones mensuales a metas activas / ingreso neto (lo que el usuario *está* ahorrando efectivamente).
2. **Proyección hipotética (US-8, AC-8.1)**: muestra la acumulación mensual si el usuario ahorrara el porcentaje configurado en la distribución × ingreso neto — una herramienta de "¿qué pasaría si?" separada del score.
3. **Proyección con interés compuesto (US-8, AC-8.2 y AC-8.6)**: muestra el crecimiento de los ahorros reales actuales aplicando la tasa de rendimiento configurada, con visualización mes a mes.

**OQ-3 — Granularidad de la tasa de rendimiento** *(respondido 2026-05-16)*
La tasa de rendimiento anual se configura por activo individual. Cada activo de tipo ahorro o inversión tiene su propio campo de tasa EA al momento de crearlo o editarlo. La proyección de interés compuesto agrega el crecimiento de cada activo usando su tasa individual y los muestra como curva combinada.

---

## Sign-off

<!-- mode=solo -->
- [x] Author: `Johann Medina` — `2026-05-16`
