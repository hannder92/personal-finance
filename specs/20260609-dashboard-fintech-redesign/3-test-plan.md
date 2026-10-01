# Test Plan: Dashboard fintech redesign

> Spec: [1-spec.md](./1-spec.md) · Plan: [2-plan.md](./2-plan.md)

## Pyramid

- Unit 12 TC · Integration/Component 15 TC · E2E 5 TC (≈37/47/16)
- Nota: feature predominantemente de UI — el peso de component tests sube sobre el ~60/30/10 del proyecto; cada TC-U agrupa múltiples casos (límites de franja, bordes de pace), lo que en conteo de casos restablece la pirámide. La cobertura de `lib/calculations/` nueva (pace, flow, snapshot) mantiene ≥80% obligatorio.

## Spec Challenge Log

| AC         | Challenge raised                                          | Resolution                                                                                                          |
| ---------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| AC-1.1     | "Hora local 8:00" requiere control del reloj en tests     | OK — `vi.setSystemTime` / Playwright clock; Given declarado                                                         |
| AC-1.2     | —                                                         | OK — copy observable vía i18n                                                                                       |
| AC-1.3     | "Persiste tras recargar" cruza unit/e2e                   | OK — unit (store+migrate) + e2e recarga real                                                                        |
| AC-2.1     | "Ajustar por días transcurridos" podía ser ambiguo        | OK — fórmula fijada en contrato `calcSpendingPace` (spentPct vs elapsedPct, días naturales por Clarification OQ-2)  |
| AC-2.2–2.3 | Umbral exacto: ¿empate (spentPct == elapsedPct) es verde? | OK — spec dice "menor **o igual**" → verde; caso límite explícito en TC-U-004                                       |
| AC-2.4     | —                                                         | OK — negativo prohíbe NaN/0%                                                                                        |
| AC-3.1     | "Texto más grande de su tarjeta" — ¿observable?           | OK — precedente spec ux-professional-polish: asserts de clase tipográfica                                           |
| AC-3.2     | —                                                         | OK — navegación observable con router real                                                                          |
| AC-3.3–3.4 | —                                                         | OK                                                                                                                  |
| AC-4.1     | Canvas no inspeccionable en jsdom                         | OK — assert sobre `:data` del wrapper (patrón existente en tests del repo); stub vue-chartjs ya en `tests/setup.ts` |
| AC-4.2–4.3 | —                                                         | OK                                                                                                                  |
| AC-5.1     | Empate de montos entre categorías: ¿orden estable?        | **SPEC-GAP menor** — orden secundario alfabético; no amerita AC nuevo, fijado en TC-I-010                           |
| AC-5.2     | —                                                         | OK                                                                                                                  |
| AC-6.1     | —                                                         | OK — Playwright viewport 390×844 + boundingBox                                                                      |
| AC-6.2–6.4 | —                                                         | OK — reusa patrón e2e de specs firmados                                                                             |

**Constitution-driven TCs** (plan toca persistencia y forms; el spec no tiene AC de seguridad/migración):

- Migración V4→V5 con payload real (Forbidden: "persisted field sin migrate()") → TC-U-010, TC-I-014
- Guard anti doble-snapshot en rollover (integridad de datos, EC-1) → TC-U-009
- XSS en campo nombre (Security: sin `v-html`, interpolación) → TC-I-002
- Paridad de claves i18n es/en (Code Style MUST) → TC-I-015

## Product Challenge Log

> UX/adoption challenges — not formula correctness.

| ID   | Challenge                                       | Spec answer                                                                                                                        | Resolved? |
| ---- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | --------- |
| PC-1 | ¿El usuario sabe qué hacer en 30s sin tutorial? | Saludo + tarjetas con label/héroe; empty states con CTA (AC-3.4, 5.2)                                                              | ✅        |
| PC-2 | ¿Por qué abriría esto mañana?                   | Badge de ritmo cambia a diario; saludo cálido; Mi Día intacto (UM-1/UM-2)                                                          | ✅        |
| PC-3 | ¿Comparación/beneficio visible en decisiones?   | Copy de pace: "Llevas el X% del gasto del mes pasado y va el Y% del mes" (AC-2.2)                                                  | ✅        |
| PC-4 | ¿Empty state comunica tono?                     | Cuatro empty states con tono definido: neutro pace (2.4), invitación patrimonio (3.4), explicativo flow (4.3), CTA actividad (5.2) | ✅        |
| PC-5 | ¿Duplica dashboard sin loop nuevo?              | Loops nuevos: comparación temporal + flujo histórico; guardado en discovery §7                                                     | ✅        |

