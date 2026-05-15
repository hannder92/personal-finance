/* ============================================================
   PERSONAL FINANCE DASHBOARD — app.js
   ============================================================ */

// ── Constants ────────────────────────────────────────────────
const STORAGE_KEY      = 'finance_app_data';
const SCHEMA_VERSION   = 1;
const SAVE_DEBOUNCE_MS = 300;

const CURRENCIES = [
  { code: 'COP', label: '🇨🇴 COP — Peso colombiano', locale: 'es-CO' },
  { code: 'USD', label: '🇺🇸 USD — US Dollar',        locale: 'en-US' },
  { code: 'EUR', label: '🇪🇺 EUR — Euro',              locale: 'es-ES' },
  { code: 'MXN', label: '🇲🇽 MXN — Peso mexicano',    locale: 'es-MX' },
  { code: 'ARS', label: '🇦🇷 ARS — Peso argentino',   locale: 'es-AR' },
  { code: 'BRL', label: '🇧🇷 BRL — Real brasileño',   locale: 'pt-BR' },
  { code: 'CLP', label: '🇨🇱 CLP — Peso chileno',     locale: 'es-CL' },
  { code: 'PEN', label: '🇵🇪 PEN — Sol peruano',      locale: 'es-PE' },
  { code: 'GBP', label: '🇬🇧 GBP — British Pound',    locale: 'en-GB' },
];

// Colombia: UVT 2025 (Resolución DIAN 000187/2024)
const UVT_2025 = 49799;

// Presets de deducciones Colombia
// ARL excluida: costo 100% del empleador (Art. 16 Ley 1562/2012), no descuenta del empleado.
// Fondo de solidaridad pensional (1%) aplica solo si salario > 4 SMMLV — agregar manualmente si aplica.
const COLOMBIA_PRESETS = [
  { label: 'Salud',   amount: 4, type: 'percent' },
  { label: 'Pensión', amount: 4, type: 'percent' },
];

const FREQ_DIVISORS = { monthly: 1, quarterly: 3, semiannual: 6, annual: 12 };

// Beneficios extrasalariales típicos Colombia (Art. 128 CST)
const COLOMBIA_NONSALARY_PRESETS = [
  { label: 'Bono de conectividad' },
  { label: 'Auxilio de alimentación' },
  { label: 'Medicina prepagada' },
];

// Iconos para activos
const ASSET_ICONS = { cash: '💵', investment: '📈', property: '🏠', vehicle: '🚗', pension: '🏦', other: '📦' };

// Categorías de gastos variables con emoji
const VAR_CATEGORIES = [
  { id: 'food',    icon: '🍽', labelEs: 'Restaurantes',    labelEn: 'Dining Out'     },
  { id: 'grocery', icon: '🛒', labelEs: 'Mercado',          labelEn: 'Groceries'      },
  { id: 'clothes', icon: '👗', labelEs: 'Ropa',             labelEn: 'Clothing'       },
  { id: 'entert',  icon: '🎭', labelEs: 'Entretenimiento',  labelEn: 'Entertainment'  },
  { id: 'health',  icon: '💊', labelEs: 'Salud',            labelEn: 'Health'         },
  { id: 'travel',  icon: '✈️', labelEs: 'Viajes',           labelEn: 'Travel'         },
  { id: 'tech',    icon: '📱', labelEs: 'Tecnología',       labelEn: 'Tech'           },
  { id: 'gifts',   icon: '🎁', labelEs: 'Regalos',          labelEn: 'Gifts'          },
  { id: 'sport',   icon: '🏋️', labelEs: 'Deporte',          labelEn: 'Sports'         },
  { id: 'other',   icon: '📦', labelEs: 'Otro',             labelEn: 'Other'          },
];

// ── i18n ─────────────────────────────────────────────────────
const TRANSLATIONS = {
  es: {
    'nav.dashboard':  'Panel',
    'nav.income':     'Ingresos',
    'nav.expenses':   'Gastos Fijos',
    'nav.debt':       'Deudas',
    'nav.goals':      'Metas',
    'nav.networth':   'Patrimonio',
    'nav.variable':   'Gastos Variables',
    'nav.ratios':     'Ratios',
    'action.export':  'Exportar',
    'action.import':  'Importar',
    'action.reset':   'Reiniciar',
    'action.darkMode': '🌙 Modo oscuro',
    'action.lightMode': '☀️ Modo claro',
    'dash.breakdown': 'Distribución del presupuesto',
    'dash.projection':'Proyección 12 meses',
    'dash.month':     'Mes',
    'dash.balance':   'Balance',
    'dash.goals':     'Metas',
    'dash.debt':      'Deuda',
    'dash.allocation':'Asignación (50/30/20)',
    'income.salary':  'Salario mensual bruto',
    'income.grossLabel': 'Salario bruto',
    'income.deductions': 'Deducciones nomina',
    'income.addDeduction': '+ Agregar deducción',
    'income.netSalary': 'Salario neto',
    'income.otherTitle': 'Otros ingresos',
    'income.addStream': '+ Agregar ingreso',
    'income.otherTotal': 'Total otros ingresos',
    'income.totalDisposable': 'Total disponible',
    'income.labelPlaceholder': 'Ej. Impuesto renta',
    'income.streamPlaceholder': 'Ej. Freelance',
    'income.colPresets': '🇨🇴 Cargar deducciones Colombia',
    'income.calcRet':    '⚡ Calcular retención en la fuente',
    'income.retInfo':    'Estimado Art. 383 ET / UVT 2025',
    'income.nonSalary':  'Beneficios extrasalariales',
    'income.addNonSalary': '+ Agregar beneficio',
    'income.nonSalaryHint': 'Excluidos de la base de aportes y retención (Art. 128 CST)',
    'income.deductionBase': 'Base de aportes sociales',
    'income.colNonSalaryPresets': '🇨🇴 Cargar beneficios extrasalariales',
    'income.colPrimaPreset': '🇨🇴 Cargar prima de servicios',
    'income.freqMonthly':    'Mensual',
    'income.freqQuarterly':  'Trimestral',
    'income.freqSemiannual': 'Semestral',
    'income.freqAnnual':     'Anual',
    'income.freqLabel':      'Frecuencia',
    'income.freqEquiv':      'equiv. mensual',
    'income.nonMonthly':     'No mensual (ver proyección)',
    'expense.add':    '+ Agregar gasto',
    'expense.total':  'Total gastos fijos',
    'expense.remaining': 'Restante tras gastos',
    'expense.namePlaceholder': 'Nombre del gasto',
    'debt.method':    'Método:',
    'debt.avalanche': 'Avalancha (mayor Tasa EA)',
    'debt.snowball':  'Bola de nieve (menor saldo)',
    'debt.addCard':   '+ Agregar tarjeta / préstamo',
    'debt.typeCard':  '💳 Tarjeta de crédito',
    'debt.typeLoan':  '📋 Préstamo / crédito',
    'debt.loanTerm':  'Plazo (cuotas)',
    'debt.loanOriginal': 'Monto original',
    'debt.summary':   'Resumen de deudas',
    'debt.obligation':'Obligación mensual',
    'debt.totalBalance': 'Saldo total',
    'debt.utilization': 'Utilización global',
    'debt.extraSim':  '¿Qué pasa si pagas extra cada mes?',
    'debt.extraPlaceholder': 'Pago extra',
    'debt.extraResult': 'Ingresa un monto para ver el impacto',
    'goals.add':      '+ Agregar meta',
    'goals.summary':  'Resumen de metas',
    'goals.needed':   'Necesario por todas las metas',
    'goals.available':'Presupuesto de ahorro disponible',
    'goals.surplus':  'Superávit',
    'goals.overcommit': 'Las metas superan el presupuesto de ahorro por',
    'goals.fit':      'Las metas encajan en el presupuesto.',
    'goals.namePlaceholder': 'Nombre de la meta',
    'goals.completed': '🎉 ¡Meta completada!',
    'goals.eta':      'ETA',
    'goals.needs':    'Necesita',
    'goals.perMonth': '/mes',
    'goals.shared':   'Meta compartida',
    'goals.participants': 'Responsables',
    'goals.addParticipant': '+ Agregar responsable',
    'goals.partName': 'Nombre',
    'goals.partType': 'Ingreso',
    'goals.partTypeFixed': 'Fijo',
    'goals.partTypeVariable': 'Variable',
    'goals.partContrib': 'Aporte/mes',
    'goals.partSaved': 'Ahorrado',
    'goals.partTarget': 'Parte esperada',
    'goals.combined': 'Progreso conjunto',
    'goals.variableNote': '~estimado',
    'goals.monthsLeft': 'meses restantes',
    'nw.assets':      'Activos',
    'nw.liabilities': 'Pasivos (de deudas)',
    'nw.addAsset':    '+ Agregar activo',
    'nw.totalAssets': 'Total activos',
    'nw.totalLiabilities': 'Total pasivos',
    'nw.netWorth':    'Patrimonio neto',
    'nw.assetTypes':  { cash: 'Efectivo/Ahorros', investment: 'Inversiones', property: 'Propiedad', vehicle: 'Vehículo', pension: 'Pensión/AFP', other: 'Otro' },
    'variable.add':   '+ Agregar categoría',
    'variable.summary': 'Resumen del mes',
    'variable.budget': 'Presupuesto',
    'variable.spent':  'Gastado',
    'variable.remaining': 'Restante',
    'variable.total':  'Total variables',
    'ratios.title':   'Salud financiera',
    'ratios.housing': 'Costo de vivienda',
    'ratios.dti':     'Deuda sobre ingresos',
    'ratios.emergency': 'Fondo de emergencia',
    'ratios.savings': 'Tasa de ahorro',
    'ratios.onTrack': '✓ En regla',
    'ratios.caution': '~ Precaución',
    'ratios.risk':    '✗ En riesgo',
    'ratios.recommended': 'recomendado',
    'sc.gross':       'Ingreso bruto',
    'sc.net':         'Ingreso neto',
    'sc.fixed':       'Gastos fijos',
    'sc.debt':        'Pagos deuda',
    'sc.free':        'Libre para asignar',
    'sc.goals':       'Metas / mes',
    'alloc.needs':    'Necesidades',
    'alloc.wants':    'Deseos',
    'alloc.savings':  'Ahorro',
    'alloc.warn.sum': 'Los porcentajes suman',
    'alloc.warn.debt': 'Las deudas consumen tu asignación de ahorro.',
    'payoff.prefix':  '⏱ Pago estimado',
    'cat.Housing':    'Vivienda',
    'cat.Utilities':  'Servicios',
    'cat.Transport':  'Transporte',
    'cat.Subscriptions': 'Suscripciones',
    'cat.Insurance':  'Seguros',
    'cat.Education':  'Educación',
    'cat.Food/Groceries': 'Comida / Mercado',
    'cat.Other':      'Otro',
    'empty.deductions': 'Sin deducciones',
    'empty.deductionsHint': 'Agrega impuestos, seguros y más.',
    'empty.streams':  'Sin ingresos adicionales',
    'empty.streamsHint': 'Freelance, arriendos, dividendos…',
    'empty.expenses': 'Sin gastos fijos',
    'empty.expensesHint': 'Agrega arriendo, servicios, suscripciones…',
    'empty.cards':    'Sin tarjetas ni préstamos',
    'empty.cardsHint': 'Registra saldos, tasas y cuotas.',
    'empty.goals':    'Sin metas de ahorro',
    'empty.goalsHint': 'Viaje, fondo emergencia, laptop…',
    'empty.assets':   'Sin activos registrados',
    'empty.assetsHint': 'Ahorros, inversiones, propiedades…',
    'empty.variable': 'Sin categorías de gasto variable',
    'empty.variableHint': 'Rastrea restaurantes, ropa, entretenimiento…',
    'inst.item':      'Producto',
    'inst.total':     'Total',
    'inst.count':     'Cuotas',
    'inst.paid':      'Pagadas',
    'inst.monthly':   'Mensual',
    'inst.add':       '+ Agregar cuota',
    'save.indicator': 'Guardado ✓',
    'corrupt':        'Los datos anteriores no pudieron cargarse. Iniciando desde cero.',
    'reset.confirm':  '¿Deseas eliminar todos tus datos financieros? Esta acción no se puede deshacer.',
    'import.success': 'Datos importados correctamente.',
    'import.fail':    '⚠ Importación fallida: archivo inválido.',
    'save.quota':     '⚠ No se pudo guardar: cuota de almacenamiento superada.',
    'reset.done':     'Todos los datos han sido reiniciados.',
  },
  en: {
    'nav.dashboard':  'Dashboard',
    'nav.income':     'Income',
    'nav.expenses':   'Fixed Expenses',
    'nav.debt':       'Cards & Debt',
    'nav.goals':      'Goals',
    'nav.networth':   'Net Worth',
    'nav.variable':   'Variable Expenses',
    'nav.ratios':     'Ratios',
    'action.export':  'Export',
    'action.import':  'Import',
    'action.reset':   'Reset',
    'action.darkMode': '🌙 Dark mode',
    'action.lightMode': '☀️ Light mode',
    'dash.breakdown': 'Budget Breakdown',
    'dash.projection':'12-Month Projection',
    'dash.month':     'Month',
    'dash.balance':   'Balance',
    'dash.goals':     'Goals',
    'dash.debt':      'Debt',
    'dash.allocation':'Budget Allocation (50/30/20)',
    'income.salary':  'Gross Monthly Salary',
    'income.grossLabel': 'Gross Salary',
    'income.deductions': 'Payroll Deductions',
    'income.addDeduction': '+ Add Deduction',
    'income.netSalary': 'Net Take-Home Pay',
    'income.otherTitle': 'Additional Income',
    'income.addStream': '+ Add Income Stream',
    'income.otherTotal': 'Total Additional Income',
    'income.totalDisposable': 'Total Disposable Income',
    'income.labelPlaceholder': 'e.g. Income Tax',
    'income.streamPlaceholder': 'e.g. Freelance',
    'income.colPresets': '🇨🇴 Load Colombia deductions',
    'income.calcRet':    '⚡ Calculate withholding tax',
    'income.retInfo':    'Estimate Art. 383 ET / UVT 2025',
    'income.nonSalary':  'Non-salary benefits',
    'income.addNonSalary': '+ Add benefit',
    'income.nonSalaryHint': 'Excluded from contribution base and withholding (Art. 128 CST)',
    'income.deductionBase': 'Social security base',
    'income.colNonSalaryPresets': '🇨🇴 Load non-salary benefits',
    'income.colPrimaPreset': '🇨🇴 Load service bonus (prima)',
    'income.freqMonthly':    'Monthly',
    'income.freqQuarterly':  'Quarterly',
    'income.freqSemiannual': 'Semi-annual',
    'income.freqAnnual':     'Annual',
    'income.freqLabel':      'Frequency',
    'income.freqEquiv':      'monthly equiv.',
    'income.nonMonthly':     'Non-monthly (see projection)',
    'expense.add':    '+ Add Expense',
    'expense.total':  'Total Fixed Expenses',
    'expense.remaining': 'Remaining After Expenses',
    'expense.namePlaceholder': 'Expense name',
    'debt.method':    'Payoff method:',
    'debt.avalanche': 'Avalanche (highest EA rate)',
    'debt.snowball':  'Snowball (lowest balance)',
    'debt.addCard':   '+ Add Credit Card / Loan',
    'debt.typeCard':  '💳 Credit Card',
    'debt.typeLoan':  '📋 Loan',
    'debt.loanTerm':  'Term (installments)',
    'debt.loanOriginal': 'Original Amount',
    'debt.summary':   'Debt Summary',
    'debt.obligation':'Monthly Obligation',
    'debt.totalBalance': 'Total Balance',
    'debt.utilization': 'Overall Utilization',
    'debt.extraSim':  'What if you paid extra each month?',
    'debt.extraPlaceholder': 'Extra payment',
    'debt.extraResult': 'Enter an amount to see the impact',
    'goals.add':      '+ Add Goal',
    'goals.summary':  'Goals Summary',
    'goals.needed':   'Total needed for all goals',
    'goals.available':'Savings budget available',
    'goals.surplus':  'Surplus',
    'goals.overcommit': 'Goals over-committed by',
    'goals.fit':      'Goals fit within savings budget.',
    'goals.namePlaceholder': 'Goal name',
    'goals.completed': '🎉 Goal completed!',
    'goals.eta':      'ETA',
    'goals.needs':    'Needs',
    'goals.perMonth': '/mo',
    'goals.shared':   'Shared goal',
    'goals.participants': 'Participants',
    'goals.addParticipant': '+ Add participant',
    'goals.partName': 'Name',
    'goals.partType': 'Income',
    'goals.partTypeFixed': 'Fixed',
    'goals.partTypeVariable': 'Variable',
    'goals.partContrib': 'Monthly',
    'goals.partSaved': 'Saved',
    'goals.partTarget': 'Expected share',
    'goals.combined': 'Joint progress',
    'goals.variableNote': '~estimated',
    'goals.monthsLeft': 'months left',
    'nw.assets':      'Assets',
    'nw.liabilities': 'Liabilities (from debts)',
    'nw.addAsset':    '+ Add Asset',
    'nw.totalAssets': 'Total Assets',
    'nw.totalLiabilities': 'Total Liabilities',
    'nw.netWorth':    'Net Worth',
    'nw.assetTypes':  { cash: 'Cash/Savings', investment: 'Investments', property: 'Property', vehicle: 'Vehicle', pension: 'Pension/401k', other: 'Other' },
    'variable.add':   '+ Add Category',
    'variable.summary': 'Monthly Summary',
    'variable.budget': 'Budget',
    'variable.spent':  'Spent',
    'variable.remaining': 'Remaining',
    'variable.total':  'Total variable',
    'ratios.title':   'Financial Health',
    'ratios.housing': 'Housing Cost Ratio',
    'ratios.dti':     'Debt-to-Income Ratio',
    'ratios.emergency': 'Emergency Fund',
    'ratios.savings': 'Savings Rate',
    'ratios.onTrack': '✓ On Track',
    'ratios.caution': '~ Caution',
    'ratios.risk':    '✗ At Risk',
    'ratios.recommended': 'recommended',
    'sc.gross':       'Gross Income',
    'sc.net':         'Net Income',
    'sc.fixed':       'Fixed Costs',
    'sc.debt':        'Debt Payments',
    'sc.free':        'Free to Allocate',
    'sc.goals':       'Goals / Mo',
    'alloc.needs':    'Needs',
    'alloc.wants':    'Wants',
    'alloc.savings':  'Savings',
    'alloc.warn.sum': 'Percentages sum to',
    'alloc.warn.debt': 'Debt obligations are consuming your savings allocation.',
    'payoff.prefix':  '⏱ Payoff timeline',
    'cat.Housing':    'Housing',
    'cat.Utilities':  'Utilities',
    'cat.Transport':  'Transport',
    'cat.Subscriptions': 'Subscriptions',
    'cat.Insurance':  'Insurance',
    'cat.Education':  'Education',
    'cat.Food/Groceries': 'Food/Groceries',
    'cat.Other':      'Other',
    'empty.deductions': 'No deductions added',
    'empty.deductionsHint': 'Add taxes, insurance, pension…',
    'empty.streams':  'No additional income',
    'empty.streamsHint': 'Freelance, rental, dividends…',
    'empty.expenses': 'No fixed expenses yet',
    'empty.expensesHint': 'Add rent, utilities, subscriptions…',
    'empty.cards':    'No cards or loans added',
    'empty.cardsHint': 'Track balances, rates, and installments.',
    'empty.goals':    'No savings goals yet',
    'empty.goalsHint': 'Trip, emergency fund, laptop…',
    'empty.assets':   'No assets registered',
    'empty.assetsHint': 'Savings, investments, properties…',
    'empty.variable': 'No variable expense categories',
    'empty.variableHint': 'Track dining, clothes, entertainment…',
    'inst.item':      'Item',
    'inst.total':     'Total',
    'inst.count':     'Installments',
    'inst.paid':      'Paid',
    'inst.monthly':   'Monthly',
    'inst.add':       '+ Add Installment',
    'save.indicator': 'Saved ✓',
    'corrupt':        'Previous data could not be loaded. Starting fresh.',
    'reset.confirm':  'This will permanently delete all your financial data. Are you sure?',
    'import.success': 'Data imported successfully.',
    'import.fail':    '⚠ Import failed: invalid file format.',
    'save.quota':     '⚠ Could not save: storage quota exceeded.',
    'reset.done':     'All data has been reset.',
  }
};

