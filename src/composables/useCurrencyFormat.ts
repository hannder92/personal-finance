import { formatCurrency } from '@/lib/currency/format'
import { useSettingsStore } from '@/stores/settingsStore'

export function useCurrencyFormat() {
  const settings = useSettingsStore()
  function format(amount: number): string {
    return formatCurrency(amount, settings.state.currency)
  }
  return { format }
}
