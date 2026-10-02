// Cesantías: one month of salary per year worked (Art. 249 CST), deposited in the fund by
// February 14. The fund cannot be freely withdrawn, but the 12% annual interest on it
// (Ley 52/1975, Art. 1, num. 2) is paid to the worker by January 31.
export const CESANTIAS_INTEREST_RATE = 0.12

// Full-year estimate: cesantías ≈ one monthly salary, interest = 12% of that. Partial years
// and auxilio de transporte are out of scope (same simplification as prima.ts).
export function calcInteresesCesantias(monthlySalary: number): number {
  if (!Number.isFinite(monthlySalary) || monthlySalary <= 0) return 0
  return Math.round(monthlySalary * CESANTIAS_INTEREST_RATE)
}
