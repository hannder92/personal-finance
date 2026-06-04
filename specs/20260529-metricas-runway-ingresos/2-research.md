# Research: Fórmulas financieras — audit antes de especificar

> Feature: `20260529-metricas-runway-ingresos` · Date: `2026-05-29`  
> Propósito: separar fórmulas **estándar / respaldadas** de narrativa del curso antes de escribir ACs.

## Veredicto ejecutivo

| Fórmula                               | ¿Válida?                                    | Fuente / nota                                 | En la app hoy                                   |
| ------------------------------------- | ------------------------------------------- | --------------------------------------------- | ----------------------------------------------- |
| Flujo de caja = Ingresos − Egresos    | ✅ Identidad contable                       | Definición universal                          | `useNetIncome` → `freeForAllocation`            |
| Patrimonio = Activos − Pasivos        | ✅ Identidad contable                       | Definición universal                          | `calcNetWorth`                                  |
| Runway = Líquido ÷ Gasto mensual      | ✅ Estándar PF                              | Emergency fund / runway calculators           | Parcial: `emergencyMonths` usa fórmula distinta |
| FIRE meta = Gasto anual × 25          | ✅ Empírica (no garantía)                   | Trinity Study / regla 4% (Bengen 1994)        | `calcFinancialFreedom`                          |
| IP + IR ≥ Gastos = libertad por flujo | ✅ Definición operativa                     | No es “ley”; es criterio de cobertura mensual | ❌ No implementado                              |
| Interés compuesto: P×(1+r)ⁿ           | ✅ Matemática                               | Fórmula estándar                              | `calcCompoundGrowth`                            |
| Ahorro lineal: aporte × meses         | ✅ Aritmética                               | No es compuesto                               | `calcHypotheticalSavings`                       |
| RCAA = % fijo antes de gastar         | ✅ Heurística conductual                    | Pay-yourself-first; no fórmula única          | Allocation + `SavingsGapCard`                   |
| “Tiempo de vida” del curso            | 🟡 = Runway si líquido/gasto bien definidos | Mismo número que emergency runway             | Nombre distinto, misma fórmula                  |
| Cuadrante EADI / % tiempo por tipo    | 🟡 Taxonomía, no fórmula                    | Kiyosaki — clasificación, no ecuación         | ❌                                              |
| Termostato / ley dar-recibir          | ❌ No ingeniería                            | Excluir de producto                           | —                                               |

---

## 1. Runway (tiempo de vida financiero)

### Fórmula estándar

```text
runwayMonths = liquidAssets / monthlyLivingExpense
```