let currentLang = 'es';
function t(key) { return TRANSLATIONS[currentLang][key] || TRANSLATIONS['en'][key] || key; }

// ── Tooltip copy ─────────────────────────────────────────────
const TIPS = {
  es: {
    'card.limit':   'Cupo total aprobado de la tarjeta, o el monto original del préstamo.',
    'card.balance': 'Lo que debes hoy. Para tarjetas usa el saldo del último extracto.',
    'card.minpay':  'El pago mínimo mensual que aparece en tu extracto de cuenta.',
    'card.apr':     'Tasa Efectiva Anual (EA): interés compuesto anual, distinto al APR americano. Tarjetas Colombia: típicamente 26–36% EA. La encuentras en el extracto o en la app del banco.',
    'card.duedate': 'Fecha en que se genera tu extracto mensual (fecha de corte).',
    'card.method':  'Avalancha: paga primero la deuda con mayor Tasa EA — pagas menos intereses en total. Bola de nieve: paga primero la de menor saldo — más fácil de mantener la motivación.',
    'ratio.dti':    'Deuda total / Ingreso mensual × 100. Mide qué tanto de tu ingreso va a pagar deudas. Idealmente ≤ 20%; alerta en > 36%.',
    'ratio.housing':'Gastos de vivienda / Ingreso mensual × 100. Incluye arriendo/cuota + servicios. Recomendado ≤ 30%.',
    'ratio.emergency':'Cuántos meses de tus gastos totales puedes cubrir con activos líquidos (ahorros). Meta: 3–6 meses.',
    'ratio.savings': '% de tu ingreso que estás ahorrando o invirtiendo cada mes. Meta recomendada: ≥ 20%.',
    'card.loanterm': 'Número total de cuotas del préstamo según el contrato (plazo). Ej: crédito a 36 meses = 36 cuotas.',
  },
  en: {
    'card.limit':   'Total approved credit line, or the original loan amount.',
    'card.balance': 'What you owe today. For cards, use your latest statement balance.',
    'card.minpay':  'Minimum monthly payment shown on your account statement.',
    'card.apr':     'Effective Annual Rate (Tasa EA): annual compound interest. Different from the US APR concept. Colombian cards: typically 26–36% EA. Find it on your statement or bank app.',
    'card.duedate': 'Date your monthly statement is generated (statement closing date).',
    'card.method':  'Avalanche: pay highest EA rate debt first — you pay less total interest. Snowball: pay smallest balance first — easier to stay motivated.',
    'ratio.dti':    'Total debt / Monthly income × 100. Measures how much of your income goes to debt payments. Ideally ≤ 20%; alert at > 36%.',
    'ratio.housing':'Housing expenses / Monthly income × 100. Includes rent/mortgage + utilities. Recommended ≤ 30%.',
    'ratio.emergency':'How many months of total expenses your liquid assets (savings) can cover. Target: 3–6 months.',
    'ratio.savings': '% of your income you save or invest each month. Recommended target: ≥ 20%.',
    'card.loanterm': 'Total number of installments in the loan contract (term). E.g., a 36-month loan = 36 installments.',
  }
};
function tip(key) {
  const text = (TIPS[currentLang] || TIPS.es)[key] || '';
  return `<span class="tip-icon" data-tip="${text.replace(/"/g, '&quot;')}">?</span>`;
}

function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const val = t(key);
    if (typeof val === 'string') el.textContent = val;
  });
  // Update static tip icons in HTML (data-tip-key attribute)
  document.querySelectorAll('[data-tip-key]').forEach(el => {
    const text = (TIPS[currentLang] || TIPS.es)[el.dataset.tipKey] || '';
    el.dataset.tip = text;
  });
  document.documentElement.lang = currentLang;
  document.getElementById('lang-es').classList.toggle('active', currentLang === 'es');
  document.getElementById('lang-en').classList.toggle('active', currentLang === 'en');
  document.getElementById('corruption-msg').textContent = t('corrupt');
}

// ── State ─────────────────────────────────────────────────────
let state     = buildDefaultState();
let saveTimer = null;

function buildDefaultState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    lastSaved: null,
    lang: 'es',
    currency: 'COP',
    income: { grossSalary: 0, deductions: [], otherStreams: [], nonSalaryBenefits: [] },
    expenses: [],
    cards: [],
    goals: [],
    assets: [],
    variableExpenses: [],
    budgetAllocation: { needs: 50, wants: 30, savings: 20 },
    payoffMethod: 'avalanche'
  };
}

function uid() { return Math.random().toString(36).slice(2, 10); }

// ── Formatters ────────────────────────────────────────────────
function getCurrencyConfig() {
  const code = (state && state.currency) ? state.currency : 'COP';
  const conf = CURRENCIES.find(c => c.code === code) || CURRENCIES[0];
  const decimals = ['COP', 'CLP'].includes(code) ? 0 : 2;
  return { code, locale: conf.locale, decimals };
}
function currency(n) {
  const { code, locale, decimals } = getCurrencyConfig();
  return new Intl.NumberFormat(locale, { style: 'currency', currency: code, maximumFractionDigits: decimals }).format(isNaN(n) ? 0 : n);
}
function pct(n, d = 1) { return (isNaN(n) ? 0 : n).toFixed(d) + '%'; }

// ============================================================
// COLOMBIA — Retención en la fuente (Art. 383 ET, UVT 2025)
// ============================================================
function calcRetencionFuente(grossSalary) {
  if (!grossSalary || grossSalary <= 0) return 0;

  // 1. Restar aportes obligatorios salud (4%) + pensión (4%) del trabajador
  //    Solo sobre el salario base (beneficios extrasalariales excluidos — Art. 128 CST)
  const aporteSocial = grossSalary * 0.08;
  const ingresoNominal = grossSalary - aporteSocial;

  // 2. Renta exenta 25%, tope 2.880 UVT/año = 240 UVT/mes (Art. 206 num. 10 ET)
  const topeExenta = 240 * UVT_2025;
  const rentaExenta = Math.min(ingresoNominal * 0.25, topeExenta);

  // 3. Base gravable mensual
  const base = Math.max(0, ingresoNominal - rentaExenta);
  const baseUVT = base / UVT_2025;

  // 4. Tabla Art. 383 ET (rangos en UVT/mes, marginal)
  let retUVT = 0;
  if (baseUVT <= 95) {
    retUVT = 0;
  } else if (baseUVT <= 150) {
    retUVT = (baseUVT - 95) * 0.19;
  } else if (baseUVT <= 360) {
    retUVT = 55 * 0.19 + (baseUVT - 150) * 0.28;
  } else if (baseUVT <= 640) {
    retUVT = 55 * 0.19 + 210 * 0.28 + (baseUVT - 360) * 0.33;
  } else if (baseUVT <= 945) {
    retUVT = 55 * 0.19 + 210 * 0.28 + 280 * 0.33 + (baseUVT - 640) * 0.35;
  } else if (baseUVT <= 2300) {
    retUVT = 55 * 0.19 + 210 * 0.28 + 280 * 0.33 + 305 * 0.35 + (baseUVT - 945) * 0.37;
  } else {
    retUVT = 55 * 0.19 + 210 * 0.28 + 280 * 0.33 + 305 * 0.35 + 1355 * 0.37 + (baseUVT - 2300) * 0.39;
  }

  return Math.round(retUVT * UVT_2025);
}

// ============================================================
// PERSISTENCE
// ============================================================
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') throw new Error('invalid');
    state = migrate(parsed);
    currentLang = state.lang || 'es';
  } catch (e) {
    console.warn('Finance: failed to load saved data', e);
    state = buildDefaultState();
    document.getElementById('corruption-banner').style.display = 'flex';
  }
}

function migrate(data) {
  const v = data.schemaVersion || 0;
  if (v < 1) {
    console.log('Migrated from v' + v + ' to v1');
    data.schemaVersion = 1;
    if (!data.income)            data.income            = buildDefaultState().income;
    if (!data.expenses)          data.expenses          = [];
    if (!data.cards)             data.cards             = [];
    if (!data.goals)             data.goals             = [];
    if (!data.budgetAllocation)  data.budgetAllocation  = { needs: 50, wants: 30, savings: 20 };
    if (!data.payoffMethod)      data.payoffMethod      = 'avalanche';
  }
  // Ensure all new collections exist after migration
  if (!data.assets)            data.assets            = [];
  if (!data.variableExpenses)  data.variableExpenses  = [];
  if (!data.currency)          data.currency          = 'COP';
  data.income.deductions       = data.income.deductions       || [];
  data.income.otherStreams      = data.income.otherStreams      || [];
  data.income.nonSalaryBenefits = data.income.nonSalaryBenefits || [];
  // Ensure deductions have type field
  data.income.deductions.forEach(d => { if (!d.type) d.type = 'fixed'; });
  // Ensure income streams have frequency field
  data.income.otherStreams.forEach(o => { if (!o.frequency) o.frequency = 'monthly'; });
  data.cards.forEach(c => {
    c.installments = c.installments || [];
    if (!c.cardType)              c.cardType  = 'card';
    if (c.loanTerm === undefined) c.loanTerm  = '';
  });
  data.goals.forEach(g => {
    if (g.shared === undefined) g.shared = false;
    if (!g.participants) g.participants = [];
  });
  return data;
}

