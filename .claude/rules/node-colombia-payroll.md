---
description: Colombian payroll and tax constants — verified legal rules, not guesses
---

# Colombian Payroll & Tax Rules

Source: session corrections 2026-05-11 (ARL employer-only, retención base, renta exenta cap).

## Principles

1. **ARL is 100% employer cost.** Never add ARL as an employee deduction. Art. 16 Ley 1562/2012 — the employer pays 0.348%–8.7% depending on risk class; the employee pays nothing.
2. **Retención en la fuente base = gross − salud(4%) − pensión(4%).** Both contributions are deductible before applying renta exenta. Deducting only pension is wrong.
3. **Renta exenta cap: 240 UVT/month (2,880/year).** Art. 206 numeral 10 ET. The 65.833 UVT/month figure (790/year) is incorrect for this item.
4. **Non-salary benefits (Art. 128 CST) are excluded from ALL bases:** health, pension, ARL, solidarity fund, and withholding tax.
5. **Fondo de solidaridad pensional (1%)** is an employee deduction only for salaries > 4 SMMLV. Do not include it in default presets.

## Constants (2025)

```js
const UVT_2025 = 49799;             // Resolución DIAN 000187/2024
// SMMLV 2025 = $1,423,500 — solidarity fund threshold = 4 × $1,423,500 = $5,694,000
// Renta exenta monthly cap = 240 × UVT_2025 = $11,951,760
```

## Examples

✅ Correct retención base:
```js
const aporteSocial  = grossSalary * 0.08;   // salud 4% + pensión 4%
const ingresoNominal = grossSalary - aporteSocial;
const topeExenta    = 240 * UVT_2025;       // Art. 206 num. 10 ET
const rentaExenta   = Math.min(ingresoNominal * 0.25, topeExenta);
```

✅ Correct Colombia employee deduction presets:
```js
const COLOMBIA_PRESETS = [
  { label: 'Salud',   amount: 4, type: 'percent' },
  { label: 'Pensión', amount: 4, type: 'percent' },
  // ARL excluded — employer cost only
];
```

✅ Non-salary benefit: added to income AFTER deductions — never enters the contribution base:
```js
function calcNetSalary() {
  const deductions = state.income.deductions.reduce(...);           // on grossSalary only
  const benefits   = state.income.nonSalaryBenefits.reduce(...);   // added after
  return Math.max(0, grossSalary - deductions) + benefits;
}
```

❌ Including ARL in employee deductions:
```js
{ label: 'ARL', amount: 0.522, type: 'percent' }   // WRONG — employer cost, not employee
```

❌ Deducting only pension from retención base:
```js
const pension = grossSalary * 0.04;           // WRONG — misses salud 4%
const ingresoNominal = grossSalary - pension;
```

❌ Wrong renta exenta cap:
```js
const topeExenta = 65.833 * UVT_2025;   // WRONG — 790 UVT/year, not 2,880
```

## Anti-patterns

- Guessing Colombian payroll percentages without citing the legal source
- Putting UVT values as magic numbers without the `UVT_2025` constant
- Treating bono de conectividad, auxilio de alimentación, or medicina prepagada as salary-base income
- Adding Fondo de Solidaridad to default presets (only applies to higher earners)
