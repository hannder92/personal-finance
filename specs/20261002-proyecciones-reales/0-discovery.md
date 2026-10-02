# Discovery: Proyecciones reales (inflación, rentabilidad y aporte requerido)

> Feature: `20261002-proyecciones-reales` · Date: `2026-10-02`
> Prerequisite for `size_class` **M+** · Recommended for all user-facing features
> Benchmark corpus: — · `https://escenariosdeinversion.lovable.app` (secciones "Valor real", "Meta financiera", "Vivir de tus inversiones")

## 0. Brief (8/8)

| #   | Campo        | Valor                                                                                                                                                                                                                                                                                      |
| --- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Nombre corto | Proyecciones reales                                                                                                                                                                                                                                                                        |
| 2   | Problema     | Las metas y la libertad financiera se calculan como `faltante / ahorro mensual`: ignoran que el dinero invertido rinde y que la inflación le quita poder de compra. El usuario ve plazos demasiado largos (sin rentabilidad) y montos que parecen mayores de lo que valen (sin inflación). |
| 3   | Persona      | Empleado en Colombia que ahorra cada mes y planea sus metas y su retiro                                                                                                                                                                                                                    |
| 4   | Horizonte    | `year`                                                                                                                                                                                                                                                                                     |
| 5   | Tipo         | `decision`                                                                                                                                                                                                                                                                                 |
| 6   | P0 móvil     | En Libertad financiera y en cada meta: tiempo estimado con rentabilidad + aporte mensual necesario, en pesos de hoy                                                                                                                                                                        |
| 7   | Non-goals    | (a) Costo de esperar, desglose del crecimiento, portafolio por perfiles y CDT neto de retención → spec posterior. (b) Sin tasas de mercado ni inflación en línea: los supuestos los escribe el usuario (invariante: datos financieros solo locales).                                       |
| 8   | Benchmark    | escenariosdeinversion.lovable.app; app actual (Libertad financiera, Metas, proyección de ahorro del dashboard)                                                                                                                                                                             |

## 1. Moment & question

| Field                     | Value                                                                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **When**                  | Al crear o revisar una meta, y en la revisión mensual/anual del plan ("¿voy bien?")                                      |
| **Horizon**               | `year`                                                                                                                   |
| **Trigger**               | Crea una meta, cambia su ahorro mensual, o entra a Libertad financiera para ver cuánto le falta                          |
| **Question (1 sentence)** | ¿Cuánto tengo que ahorrar al mes, y en cuántos años llego, si mi dinero rinde y la inflación sigue subiendo los precios? |
| **Feature type**          | `decision`                                                                                                               |

## 2. What the user must see (UI intent)

| Priority                        | User sees                                                                                                                                                                                                                                                                          | User must NOT see first                                           |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| **P0** (above fold mobile)      | Libertad financiera: **años para lograrlo** (hero) + aporte mensual necesario para llegar en el plazo deseado + línea de contexto con los supuestos ("con 8% anual e inflación 5%"). Metas: por tarjeta, **fecha estimada** y **aporte mensual requerido** para la fecha objetivo. | Tablas nominal/real, fórmulas, varias tasas a la vez              |
| **P1** (same screen, scroll)    | Comparación "sin rentabilidad vs con rentabilidad" en lenguaje humano ("llegas 3 años antes", "ahorras $X menos al mes"); capital necesario en pesos de hoy y en pesos del año meta                                                                                                | Valores nominales grandes sin aclarar que no descuentan inflación |
| **P2** (secondary / drill-down) | Editar supuestos: inflación anual, rentabilidad anual esperada, tasa de retiro; aviso educativo ("simulación, no promesa de rentabilidad")                                                                                                                                         | —                                                                 |

### Emotional target

- [ ] Relief (nothing due / covered)
- [x] Clarity (one number answers the question)
- [ ] Urgency (shortfall visible with amount)
- [x] Confidence (comparison shows benefit of action)

## 3. Benchmark teardown