## Traceability Matrix

| AC ID  | Unit                         | Integration        | E2E      |
| ------ | ---------------------------- | ------------------ | -------- |
| AC-1.1 | TC-U-001, TC-U-002           | TC-I-001           | —        |
| AC-1.2 | TC-U-002                     | TC-I-001           | TC-E-005 |
| AC-1.3 | TC-U-003, TC-U-010           | TC-I-002           | TC-E-005 |
| AC-2.1 | TC-U-012                     | TC-I-003, TC-I-013 | —        |
| AC-2.2 | TC-U-004                     | TC-I-003           | —        |
| AC-2.3 | TC-U-004                     | TC-I-004           | —        |
| AC-2.4 | TC-U-005                     | TC-I-005           | —        |
| AC-3.1 | TC-U-008                     | TC-I-006           | —        |
| AC-3.2 | —                            | TC-I-006           | —        |
| AC-3.3 | TC-U-008                     | TC-I-006           | —        |
| AC-3.4 | —                            | TC-I-007           | —        |
| AC-4.1 | TC-U-006, TC-U-007, TC-U-011 | TC-I-008           | —        |
| AC-4.2 | —                            | TC-I-008           | —        |
| AC-4.3 | —                            | TC-I-009           | —        |
| AC-5.1 | —                            | TC-I-010           | —        |
| AC-5.2 | —                            | TC-I-011           | —        |
| AC-6.1 | —                            | —                  | TC-E-001 |
| AC-6.2 | —                            | TC-I-012           | TC-E-002 |
| AC-6.3 | —                            | TC-I-012           | TC-E-003 |
| AC-6.4 | —                            | —                  | TC-E-004 |

Edge cases: EC-1 → TC-U-009, TC-I-013 · EC-2 → TC-U-003, TC-I-002 · EC-3 → TC-U-006 · EC-4 → TC-E-002/003 (reusa suites firmadas) · EC-5 → TC-U-005

## Acceptance Scenarios

### Scenario: AC-1.1/1.2 — saludo [TC-U-001, TC-U-002, TC-I-001]

```gherkin
Given la hora del sistema es 08:00 y no hay nombre configurado
When se renderiza el encabezado del inicio
Then muestra el texto de `dashboard.greeting.morning` y la fecha de hoy en el locale activo
And con nombre "Johann" y hora 20:00 muestra "Buenas noches, Johann"
And en los límites 5:00/12:00/19:00 la franja cambia exactamente (morning/afternoon/evening)
```

### Scenario: AC-1.3 — nombre en ajustes [TC-U-003, TC-I-002, TC-E-005]

```gherkin
Given la vista de ajustes
When escribo "Johann" (≤30 chars) y guardo, recargo la app
Then settings.userName persiste vía schema V5 y el saludo lo incluye
And al borrar el campo el saludo vuelve al genérico
And un input de 31+ chars es rechazado por el guard (EC-2)
And un input "<script>x</script>" se renderiza como texto plano (XSS)
```

### Scenario: AC-2.x — ritmo de gasto [TC-U-004, TC-U-005, TC-U-012, TC-I-003..005]

```gherkin
Given snapshot del mes anterior con totalVariableSpent=1000000, hoy es día 15 de 30 (elapsedPct=50)
When el gasto variable del mes actual es 700000 (spentPct=70)
Then status='ahead', badge rojo ↑ y copy "Llevas el 70% del gasto del mes pasado y va el 50% del mes"
And con gasto 400000 (spentPct=40) → status='below', badge verde ↓
And con spentPct == elapsedPct → 'below' (verde, "menor o igual")
And sin snapshot previo o totalVariableSpent=0 → status='none', sin badge, sin NaN, copy neutro (EC-5)
```

### Scenario: AC-3.x — patrimonio [TC-U-008, TC-I-006, TC-I-007]

```gherkin
Given activos por 5000000 y deudas por 2000000
When se renderiza la sección de patrimonio
Then hay exactamente 3 tarjetas Tengo/Debo/Neto; el monto es la tipografía mayor de cada tarjeta
And Tengo/Debo navegan a /networth y /debts; Neto a /networth (router real)
And con deudas > activos el neto se muestra rojo y negativo; en cero o positivo, verde
And sin activos ni deudas: empty state con icono y copy i18n, no tres tarjetas en $0
```

