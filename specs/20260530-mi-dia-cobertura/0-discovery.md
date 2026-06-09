# Discovery: Mi Día — cobertura y vencimientos

> Feature: `20260530-mi-dia-cobertura` · Date: `2026-05-29`  
> Benchmark: `finanzas ej/` · [Black Control — Mi Día](https://blackwebdigital.com/Lab/Control/)

## 1. Moment & question

| Field                     | Value                                                                          |
| ------------------------- | ------------------------------------------------------------------------------ |
| **When**                  | Mañana (7–9am) o al recordar un pago; también revisión rápida al mediodía      |
| **Horizon**               | `today` (+ vista `week` de 3 días)                                             |
| **Trigger**               | “¿Me alcanza la plata para lo que vence hoy?”                                  |
| **Question (1 sentence)** | ¿Cubro con mi liquidez lo que debo pagar hoy y qué viene en los próximos días? |
| **Feature type**          | `habit` + `overview` (cobertura operativa, no simulador)                       |

## 2. What the user must see (UI intent)

| Priority | User sees                                                                            | User must NOT see first                     |
| -------- | ------------------------------------------------------------------------------------ | ------------------------------------------- |
| **P0**   | Badge de cobertura (cubro / faltan $X) + total liquidez operativa                    | Gráficos, FIRE, runway, donut de allocation |
| **P0**   | Lista “Pagos de hoy” (tarjetas/préstamos con vencimiento hoy) o empty state aliviado | KPI strip de 5 métricas                     |
| **P1**   | Agenda próximos 3 días (conteo + montos)                                             | Health score desplegable                    |
| **P2**   | Disponible mensual + salud (bloque actual DashboardHero)                             | Proyección 12 meses                         |

### Emotional target

- [x] Relief — “Sin pagos para hoy” con tono positivo
- [x] Clarity — un badge responde cubro / no cubro
- [x] Urgency — “Faltan $X para cubrir hoy” en ámbar/rojo
- [ ] Confidence — comparación de estrategias (fuera de alcance aquí)

## 3. Benchmark teardown

| Reference                   | Pattern                                                         | Adopt / Adapt / Reject     | Why                                                              |
| --------------------------- | --------------------------------------------------------------- | -------------------------- | ---------------------------------------------------------------- |
| Black Control — Mi Día      | Objetivo diario, Pagos de hoy, Agenda 3 días, capital por canal | **Adapt**                  | Tomamos cobertura + vencimientos; objetivo diario % queda fase 2 |
| Black Control — Análisis    | Proyectado / pagado / pendiente                                 | **Adapt** (fase posterior) | Este spec solo cubre **pendiente de hoy** vs liquidez            |
| Nuestra app — Dashboard     | Disponible mensual + muchos KPIs/charts                         | **Reject** como P0         | Correcto analíticamente pero no responde “hoy” en 10s            |
| Nuestra app — DueDateAlerts | Vencimientos 7 días en deudas                                   | **Adapt**                  | Reutilizar lógica; subir a inicio y acotar a hoy + 3 días        |

## 4. Feedback loop

```text
liquidez operativa  vs  pagos que vencen hoy
        ↓
   CUBRES / FALTAN $X  (badge P0)
        ↓
   Pagos de hoy (detalle)  →  tap lleva a Deudas si aplica
        ↓
   Próximos 3 días (anticipación)
```

| State                    | Visible signal                        | Color / copy intent                           |
| ------------------------ | ------------------------------------- | --------------------------------------------- |
| Sin vencimientos hoy     | “Sin pagos para hoy” + icono aliviado | Neutro / verde suave                          |
| Cubierto                 | “Cubres lo pendiente de hoy”          | Verde                                         |
| Shortfall                | “Faltan $X para cubrir hoy”           | Ámbar si gap <20% liquidez; rojo si gap mayor |
| Sin liquidez configurada | Invitar a registrar efectivo/ahorros  | Neutro + CTA patrimonio                       |

## 5. AI proposals (mandatory)

### Option A — “Mi Día” arriba del dashboard (recomendada)

- **Layout:** Nueva sección `DayOverview` **encima** de DashboardHero en `/`. Tres cards apiladas: (1) Cobertura + liquidez, (2) Pagos hoy, (3) Próximos 3 días. Hero mensual baja a P1.
- **Pros:** Mínimo cambio de rutas; usuario existente gana hábito diario sin nuevo tab; reutiliza stores.
- **Cons:** Dashboard sigue largo; analítico queda más abajo.
- **Best when:** Queremos validar mindset rápido sin reestructurar nav.

### Option B — Tab “Mi Día” en bottom nav

- **Layout:** Ruta `/today` con solo las 3 cards; dashboard queda 100% analítico.
- **Pros:** Separación clara operativo vs analítico; parecido a Black Control.
- **Cons:** Más trabajo nav + descubrimiento; usuario debe aprender nuevo tab.
- **Best when:** Dashboard ya está saturado y queremos identidad “app diaria”.

### ✅ Recommendation

**Option A** para este spec (size **S**): máximo impacto con menos superficie. Reevaluar Option B en spec `ux-clarity-phase2` si el scroll del inicio sigue siendo problema.

**Rejected for now:** Objetivo diario % (habit gamification) — spec separado `objetivo-diario` para no mezclar schema nuevo + UI en un solo PR.

## 6. Feature-type questionnaire (habit + overview)

- **¿Por qué abriría mañana?** Para saber si puede pagar lo que vence hoy sin abrir Deudas + Patrimonio + calcular mentalmente.
- **¿Micro-logro visible?** Badge verde “Cubres lo pendiente” o empty “Sin pagos para hoy”.
- **Empty state:** Alivio, no culpa — copy tipo Black Control (“Sin pagos para hoy”), no “No hay datos”.
- **Proyectado vs real:** Fuera de alcance; solo **pendiente calendario hoy** vs **liquidez actual**.

## 7. Anti-patterns & scope guard

| Risk                                | Mitigation                                                           |
| ----------------------------------- | -------------------------------------------------------------------- |
| Duplicar DueDateAlerts sin valor    | Subir a P0 con badge de cobertura (loop nuevo)                       |
| Otra métrica suelta                 | Un solo héroe por card: badge O lista, liquidez secundaria           |
| Spreadsheet en móvil                | Cards apiladas, no tabla de 5 columnas                               |
| Gastos fijos sin día de vencimiento | v1 solo tarjetas/préstamos con `dueDate`; gastos fijos → OQ-1 fase 2 |

## 8. Open questions → spec

- [ ] **OQ-1:** ¿Agregar `dueDay` (1–31) a gastos fijos en v1 o fase 2? → **Decisión: fase 2** (evita migración en piloto UI).
- [ ] **OQ-2:** ¿Liquidez = solo cash+savings o incluir inversiones líquidas? → **Decisión: misma definición que `calcLiquidAssetsTotal`** (consistencia runway).

## Sign-off

- [x] Author — Johann Medina — 2026-06-04
- [x] Recommendation confirmed — Option A — `2026-05-29`

## Next

`/sdd-specify` → `1-spec.md`
