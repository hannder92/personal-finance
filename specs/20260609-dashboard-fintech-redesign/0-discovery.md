# Discovery: Dashboard fintech redesign

> Feature: `20260609-dashboard-fintech-redesign` · Date: `2026-06-09`  
> Prerequisite for `size_class` **M+** · Recommended for all user-facing features  
> Benchmark corpus: imagen de referencia del usuario (`assets/benchmark-fintech-dashboard.png`) · [Black Control](https://blackwebdigital.com/Lab/Control/)

## 1. Moment & question

| Field                     | Value                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------- |
| **When**                  | Mañana (chequeo diario) y revisiones recurrentes durante el mes                             |
| **Horizon**               | `month` (preservando el tier `today` de Mi Día)                                             |
| **Trigger**               | Abrir la app para confirmar cómo está el dinero y si el mes va mejor o peor que el anterior |
| **Question (1 sentence)** | "¿Cómo está mi dinero hoy y estoy gastando más o menos que el mes pasado?"                  |
| **Feature type**          | `overview`                                                                                  |

## 2. What the user must see (UI intent)

| Priority                        | User sees                                                                                                                                                       | User must NOT see first                               |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| **P0** (above fold mobile)      | Saludo con fecha de hoy; badge de cobertura de Mi Día; disponible del mes con **% de gastos vs mes anterior** (badge verde/rojo)                                | KPIs analíticos, gráficos de proyección, health score |
| **P1** (same screen, scroll)    | Fila de tarjetas de patrimonio (activos, deudas/tarjetas, neto); gráfica **cash flow ingresos vs gastos** (barras, últimos 6 meses); actividad reciente del mes | Tablas densas, métricas FIRE                          |
| **P2** (secondary / drill-down) | Bloque analítico existente (KPIs, runway, salud, proyecciones) bajo el toggle "Ver análisis del mes"                                                            | —                                                     |

### Emotional target

- [x] Relief (nothing due / covered)
- [x] Clarity (one number answers the question)
- [ ] Urgency (shortfall visible with amount)
- [x] Confidence (comparison shows benefit of action)

## 3. Benchmark teardown

| Reference                | Pattern                                                                | Adopt / Adapt / Reject                  | Why                                                                                                                                                              |
| ------------------------ | ---------------------------------------------------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Imagen fintech (usuario) | Saludo personalizado + fecha ("Good morning, Alex")                    | **Adapt**                               | Adopta el tono cálido; el nombre es opcional (hoy la app no lo pide) → saludo por franja horaria con nombre si está configurado                                  |
| Imagen fintech (usuario) | "Your Accounts" — tarjetas con saldos por cuenta bancaria              | **Adapt**                               | No hay cuentas bancarias conectadas; se mapea a tarjetas de patrimonio: activos, deudas/tarjetas y neto, con color semántico                                     |
| Imagen fintech (usuario) | Cash Flow — barras ingresos vs gastos últimos 6 meses                  | **Adopt**                               | La app ya guarda resúmenes mensuales (hasta 24 meses); cierra el loop "¿voy mejor que antes?" hoy ausente del inicio                                             |
| Imagen fintech (usuario) | Recent Transactions — lista de movimientos con fecha                   | **Adapt**                               | No existe registro de movimientos individuales con fecha; v1 muestra "actividad del mes" desde gasto variable por categoría (OQ-1 decide si se construye ledger) |
| Imagen fintech (usuario) | Barra de búsqueda de transacciones + botón "Add Transaction" en header | **Reject** (búsqueda) / **Adapt** (CTA) | Sin ledger no hay qué buscar; la CTA rápida de registrar gasto ya existe como botón flotante y se conserva                                                       |
| Imagen fintech (usuario) | Sidebar de navegación izquierda                                        | **Reject**                              | Mobile-first con navegación inferior ya constitucional; un sidebar duplicaría navegación y excede alcance (clase L)                                              |
| Black Control — Mi Día   | Momento diario: cobertura + pagos de hoy arriba                        | **Adopt** (mantener)                    | Ya implementado y firmado en specs previos; el rediseño no debe degradarlo                                                                                       |
| Our app — current        | Inicio = título plano + Mi Día + héroe + tier analítico colapsable     | **Adapt**                               | La jerarquía funciona pero es fría: sin saludo, sin comparación temporal, sin vista de patrimonio ni flujo histórico en P1                                       |

## 4. Feedback loop

```text
Gasto del mes (real) → comparación vs mes anterior → verde (gasté menos) / rojo (gasté más)
→ acción: revisar actividad del mes o expandir análisis
```

| State                                            | Visible signal                      | Color / copy intent                                |
| ------------------------------------------------ | ----------------------------------- | -------------------------------------------------- |
| Gasté menos que el mes pasado                    | Badge `↓ -X%` junto al disponible   | Verde — "Vas mejor que el mes pasado"              |
| Gasté más que el mes pasado                      | Badge `↑ +X%` junto al disponible   | Rojo — "Llevas X% más de gasto que en <mes>"       |
| Sin mes anterior (primer mes)                    | Sin badge; línea de contexto neutra | Gris — "Desde el próximo mes verás tu comparación" |
| Flujo mensual positivo (barra ingresos > gastos) | Par de barras verde/rojo por mes    | Verde ingresos / rojo gastos (semántica constante) |

## 5. AI proposals (mandatory — pick one)

### Option A — Refresh del inicio en capas (evolución)

- **Layout:** (1) Header con saludo por franja horaria + fecha; (2) Mi Día intacto; (3) héroe de disponible mensual enriquecido con badge % vs mes anterior; (4) **nueva fila** de tarjetas de patrimonio (activos / deudas / neto); (5) sección dos columnas en desktop: gráfica cash flow 6 meses + actividad del mes; (6) tier analítico colapsable intacto al final.
- **Pros:** Preserva specs firmados (Mi Día, progressive disclosure); mobile-first natural; tamaño M manejable; cada bloque nuevo cierra un loop propio.
- **Cons:** El inicio queda más largo en scroll P1; no replica 1:1 la estética del benchmark (sin sidebar ni búsqueda).
- **Best when:** Se quiere el beneficio del benchmark (calidez + comparación + flujo) sin rehacer navegación ni romper el hábito diario ya validado.

### Option B — Réplica fintech completa (reestructura)

- **Layout:** Header con saludo + búsqueda + CTA prominente; grid de cuentas arriba del todo; cash flow + transacciones como protagonistas centrales; el analítico mensual se muda a una pantalla dedicada; sidebar en desktop.
- **Pros:** Máxima fidelidad visual al benchmark; desktop muy aprovechado.
- **Cons:** Rompe AC firmados de Mi Día above-the-fold y del toggle de análisis; requiere ledger de transacciones + búsqueda + nueva ruta → clase **L** (habría que dividir); duplica navegación existente.
- **Best when:** Hubiera cuentas bancarias reales y registro de movimientos individual ya construido.

### ✅ Recommendation

**Option A** porque entrega lo que el usuario valoró del benchmark — calidez del saludo, gráfica de flujo, comparación % vs mes anterior y vista de movimientos — sin invalidar los specs firmados de Mi Día y progressive disclosure, y manteniendo el feature en clase M.

**Rejected for now:** Option B — exige ledger de transacciones, búsqueda y nueva navegación (clase L). Si OQ-1 concluye que el ledger es imprescindible, se propone como feature separado posterior.

## 6. Feature-type questionnaire

### If `overview` (month/year)

- **¿Proyectado vs real vs pendiente?** La gráfica cash flow muestra ingreso real vs gasto real por mes (6 meses); el héroe mantiene disponible (proyectado del mes); la comparación % usa real del mes vs real del mes anterior.
- **¿Qué acción desbloquea si el estado es malo?** Badge rojo → línea de contexto invita a revisar la actividad del mes (categorías con mayor gasto) o expandir el análisis; CTA de registrar gasto sigue a un tap.

## 7. Anti-patterns & scope guard

| Risk                                   | Mitigation                                                                                                                                                             |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Another metric without action          | El badge % siempre lleva línea de contexto con qué hacer ("revisa tus gastos de <categoría top>")                                                                      |
| Duplicates dashboard without new loop  | Loops nuevos: comparación temporal (antes ausente) y flujo histórico; las tarjetas de patrimonio reutilizan datos pero con jerarquía nueva, no repiten KPIs del tier 2 |
| Spreadsheet density on mobile          | Tarjetas de patrimonio en carrusel/stack vertical en 390px; gráfica con máx. 6 pares de barras; actividad limitada a 4–5 filas con "ver todo"                          |
| Romper specs firmados (Mi Día, tier 2) | Option A no toca orden ni reglas de esos bloques; regresión verificada en fase 5.5                                                                                     |

## 8. Open questions → spec

- [x] **OQ-1:** "Transacciones recientes" — ¿v1 se adapta a actividad por categoría del mes (sin fechas individuales) o se construye un registro de movimientos con fecha (ledger)? Lo segundo empuja a dividir el feature.
- [x] **OQ-2:** Comparación % vs mes anterior — ¿qué base usa exactamente (gasto fijo + variable, o solo variable)? ¿Y el primer mes sin histórico?
- [x] **OQ-3:** Saludo — ¿se añade campo de nombre opcional en ajustes o saludo genérico por franja horaria ("Buenos días")?
- [x] **OQ-4:** Tarjetas de patrimonio — ¿tres fijas (activos / deudas / neto) o una por cada activo registrado como en el benchmark?

## Clarifications (2026-06-09)

| OQ       | Decisión                                                                                                                                                                                                                                                                                                                                   |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **OQ-1** | Actividad del mes por categoría (sin fechas individuales). Ledger de movimientos = posible feature separado futuro; fuera de alcance aquí.                                                                                                                                                                                                 |
| **OQ-2** | Dos bases, una por card: (a) badge del héroe = **ritmo de gasto variable** — "llevas X% del gasto variable del mes pasado vs Y% del mes transcurrido"; rojo si el ritmo va adelantado, verde si va por debajo, neutro sin histórico. (b) Gráfica cash flow = **gasto total** (fijos + variables + deuda) vs ingresos, por **mes cerrado**. |
| **OQ-3** | Campo de nombre **opcional** en ajustes; fallback saludo por franja horaria ("Buenos días/tardes/noches"). Dato local en el dispositivo, nunca obligatorio.                                                                                                                                                                                |
| **OQ-4** | Tres tarjetas fijas — **Tengo / Debo / Neto** — con drill-down a las vistas de detalle. No una tarjeta por activo.                                                                                                                                                                                                                         |

## Sign-off

- [x] Author — Johann Medina — 2026-06-09
- [x] Recommendation confirmed (Option A) — Johann Medina — 2026-06-09

## Next

`/sdd-specify` using User Moments from this doc → `1-spec.md`
