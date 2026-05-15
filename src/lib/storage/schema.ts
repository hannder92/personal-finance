import { z } from 'zod'

// ─── Primitives ──────────────────────────────────────────────────────────
const ID = z.string().uuid()
const Money = z.number().nonnegative().finite()
const Percent01 = z.number().min(0).max(100)
const ISODateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
const ISODateTimeString = z.string().datetime()
const YearMonth = z.string().regex(/^\d{4}-\d{2}$/)
const CurrencyCode = z.enum(['COP', 'USD', 'CLP', 'MXN', 'ARS', 'BRL', 'PEN'])
const Lang = z.enum(['es', 'en'])
const Theme = z.enum(['light', 'dark', 'system'])

// ─── Settings ────────────────────────────────────────────────────────────
const SettingsSchema = z.object({
  lang: Lang.default('es'),
  currency: CurrencyCode.default('COP'),
  theme: Theme.default('system'),
  payoffMethod: z.enum(['avalanche', 'snowball']).default('avalanche'),
  onboarding: z
    .object({
      done: z.boolean().default(false),
      currentStep: z.number().int().min(0).max(3).default(0),
    })
    .default({ done: false, currentStep: 0 }),
  lastMonthSeen: YearMonth.nullable().default(null),
})

// ─── Income ──────────────────────────────────────────────────────────────
const DeductionSchema = z.object({
  id: ID,
  label: z.string().min(1).max(60),
  amount: z.number().min(0).finite(),
  type: z.enum(['fixed', 'percent']),
})

const FrequencyEnum = z.enum(['monthly', 'quarterly', 'semiannual', 'annual'])
const IncomeStreamSchema = z.object({
  id: ID,
  label: z.string().min(1).max(60),
  amount: Money,
  frequency: FrequencyEnum.default('monthly'),
})

const NonSalaryBenefitSchema = z.object({
  id: ID,
  label: z.string().min(1).max(60),
  amount: Money,
})

const IncomeSchema = z.object({
  grossSalary: Money.default(0),
  deductions: z.array(DeductionSchema).default([]),
  otherStreams: z.array(IncomeStreamSchema).default([]),
  nonSalaryBenefits: z.array(NonSalaryBenefitSchema).default([]),
})

// ─── Fixed expenses ──────────────────────────────────────────────────────
const ExpenseCategoryEnum = z.enum([
  'housing',
  'utilities',
  'transport',
  'food',
  'health',
  'education',
  'subscriptions',
  'insurance',
  'other',
])

const FixedExpenseSchema = z.object({
  id: ID,
  name: z.string().min(1).max(60),
  amount: Money,
  category: ExpenseCategoryEnum,
})

// ─── Cards / Loans (discriminated union) ─────────────────────────────────
const InstallmentSchema = z.object({
  id: ID,
  name: z.string().min(1).max(60),
  total: Money,
  installments: z.number().int().min(1).max(72),
  paid: z.number().int().min(0).default(0),
})

const CardCommonSchema = z.object({
  id: ID,
  name: z.string().min(1).max(60),
  limit: Money.optional(),
  balance: Money,
  minPayment: Money.default(0),
  apr: z.number().min(0).max(200).finite(),
  installmentsList: z.array(InstallmentSchema).default([]),
})

const CardSchema = z.discriminatedUnion('type', [
  CardCommonSchema.extend({
    type: z.literal('card'),
    dueDate: z.number().int().min(1).max(31),
  }),
  CardCommonSchema.extend({
    type: z.literal('loan'),
    remainingInstallments: z.number().int().min(0).max(360),
  }),
])

// ─── Goals ───────────────────────────────────────────────────────────────
const GoalSchema = z.object({
  id: ID,
  name: z.string().min(1).max(60),
  target: Money,
  saved: Money.default(0),
  monthlyContrib: Money.default(0),
  targetDate: ISODateString.nullable().default(null),
  priority: z.number().int().min(0).default(0),
})

// ─── Assets ──────────────────────────────────────────────────────────────
const AssetTypeEnum = z.enum(['cash', 'savings', 'investment', 'property', 'vehicle', 'other'])

const AssetSchema = z.object({
  id: ID,
  name: z.string().min(1).max(60),
  value: Money,
  type: AssetTypeEnum,
})

// ─── Variable expenses ───────────────────────────────────────────────────
const VariableCategorySchema = z.object({
  id: ID,
  name: z.string().min(1).max(60),
  icon: z.string().min(1).max(40),
  budget: Money,
  spent: Money.default(0),
})

// ─── Allocation (refinement: sum must equal 100) ─────────────────────────
const AllocationSchema = z
  .object({
    needs: Percent01.default(50),
    wants: Percent01.default(30),
    savings: Percent01.default(20),
  })
  .refine((a) => a.needs + a.wants + a.savings === 100, {
    message: 'allocation.sumMustBe100',
    path: ['savings'],
  })

// ─── Snapshots ───────────────────────────────────────────────────────────
const SnapshotSchema = z.object({
  id: ID,
  month: YearMonth,
  capturedAt: ISODateTimeString,
  netIncome: Money,
  totalFixedExpenses: Money,
  totalVariableSpent: Money,
  totalDebt: Money,
  dti: z.number().min(0).max(1000).finite(),
  savingsRate: z.number().finite(),
  netWorth: z.number().finite(),
  healthScore: z.number().min(0).max(100).nullable(),
})

// ─── Root ────────────────────────────────────────────────────────────────
export const AppStateSchemaV2 = z.object({
  schemaVersion: z.literal(2),
  settings: SettingsSchema,
  income: IncomeSchema,
  expenses: z.array(FixedExpenseSchema).default([]),
  cards: z.array(CardSchema).default([]),
  goals: z.array(GoalSchema).default([]),
  assets: z.array(AssetSchema).default([]),
  variableExpenses: z.array(VariableCategorySchema).default([]),
  allocation: AllocationSchema,
  snapshots: z.array(SnapshotSchema).default([]),
})

export type AppStateV2 = z.infer<typeof AppStateSchemaV2>
export type Deduction = z.infer<typeof DeductionSchema>
export type IncomeStream = z.infer<typeof IncomeStreamSchema>
export type FixedExpense = z.infer<typeof FixedExpenseSchema>
export type Card = z.infer<typeof CardSchema>
export type Installment = z.infer<typeof InstallmentSchema>
export type Goal = z.infer<typeof GoalSchema>
export type Asset = z.infer<typeof AssetSchema>
export type VariableCategory = z.infer<typeof VariableCategorySchema>
export type Snapshot = z.infer<typeof SnapshotSchema>
export type Settings = z.infer<typeof SettingsSchema>
