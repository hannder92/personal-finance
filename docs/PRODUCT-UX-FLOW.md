# Product & UX Flow — personal-finance

Guía operativa para alinear specs, diseño e implementación con un producto **amigable, moderno y orientado a decisiones** — no solo un registro contable preciso.

Benchmark principal: carpeta `finanzas ej/` y [Black Control](https://blackwebdigital.com/Lab/Control/).

---

## El problema que resolvemos

Hoy el flujo SDD produce specs **correctas en cálculo** pero a menudo **planas en experiencia**: muchas métricas del mismo peso, poco “qué hago hoy”, pocas comparaciones que inviten a actuar.

La referencia externa gana en:

- **Momento** (Mi Día, pagos de hoy, agenda 3 días)
- **Decisión** (efectivo vs cuotas, nieve vs avalancha)
- **Feedback emocional** (“cubrís lo pendiente”, confeti si no hay pagos)
- **Jerarquía visual** (un número héroe por card, color = estado)

Este documento integra ese mindset en **nuestro** SDD sin abandonar trazabilidad ni tests.

---

## Flujo creativo ampliado

```text
FEATURE-BRIEF.md (o equivalente en chat) — ver también repo sdd-workflow
  ↓
0-discovery.md     ← momentos, benchmark, 2 propuestas UI, recomendación IA
  ↓ sign-off
1-spec.md          ← User Moments, UI Intent, ACs observables de copy/layout
  ↓
2-plan.md          ← moment → component map + tokens visuales
  ↓
3-test-plan.md     ← Product Challenge Log (adopción, no solo fórmulas)
  ↓
4-tasks.md         ← DoD incluye copy de beneficio + empty states
  ↓
Implement (TDD)
  ↓
6-review.md        ← sección G: Product & UX feel
```

Comandos: `/sdd-discovery` → `/sdd-specify` → … (ver skill `sdd-workflow`).

---

## Fase 0.5 — Discovery (`0-discovery.md`)

### Qué debe producir la IA (obligatorio)

1. **Pregunta humana** en una frase (“¿Cubro lo que vence hoy?”).
2. **Tabla P0 / P1 / P2** — qué ve primero el usuario en móvil.
3. **Benchmark** con adopt / adapt / reject (mín. Black Control + nuestra app).
4. **Dos propuestas de layout** + **recomendación explícita** con pros/contras.
5. **Loop de feedback** (estados visibles y colores).
6. **Cuestionario según tipo** de feature (habit / decision / overview / input).

### Preguntas por tipo de feature

| Tipo                                | Preguntas clave                                 | La IA debe proponer                         |
| ----------------------------------- | ----------------------------------------------- | ------------------------------------------- |
| **Habit** (Mi Día, objetivo diario) | ¿Por qué abrir mañana? ¿Micro-logro visible?    | Card de progreso %, empty state aliviado    |
| **Decision** (deudas, simuladores)  | ¿Escenario A vs B? ¿Beneficio en palabras?      | Comparación lado a lado + badge de ahorro   |
| **Overview** (análisis mensual)     | ¿Proyectado vs pagado vs pendiente?             | Tres totales con color semántico            |
| **Input** (ingresos, gastos)        | ¿Qué ejemplo en placeholder? ¿Toggle secciones? | Bloques activables, placeholders educativos |

---

## Fase 1 — Spec (`1-spec.md`)

Además de ACs funcionales, incluir ACs **observables de UI** cuando aplique:

- P0 visible en 390×844 sin scroll
- Badge de estado con copy i18n concreto
- Jerarquía tipográfica (héroe > secundario)
- Empty state con tono (no “Sin datos” solo)
- Línea de contexto bajo métrica no obvia
- Beneficio humano en comparaciones

Ejemplo de AC de cobertura:

| Given | Pagos que vencen hoy suman $500.000; liquidez operativa es $800.000 |
| When | Usuario abre inicio a las 8:00 |
| Then | Badge visible con mensaje equivalente a “Cubres lo pendiente de hoy” |
| Negative | No mostrar solo $800.000 sin compararlo con los $500.000 |

---

## Principios visuales (implementación)

Alineados con `constitution.md` v5:

| Principio        | Implementación Tailwind (orientativa)                    |
| ---------------- | -------------------------------------------------------- |
| Card cálida      | `rounded-xl border shadow-sm bg-white dark:bg-slate-900` |
| Label de sección | `text-xs uppercase tracking-wide text-slate-500`         |
| Número héroe     | `text-3xl sm:text-4xl font-bold tabular-nums`            |
| Estado OK        | `bg-emerald-50 text-emerald-800 border-emerald-200`      |
| Atención         | `bg-amber-50 text-amber-900 border-amber-200`            |
| Shortfall        | `bg-rose-50 text-rose-900 border-rose-200`               |
| Icono de sección | `lucide-vue-next`, color acorde al bloque                |
| Ritmo            | `gap-4` o `gap-6` entre cards; evitar grids densos en P0 |

**Orden sugerido en dashboard operacional:**

1. Cobertura / liquidez vs pendiente hoy
2. Pagos de hoy
3. Próximos 3–7 días
4. Disponible del mes + salud (analítico, P1)
5. Gráficos y FIRE (P2)

---

## Product Challenge Log (test plan)

Antes de implementar, el test plan debe responder:

| ID   | Pregunta                                  |
| ---- | ----------------------------------------- |
| PC-1 | ¿Acción clara en 30 s sin tutorial?       |
| PC-2 | ¿Retorno diario (habit)?                  |
| PC-3 | ¿Beneficio visible (decision)?            |
| PC-4 | ¿Empty state con tono?                    |
| PC-5 | ¿Evita duplicar dashboard sin loop nuevo? |

---

## Review — sección G

Antes de merge, verificar manualmente en 390×844:

- [ ] Lo prometido en User Moments está arriba del fold
- [ ] Un héroe por card
- [ ] Colores = estado
- [ ] Context lines presentes
- [ ] Empty states probados
- [ ] Comparaciones muestran beneficio en lenguaje humano

---

## Corpus de benchmark

| Recurso                                                        | Uso                               |
| -------------------------------------------------------------- | --------------------------------- |
| `finanzas ej/*.jpeg`                                           | Capturas congeladas para teardown |
| [Black Control live](https://blackwebdigital.com/Lab/Control/) | Mi Día, calendario, simuladores   |
| Nuestra app (`npm start`)                                      | Contraste “antes” en discovery    |

---

## Próxima feature piloto

`specs/20260530-mi-dia-cobertura/` — primer experimento del flujo completo: cobertura de vencimientos + pagos de hoy + UI card-based en dashboard.