function saveState() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      state.lastSaved = new Date().toISOString();
      state.lang = currentLang;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      flashSave();
    } catch (e) {
      showToast(t('save.quota'));
    }
  }, SAVE_DEBOUNCE_MS);
}

function flashSave() {
  ['last-saved-indicator', 'last-saved-indicator-desktop'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = t('save.indicator');
    el.classList.add('visible');
    setTimeout(() => el.classList.remove('visible'), 1500);
  });
}

function exportData() {
  const json = JSON.stringify(state, null, 2);
  const date = new Date().toISOString().slice(0, 10);
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
  a.download = `finance-backup-${date}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (!parsed.schemaVersion) throw new Error('invalid');
      state = migrate(parsed);
      currentLang = state.lang || 'es';
      saveState(); applyI18n(); render();
      showToast(t('import.success'));
    } catch (_) {
      showToast(t('import.fail'));
    }
  };
  reader.readAsText(file);
}

function resetData() {
  if (!window.confirm(t('reset.confirm'))) return;
  try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
  state = buildDefaultState();
  render();
  showToast(t('reset.done'));
}

// ============================================================
// CALCULATIONS — INCOME
// ============================================================
function calcDeductionAmount(d) {
  const gross = parseFloat(state.income.grossSalary) || 0;
  if (d.type === 'percent') return gross * (parseFloat(d.amount) || 0) / 100;
  return parseFloat(d.amount) || 0;
}

function calcNonSalaryBenefits() {
  return (state.income.nonSalaryBenefits || []).reduce((s, b) => s + (parseFloat(b.amount) || 0), 0);
}

function calcNetSalary() {
  const gross = parseFloat(state.income.grossSalary) || 0;
  const deductions = state.income.deductions.reduce((s, d) => s + calcDeductionAmount(d), 0);
  // Benefits are added AFTER deductions — they don't affect the contribution base
  return Math.max(0, gross - deductions) + calcNonSalaryBenefits();
}
function calcOtherIncome() {
  return state.income.otherStreams
    .filter(o => (o.frequency || 'monthly') === 'monthly')
    .reduce((s, o) => s + (parseFloat(o.amount) || 0), 0);
}
function calcNonMonthlyIncome() {
  return state.income.otherStreams
    .filter(o => (o.frequency || 'monthly') !== 'monthly')
    .reduce((s, o) => s + (parseFloat(o.amount) || 0), 0);
}
function calcTotalIncome()   { return calcNetSalary() + calcOtherIncome(); }

// ============================================================
// CALCULATIONS — EXPENSES
// ============================================================
function calcTotalExpenses() { return state.expenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0); }
function calcAfterExpenses() { return calcTotalIncome() - calcTotalExpenses(); }

// ============================================================
// CALCULATIONS — DEBT
// ============================================================
function calcCardObligation(card) {
  const min  = parseFloat(card.minPayment) || 0;
  const inst = (card.installments || []).reduce((s, i) => {
    return s + (parseFloat(i.total) || 0) / Math.max(1, parseInt(i.installments) || 1);
  }, 0);
  return min + inst;
}
function calcTotalDebt()   { return state.cards.reduce((s, c) => s + calcCardObligation(c), 0); }
function calcDTI()         { const inc = calcTotalIncome(); return inc > 0 ? (calcTotalDebt() / inc) * 100 : 0; }
function calcFreeAlloc()   { return calcTotalIncome() - calcTotalExpenses() - calcTotalDebt(); }

function calcBuckets() {
  const total = calcTotalIncome();
  const { needs, wants, savings } = state.budgetAllocation;
  return { needs: total * needs / 100, wants: total * wants / 100, savings: total * savings / 100 };
}

function calcPayoffTimeline(card, extraPerMonth = 0) {
  const balance  = parseFloat(card.balance) || 0;
  const minPay   = (parseFloat(card.minPayment) || 0) + extraPerMonth;
  const ea       = parseFloat(card.apr) || 0;
  const isLoan   = card.cardType === 'loan';
  const unit     = isLoan ? (currentLang === 'es' ? ' cuotas' : ' installments') : (currentLang === 'es' ? ' meses' : ' months');
  if (balance <= 0) return currentLang === 'es' ? 'Pagado' : 'Paid off';
  if (minPay <= 0)  return currentLang === 'es' ? 'Define la cuota mensual' : 'Set monthly payment';
  // EA → monthly effective rate: r = (1 + EA/100)^(1/12) − 1
  const r = ea === 0 ? 0 : Math.pow(1 + ea / 100, 1 / 12) - 1;
  if (r === 0) {
    const mo = Math.ceil(balance / minPay);
    return mo + unit;
  }
  if (minPay <= balance * r) return currentLang === 'es' ? 'Cuota insuficiente (no cubre intereses)' : 'Payment too low (doesn\'t cover interest)';
  const months = Math.ceil(-Math.log(1 - (balance * r) / minPay) / Math.log(1 + r));
  if (!isFinite(months) || months > 600) return '>50 años';
  if (isLoan) {
    const contractTerm = parseInt(card.loanTerm) || 0;
    const remaining = months + unit;
    return contractTerm > 0
      ? `${remaining} ${currentLang === 'es' ? `(plazo: ${contractTerm})` : `(term: ${contractTerm})`}`
      : remaining;
  }
  const yrs = Math.floor(months / 12), mo = months % 12;
  if (yrs === 0) return mo + unit;
  return `${yrs}${currentLang === 'es' ? 'a' : 'y'} ${mo}m`;
}

// Extra payment simulator — returns { monthsSaved, interestSaved, newMonths, origMonths }
function calcExtraPaymentImpact(card, extra) {
  const balance = parseFloat(card.balance) || 0;
  const minPay  = parseFloat(card.minPayment) || 0;
  const ea      = parseFloat(card.apr) || 0;
  if (balance <= 0 || minPay <= 0 || extra <= 0) return null;

  // EA → monthly effective rate: r = (1 + EA/100)^(1/12) − 1
  const r = ea === 0 ? 0 : Math.pow(1 + ea / 100, 1 / 12) - 1;
  function monthsToPayoff(payment) {
    if (payment <= 0) return Infinity;
    if (r === 0) return Math.ceil(balance / payment);
    if (payment <= balance * r) return Infinity;
    return Math.ceil(-Math.log(1 - (balance * r) / payment) / Math.log(1 + r));
  }

  const origMonths = monthsToPayoff(minPay);
  const newMonths  = monthsToPayoff(minPay + extra);
  if (!isFinite(origMonths) || !isFinite(newMonths)) return null;

  // Total interest = total paid − principal
  const origInterest = origMonths * minPay - balance;
  const newInterest  = newMonths * (minPay + extra) - balance;
  const interestSaved = Math.max(0, origInterest - newInterest);

  return { origMonths, newMonths, monthsSaved: origMonths - newMonths, interestSaved };
}

// ============================================================
// CALCULATIONS — GOALS
// ============================================================
function calcGoalSaved(goal) {
  if (goal.shared && goal.participants.length)
    return goal.participants.reduce((s, p) => s + (parseFloat(p.saved) || 0), 0);
  return parseFloat(goal.saved) || 0;
}

function calcGoalMonthly(goal) {
  const totalMonthly = goal.shared && goal.participants.length
    ? goal.participants.reduce((s, p) => s + (parseFloat(p.monthlyContrib) || 0), 0)
    : null;
  const monthly = totalMonthly !== null ? totalMonthly : parseFloat(goal.monthlyContrib) || 0;
  const remaining = Math.max(0, (parseFloat(goal.target) || 0) - calcGoalSaved(goal));
  if (goal.targetDate) {
    const now = new Date(), target = new Date(goal.targetDate);
    const months = Math.max(1, (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth()));
    return remaining / months;
  }
  return monthly;
}

function calcGoalETA(goal) {
  const remaining = Math.max(0, (parseFloat(goal.target) || 0) - calcGoalSaved(goal));
  if (remaining <= 0) return t('goals.completed');
  if (goal.targetDate) return new Date(goal.targetDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' });
  const monthly = goal.shared && goal.participants.length
    ? goal.participants.reduce((s, p) => s + (parseFloat(p.monthlyContrib) || 0), 0)
    : parseFloat(goal.monthlyContrib) || 0;
  if (monthly <= 0) return '—';
  const months = Math.ceil(remaining / monthly);
  const eta = new Date();
  eta.setMonth(eta.getMonth() + months);
  return eta.toLocaleDateString(undefined, { year: 'numeric', month: 'short' });
}

function calcParticipantStats(goal, participant) {
  const totalMonthly = goal.participants.reduce((s, p) => s + (parseFloat(p.monthlyContrib) || 0), 0);
  const target = parseFloat(goal.target) || 0;
  const partMonthly = parseFloat(participant.monthlyContrib) || 0;
  const partSaved   = parseFloat(participant.saved) || 0;
  const partTarget  = totalMonthly > 0 ? (partMonthly / totalMonthly) * target : 0;
  const pctDone     = partTarget > 0 ? Math.min(100, partSaved / partTarget * 100) : 0;
  const remaining   = Math.max(0, partTarget - partSaved);
  const monthsLeft  = partMonthly > 0 ? Math.ceil(remaining / partMonthly) : null;
  return { partTarget, partSaved, pctDone, monthsLeft };
}

function calcTotalGoals() { return state.goals.reduce((s, g) => s + calcGoalMonthly(g), 0); }

// ============================================================
// CALCULATIONS — NET WORTH
// ============================================================
function calcTotalAssets()      { return state.assets.reduce((s, a) => s + (parseFloat(a.value) || 0), 0); }
function calcTotalLiabilities() { return state.cards.reduce((s, c) => s + (parseFloat(c.balance) || 0), 0); }
function calcNetWorth()         { return calcTotalAssets() - calcTotalLiabilities(); }

// ============================================================
// CALCULATIONS — VARIABLE EXPENSES
// ============================================================
function calcTotalVarBudget() { return state.variableExpenses.reduce((s, v) => s + (parseFloat(v.budget) || 0), 0); }
function calcTotalVarSpent()  { return state.variableExpenses.reduce((s, v) => s + (parseFloat(v.spent) || 0), 0); }

// ============================================================
// CALCULATIONS — RATIOS
// ============================================================
function calcRatios() {
  const net      = calcTotalIncome();
  const housing  = state.expenses.filter(e => e.category === 'Housing').reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
  const expenses = calcTotalExpenses();
  const efGoal   = state.goals.find(g => /emergencia|emergency/i.test(g.name));
  const efSaved  = efGoal ? (parseFloat(efGoal.saved) || 0) : 0;
  return {
    housing:     { actual: net > 0 ? (housing / net) * 100 : 0 },
    dti:         { actual: calcDTI() },
    emergency:   { actual: expenses > 0 ? efSaved / expenses : 0 },
    savingsRate: { actual: net > 0 ? (calcBuckets().savings / net) * 100 : 0 }
  };
}

// ============================================================
// PROJECTION
// ============================================================
function buildProjection() {
  // Base monthly income: salary + strictly monthly streams
  const baseIncome = calcNetSalary() + state.income.otherStreams
    .filter(o => (o.frequency || 'monthly') === 'monthly')
    .reduce((s, o) => s + (parseFloat(o.amount) || 0), 0);
  const nonMonthly = state.income.otherStreams.filter(o => (o.frequency || 'monthly') !== 'monthly');
  const expenses = calcTotalExpenses();
  const debt     = calcTotalDebt();
  const goals    = calcTotalGoals();
  let cumBal = 0, cumGoals = 0;
  return Array.from({ length: 12 }, (_, i) => {
    const monthIdx = i + 1; // 1–12 relative to today
    const d = new Date();
    d.setMonth(d.getMonth() + monthIdx);
    const label = d.toLocaleDateString(currentLang === 'es' ? 'es' : undefined, { month: 'short', year: '2-digit' });
    // Add non-monthly streams to their actual pay months
    let extra = 0;
    nonMonthly.forEach(o => {
      const amt = parseFloat(o.amount) || 0;
      if (o.frequency === 'quarterly'  && monthIdx % 3 === 0) extra += amt;
      if (o.frequency === 'semiannual' && (monthIdx === 6 || monthIdx === 12)) extra += amt;
      if (o.frequency === 'annual'     && monthIdx === 12) extra += amt;
    });
    const delta = (baseIncome + extra) - expenses - debt - goals;
    cumBal   += delta;
    cumGoals += goals;
    return { label, balance: cumBal, goals: cumGoals, debt };
  });
}

// ============================================================
// ALERTS
// ============================================================
function buildAlerts() {
  const alerts = [];
  const now = new Date(), in7 = new Date(now.getTime() + 7 * 86400000);

  state.cards.forEach(c => {
    if (!c.dueDate) return;
    const due  = new Date(c.dueDate);
    if (due >= now && due <= in7) {
      const days = Math.ceil((due - now) / 86400000);
      alerts.push({ type: 'amber', msg: currentLang === 'es'
        ? `${c.name || 'Tarjeta'} vence en ${days} día${days !== 1 ? 's' : ''} — mínimo ${currency(parseFloat(c.minPayment) || 0)}`
        : `${c.name || 'Card'} due in ${days} day${days !== 1 ? 's' : ''} — minimum ${currency(parseFloat(c.minPayment) || 0)}`
      });
    }
  });

  const rem = calcAfterExpenses() - calcTotalDebt();
  if (rem < 0) alerts.push({ type: 'red', msg: currentLang === 'es'
    ? `Déficit de ${currency(Math.abs(rem))} tras gastos y deudas.`
    : `Deficit of ${currency(Math.abs(rem))} after expenses and debt.`
  });

  const savBucket = calcBuckets().savings;
  const goalTotal = calcTotalGoals();
  if (goalTotal > savBucket && savBucket > 0) alerts.push({ type: 'amber', msg: currentLang === 'es'
    ? `Metas requieren ${currency(goalTotal)}/mes — solo hay ${currency(savBucket)} en ahorro.`
    : `Goals need ${currency(goalTotal)}/mo — only ${currency(savBucket)} in savings.`
  });

  // Over-budget variable categories
  state.variableExpenses.forEach(v => {
    const budget = parseFloat(v.budget) || 0;
    const spent  = parseFloat(v.spent)  || 0;
    const cat    = VAR_CATEGORIES.find(c => c.id === v.categoryId);
    const icon   = cat ? cat.icon : '📦';
    if (spent > budget && budget > 0) alerts.push({ type: 'amber', msg: currentLang === 'es'
      ? `${icon} ${v.name}: gastaste ${currency(spent)} de ${currency(budget)} (${pct((spent / budget) * 100, 0)})`
      : `${icon} ${v.name}: spent ${currency(spent)} of ${currency(budget)} (${pct((spent / budget) * 100, 0)})`
    });
  });

  if (calcDTI() > 43) alerts.push({ type: 'red', msg: currentLang === 'es'
    ? `Ratio deuda/ingreso ${pct(calcDTI())} — por encima del umbral del 43%.`
    : `DTI ratio ${pct(calcDTI())} — above the 43% danger threshold.`
  });

  return alerts;
}

// ============================================================
// TOAST
// ============================================================
let toastTimer = null;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
}

// ============================================================
// CHARTS
// ============================================================
function drawDonut() {
  const canvas = document.getElementById('donut-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const total    = calcTotalIncome();
  const expenses = calcTotalExpenses();
  const debt     = calcTotalDebt();
  const goals    = calcTotalGoals();
  const varSpent = calcTotalVarSpent();
  const free     = Math.max(0, total - expenses - debt - goals - varSpent);

  const labels = currentLang === 'es'
    ? ['Gastos fijos', 'Deudas', 'Metas', 'Variables', 'Libre']
    : ['Fixed Expenses', 'Debt', 'Goals', 'Variable', 'Free'];

  const segments = [
    { label: labels[0], value: expenses, color: '#6366f1' },
    { label: labels[1], value: debt,     color: '#ef4444' },
    { label: labels[2], value: goals,    color: '#f59e0b' },
    { label: labels[3], value: varSpent, color: '#a855f7' },
    { label: labels[4], value: free,     color: '#22c55e' }
  ].filter(s => s.value > 0);

  const cx = W / 2, cy = H / 2, outerR = 90, innerR = 54;

  if (!segments.length) {
    ctx.beginPath(); ctx.arc(cx, cy, outerR, 0, Math.PI * 2); ctx.fillStyle = '#e2e8f0'; ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy, innerR, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
  } else {
    let angle = -Math.PI / 2;
    segments.forEach(seg => {
      const slice = (seg.value / total) * Math.PI * 2;
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, outerR, angle, angle + slice);
      ctx.closePath(); ctx.fillStyle = seg.color; ctx.fill();
      angle += slice;
    });
    ctx.beginPath(); ctx.arc(cx, cy, innerR, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
  }

  ctx.textAlign = 'center';
  ctx.font = 'bold 12px system-ui, sans-serif'; ctx.fillStyle = '#64748b';
  ctx.fillText(currentLang === 'es' ? 'Total' : 'Total', cx, cy - 5);
  ctx.font = 'bold 11px system-ui, sans-serif'; ctx.fillStyle = '#1e293b';
  ctx.fillText(currency(total), cx, cy + 12);

  const legend = document.getElementById('donut-legend');
  if (legend) {
    legend.innerHTML = segments.map(s =>
      `<div class="legend-item">
        <div class="legend-dot" style="background:${s.color}"></div>
        <span>${s.label}: <strong>${currency(s.value)}</strong></span>
      </div>`
    ).join('');
  }
}

function drawDTIGauge(canvas, dtiPct) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  const cx = W / 2, cy = H * 0.8, R = Math.min(W, H) * 0.42;
  ctx.beginPath(); ctx.arc(cx, cy, R, Math.PI, 2 * Math.PI);
  ctx.lineWidth = 13; ctx.strokeStyle = '#e2e8f0'; ctx.stroke();
  const color = dtiPct <= 20 ? '#22c55e' : dtiPct <= 36 ? '#f59e0b' : '#ef4444';
  const valueAngle = Math.PI + (Math.min(100, Math.max(0, dtiPct)) / 100) * Math.PI;
  ctx.beginPath(); ctx.arc(cx, cy, R, Math.PI, valueAngle);
  ctx.lineWidth = 13; ctx.strokeStyle = color; ctx.lineCap = 'round'; ctx.stroke();
  ctx.textAlign = 'center';
  ctx.font = 'bold 16px system-ui, sans-serif'; ctx.fillStyle = color;
  ctx.fillText(pct(dtiPct), cx, cy - 8);
  ctx.font = '10px system-ui, sans-serif'; ctx.fillStyle = '#94a3b8';
  ctx.fillText('DTI', cx, cy + 8);
}

// ============================================================
// NAV
// ============================================================
function setupNav() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.getElementById('section-' + item.dataset.section).classList.add('active');
      if (window.innerWidth <= 768) document.getElementById('sidebar').classList.remove('mobile-open');
      if (item.dataset.section === 'dashboard') setTimeout(drawDonut, 60);
      if (item.dataset.section === 'networth')  renderNetWorth();
    });
  });
  document.getElementById('mobile-menu-toggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('mobile-open');
  });
}

// ============================================================
// RENDER — DASHBOARD
// ============================================================
function renderDashboard() {
  renderSummaryCards();
  renderAlerts();
  drawDonut();
  renderProjection();
  renderBudgetPanel();
}

function renderSummaryCards() {
  const gross    = parseFloat(state.income.grossSalary) || 0;
  const net      = calcTotalIncome();
  const expenses = calcTotalExpenses();
  const debt     = calcTotalDebt();
  const free     = calcFreeAlloc();
  const goals    = calcTotalGoals();
  const cards = [
    { label: t('sc.gross'),  value: currency(gross),    cls: '' },
    { label: t('sc.net'),    value: currency(net),      cls: 'green' },
    { label: t('sc.fixed'),  value: currency(expenses), cls: '' },
    { label: t('sc.debt'),   value: currency(debt),     cls: debt > net * 0.36 ? 'red' : '' },
    { label: t('sc.free'),   value: currency(free),     cls: free >= 0 ? 'green' : 'red' },
    { label: t('sc.goals'),  value: currency(goals),    cls: 'amber' }
  ];
  document.getElementById('summary-cards').innerHTML = cards.map(c =>
    `<div class="summary-card ${c.cls}"><div class="sc-label">${c.label}</div><div class="sc-value">${c.value}</div></div>`
  ).join('');
}

function renderAlerts() {
  const alerts = buildAlerts();
  document.getElementById('alerts-container').innerHTML = alerts.map(a =>
    `<div class="alert ${a.type}"><span class="alert-icon">⚠</span><span>${a.msg}</span></div>`
  ).join('');
}

function renderProjection() {
  document.getElementById('projection-body').innerHTML = buildProjection().map(r =>
    `<tr>
      <td>${r.label}</td>
      <td style="color:${r.balance >= 0 ? 'var(--green-600)' : 'var(--red-600)'}">${currency(r.balance)}</td>
      <td>${currency(r.goals)}</td>
      <td>${currency(r.debt)}</td>
    </tr>`
  ).join('');
}

function renderBudgetPanel() {
  const total = calcTotalIncome();
  const buckets = [
    { key: 'needs',   label: t('alloc.needs'),  color: '#6366f1' },
    { key: 'wants',   label: t('alloc.wants'),  color: '#f59e0b' },
    { key: 'savings', label: t('alloc.savings'), color: '#22c55e' }
  ];
  document.getElementById('allocation-sliders').innerHTML = buckets.map(b =>
    `<div class="slider-row">
      <span class="slider-label" style="color:${b.color}">${b.label}</span>
      <input type="range" min="0" max="100" step="1" value="${state.budgetAllocation[b.key]}"
        data-key="${b.key}" class="alloc-slider" />
      <span class="slider-pct" id="pct-${b.key}">${state.budgetAllocation[b.key]}%</span>
      <span class="slider-amount" id="amt-${b.key}">${currency(total * state.budgetAllocation[b.key] / 100)}</span>
    </div>`
  ).join('');
  updateAllocationWarning();
  document.getElementById('allocation-sliders').querySelectorAll('.alloc-slider').forEach(slider => {
    slider.addEventListener('input', () => {
      const key = slider.dataset.key, val = parseInt(slider.value);
      state.budgetAllocation[key] = val;
      document.getElementById('pct-' + key).textContent = val + '%';
      document.getElementById('amt-' + key).textContent = currency(total * val / 100);
      updateAllocationWarning();
      saveState();
    });
  });
}

function updateAllocationWarning() {
  const { needs, wants, savings } = state.budgetAllocation;
  const sum = needs + wants + savings;
  let warn = '';
  if (sum !== 100) warn += `<div class="alloc-warn">${t('alloc.warn.sum')} ${sum}% — ajusta a 100%.</div>`;
  if (calcTotalDebt() > calcBuckets().savings) warn += `<div class="alloc-warn">${t('alloc.warn.debt')}</div>`;
  document.getElementById('allocation-totals').innerHTML = warn;
}

// ============================================================
// RENDER — INCOME (with % deductions)
// ============================================================
function renderIncome() {
  document.getElementById('gross-salary').value = state.income.grossSalary || '';
  renderDeductions();
  renderNonSalaryBenefits();
  renderOtherIncome();
  updateIncomeDisplays();
}

function renderDeductions() {
  const list  = document.getElementById('deductions-list');
  const gross = parseFloat(state.income.grossSalary) || 0;

  // Colombia presets button (only when currency is COP)
  const presetBtn = state.currency === 'COP'
    ? `<button class="btn-presets" id="btn-col-presets">${t('income.colPresets')}</button>`
    : '';

  if (!state.income.deductions.length) {
    list.innerHTML = presetBtn + `<div class="empty-state"><div class="empty-icon">📋</div>
      <p>${t('empty.deductions')}</p><p class="empty-hint">${t('empty.deductionsHint')}</p></div>`;
  } else {
    list.innerHTML = presetBtn + state.income.deductions.map(d => {
      const isPercent  = d.type === 'percent';
      const computed   = calcDeductionAmount(d);
      const computedTxt = isPercent && gross > 0
        ? `= ${currency(computed)}`
        : '';
      return `<div class="inline-form deduction-row" data-id="${d.id}">
        <div>
          <label class="field-label">${currentLang === 'es' ? 'Etiqueta' : 'Label'}</label>
          <input type="text" class="ded-label" placeholder="${t('income.labelPlaceholder')}" value="${esc(d.label)}" />
        </div>
        <div>
          <label class="field-label">${isPercent ? (currentLang === 'es' ? 'Porcentaje' : 'Percentage') : (currentLang === 'es' ? 'Monto' : 'Amount')}</label>
          <input type="number" class="ded-amount" min="0" step="${isPercent ? '0.001' : '0.01'}"
            placeholder="${isPercent ? '0.00%' : '0.00'}" value="${d.amount || ''}" />
          <div class="ded-computed">${computedTxt}</div>
        </div>
        <div>
          <label class="field-label" style="visibility:hidden">_</label>
          <div class="ded-type-group">
            <button class="ded-type-btn ${!isPercent ? 'active' : ''}" data-t="fixed">$</button>
            <button class="ded-type-btn ${isPercent ? 'active' : ''}" data-t="percent">%</button>
          </div>
        </div>
        <div>
          <label class="field-label" style="visibility:hidden">_</label>
          <button class="btn-remove btn-remove-ded">✕</button>
        </div>
      </div>`;
    }).join('');

    // Retención button (only when COP)
    if (state.currency === 'COP' && gross > 0) {
      list.innerHTML += `<button class="btn-presets" id="btn-calc-ret" style="background:#e8f5e9;border-color:#a5d6a7;color:#1b5e20">${t('income.calcRet')}</button>`;
    }
  }

  // Re-bind Colombia presets button
  const colBtn = document.getElementById('btn-col-presets');
  if (colBtn) {
    colBtn.addEventListener('click', () => {
      COLOMBIA_PRESETS.forEach(p => {
        const already = state.income.deductions.find(d => d.label === p.label);
        if (!already) state.income.deductions.push({ id: uid(), ...p });
      });
      renderDeductions(); updateIncomeDisplays(); updateDashboardPartial(); saveState();
    });
  }

  const retBtn = document.getElementById('btn-calc-ret');
  if (retBtn) {
    retBtn.addEventListener('click', () => {
      const ret = calcRetencionFuente(gross);
      if (ret > 0) {
        const existing = state.income.deductions.find(d => /retención|retencion|withholding/i.test(d.label));
        if (existing) {
          existing.amount = ret; existing.type = 'fixed';
        } else {
          state.income.deductions.push({ id: uid(), label: currentLang === 'es' ? 'Retención en la fuente' : 'Withholding Tax', amount: ret, type: 'fixed' });
        }
        renderDeductions(); updateIncomeDisplays(); updateDashboardPartial(); saveState();
        showToast(`Retención estimada: ${currency(ret)} (${t('income.retInfo')})`);
      } else {
        showToast(currentLang === 'es' ? 'Salario por debajo del umbral de retención.' : 'Salary below withholding threshold.');
      }
    });
  }

  // Contribution base info row (only shown when there are % deductions or non-salary benefits)
  const baseRow = document.getElementById('deduction-base-row');
  if (baseRow) {
    const hasPercent = state.income.deductions.some(d => d.type === 'percent');
    const hasBenefits = (state.income.nonSalaryBenefits || []).length > 0;
    if ((hasPercent || hasBenefits) && gross > 0) {
      baseRow.style.display = '';
      baseRow.innerHTML = `<span class="ded-base-label">${t('income.deductionBase')}</span><span class="ded-base-value">${currency(gross)}</span>`;
    } else {
      baseRow.style.display = 'none';
    }
  }
}

function renderNonSalaryBenefits() {
  const list = document.getElementById('nonsalary-list');
  if (!list) return;
  const benefits = state.income.nonSalaryBenefits || [];

  const presetBtn = state.currency === 'COP'
    ? `<button class="btn-presets btn-presets-sm" id="btn-col-nonsalary">${t('income.colNonSalaryPresets')}</button>`
    : '';

  if (!benefits.length) {
    list.innerHTML = presetBtn + `<p class="nonsalary-hint">${t('income.nonSalaryHint')}</p>`;
  } else {
    list.innerHTML = presetBtn + benefits.map(b =>
      `<div class="inline-form nonsalary-row" data-nsid="${b.id}">
        <div>
          <label class="field-label">${currentLang === 'es' ? 'Concepto' : 'Concept'}</label>
          <input type="text" class="ns-label" placeholder="${currentLang === 'es' ? 'Ej. Bono conectividad' : 'E.g. Connectivity bonus'}" value="${esc(b.label || '')}" />
        </div>
        <div>
          <label class="field-label">${currentLang === 'es' ? 'Monto mensual' : 'Monthly Amount'}</label>
          <input type="number" class="ns-amount" min="0" step="0.01" placeholder="0.00" value="${b.amount || ''}" />
        </div>
        <div>
          <label class="field-label" style="visibility:hidden">_</label>
          <button class="btn-remove btn-remove-ns">✕</button>
        </div>
      </div>`
    ).join('');
  }

  const colNsBtn = document.getElementById('btn-col-nonsalary');
  if (colNsBtn) {
    colNsBtn.addEventListener('click', () => {
      COLOMBIA_NONSALARY_PRESETS.forEach(p => {
        const already = (state.income.nonSalaryBenefits || []).find(b => b.label === p.label);
        if (!already) state.income.nonSalaryBenefits.push({ id: uid(), label: p.label, amount: 0 });
      });
      renderNonSalaryBenefits(); renderDeductions(); updateIncomeDisplays(); saveState();
    });
  }
}

function renderOtherIncome() {
  const list  = document.getElementById('other-income-list');
  const gross = parseFloat(state.income.grossSalary) || 0;
  const primaBtn = state.currency === 'COP' && gross > 0
    ? `<button class="btn-presets" id="btn-prima-preset" style="background:#fdf3f3;border-color:#f5c6c6;color:#7f1d1d">${t('income.colPrimaPreset')}</button>`
    : '';

  const freqOpts = [
    { v: 'monthly',    label: t('income.freqMonthly')    },
    { v: 'quarterly',  label: t('income.freqQuarterly')  },
    { v: 'semiannual', label: t('income.freqSemiannual') },
    { v: 'annual',     label: t('income.freqAnnual')     },
  ];

  if (!state.income.otherStreams.length) {
    list.innerHTML = primaBtn + `<div class="empty-state"><div class="empty-icon">💰</div>
      <p>${t('empty.streams')}</p><p class="empty-hint">${t('empty.streamsHint')}</p></div>`;
  } else {
    list.innerHTML = primaBtn + state.income.otherStreams.map(o => {
      const freq    = o.frequency || 'monthly';
      const divisor = FREQ_DIVISORS[freq] || 1;
      const monthly = (parseFloat(o.amount) || 0) / divisor;
      const equivTxt = freq !== 'monthly' && monthly > 0
        ? `= ${currency(monthly)} ${t('income.freqEquiv')}`
        : '';
      return `<div class="inline-form income-row" data-id="${o.id}">
        <div>
          <label class="field-label">${currentLang === 'es' ? 'Concepto' : 'Label'}</label>
          <input type="text" class="inc-label" placeholder="${t('income.streamPlaceholder')}" value="${esc(o.label)}" />
        </div>
        <div>
          <label class="field-label">${currentLang === 'es' ? 'Monto' : 'Amount'}</label>
          <input type="number" class="inc-amount" min="0" step="0.01" placeholder="0.00" value="${o.amount || ''}" />
          <div class="ded-computed">${equivTxt}</div>
        </div>
        <div>
          <label class="field-label">${t('income.freqLabel')}</label>
          <select class="inc-freq">
            ${freqOpts.map(f => `<option value="${f.v}" ${freq === f.v ? 'selected' : ''}>${f.label}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="field-label" style="visibility:hidden">_</label>
          <button class="btn-remove btn-remove-inc">✕</button>
        </div>
      </div>`;
    }).join('');
  }

  // Bind prima preset button
  const primaEl = document.getElementById('btn-prima-preset');
  if (primaEl) {
    primaEl.addEventListener('click', () => {
      const primaLabel = 'Prima de servicios';
      const already = state.income.otherStreams.find(o => o.label === primaLabel);
      if (!already) {
        const primaAmount = Math.round((parseFloat(state.income.grossSalary) || 0) / 2);
        state.income.otherStreams.push({ id: uid(), label: primaLabel, amount: primaAmount, frequency: 'semiannual' });
        renderOtherIncome(); updateIncomeDisplays(); updateDashboardPartial(); saveState();
      }
    });
  }
}