| Reference                                                          | Pattern                                                                                                                                                                          | Adopt / Adapt / Reject | Why                                                                                                                        |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Escenarios de inversión — "Valor nominal / Valor real" por tarjeta | Dos números lado a lado, real descontado por inflación                                                                                                                           | **Adapt**              | Útil, pero un solo hero por tarjeta: mostrar en pesos de hoy como principal y el nominal como detalle                      |
| Escenarios — "Vivir de tus inversiones"                            | Ingreso deseado + tasa de retiro → capital necesario, años para lograrlo, aporte requerido en 10 años                                                                            | **Adopt**              | Es exactamente la pregunta de nuestra vista de Libertad financiera; hoy usamos ×25 fijo y no hay aporte requerido          |
| Escenarios — "Meta financiera"                                     | Brecha y aporte requerido por activo, tiempo estimado                                                                                                                            | **Adapt**              | Aporte requerido sí; pero por _tasa de rentabilidad_ del usuario, no por activo                                            |
| Escenarios — "Mejor ruta: Criptomonedas"                           | Recomienda el activo con mayor CAGR                                                                                                                                              | **Reject**             | Parece recomendación de inversión; tasas especulativas como default; contradice el tono prudente de la app                 |
| Escenarios — montos en USD sin contexto local                      | Formato $ genérico                                                                                                                                                               | **Reject**             | Nuestra app es COP-first                                                                                                   |
| Our app — current                                                  | Libertad financiera: meta = gasto × 12 × 25; meses = faltante / ahorro factible. Metas: ETA y aporte requerido lineales. Dashboard: proyección de ahorro con tasa anual opcional | **Adapt**              | Ya existen la tasa de proyección y la tasa por activo; falta unificar supuestos y aplicarlos a metas y libertad financiera |

## 4. Feedback loop

```text
Supuestos (inflación, rentabilidad, retiro) → plazo y aporte requerido
  → usuario ajusta ahorro mensual o fecha de la meta
  → estado: en camino / atrasada → (mes siguiente) progreso real vs plan
```

| State                                       | Visible signal                  | Color / copy intent                                                                    |
| ------------------------------------------- | ------------------------------- | -------------------------------------------------------------------------------------- |
| En camino                                   | Fecha estimada ≤ fecha objetivo | Verde · "Llegas en mar 2029, 4 meses antes"                                            |
| Atrasada                                    | Fecha estimada > fecha objetivo | Ámbar · "Para llegar a tiempo ahorra $X/mes (hoy $Y)"                                  |
| Sin ahorro mensual                          | No hay plazo calculable         | Ámbar · "Define un aporte mensual para estimar la fecha"                               |
| Meta lograda                                | Faltante ≤ 0                    | Verde · alivio                                                                         |
| Sin supuestos (rentabilidad 0, inflación 0) | Cálculo lineal actual           | Neutral · invitación "Agrega una rentabilidad esperada para ver un plazo más realista" |

## 5. AI proposals (mandatory — pick one)

### Option A — Supuestos globales + comparación "con vs sin rentabilidad"

- **Layout:** Un bloque único de supuestos en Ajustes (inflación, rentabilidad esperada, tasa de retiro). Libertad financiera: hero = años para lograrlo; debajo, aporte requerido para el plazo deseado y una línea de beneficio ("con rentabilidad llegas N años antes"). Cada tarjeta de meta: fecha estimada + aporte requerido; montos en pesos de hoy.
- **Pros:** Un solo número por tarjeta; poca carga en móvil; reutiliza la tasa de proyección existente; consistente entre vistas.
- **Cons:** Un usuario con metas de distinto riesgo (emergencia vs retiro) usa la misma tasa.
- **Best when:** La mayoría de metas son de mediano/largo plazo y el usuario quiere una sola respuesta clara.

### Option B — Tres escenarios (conservador / base / optimista) en cada meta

- **Layout:** Selector de escenario arriba de Metas y Libertad financiera; cada tarjeta muestra tres plazos/aportes o cambia con el selector.
- **Pros:** Comunica incertidumbre; muy fiel al benchmark.
- **Cons:** Triplica números en móvil; obliga a definir tres tasas; el P0 elegido (años + aporte) se diluye.
- **Best when:** Usuario inversionista que ya compara activos (no es la persona principal).

### ✅ Recommendation

**Option A** porque responde la pregunta con un número por tarjeta, cumple "one idea per card" y "benefit copy on decisions" con la comparación con/sin rentabilidad, y no exige al usuario configurar tres tasas.

**Rejected for now:** Option B (escenarios múltiples) — puede volver como P2 en un spec posterior junto al portafolio por perfiles.

## 6. Feature-type questionnaire

### If `decision` (compare before acting)

