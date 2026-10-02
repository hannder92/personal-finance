---
name: colombia-payroll
description: Review or change Colombian payroll, withholding, tax, and related financial calculations in personal-finance. Use for src/lib/tax/colombia, income-store payroll behavior, or legal-rate changes.
---

# Colombian Payroll in Personal Finance

Treat `src/lib/tax/colombia/`, `constitution.md`, and the tests as the
current implementation contract. Existing constants and examples are
year-specific; do not carry a 2025 value into a later tax year by inference.

- Before changing a rate, threshold, deduction, or legal interpretation,
  verify the applicable tax year against official Colombian sources and
  record the source and effective date in the code or decision artifact.
- Preserve the distinction between employer costs, employee deductions,
  non-salary benefits, and withholding bases. Review the existing presets,
  `constants.ts`, and `retencion.ts` together before changing one.
- Keep debt `apr` semantics as TEA; see `docs/agent-reference.md` for the
  existing monthly conversion.
- Add or update tests for boundary values and cases where a deduction does
  not apply. Run the tax coverage gate in `vue-engineering` and the project
  quality commands.

If a legal source conflicts with the current code or constitution, document
the discrepancy and stop before changing the product contract.
