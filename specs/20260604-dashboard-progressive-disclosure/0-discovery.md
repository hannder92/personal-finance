# Discovery: Dashboard progressive disclosure (mobile hierarchy)

> Feature: `20260604-dashboard-progressive-disclosure` · Date: `2026-06-04`  
> Prerequisite: Mi Día ya integrado en inicio (spec `20260530-mi-dia-cobertura`, Option A)  
> Benchmark: `finanzas ej/` · [Black Control — Mi Día](https://blackwebdigital.com/Lab/Control/)  
> Source: evaluación IMP-001

## 1. Moment & question

| Field                     | Value                                                                                                   |
| ------------------------- | ------------------------------------------------------------------------------------------------------- |
| **When**                  | Mañana (7–9am) o pausa del día — apertura habitual de la app                                            |
| **Horizon**               | `today` (P0 operativo) · `month` (P1 analítico bajo demanda)                                            |
| **Trigger**               | Usuario abre Inicio para chequeo rápido antes de seguir con su día                                      |
| **Question (1 sentence)** | ¿Estoy bien hoy y cuánto me queda disponible — sin tener que hacer scroll por todo el análisis mensual? |
| **Feature type**          | `habit` (retorno diario) + `overview` (analítico accesible pero no intrusivo)                           |

## 2. What the user must see (UI intent)

| Priority                           | User sees                                                                                          | User must NOT see first                         |
| ---------------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| **P0** (above fold mobile)         | Mi Día: badge cobertura + pagos hoy + agenda 3 días                                                | Gráficos, KPI strip, runway, health score, FIRE |
| **P0**                             | Disponible del mes (número héroe + salud resumida)                                                 | Brecha de ahorro, donut, proyección 12 meses    |
| **P1** (mismo scroll, bajo toggle) | Bloque “Análisis del mes”: KPIs, runway, libertad financiera compacta, salud desplegable, gráficos | —                                               |
| **P2**                             | Detalle en pantallas dedicadas (Ingresos, Deudas, Libertad financiera)                             | Duplicar esas pantallas completas en inicio     |

### Emotional target

- [x] Relief — chequeo diario sin ruido analítico
- [x] Clarity — dos capas claras: “hoy” vs “análisis del mes”
- [ ] Urgency — ya cubierto por Mi Día (no regresar)
- [x] Confidence — analítico sigue disponible con un gesto explícito (“Ver más”)

## 3. Benchmark teardown

| Reference                            | Pattern                                   | Adopt / Adapt / Reject    | Why                                                                          |
| ------------------------------------ | ----------------------------------------- | ------------------------- | ---------------------------------------------------------------------------- |
| Black Control — Mi Día               | Pantalla operativa separada del analítico | **Adapt**                 | No creamos tab nuevo; comprimimos analítico bajo toggle en la misma pantalla |
| Black Control — Análisis             | Métricas mensuales en sección distinta    | **Adapt**                 | Tier 2 agrupa lo que hoy compite con Mi Día en scroll                        |
| Nuestra app — inicio actual          | Mi Día + hero + 8+ bloques apilados       | **Reject** como layout P0 | Mi Día resolvió el “qué hoy”; el scroll largo sigue matando el hábito        |
| Nuestra app — spec Mi Día Option A   | Integrar operativo arriba del analítico   | **Adapt**                 | Era el paso 1; este spec es el paso 2 (disclosure)                           |
| `finanzas ej/` — cards con jerarquía | Un héroe por card, secciones respiradas   | **Adopt**                 | Tier 1 mantiene ritmo vertical generoso; tier 2 colapsado evita densidad     |

## 4. Feedback loop

```text
Abrir Inicio
    ↓
Tier 1 visible (Mi Día + disponible mensual)  →  usuario responde “¿estoy bien hoy?”
    ↓
¿Necesita profundizar?
    ├─ No → cierra app (hábito cumplido en <10s)
    └─ Sí → tap “Ver análisis del mes”
              ↓
         Tier 2 expandido (KPIs, gráficos, runway…)
              ↓
         Tap en card / CTA → pantalla dedicada (loop cerrado)
```

| State            | Visible signal                                                          | Color / copy intent                                              |
| ---------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Tier 1 solo      | Mi Día + hero mensual; control “Ver análisis del mes” visible           | Neutro; CTA secundario (outline), no compite con badge cobertura |
| Tier 2 colapsado | Hint opcional: “KPIs, gráficos y proyección” bajo el botón              | Texto secundario slate-500                                       |
| Tier 2 expandido | Bloque analítico completo; control cambia a “Ocultar análisis”          | Misma jerarquía que hoy, pero bajo un solo contenedor            |
| Sin ingresos     | Tier 1 con empty states; tier 2 colapsado (gráficos vacíos no compiten) | Neutro + invitación a configurar ingresos en hero                |

## 5. AI proposals (mandatory)

### Option A — Un solo bloque colapsable “Análisis del mes” (recomendada)

- **Layout:** Tier 1 fijo: Mi Día (3 cards) + card Disponible del mes. Debajo, un control único expande/colapsa todo el analítico restante (brecha ahorro, KPI strip, runway, health, gráficos) en un contenedor visualmente agrupado.
- **Pros:** Un gesto aprendible; mobile cumple P0 en ~2 pantallas de scroll máximo; reutiliza todas las cards existentes sin reordenar nav; coherente con apuesta Option A de Mi Día.
- **Cons:** Usuario power que quiere KPIs diarios necesita un tap extra cada sesión (mitigable con memoria de sesión).
- **Best when:** Queremos reducir scroll sin fragmentar la app ni crear rutas nuevas.

### Option B — Tab “Análisis” en navegación inferior

- **Layout:** Inicio = solo Mi Día + hero; tab nuevo con todo lo analítico.
- **Pros:** Separación máxima operativo vs analítico; parecido a Black Control.
- **Cons:** Coste de descubrimiento; más trabajo de nav e i18n; contradice decisión previa de no añadir `/today`; usuarios actuales pierden vista unificada.
- **Best when:** El inicio sigue saturado _después_ de disclosure y el analítico se usa raramente.

### Option C — Acordeones múltiples (un toggle por grupo)

- **Layout:** Tres toggles: “Salud y KPIs”, “Proyección y gráficos”, “Ahorro y FIRE”.
- **Pros:** Control granular; power users abren solo lo que necesitan.
- **Cons:** Tres decisiones en lugar de una; más copy; riesgo de “accordion fatigue”; peor para hábito diario.
- **Best when:** Audiencia mayoritariamente analítica en desktop — no nuestro caso mobile-first.

### ✅ Recommendation

**Option A** — un solo bloque colapsable “Análisis del mes”.

**Por qué:** Cierra el riesgo explícito del spec Mi Día (“dashboard sigue largo”) con el menor cambio de IA y sin romper nav. Option B queda reservada si tras medir adopción el tier 2 sigue infrautilizado. Option C añade fricción sin mejorar el loop diario.

**Memoria de estado:** Colapsado por defecto en móvil; si el usuario expande, recordar solo **durante la sesión del navegador** (no persistir en datos financieros). En viewport ancho (desktop), tier 2 **siempre visible** — el problema es mobile scroll, no desktop densidad.

**Rejected for now:** Eliminar bloques analíticos del inicio — el usuario de fin de mes aún los necesita en un solo lugar.

## 6. Feature-type questionnaire

### Habit (retorno diario)

- **¿Por qué abriría mañana?** Para confirmar cobertura y disponible en segundos, no para revisar 12 gráficos.
- **¿Micro-logro visible?** Badge Mi Día + número disponible del mes — sin scroll analítico.
- **Empty state:** Tier 1 mantiene empty states actuales; tier 2 oculto evita “muralla de gráficos vacíos”.

### Overview (analítico bajo demanda)

- **¿Proyectado vs real vs pendiente?** Sigue en tier 2 y pantallas dedicadas — no duplicar lógica.
- **¿Acción si estado malo?** CTAs existentes en Mi Día (deudas, patrimonio) permanecen en P0; tier 2 es profundización opcional.

## 7. Anti-patterns & scope guard

| Risk                                         | Mitigation                                                                             |
| -------------------------------------------- | -------------------------------------------------------------------------------------- |
| Duplicar dashboard sin loop nuevo            | No añade métricas; reorganiza jerarquía de las existentes                              |
| Ocultar analítico crítico sin rastro         | Control “Ver análisis del mes” siempre visible bajo tier 1; copy indica qué hay dentro |
| Spreadsheet en móvil P0                      | Tier 1 = máx. 4 cards apiladas (Mi Día ×3 + hero)                                      |
| Romper e2e Mi Día above-fold                 | Tier 1 orden intacto: Mi Día antes de hero; tier 2 no intercalado                      |
| Persistir preferencia en localStorage schema | Solo sessionStorage para UI — fuera de Zod/schema                                      |

## 8. Open questions → spec

- [x] **OQ-1:** ¿Viewport desktop (≥768px) muestra tier 2 siempre expandido sin toggle? → **Decisión: sí** (confirmado 2026-06-04).
- [x] **OQ-2:** ¿Usuario sin ingresos ve tier 2 colapsado por defecto aunque haya expandido en sesión anterior? → **Decisión: sí, colapsado** (confirmado 2026-06-04).
- [x] **OQ-3:** ¿Copy del control: “Ver análisis del mes” / “Ocultar análisis” o “Ver más” genérico? → **Decisión: específico** (confirmado 2026-06-04).

## Sign-off

- [x] Author — Johann Medina — 2026-06-04
- [x] Recommendation confirmed (Option A) — Johann Medina — 2026-06-04

## Next

Resolver OQ-1…OQ-3 en sign-off o `/sdd-clarify` → `/sdd-specify`