- **A vs B:** Ahorrar sin invertir (rentabilidad 0) vs invertir a la rentabilidad esperada; y "plazo con el aporte actual" vs "aporte necesario para la fecha deseada".
- **Beneficio en lenguaje humano:** "Llegas N años/meses antes", "Necesitas $X menos al mes", "Tu meta de $100M equivale a $Y de hoy".
- **CTA tras comparar:** Ajustar el aporte mensual de la meta (o la fecha objetivo); en Libertad financiera, ir a editar supuestos.

## 7. Anti-patterns & scope guard

| Risk                                  | Mitigation                                                                                                                       |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Another metric without action         | Cada número nuevo trae una acción: ajustar aporte o fecha                                                                        |
| Duplicates dashboard without new loop | La proyección del dashboard se queda como está; este spec cambia Metas y Libertad financiera, que hoy no consideran rentabilidad |
| Spreadsheet density on mobile         | Sin tablas nominal/real; nominal solo como texto secundario                                                                      |
| Parecer asesoría de inversión         | Sin nombres de activos; supuestos editados por el usuario; aviso educativo visible                                               |
| Supuestos irreales (p. ej. 30%)       | Rango validado y aviso cuando la rentabilidad real (rentabilidad − inflación) supera un umbral                                   |

## 8. Open questions → spec

- [x] **OQ-1:** Metas de corto plazo → **opción por meta** "este dinero se invierte". Apagada por defecto en metas existentes; solo las metas con la opción activa usan la rentabilidad esperada.
- [x] **OQ-2:** Monto objetivo → **pesos de hoy**. Se ajusta por la inflación hasta la fecha objetivo (o la fecha estimada si no hay fecha) y el aporte requerido se calcula sobre ese monto.
- [x] **OQ-3:** Defaults para usuarios existentes → **neutros**: inflación 0%, rentabilidad = la tasa de proyección que ya tengan (0% por defecto), retiro 4%. Ningún número cambia al actualizar; se muestra una sugerencia para configurar los supuestos, con un atajo "Usar valores de referencia para Colombia" (ver §9).
- [x] **OQ-4:** **Unificar**: la rentabilidad esperada es la misma tasa de la proyección de ahorro del dashboard; editarla en un lugar la cambia en todos.

## 9. Supuestos de referencia — Colombia (consultado 2026-10-02)

Valores que la app ofrece como **sugerencia editable** ("Usar valores de referencia para Colombia"), siempre con fuente y fecha visibles. No se descargan en línea: se actualizan con una nueva versión de la app.

| Supuesto                        | Dato observado                                                                                                                                     | Valor de referencia propuesto                                                                                                             | Fuente                                           |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Inflación anual                 | IPC anual ago-2026: **6,24%** · promedio geométrico 2005–2025: **4,88%** · últimos 10 años: **5,63%** · meta BanRep: **3% ± 1**                    | **5%** (largo plazo: entre el promedio de 20 años y el de 10 años; por encima de la meta porque no se ha cumplido de forma sostenida)     | DANE; Banco de la República; serie histórica IPC |
| Rentabilidad esperada (nominal) | CDT 360 días promedio: **12,07% E.A.** (sem. 28-sep a 4-oct-2026) · DTF 90 días: **10,38% E.A.** · tasa de política: **12,25%** (desde 1-oct-2026) | **9% E.A.** (≈ 4% real sobre 5% de inflación). Las tasas actuales de CDT están altas por el ciclo de tasas y no se sostienen a 10–30 años | Banco de la República; reportes de mercado CDT   |
| Tasa de retiro anual            | Regla del 4% (25× el gasto anual); Morningstar sugiere 3,7% para 2026                                                                              | **4%** (sin cambio respecto al cálculo actual ×25); aviso de que 3,5–3,7% es más prudente                                                 | Literatura de retiro seguro                      |

Reglas de producto que se derivan:

- Los defaults siguen **neutros** (OQ-3); la referencia es un atajo que el usuario elige, no un valor impuesto.
- Mostrar la **rentabilidad real** resultante (rentabilidad − inflación, fórmula de Fisher) junto a los supuestos; si supera 7% real, aviso ámbar de supuesto optimista.
- Nada de esto es recomendación de inversión: copy educativo, sin nombres de productos ni entidades.

## Sign-off

- [x] Author — Claude (borrador) — 2026-10-02
- [x] Recommendation confirmed (Option A + valores §9) — Johann Medina — 2026-10-02

## Next

`/sdd-signoff discovery` → `/sdd-specify`