- **Líquido:** efectivo y equivalentes convertibles en días, sin penalización material ([CFPB emergency fund guidance](https://www.consumerfinance.gov/); calculadoras PF convergen en la misma división).
- **Gasto mensual:** costo de vida para mantener el nivel actual (fijos + variables esenciales; algunas fuentes usan solo esenciales — hay que fijar en ADR).

### Variante con ingreso parcial (burn neto)

```text
netBurn = max(0, monthlyLivingExpense − monthlyPassiveAndResidualIncome)
runwayMonths = liquidAssets / netBurn   (si netBurn > 0)
runwayMonths = ∞                        (si netBurn = 0)
```

Usada en calculadoras de “partial burn” cuando aún hay ingresos en transición.

### Lo que NO es runway

- Dividir solo entre **fijos + deuda** (como hace hoy `useHealthScore.emergencyMonths`) — es una métrica de **fondo de emergencia mínimo**, no de “meses de vida al estilo actual”.
- Incluir **inmuebles/vehículos** en el numerador — son ilíquidos por definición operativa.

### Inconsistencia actual en el repo

| Ubicación             | Numerador                   | Denominador       |
| --------------------- | --------------------------- | ----------------- |
| `useFinancialFreedom` | cash + savings + investment | fijos + variables |
| `useHealthScore`      | cash + savings              | fijos + deuda     |

**Recomendación para spec:** una función pura `calcFinancialRunway()` + ADR que unifique qué tipos son líquidos.

---

## 2. Libertad financiera — dos modelos complementarios

### A) Modelo capital (FIRE / Trinity)

```text
targetPatrimony = monthlyLivingExpense × 12 × 25
progress = liquidAssets / targetPatrimony
```

- **Origen:** Bengen (1994), Cooley/Hubbard/Walz “Trinity Study” (1998, _AAII Journal_).
- **Supuesto:** cartera diversificada acciones/bonos; retiro inicial 4% ajustado por inflación; horizonte ~30 años.
- **Limitaciones documentadas:** datos históricos EE.UU.; jubilación anticipada larga → muchos usan 3.5% (≈28.6×); riesgo de secuencia de retornos; no modela impuestos COL.
- **Veredicto:** ✅ **Correcto como heurística FIRE**; la app ya lo implementa bien en `financial-freedom.ts`.

### B) Modelo flujo (curso: IP + IR ≥ gastos)

```text
passiveCoverage = (monthlyPassiveIncome + monthlyResidualIncome) / monthlyLivingExpense
isCashFlowFree = passiveCoverage >= 1
gapToFreedom = max(0, monthlyLivingExpense − (IP + IR))
```

- **Origen:** definición operativa de “ingresos no lineales cubren gastos” — no es paper académico, pero es **medible y falsable**.
- **No contradice FIRE:** FIRE pregunta “¿cuánto capital necesito?”; flujo pregunta “¿mis ingresos pasivos/residuales ya pagan la factura?”.
- **Veredicto:** ✅ **Válido como métrica de producto** siempre que IP/IR estén definidos por el usuario (no inferidos mágicamente).

---

## 3. Interés compuesto (ya en repo)

```text
monthlyRate = (1 + annualRatePercent/100)^(1/12) − 1
valueAfterM = balance × (1 + monthlyRate)^M
```

Implementado en `calcCompoundGrowth`. ✅ Matemática estándar.

**Ahorro hipotético lineal** (sin reinversión de aportes):

```text
cumulative = netIncome × (savingsPercent/100) × months
```

✅ Correcto como escenario “¿y si aparto X% sin tasa?” — no confundir con compuesto.

---

## 4. Tipos de ingreso (E / lineal, I / residual, I / pasivo)

No hay fórmula universal — es **taxonomía**:

| Tipo     | Definición operativa propuesta                                          |
| -------- | ----------------------------------------------------------------------- |
| Lineal   | Requiere intercambio tiempo↔dinero (~100% esfuerzo activo)              |
| Residual | Ingreso decae lentamente sin tiempo proporcional (regalías, comisiones) |
| Pasivo   | Ingreso sin tiempo marginal (rentas, dividendos, intereses)             |

**Monthly equivalent** para streams no mensuales (ya existe en `frequency.ts`):

```text
monthlyEquivalent = amount × (12 / periodsPerYear)
```

✅ Reutilizar infra existente; añadir campo `incomeClass: linear | residual | passive` en streams.

---

## 5. Costo de oportunidad (futuro — módulo 6 curso)

```text
futureValue = monthlyExpense × ((1 + r)^n − 1) / r    (r = tasa mensual, n = meses)
```

Anualidad vencida estándar. ✅ Matemática correcta para “este gasto mensual dejó de ser X invertido”.

---

## 6. Decisiones para `/sdd-specify`

1. **Adoptar runway estándar** como KPI visible (nombre UX: “Meses de autonomía” o “Runway”).
2. **Unificar líquido** en dominio — candidato: `cash`, `savings`, `investment` (alinear FIRE + runway).
3. **Gasto de vida** = fijos + variables del mes (ya usa `useFinancialFreedom`) — documentar en ADR.
4. **Cobertura pasiva** como ratio 0–100%+ separado del progreso 25×.
5. **Excluir** fases de consciencia 1–4 arbitrarias; derivar de métricas si hace falta UX.

## 7. Alcance UX incluido en spec v2 (implementar en esta feature)

| Tema                     | US   | Notas                                                                                                  |
| ------------------------ | ---- | ------------------------------------------------------------------------------------------------------ |
| Eliminar deudas          | US-5 | Icono dentro de card (`lucide-vue-next` ya en stack); patrón reutilizable para otras listas            |
| TEA en gráfico compuesto | US-6 | Persistir en ajustes del usuario; fórmula compuesto ya auditada en §3; base = mismo líquido que runway |

## Referencias

- Bengen, W. (1994). _Determining Withdrawal Rates Using Historical Data_. Journal of Financial Planning.
- Cooley, P., Hubbard, C., Walz, D. (1998). _Retirement Savings: Choosing a Withdrawal Rate That Is Sustainable_. AAII Journal (Trinity Study).
- [Wikipedia: Trinity study](https://en.wikipedia.org/wiki/Trinity_study)
- CFPB / estándar industria: fondo emergencia = 3–6 meses de gastos esenciales (runway usa la misma división con distinto framing).