function updateIncomeDisplays() {
  const net        = calcNetSalary();
  const other      = calcOtherIncome();
  const total      = calcTotalIncome();
  const nonMonthly = calcNonMonthlyIncome();
  document.getElementById('net-salary-display').textContent   = currency(net);
  document.getElementById('other-income-display').textContent = currency(other);
  document.getElementById('total-income-display').textContent = currency(total);
  document.getElementById('net-salary-display').className = 'amount-lg ' + (net >= 0 ? 'text-green' : 'text-red');
  const nmRow = document.getElementById('nonmonthly-row');
  if (nmRow) {
    nmRow.style.display = nonMonthly > 0 ? '' : 'none';
    const nmDisp = document.getElementById('nonmonthly-income-display');
    if (nmDisp) nmDisp.textContent = currency(nonMonthly);
    const nmLabel = document.getElementById('nonmonthly-label');
    if (nmLabel) nmLabel.textContent = t('income.nonMonthly');
  }
}

// ============================================================
// RENDER — EXPENSES
// ============================================================
const CATEGORIES = ['Housing', 'Utilities', 'Transport', 'Subscriptions', 'Insurance', 'Education', 'Food/Groceries', 'Other'];

function renderExpenses() {
  const list = document.getElementById('expenses-list');
  if (!state.expenses.length) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">🧾</div>
      <p>${t('empty.expenses')}</p><p class="empty-hint">${t('empty.expensesHint')}</p></div>`;
  } else {
    list.innerHTML = state.expenses.map(e =>
      `<div class="inline-form expense-row" data-id="${e.id}">
        <div><label class="field-label">${currentLang === 'es' ? 'Nombre' : 'Name'}</label>
          <input class="exp-name" type="text" placeholder="${t('expense.namePlaceholder')}" value="${esc(e.name)}" /></div>
        <div><label class="field-label">${currentLang === 'es' ? 'Monto' : 'Amount'}</label>
          <input class="exp-amount" type="number" min="0" step="0.01" placeholder="0.00" value="${e.amount || ''}" /></div>
        <div><label class="field-label">${currentLang === 'es' ? 'Categoría' : 'Category'}</label>
          <select class="exp-category">
            ${CATEGORIES.map(cat => `<option value="${cat}" ${e.category === cat ? 'selected' : ''}>${t('cat.' + cat)}</option>`).join('')}
          </select></div>
        <div><label class="field-label">${currentLang === 'es' ? 'Notas' : 'Notes'}</label>
          <input class="exp-notes" type="text" placeholder="${currentLang === 'es' ? 'Opcional' : 'Optional'}" value="${esc(e.notes || '')}" /></div>
        <button class="btn-remove btn-remove-exp">✕</button>
      </div>`
    ).join('');
  }
  updateExpenseDisplays();
}

function updateExpenseDisplays() {
  const total     = calcTotalExpenses();
  const remaining = calcAfterExpenses();
  document.getElementById('total-expenses-display').textContent   = currency(total);
  document.getElementById('remaining-income-display').textContent = currency(remaining);
  document.getElementById('remaining-income-display').className   = 'amount-lg ' + (remaining >= 0 ? 'text-green' : 'text-red');
}

// ============================================================
// RENDER — DEBT (with extra payment simulator)
// ============================================================
function renderDebt() {
  const list = document.getElementById('cards-list');
  if (!state.cards.length) {
    list.innerHTML = `<div class="card"><div class="empty-state"><div class="empty-icon">💳</div>
      <p>${t('empty.cards')}</p><p class="empty-hint">${t('empty.cardsHint')}</p></div></div>`;
  } else {
    list.innerHTML = state.cards.map(c => renderCardHTML(c)).join('');
  }
  document.getElementById('payoff-method').value = state.payoffMethod;
  renderDebtSummary();
}

function renderCardHTML(card) {
  const isLoan     = card.cardType === 'loan';
  const obligation = calcCardObligation(card);
  const balance    = parseFloat(card.balance) || 0;
  const limit      = parseFloat(card.limit) || 0;
  const utilPct    = limit > 0 ? Math.min(100, (balance / limit) * 100) : 0;
  const utilColor  = utilPct < 30 ? 'green' : utilPct < 70 ? 'amber' : 'red';
  const timeline   = calcPayoffTimeline(card);

  const instHTML = (card.installments || []).map(inst =>
    `<div class="installment-row" data-inst-id="${inst.id}">
      <div><label class="field-label">${t('inst.item')}</label>
        <input class="inst-name" type="text" placeholder="${currentLang === 'es' ? 'Nombre' : 'Item'}" value="${esc(inst.name || '')}" /></div>
      <div><label class="field-label">${t('inst.total')}</label>
        <input class="inst-total" type="number" min="0" step="0.01" placeholder="0.00" value="${inst.total || ''}" /></div>
      <div><label class="field-label">${t('inst.count')}</label>
        <input class="inst-count" type="number" min="1" step="1" placeholder="12" value="${inst.installments || ''}" /></div>
      <div><label class="field-label">${t('inst.paid')}</label>
        <input class="inst-paid" type="number" min="0" step="1" placeholder="0" value="${inst.paid || ''}" /></div>
      <div><label class="field-label">${t('inst.monthly')}</label>
        <span style="font-size:.8rem;font-weight:700;color:var(--blue-600);padding:.35rem 0;display:block">
          ${inst.total && inst.installments ? currency(parseFloat(inst.total) / parseInt(inst.installments)) : '—'}
        </span></div>
      <button class="btn-remove btn-remove-inst" style="align-self:flex-end">✕</button>
    </div>`
  ).join('');

  return `<div class="card-debt" data-card-id="${card.id}">
    <div class="card-debt-header">
      <div>
        <div class="card-type-row">
          <select class="card-type-select">
            <option value="card" ${!isLoan ? 'selected' : ''}>${t('debt.typeCard')}</option>
            <option value="loan" ${isLoan ? 'selected' : ''}>${t('debt.typeLoan')}</option>
          </select>
        </div>
        <input class="card-debt-title-input" type="text"
          placeholder="${currentLang === 'es' ? 'Nombre de tarjeta / préstamo' : 'Card / Loan Name'}"
          value="${esc(card.name || '')}" />
        <div class="card-debt-meta">${t('debt.obligation')}: <strong>${currency(obligation)}</strong></div>
      </div>
      <button class="btn-remove btn-remove-card">✕</button>
    </div>

    <div class="card-debt-fields">
      <div><label class="field-label">${isLoan ? t('debt.loanOriginal') : (currentLang === 'es' ? 'Límite' : 'Limit')} ${tip('card.limit')}</label>
        <input class="field-input card-limit" type="number" min="0" step="0.01" placeholder="0.00" value="${card.limit || ''}" /></div>
      <div><label class="field-label">${currentLang === 'es' ? 'Saldo' : 'Balance'} ${tip('card.balance')}</label>
        <input class="field-input card-balance" type="number" min="0" step="0.01" placeholder="0.00" value="${card.balance || ''}" /></div>
      <div><label class="field-label">${isLoan ? (currentLang === 'es' ? 'Cuota mensual' : 'Monthly Payment') : (currentLang === 'es' ? 'Pago mínimo' : 'Min Payment')} ${tip('card.minpay')}</label>
        <input class="field-input card-minpay" type="number" min="0" step="0.01" placeholder="0.00" value="${card.minPayment || ''}" /></div>
      <div><label class="field-label">Tasa EA % ${tip('card.apr')}</label>
        <input class="field-input card-apr" type="number" min="0" max="100" step="0.01" placeholder="0.00" value="${card.apr || ''}" /></div>
      ${isLoan
        ? `<div><label class="field-label">${t('debt.loanTerm')} ${tip('card.loanterm')}</label>
            <input class="field-input card-loanterm" type="number" min="1" step="1" placeholder="36" value="${card.loanTerm || ''}" /></div>`
        : `<div><label class="field-label">${currentLang === 'es' ? 'Fecha de corte' : 'Due Date'} ${tip('card.duedate')}</label>
            <input class="field-input card-due" type="date" value="${card.dueDate || ''}" /></div>`
      }
    </div>

    <div>
      <div class="util-row">
        <span>${isLoan ? (currentLang === 'es' ? 'Saldo vs. monto original' : 'Balance vs Original') : (currentLang === 'es' ? 'Saldo vs. límite' : 'Balance vs Limit')}</span>
        <span>${pct(utilPct, 0)} ${currentLang === 'es' ? 'utilizado' : 'utilized'}</span>
      </div>
      <div class="progress-wrap"><div class="progress-bar ${utilColor}" style="width:${utilPct}%"></div></div>
    </div>

    <div class="payoff-badge">
      ${isLoan
        ? `⏱ ${currentLang === 'es' ? 'Cuotas restantes (estimado)' : 'Remaining installments (est.)'}: <strong style="margin-left:.3rem">${timeline}</strong>`
        : `${t('payoff.prefix')} (${state.payoffMethod}): <strong style="margin-left:.3rem">${timeline}</strong>`
      }
    </div>

    <!-- Extra Payment Simulator -->
    <div class="extra-sim">
      <div class="extra-sim-title">${t('debt.extraSim')}</div>
      <div class="extra-sim-row">
        <input type="number" class="extra-sim-input extra-payment-input"
          min="0" step="1000" placeholder="${t('debt.extraPlaceholder')}"
          value="${card._extraPayment || ''}" />
        <div class="extra-sim-result empty" id="extra-result-${card.id}">${t('debt.extraResult')}</div>
      </div>
    </div>

    ${!isLoan ? `<div class="installments-section">
      <div class="card-title">${currentLang === 'es' ? 'Cuotas activas' : 'Active Installments'}</div>
      <div class="installments-list">${instHTML}</div>
      <button class="btn-add-sm btn-add-inst" style="margin-top:.5rem">${t('inst.add')}</button>
    </div>` : ''}
  </div>`;
}

function renderDebtSummary() {
  const total  = calcTotalDebt();
  const dti    = calcDTI();
  const totBal = state.cards.reduce((s, c) => s + (parseFloat(c.balance) || 0), 0);
  const totLim = state.cards.reduce((s, c) => s + (parseFloat(c.limit) || 0), 0);
  const sumEl  = document.getElementById('debt-summary');
  if (!sumEl) return;
  sumEl.innerHTML = `
    <div class="debt-metric">
      <div class="dm-value ${total > calcTotalIncome() * 0.36 ? 'text-red' : 'text-green'}">${currency(total)}</div>
      <div class="dm-label">${t('debt.obligation')}</div>
    </div>
    <div class="debt-metric">
      <canvas id="dti-canvas" width="140" height="80"></canvas>
    </div>
    <div class="debt-metric">
      <div class="dm-value">${currency(totBal)}</div>
      <div class="dm-label">${t('debt.totalBalance')}</div>
    </div>
    <div class="debt-metric">
      <div class="dm-value">${totLim > 0 ? pct((totBal / totLim) * 100, 0) : '—'}</div>
      <div class="dm-label">${t('debt.utilization')}</div>
    </div>`;
  drawDTIGauge(document.getElementById('dti-canvas'), dti);
}

// ============================================================
// RENDER — GOALS
// ============================================================
function renderGoals() {
  const list = document.getElementById('goals-list');
  if (!state.goals.length) {
    list.innerHTML = `<div class="card"><div class="empty-state"><div class="empty-icon">🎯</div>
      <p>${t('empty.goals')}</p><p class="empty-hint">${t('empty.goalsHint')}</p></div></div>`;
  } else {
    list.innerHTML = state.goals.map((g, i) => renderGoalHTML(g, i + 1)).join('');
  }
  renderGoalsSummary();
}

function renderGoalHTML(goal, priority) {
  const target   = parseFloat(goal.target) || 0;
  const saved    = calcGoalSaved(goal);
  const pctDone  = target > 0 ? Math.min(100, (saved / target) * 100) : 0;
  const eta      = calcGoalETA(goal);
  const monthly  = calcGoalMonthly(goal);
  const isShared = !!goal.shared;

  const soloFields = isShared ? '' : `
      <div><label class="field-label">${currentLang === 'es' ? 'Ahorrado' : 'Saved So Far'}</label>
        <input class="field-input goal-saved" type="number" min="0" step="0.01" placeholder="0.00" value="${goal.saved || ''}" /></div>
      <div><label class="field-label">${currentLang === 'es' ? 'Aporte mensual' : 'Monthly Contrib'}</label>
        <input class="field-input goal-monthly" type="number" min="0" step="0.01" placeholder="0.00" value="${goal.monthlyContrib || ''}" /></div>`;

  const participantsHTML = isShared ? `
    <div class="goal-participants">
      <div class="participants-title">${t('goals.participants')}</div>
      ${goal.participants.map(p => renderParticipantRow(p)).join('')}
      <button class="btn-add btn-add-part">${t('goals.addParticipant')}</button>
    </div>
    <div class="goal-shared-progress">
      ${goal.participants.map(p => renderParticipantProgress(goal, p)).join('')}
      ${goal.participants.length ? renderCombinedProgress(goal, pctDone, saved, target, monthly, eta) : ''}
    </div>` : `
    <div class="goal-progress-labels">
      <span>${currency(saved)} ${currentLang === 'es' ? 'ahorrado' : 'saved'}</span>
      <span>${pct(pctDone, 0)} ${currentLang === 'es' ? 'de' : 'of'} ${currency(target)}</span>
    </div>
    <div class="progress-wrap">
      <div class="progress-bar ${pctDone >= 100 ? 'green' : pctDone >= 50 ? 'amber' : ''}" style="width:${pctDone}%"></div>
    </div>
    <div class="goal-eta">
      ${pctDone >= 100 ? t('goals.completed') : `${t('goals.needs')} ${currency(monthly)}${t('goals.perMonth')} — ${t('goals.eta')}: <strong>${eta}</strong>`}
    </div>`;

  return `<div class="goal-card" data-goal-id="${goal.id}">
    <div class="goal-card-header">
      <div style="display:flex;align-items:center;gap:.625rem">
        <span class="priority-badge">${priority}</span>
        <input class="goal-name-input" type="text" placeholder="${t('goals.namePlaceholder')}" value="${esc(goal.name || '')}" />
      </div>
      <div style="display:flex;align-items:center;gap:.75rem">
        <label class="shared-toggle-label">
          <input type="checkbox" class="goal-shared-chk" ${isShared ? 'checked' : ''} />
          <span>${t('goals.shared')}</span>
        </label>
        <button class="btn-remove btn-remove-goal">✕</button>
      </div>
    </div>
    <div class="goal-fields">
      <div><label class="field-label">${currentLang === 'es' ? 'Meta total' : 'Total Target'}</label>
        <input class="field-input goal-target" type="number" min="0" step="0.01" placeholder="0.00" value="${goal.target || ''}" /></div>
      ${soloFields}
      <div><label class="field-label">${currentLang === 'es' ? 'Fecha objetivo' : 'Target Date'}</label>
        <input class="field-input goal-date" type="date" value="${goal.targetDate || ''}" /></div>
    </div>
    ${participantsHTML}
  </div>`;
}

function renderParticipantRow(p) {
  const isVar = p.incomeType === 'variable';
  return `<div class="participant-row" data-part-id="${p.id}">
    <div>
      <label class="field-label">${t('goals.partName')}</label>
      <input class="field-input part-name" type="text" placeholder="${currentLang === 'es' ? 'Nombre' : 'Name'}" value="${esc(p.name || '')}" />
    </div>
    <div>
      <label class="field-label">${t('goals.partType')}</label>
      <select class="field-input part-type">
        <option value="fixed" ${!isVar ? 'selected' : ''}>${t('goals.partTypeFixed')}</option>
        <option value="variable" ${isVar ? 'selected' : ''}>${t('goals.partTypeVariable')} ⚡</option>
      </select>
    </div>
    <div>
      <label class="field-label">${t('goals.partContrib')}${isVar ? ` <span class="variable-est">${t('goals.variableNote')}</span>` : ''}</label>
      <input class="field-input part-contrib" type="number" min="0" step="0.01" placeholder="0.00" value="${p.monthlyContrib || ''}" />
    </div>
    <div>
      <label class="field-label">${t('goals.partSaved')}</label>
      <input class="field-input part-saved" type="number" min="0" step="0.01" placeholder="0.00" value="${p.saved || ''}" />
    </div>
    <div>
      <label class="field-label" style="visibility:hidden">_</label>
      <button class="btn-remove btn-remove-part">✕</button>
    </div>
  </div>`;
}

function renderParticipantProgress(goal, p) {
  const { partTarget, partSaved, pctDone, monthsLeft } = calcParticipantStats(goal, p);
  const isVar = p.incomeType === 'variable';
  const barCls = pctDone >= 100 ? 'green' : pctDone >= 50 ? 'amber' : '';
  const etaStr = monthsLeft !== null ? `${monthsLeft} ${t('goals.monthsLeft')}` : '—';
  const contrib = parseFloat(p.monthlyContrib) || 0;
  return `<div class="part-progress-item">
    <div class="part-progress-header">
      <span class="part-name-lbl">${esc(p.name || '—')}${isVar ? ' <span class="badge-variable">⚡</span>' : ''}</span>
      <span class="part-pct-lbl">${currency(partSaved)} / ${currency(partTarget)} (${pct(pctDone, 0)})</span>
    </div>
    <div class="progress-wrap">
      <div class="progress-bar ${barCls}" style="width:${pctDone}%"></div>
    </div>
    <div class="part-meta">${contrib > 0 ? `${currency(contrib)}${t('goals.perMonth')}` : '—'} · ${pctDone >= 100 ? t('goals.completed') : etaStr}</div>
  </div>`;
}

function renderCombinedProgress(goal, pctDone, saved, target, monthly, eta) {
  const barCls = pctDone >= 100 ? 'green' : pctDone >= 50 ? 'amber' : '';
  return `<div class="combined-progress">
    <div class="part-progress-header">
      <span class="part-name-lbl" style="font-weight:800">${t('goals.combined')}</span>
      <span class="part-pct-lbl">${currency(saved)} / ${currency(target)} (${pct(pctDone, 0)})</span>
    </div>
    <div class="progress-wrap" style="height:10px">
      <div class="progress-bar ${barCls}" style="width:${pctDone}%"></div>
    </div>
    <div class="part-meta">${pctDone >= 100 ? t('goals.completed') : `${currency(monthly)}${t('goals.perMonth')} — ${t('goals.eta')}: <strong>${eta}</strong>`}</div>
  </div>`;
}

function renderGoalsSummary() {
  const needed = calcTotalGoals(), avail = calcBuckets().savings;
  let html = `
    <div class="result-row"><span>${t('goals.needed')}</span><strong>${currency(needed)}</strong></div>
    <div class="result-row"><span>${t('goals.available')}</span><strong>${currency(avail)}</strong></div>`;
  if (needed > avail && avail > 0) {
    html += `<div class="goals-overcommit">⚠ ${t('goals.overcommit')} ${currency(needed - avail)}${t('goals.perMonth')}.</div>`;
  } else if (avail > 0) {
    html += `<div class="goals-ok">✓ ${t('goals.fit')} ${t('goals.surplus')}: ${currency(avail - needed)}</div>`;
  }
  document.getElementById('goals-summary').innerHTML = html;
}

// ============================================================
// RENDER — NET WORTH
// ============================================================
function renderNetWorth() {
  const totalAssets      = calcTotalAssets();
  const totalLiabilities = calcTotalLiabilities();
  const netWorth         = calcNetWorth();
  const assetTypes       = t('nw.assetTypes');

  // Banner
  document.getElementById('networth-summary-bar').innerHTML = `
    <div>
      <div class="nw-label">${t('nw.netWorth')}</div>
      <div class="nw-value ${netWorth >= 0 ? 'positive' : 'negative'}">${currency(netWorth)}</div>
    </div>
    <div class="nw-trio">
      <div class="nw-stat">
        <div class="nw-stat-val" style="color:#4ade80">${currency(totalAssets)}</div>
        <div class="nw-stat-lbl">${t('nw.assets')}</div>
      </div>
      <div class="nw-stat" style="color:rgba(255,255,255,.4);font-size:1.5rem;padding-top:.5rem">−</div>
      <div class="nw-stat">
        <div class="nw-stat-val" style="color:#f87171">${currency(totalLiabilities)}</div>
        <div class="nw-stat-lbl">${t('nw.liabilities')}</div>
      </div>
    </div>`;

  // Assets list
  const assetList = document.getElementById('assets-list');
  if (!state.assets.length) {
    assetList.innerHTML = `<div class="empty-state"><div class="empty-icon">💎</div>
      <p>${t('empty.assets')}</p><p class="empty-hint">${t('empty.assetsHint')}</p></div>`;
  } else {
    assetList.innerHTML = state.assets.map(a =>
      `<div class="asset-row" data-asset-id="${a.id}">
        <div class="asset-icon">${ASSET_ICONS[a.type] || '📦'}</div>
        <div><input type="text" class="asset-name" placeholder="${currentLang === 'es' ? 'Nombre' : 'Name'}" value="${esc(a.name || '')}" /></div>
        <div>
          <select class="asset-type">
            ${Object.entries(assetTypes).map(([k, v]) => `<option value="${k}" ${a.type === k ? 'selected' : ''}>${v}</option>`).join('')}
          </select>
        </div>
        <div><input type="number" class="asset-value" min="0" step="0.01" placeholder="0.00" value="${a.value || ''}" /></div>
        <button class="btn-remove btn-remove-asset">✕</button>
      </div>`
    ).join('');
  }

  // Asset totals
  document.getElementById('total-assets-display').textContent      = currency(totalAssets);
  document.getElementById('total-liabilities-display').textContent = currency(totalLiabilities);

  // Liabilities (from cards)
  const liabList = document.getElementById('liabilities-list');
  if (!state.cards.length) {
    liabList.innerHTML = `<div style="font-size:.8rem;color:var(--gray-400);padding:.5rem 0">${currentLang === 'es' ? 'Agrega tarjetas/préstamos en la sección Deudas.' : 'Add cards/loans in the Debt section.'}</div>`;
  } else {
    liabList.innerHTML = state.cards.map(c =>
      `<div class="liability-item">
        <span class="liability-name">💳 ${esc(c.name) || (currentLang === 'es' ? 'Tarjeta sin nombre' : 'Unnamed card')}</span>
        <span class="liability-amount">${currency(parseFloat(c.balance) || 0)}</span>
      </div>`
    ).join('');
  }
}

// ============================================================
// RENDER — VARIABLE EXPENSES
// ============================================================
function renderVariable() {
  // Month label
  const now = new Date();
  document.getElementById('variable-month-label').textContent =
    now.toLocaleDateString(currentLang === 'es' ? 'es' : undefined, { month: 'long', year: 'numeric' });

  const list = document.getElementById('variable-list');
  if (!state.variableExpenses.length) {
    list.innerHTML = `<div class="card"><div class="empty-state"><div class="empty-icon">🛒</div>
      <p>${t('empty.variable')}</p><p class="empty-hint">${t('empty.variableHint')}</p></div></div>`;
  } else {
    list.innerHTML = state.variableExpenses.map(v => {
      const budget  = parseFloat(v.budget)  || 0;
      const spent   = parseFloat(v.spent)   || 0;
      const usePct  = budget > 0 ? (spent / budget) * 100 : 0;
      const barColor = usePct >= 100 ? 'red' : usePct >= 80 ? 'amber' : 'green';
      const remaining = budget - spent;
      const cat = VAR_CATEGORIES.find(c => c.id === v.categoryId) || VAR_CATEGORIES[VAR_CATEGORIES.length - 1];

      return `<div class="variable-card" data-var-id="${v.id}">
        <div class="variable-header">
          <select class="variable-icon-select var-category">
            ${VAR_CATEGORIES.map(c => `<option value="${c.id}" ${v.categoryId === c.id ? 'selected' : ''}>${c.icon}</option>`).join('')}
          </select>
          <div><label class="field-label">${currentLang === 'es' ? 'Nombre' : 'Name'}</label>
            <input type="text" class="var-name" placeholder="${currentLang === 'es' ? 'Ej. Restaurantes' : 'e.g. Dining'}" value="${esc(v.name || '')}" /></div>
          <div><label class="field-label">${t('variable.budget')}</label>
            <input type="number" class="var-budget" min="0" step="0.01" placeholder="0.00" value="${v.budget || ''}" /></div>
          <div><label class="field-label">${t('variable.spent')}</label>
            <input type="number" class="var-spent" min="0" step="0.01" placeholder="0.00" value="${v.spent || ''}" /></div>
          <button class="btn-remove btn-remove-var" style="align-self:flex-end">✕</button>
        </div>
        <div class="variable-progress-row">
          <span>${cat.icon} ${pct(usePct, 0)} ${currentLang === 'es' ? 'del presupuesto' : 'of budget'}</span>
          <span class="${remaining < 0 ? 'variable-over' : 'variable-ok'}">
            ${remaining >= 0
              ? `${currency(remaining)} ${currentLang === 'es' ? 'disponible' : 'left'}`
              : `${currency(Math.abs(remaining))} ${currentLang === 'es' ? 'excedido' : 'over'} ⚠`}
          </span>
        </div>
        <div class="progress-wrap">
          <div class="progress-bar ${barColor}" style="width:${Math.min(100, usePct)}%"></div>
        </div>
      </div>`;
    }).join('');
  }

  renderVariableSummary();
}

function renderVariableSummary() {
  const totalBudget = calcTotalVarBudget();
  const totalSpent  = calcTotalVarSpent();
  const usePct      = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const remaining   = totalBudget - totalSpent;
  const barColor    = usePct >= 100 ? 'red' : usePct >= 80 ? 'amber' : 'green';

  document.getElementById('variable-summary').innerHTML = `
    <div class="variable-summary-row">
      <span>${t('variable.budget')}</span><strong>${currency(totalBudget)}</strong>
    </div>
    <div class="variable-summary-row">
      <span>${t('variable.spent')}</span><strong>${currency(totalSpent)}</strong>
    </div>
    <div class="variable-summary-row">
      <span>${t('variable.remaining')}</span>
      <strong class="${remaining >= 0 ? 'text-green' : 'text-red'}">${currency(remaining)}</strong>
    </div>
    <div class="variable-total-bar">
      <div style="display:flex;justify-content:space-between;font-size:.72rem;color:var(--gray-400);margin-bottom:.3rem">
        <span>${pct(usePct, 0)} ${currentLang === 'es' ? 'del presupuesto variable utilizado' : 'of variable budget used'}</span>
      </div>
      <div class="progress-wrap"><div class="progress-bar ${barColor}" style="width:${Math.min(100, usePct)}%"></div></div>
    </div>`;
}

// ============================================================
// RENDER — RATIOS
// ============================================================
function renderRatios() {
  const ratios = calcRatios();
  const definitions = [
    {
      key: 'housing', titleKey: 'ratios.housing', tipKey: 'ratio.housing',
      format: v => pct(v), benchmark: '≤ 30%',
      good: v => v <= 25, warn: v => v <= 30,
      advice: v => v <= 25
        ? (currentLang === 'es' ? 'Costo de vivienda saludable, dentro del límite.' : 'Housing costs are healthy.')
        : v <= 30
          ? (currentLang === 'es' ? 'Cerca del límite recomendado del 30%.' : 'Near the 30% limit.')
          : (currentLang === 'es' ? `${pct(v - 30)} por encima del límite. Considera refinanciar.` : `${pct(v - 30)} over limit.`)
    },
    {
      key: 'dti', titleKey: 'ratios.dti', tipKey: 'ratio.dti',
      format: v => pct(v), benchmark: '≤ 36%',
      good: v => v <= 20, warn: v => v <= 36,
      advice: v => v <= 20
        ? (currentLang === 'es' ? 'Excelente manejo de deuda.' : 'Excellent debt management.')
        : v <= 36
          ? (currentLang === 'es' ? 'DTI aceptable. Mantén los niveles.' : 'DTI within range.')
          : (currentLang === 'es' ? 'DTI alto. Prioriza el pago de deudas.' : 'High DTI. Prioritize debt paydown.')
    },
    {
      key: 'emergency', titleKey: 'ratios.emergency', tipKey: 'ratio.emergency',
      format: v => v.toFixed(1) + (currentLang === 'es' ? ' mes' : ' mo'), benchmark: '3–6 mo',
      good: v => v >= 4, warn: v => v >= 3,
      advice: v => v >= 6
        ? (currentLang === 'es' ? 'Fondo de emergencia sólido.' : 'Outstanding emergency fund.')
        : v >= 3
          ? (currentLang === 'es' ? `${v.toFixed(1)} meses cubiertos — apunta a 4–6.` : `${v.toFixed(1)} months — aiming for 4–6.`)
          : (currentLang === 'es' ? 'Construye tu fondo a al menos 3 meses de gastos.' : 'Build fund to at least 3 months of expenses.')
    },
    {
      key: 'savingsRate', titleKey: 'ratios.savings', tipKey: 'ratio.savings',
      format: v => pct(v), benchmark: '≥ 20%',
      good: v => v >= 20, warn: v => v >= 10,
      advice: v => v >= 20
        ? (currentLang === 'es' ? 'Excelente tasa de ahorro.' : 'Great savings rate.')
        : v >= 10
          ? (currentLang === 'es' ? 'Tasa aceptable. Apunta al 20%.' : 'Aim to reach 20%.')
          : (currentLang === 'es' ? 'Tasa muy baja. Reduce gastos o aumenta ingresos.' : 'Very low. Reduce expenses or increase income.')
    }
  ];

  document.getElementById('ratios-grid').innerHTML = definitions.map(def => {
    const val    = ratios[def.key].actual;
    const status = def.good(val) ? 'green' : def.warn(val) ? 'amber' : 'red';
    const label  = status === 'green' ? t('ratios.onTrack') : status === 'amber' ? t('ratios.caution') : t('ratios.risk');
    return `<div class="ratio-card">
      <div class="ratio-title">${t(def.titleKey)} ${tip(def.tipKey)}</div>
      <span class="status-pill ${status}">${label}</span>
      <div class="ratio-values">
        <span class="ratio-actual ${status}">${def.format(val)}</span>
        <span class="ratio-benchmark">${t('ratios.recommended')}: ${def.benchmark}</span>
      </div>
      <div class="ratio-advice">${def.advice(val)}</div>
    </div>`;
  }).join('');
}

// ============================================================
// PARTIAL DASHBOARD UPDATE
// ============================================================
function updateDashboardPartial() {
  renderSummaryCards();
  renderAlerts();
  renderProjection();
  drawDonut();
  renderBudgetPanel();
  renderRatios();
}

// ============================================================
// FULL RENDER
// ============================================================
function render() {
  applyI18n();
  renderDashboard();
  renderIncome();
  renderExpenses();
  renderDebt();
  renderGoals();
  renderNetWorth();
  renderVariable();
  renderRatios();
}

// ============================================================
// EVENTS — INCOME
// ============================================================
function bindIncomeEvents() {
  document.getElementById('gross-salary').addEventListener('input', e => {
    state.income.grossSalary = parseFloat(e.target.value) || 0;
    // Re-render deductions to update computed % amounts
    renderDeductions();
    updateIncomeDisplays(); updateDashboardPartial(); saveState();
  });

  document.getElementById('btn-add-deduction').addEventListener('click', () => {
    state.income.deductions.push({ id: uid(), label: '', amount: 0, type: 'fixed' });
    renderDeductions(); saveState();
  });

  document.getElementById('btn-add-income').addEventListener('click', () => {
    state.income.otherStreams.push({ id: uid(), label: '', amount: 0, frequency: 'monthly' });
    renderOtherIncome(); saveState();
  });

  const dedList = document.getElementById('deductions-list');
  dedList.addEventListener('input', e => {
    const row = e.target.closest('[data-id]'); if (!row) return;
    const d   = state.income.deductions.find(x => x.id === row.dataset.id); if (!d) return;
    if (e.target.classList.contains('ded-label'))  d.label  = e.target.value;
    if (e.target.classList.contains('ded-amount')) {
      d.amount = parseFloat(e.target.value) || 0;
      // Update computed display inline
      const computed = row.querySelector('.ded-computed');
      if (computed && d.type === 'percent') {
        const gross = parseFloat(state.income.grossSalary) || 0;
        computed.textContent = gross > 0 ? `= ${currency(gross * d.amount / 100)}` : '';
      }
    }
    updateIncomeDisplays(); updateDashboardPartial(); saveState();
  });

  // Type toggle buttons ($ / %)
  dedList.addEventListener('click', e => {
    const typeBtn = e.target.closest('.ded-type-btn');
    if (typeBtn) {
      const row = typeBtn.closest('[data-id]'); if (!row) return;
      const d   = state.income.deductions.find(x => x.id === row.dataset.id); if (!d) return;
      d.type = typeBtn.dataset.t;
      renderDeductions(); updateIncomeDisplays(); updateDashboardPartial(); saveState();
      return;
    }
    if (e.target.classList.contains('btn-remove-ded')) {
      const row = e.target.closest('[data-id]'); if (!row) return;
      state.income.deductions = state.income.deductions.filter(d => d.id !== row.dataset.id);
      renderDeductions(); updateIncomeDisplays(); updateDashboardPartial(); saveState();
    }
  });

  const incList = document.getElementById('other-income-list');
  incList.addEventListener('input', e => {
    const row = e.target.closest('[data-id]'); if (!row) return;
    const o   = state.income.otherStreams.find(x => x.id === row.dataset.id); if (!o) return;
    if (e.target.classList.contains('inc-label'))  o.label  = e.target.value;
    if (e.target.classList.contains('inc-amount')) {
      o.amount = parseFloat(e.target.value) || 0;
      const computed = row.querySelector('.ded-computed');
      if (computed) {
        const divisor = FREQ_DIVISORS[o.frequency || 'monthly'] || 1;
        const monthly = o.amount / divisor;
        computed.textContent = (o.frequency || 'monthly') !== 'monthly' && monthly > 0
          ? `= ${currency(monthly)} ${t('income.freqEquiv')}` : '';
      }
    }
    if (e.target.classList.contains('inc-freq')) {
      o.frequency = e.target.value;
      const computed = row.querySelector('.ded-computed');
      if (computed) {
        const divisor = FREQ_DIVISORS[o.frequency] || 1;
        const monthly = (o.amount || 0) / divisor;
        computed.textContent = o.frequency !== 'monthly' && monthly > 0
          ? `= ${currency(monthly)} ${t('income.freqEquiv')}` : '';
      }
    }
    updateIncomeDisplays(); updateDashboardPartial(); saveState();
  });
  incList.addEventListener('click', e => {
    if (!e.target.classList.contains('btn-remove-inc')) return;
    const row = e.target.closest('[data-id]'); if (!row) return;
    state.income.otherStreams = state.income.otherStreams.filter(o => o.id !== row.dataset.id);
    renderOtherIncome(); updateIncomeDisplays(); updateDashboardPartial(); saveState();
  });

  document.getElementById('btn-add-nonsalary').addEventListener('click', () => {
    if (!state.income.nonSalaryBenefits) state.income.nonSalaryBenefits = [];
    state.income.nonSalaryBenefits.push({ id: uid(), label: '', amount: 0 });
    renderNonSalaryBenefits(); renderDeductions(); saveState();
  });

  const nsList = document.getElementById('nonsalary-list');
  nsList.addEventListener('input', e => {
    const row = e.target.closest('[data-nsid]'); if (!row) return;
    const b   = state.income.nonSalaryBenefits.find(x => x.id === row.dataset.nsid); if (!b) return;
    if (e.target.classList.contains('ns-label'))  b.label  = e.target.value;
    if (e.target.classList.contains('ns-amount')) b.amount = parseFloat(e.target.value) || 0;
    renderDeductions(); updateIncomeDisplays(); updateDashboardPartial(); saveState();
  });
  nsList.addEventListener('click', e => {
    if (!e.target.classList.contains('btn-remove-ns')) return;
    const row = e.target.closest('[data-nsid]'); if (!row) return;
    state.income.nonSalaryBenefits = state.income.nonSalaryBenefits.filter(b => b.id !== row.dataset.nsid);
    renderNonSalaryBenefits(); renderDeductions(); updateIncomeDisplays(); updateDashboardPartial(); saveState();
  });
}

// ============================================================
// EVENTS — EXPENSES
// ============================================================
function bindExpenseEvents() {
  document.getElementById('btn-add-expense').addEventListener('click', () => {
    state.expenses.push({ id: uid(), name: '', amount: 0, category: 'Other', notes: '' });
    renderExpenses(); saveState();
  });
  const list = document.getElementById('expenses-list');
  list.addEventListener('input', e => {
    const row = e.target.closest('[data-id]'); if (!row) return;
    const exp = state.expenses.find(x => x.id === row.dataset.id); if (!exp) return;
    if (e.target.classList.contains('exp-name'))     exp.name     = e.target.value;
    if (e.target.classList.contains('exp-amount'))   exp.amount   = parseFloat(e.target.value) || 0;
    if (e.target.classList.contains('exp-notes'))    exp.notes    = e.target.value;
    if (e.target.classList.contains('exp-category')) exp.category = e.target.value;
    updateExpenseDisplays(); updateDashboardPartial(); saveState();
  });
  list.addEventListener('click', e => {
    if (!e.target.classList.contains('btn-remove-exp')) return;
    const row = e.target.closest('[data-id]'); if (!row) return;
    state.expenses = state.expenses.filter(x => x.id !== row.dataset.id);
    renderExpenses(); updateDashboardPartial(); saveState();
  });
}

// ============================================================
// EVENTS — DEBT
// ============================================================
function bindDebtEvents() {
  document.getElementById('btn-add-card').addEventListener('click', () => {
    state.cards.push({ id: uid(), name: '', cardType: 'card', limit: 0, balance: 0, minPayment: 0, apr: 0, dueDate: '', loanTerm: '', installments: [] });
    renderDebt(); saveState();
  });
  document.getElementById('payoff-method').addEventListener('change', e => {
    state.payoffMethod = e.target.value; renderDebt(); saveState();
  });

  const list = document.getElementById('cards-list');
  list.addEventListener('change', e => {
    const cardEl = e.target.closest('[data-card-id]'); if (!cardEl) return;
    const card   = state.cards.find(c => c.id === cardEl.dataset.cardId); if (!card) return;
    if (e.target.classList.contains('card-type-select')) {
      card.cardType = e.target.value;
      renderDebt(); saveState();
    }
  });
  list.addEventListener('input', e => {
    const cardEl = e.target.closest('[data-card-id]'); if (!cardEl) return;
    const card   = state.cards.find(c => c.id === cardEl.dataset.cardId); if (!card) return;

    if (e.target.classList.contains('card-debt-title-input')) card.name       = e.target.value;
    if (e.target.classList.contains('card-limit'))            card.limit      = parseFloat(e.target.value) || 0;
    if (e.target.classList.contains('card-balance'))          card.balance    = parseFloat(e.target.value) || 0;
    if (e.target.classList.contains('card-minpay'))           card.minPayment = parseFloat(e.target.value) || 0;
    if (e.target.classList.contains('card-apr'))              card.apr        = parseFloat(e.target.value) || 0;
    if (e.target.classList.contains('card-due'))              card.dueDate    = e.target.value;
    if (e.target.classList.contains('card-loanterm'))         card.loanTerm   = e.target.value;

    // Extra payment simulator
    if (e.target.classList.contains('extra-payment-input')) {
      const extra    = parseFloat(e.target.value) || 0;
      card._extraPayment = extra;
      const resultEl = document.getElementById('extra-result-' + card.id);
      if (resultEl) {
        const impact = calcExtraPaymentImpact(card, extra);
        if (!impact) {
          resultEl.className = 'extra-sim-result empty';
          resultEl.textContent = t('debt.extraResult');
        } else {
          const monthsWord = currentLang === 'es' ? 'meses' : 'months';
          resultEl.className = 'extra-sim-result';
          resultEl.innerHTML = impact.monthsSaved > 0
            ? `✓ ${currentLang === 'es' ? 'Pagarás en' : "You'll finish in"} <strong>${impact.newMonths} ${monthsWord}</strong> ${currentLang === 'es' ? 'en lugar de' : 'instead of'} ${impact.origMonths} — ${currentLang === 'es' ? 'ahorras' : 'saving'} <strong>${currency(impact.interestSaved)}</strong> ${currentLang === 'es' ? 'en intereses' : 'in interest'}.`
            : (currentLang === 'es' ? 'El pago extra no cambia significativamente el plazo.' : 'Extra payment has minimal impact on timeline.');
        }
      }
      return; // Don't re-render whole card
    }

    // Installment fields
    const instEl = e.target.closest('[data-inst-id]');
    if (instEl) {
      const inst = card.installments.find(i => i.id === instEl.dataset.instId);
      if (inst) {
        if (e.target.classList.contains('inst-name'))  inst.name         = e.target.value;
        if (e.target.classList.contains('inst-total')) inst.total        = parseFloat(e.target.value) || 0;
        if (e.target.classList.contains('inst-count')) inst.installments = parseInt(e.target.value)   || 1;
        if (e.target.classList.contains('inst-paid'))  inst.paid         = parseInt(e.target.value)   || 0;
      }
    }

    updateCardLive(cardEl, card); updateDashboardPartial(); saveState();
  });

  list.addEventListener('click', e => {
    const cardEl = e.target.closest('[data-card-id]'); if (!cardEl) return;
    const card   = state.cards.find(c => c.id === cardEl.dataset.cardId); if (!card) return;
    if (e.target.classList.contains('btn-remove-card')) {
      state.cards = state.cards.filter(c => c.id !== card.id);
      renderDebt(); updateDashboardPartial(); saveState(); return;
    }
    if (e.target.classList.contains('btn-add-inst')) {
      card.installments.push({ id: uid(), name: '', total: 0, installments: 12, paid: 0 });
      renderDebt(); saveState(); return;
    }
    if (e.target.classList.contains('btn-remove-inst')) {
      const instEl = e.target.closest('[data-inst-id]');
      if (instEl) { card.installments = card.installments.filter(i => i.id !== instEl.dataset.instId); renderDebt(); saveState(); }
    }
  });
}

function updateCardLive(cardEl, card) {
  const balance  = parseFloat(card.balance) || 0;
  const limit    = parseFloat(card.limit) || 0;
  const utilPct  = limit > 0 ? Math.min(100, (balance / limit) * 100) : 0;
  const barColor = utilPct < 30 ? 'green' : utilPct < 70 ? 'amber' : 'red';
  const bar = cardEl.querySelector('.progress-bar');
  if (bar) { bar.style.width = utilPct + '%'; bar.className = 'progress-bar ' + barColor; }
  const metaEl = cardEl.querySelector('.card-debt-meta');
  if (metaEl) metaEl.innerHTML = `${t('debt.obligation')}: <strong>${currency(calcCardObligation(card))}</strong>`;
  const badge = cardEl.querySelector('.payoff-badge');
  if (badge) {
    const isLoan = card.cardType === 'loan';
    badge.innerHTML = isLoan
      ? `⏱ ${currentLang === 'es' ? 'Cuotas restantes (estimado)' : 'Remaining installments (est.)'}: <strong style="margin-left:.3rem">${calcPayoffTimeline(card)}</strong>`
      : `${t('payoff.prefix')} (${state.payoffMethod}): <strong style="margin-left:.3rem">${calcPayoffTimeline(card)}</strong>`;
  }
  renderDebtSummary();
}

// ============================================================
// EVENTS — GOALS
// ============================================================
function bindGoalEvents() {
  document.getElementById('btn-add-goal').addEventListener('click', () => {
    state.goals.push({ id: uid(), name: '', target: 0, saved: 0, monthlyContrib: 0, targetDate: '', priority: state.goals.length + 1, shared: false, participants: [] });
    renderGoals(); saveState();
  });
  const list = document.getElementById('goals-list');
  list.addEventListener('input', e => {
    const goalEl = e.target.closest('[data-goal-id]'); if (!goalEl) return;
    const goal   = state.goals.find(g => g.id === goalEl.dataset.goalId); if (!goal) return;
    if (e.target.classList.contains('goal-name-input')) { goal.name = e.target.value; updateGoalLive(goalEl, goal); renderGoalsSummary(); updateDashboardPartial(); saveState(); return; }
    if (e.target.classList.contains('goal-target'))     goal.target         = parseFloat(e.target.value) || 0;
    if (e.target.classList.contains('goal-saved'))      goal.saved          = parseFloat(e.target.value) || 0;
    if (e.target.classList.contains('goal-monthly'))    goal.monthlyContrib = parseFloat(e.target.value) || 0;
    if (e.target.classList.contains('goal-date'))       goal.targetDate     = e.target.value;
    // Participant inputs
    const partEl = e.target.closest('[data-part-id]');
    if (partEl) {
      const p = goal.participants.find(x => x.id === partEl.dataset.partId); if (!p) return;
      if (e.target.classList.contains('part-name'))    p.name          = e.target.value;
      if (e.target.classList.contains('part-type'))    { p.incomeType  = e.target.value; renderGoals(); saveState(); return; }
      if (e.target.classList.contains('part-contrib')) p.monthlyContrib = parseFloat(e.target.value) || 0;
      if (e.target.classList.contains('part-saved'))   p.saved         = parseFloat(e.target.value) || 0;
    }
    updateGoalLive(goalEl, goal); renderGoalsSummary(); updateDashboardPartial(); saveState();
  });
  list.addEventListener('change', e => {
    const goalEl = e.target.closest('[data-goal-id]'); if (!goalEl) return;
    const goal   = state.goals.find(g => g.id === goalEl.dataset.goalId); if (!goal) return;
    if (e.target.classList.contains('goal-shared-chk')) {
      goal.shared = e.target.checked;
      renderGoals(); updateDashboardPartial(); saveState();
    }
  });
  list.addEventListener('click', e => {
    const goalEl = e.target.closest('[data-goal-id]'); if (!goalEl) return;
    const goal   = state.goals.find(g => g.id === goalEl.dataset.goalId); if (!goal) return;
    if (e.target.classList.contains('btn-remove-goal')) {
      state.goals = state.goals.filter(g => g.id !== goal.id);
      renderGoals(); updateDashboardPartial(); saveState(); return;
    }
    if (e.target.classList.contains('btn-add-part')) {
      goal.participants.push({ id: uid(), name: '', incomeType: 'fixed', monthlyContrib: 0, saved: 0 });
      renderGoals(); saveState(); return;
    }
    if (e.target.classList.contains('btn-remove-part')) {
      const partEl = e.target.closest('[data-part-id]'); if (!partEl) return;
      goal.participants = goal.participants.filter(p => p.id !== partEl.dataset.partId);
      renderGoals(); updateDashboardPartial(); saveState();
    }
  });
}

function updateGoalLive(goalEl, goal) {
  if (goal.shared) { renderGoals(); return; }
  const target  = parseFloat(goal.target) || 0;
  const saved   = calcGoalSaved(goal);
  const pctDone = target > 0 ? Math.min(100, (saved / target) * 100) : 0;
  const bar = goalEl.querySelector('.progress-bar');
  if (bar) { bar.style.width = pctDone + '%'; bar.className = 'progress-bar ' + (pctDone >= 100 ? 'green' : pctDone >= 50 ? 'amber' : ''); }
  const labels = goalEl.querySelector('.goal-progress-labels');
  if (labels) labels.innerHTML = `<span>${currency(saved)} ${currentLang === 'es' ? 'ahorrado' : 'saved'}</span><span>${pct(pctDone, 0)} ${currentLang === 'es' ? 'de' : 'of'} ${currency(target)}</span>`;
  const etaEl = goalEl.querySelector('.goal-eta');
  if (etaEl) etaEl.innerHTML = pctDone >= 100
    ? t('goals.completed')
    : `${t('goals.needs')} ${currency(calcGoalMonthly(goal))}${t('goals.perMonth')} — ${t('goals.eta')}: <strong>${calcGoalETA(goal)}</strong>`;
}

// ============================================================
// EVENTS — NET WORTH
// ============================================================
function updateNetWorthTotals() {
  const totalAssets      = calcTotalAssets();
  const totalLiabilities = calcTotalLiabilities();
  const netWorth         = calcNetWorth();
  document.getElementById('total-assets-display').textContent      = currency(totalAssets);
  document.getElementById('total-liabilities-display').textContent = currency(totalLiabilities);
  document.getElementById('networth-summary-bar').innerHTML = `
    <div>
      <div class="nw-label">${t('nw.netWorth')}</div>
      <div class="nw-value ${netWorth >= 0 ? 'positive' : 'negative'}">${currency(netWorth)}</div>
    </div>
    <div class="nw-trio">
      <div class="nw-stat">
        <div class="nw-stat-val" style="color:#4ade80">${currency(totalAssets)}</div>
        <div class="nw-stat-lbl">${t('nw.assets')}</div>
      </div>
      <div class="nw-stat" style="color:rgba(255,255,255,.4);font-size:1.5rem;padding-top:.5rem">−</div>
      <div class="nw-stat">
        <div class="nw-stat-val" style="color:#f87171">${currency(totalLiabilities)}</div>
        <div class="nw-stat-lbl">${t('nw.liabilities')}</div>
      </div>
    </div>`;
}

function bindNetWorthEvents() {
  document.getElementById('btn-add-asset').addEventListener('click', () => {
    state.assets.push({ id: uid(), name: '', value: 0, type: 'cash' });
    renderNetWorth(); saveState();
  });
  document.getElementById('assets-list').addEventListener('input', e => {
    const row = e.target.closest('[data-asset-id]'); if (!row) return;
    const a   = state.assets.find(x => x.id === row.dataset.assetId); if (!a) return;
    if (e.target.classList.contains('asset-name'))  { a.name  = e.target.value; saveState(); return; }
    if (e.target.classList.contains('asset-value')) { a.value = parseFloat(e.target.value) || 0; updateNetWorthTotals(); saveState(); }
  });
  document.getElementById('assets-list').addEventListener('change', e => {
    const row = e.target.closest('[data-asset-id]'); if (!row) return;
    const a   = state.assets.find(x => x.id === row.dataset.assetId); if (!a) return;
    if (e.target.classList.contains('asset-type')) { a.type = e.target.value; renderNetWorth(); saveState(); }
  });
  document.getElementById('assets-list').addEventListener('click', e => {
    if (!e.target.classList.contains('btn-remove-asset')) return;
    const row = e.target.closest('[data-asset-id]'); if (!row) return;
    state.assets = state.assets.filter(a => a.id !== row.dataset.assetId);
    renderNetWorth(); saveState();
  });
}

// ============================================================
// EVENTS — VARIABLE EXPENSES
// ============================================================
function bindVariableEvents() {
  document.getElementById('btn-add-variable').addEventListener('click', () => {
    state.variableExpenses.push({ id: uid(), name: '', budget: 0, spent: 0, categoryId: 'other' });
    renderVariable(); saveState();
  });
  const list = document.getElementById('variable-list');
  list.addEventListener('input', e => {
    const varEl = e.target.closest('[data-var-id]'); if (!varEl) return;
    const v     = state.variableExpenses.find(x => x.id === varEl.dataset.varId); if (!v) return;
    if (e.target.classList.contains('var-name'))     v.name       = e.target.value;
    if (e.target.classList.contains('var-budget'))   v.budget     = parseFloat(e.target.value) || 0;
    if (e.target.classList.contains('var-spent'))    v.spent      = parseFloat(e.target.value) || 0;
    if (e.target.classList.contains('var-category')) v.categoryId = e.target.value;
    renderVariable(); updateDashboardPartial(); saveState();
  });
  list.addEventListener('change', e => {
    const varEl = e.target.closest('[data-var-id]'); if (!varEl) return;
    const v     = state.variableExpenses.find(x => x.id === varEl.dataset.varId); if (!v) return;
    if (e.target.classList.contains('var-category')) { v.categoryId = e.target.value; renderVariable(); saveState(); }
  });
  list.addEventListener('click', e => {
    if (!e.target.classList.contains('btn-remove-var')) return;
    const varEl = e.target.closest('[data-var-id]'); if (!varEl) return;
    state.variableExpenses = state.variableExpenses.filter(x => x.id !== varEl.dataset.varId);
    renderVariable(); updateDashboardPartial(); saveState();
  });
}

// ============================================================
// UTILITY
// ============================================================
function esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ============================================================
// BOOT
// ============================================================
function applyDarkMode(isDark) {
  document.body.classList.toggle('dark-mode', isDark);
  const btn = document.getElementById('btn-dark-mode');
  if (btn) btn.innerHTML = isDark ? t('action.lightMode') : t('action.darkMode');
}

document.addEventListener('DOMContentLoaded', () => {
  loadState();
  setupNav();
  applyI18n();
  render();

  // Dark mode — persisted outside state so it survives export/import/reset
  applyDarkMode(localStorage.getItem('finance_dark_mode') === '1');
  document.getElementById('btn-dark-mode').addEventListener('click', () => {
    const isDark = !document.body.classList.contains('dark-mode');
    localStorage.setItem('finance_dark_mode', isDark ? '1' : '0');
    applyDarkMode(isDark);
  });

  document.getElementById('btn-export').addEventListener('click', exportData);
  document.getElementById('btn-import').addEventListener('click', () => document.getElementById('import-file').click());
  document.getElementById('import-file').addEventListener('change', e => { if (e.target.files[0]) importData(e.target.files[0]); e.target.value = ''; });
  document.getElementById('btn-reset').addEventListener('click', resetData);

  // Currency selector
  const currSel = document.getElementById('currency-select');
  CURRENCIES.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.code;
    opt.textContent = c.label;
    if (c.code === (state.currency || 'COP')) opt.selected = true;
    currSel.appendChild(opt);
  });
  currSel.addEventListener('change', () => {
    state.currency = currSel.value;
    render(); saveState();
  });

  // Language
  document.getElementById('lang-es').addEventListener('click', () => {
    currentLang = 'es'; state.lang = 'es'; render();
    applyDarkMode(document.body.classList.contains('dark-mode'));
    saveState();
  });
  document.getElementById('lang-en').addEventListener('click', () => {
    currentLang = 'en'; state.lang = 'en'; render();
    applyDarkMode(document.body.classList.contains('dark-mode'));
    saveState();
  });

  bindIncomeEvents();
  bindExpenseEvents();
  bindDebtEvents();
  bindGoalEvents();
  bindNetWorthEvents();
  bindVariableEvents();

  setTimeout(drawDonut, 100);

  // Tooltip click handler for mobile (hover works on desktop via CSS ::after)
  document.addEventListener('click', e => {
    if (e.target.classList.contains('tip-icon')) {
      const wasOpen = e.target.classList.contains('tip-open');
      document.querySelectorAll('.tip-icon.tip-open').forEach(el => el.classList.remove('tip-open'));
      if (!wasOpen) e.target.classList.add('tip-open');
      e.stopPropagation();
    } else {
      document.querySelectorAll('.tip-icon.tip-open').forEach(el => el.classList.remove('tip-open'));
    }
  });
});