### Scenario: AC-4.x — cash flow [TC-U-006, TC-U-007, TC-U-011, TC-I-008, TC-I-009]

```gherkin
Given snapshots de 8 meses cerrados
When se construye el flow
Then la gráfica recibe 6 pares (máx), cronológicos, sin el mes en curso
And expenses = totalFixedExpenses + totalVariableSpent + debtPayments (0 si pre-V5)
And datasets con verde ingresos / rojo gastos y leyenda visible
And con <2 meses cerrados: empty state explicativo, sin canvas renderizado
```

### Scenario: AC-5.x — actividad [TC-I-010, TC-I-011]

```gherkin
Given 7 categorías con gasto variado este mes
When se renderiza la actividad del mes
Then aparecen las top 5 por gasto desc (empate → alfabético), con monto y enlace "ver todo" a /variable
And categorías con spent=0 nunca desplazan a categorías con gasto
And sin gasto del mes: empty state neutro + CTA visible para registrar el primer gasto
```

### Scenario: AC-6.x — layout y regresión [TC-I-012, TC-E-001..004]

```gherkin
Given viewport 390×844, usuario recurrente con ingresos
When abre el inicio
Then saludo + badge cobertura Mi Día + monto héroe tienen boundingBox.bottom ≤ 844 (sin scroll)
And en ≥768px el orden es saludo→MiDía→héroe→patrimonio→[flow|actividad]→tier-2, flow y actividad lado a lado
And el toggle tier-2 conserva sus reglas (suite dashboard-tier2 existente verde, secciones nuevas fuera del colapsable)
And tarjetas, "ver todo" y CTA actividad tienen área táctil ≥44×44px
```

### Scenario: rollover + migración [TC-U-009, TC-U-010, TC-I-013, TC-I-014]

```gherkin
Given lastMonthSeen="2026-05" y hoy es "2026-06-09"
When la app arranca
Then se hace append de un snapshot de 2026-05 (con totalVariableSpent y debtPayments), se resetea spent y lastMonthSeen="2026-06"
And un segundo boot el mismo mes NO duplica el snapshot (guard por month)
And un payload V4 real migra a V5: userName='' y debtPayments=0 en snapshots, sin pérdida de datos
And la hidratación puebla el store sin casts (tipo único ADR-4)
```

## Mocking Strategy

| Dependency               | Real or Mock                            | Why                                                          |
| ------------------------ | --------------------------------------- | ------------------------------------------------------------ |
| Pinia stores (unit lib/) | Real (sin Pinia — funciones puras)      | Constitución: no mockear stores en unit de `lib/`            |
| Pinia stores (component) | `createTestingPinia` con estado inicial | Patrón del repo                                              |
| vue-chartjs (`Bar`)      | Stub existente en `tests/setup.ts`      | Canvas no disponible en jsdom; se asserta `:data`/`:options` |
| Reloj del sistema        | `vi.setSystemTime` / Playwright `clock` | Franjas de saludo, pace y rollover deterministas             |
| Router                   | Real con memory history                 | Drill-down AC-3.2 verifica navegación real                   |
| localStorage             | Real (jsdom) / real (e2e)               | Migración y persistencia son el sujeto bajo prueba           |
| i18n                     | Real con mensajes completos             | Copys observables son parte de los ACs                       |

## Performance

- Chart limitado a 6 pares de barras (AC-4.1) — sin riesgo de datasets grandes.
- Lazy-mount de Chart.js fuera de alcance (IMP-006, ya excluido en spec previo); CashFlowChart monta igual que charts existentes.
- TC-E-001 verifica implícitamente que el fold no requiere scroll horizontal (UX Standards).

## Security

- TC-I-002: input nombre — guard ≤30 + trim en store; render con `{{ }}`; payload `<script>` aparece como texto (Forbidden `v-html`).
- TC-U-010 / TC-I-014: migración V4→V5 aditiva sin pérdida; `safeParse` antes de tocar stores (Forbidden: skip Zod en storage boundary).
- Fixtures con nombres ficticios; sin datos reales en tests (PII).
- Sin endpoints ni APIs externas — no aplica authz.

## Sign-off

- [x] Author — Johann Medina — 2026-06-09
