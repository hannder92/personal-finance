import { computed } from 'vue'
import { useTheme } from './useTheme'

export interface ChartThemeOptions {
  color: string
  gridColor: string
  backgroundColor: string
}

export function useChartTheme() {
  const { isDark } = useTheme()

  const options = computed<ChartThemeOptions>(() => {
    if (isDark.value) {
      return {
        color: '#e5e7eb', // slate-200 (light text)
        gridColor: '#475569', // slate-600
        backgroundColor: '#0f172a', // slate-900
      }
    }
    return {
      color: '#1e293b', // slate-800 (dark text on light bg)
      gridColor: '#cbd5e1', // slate-300
      backgroundColor: '#f8fafc', // slate-50
    }
  })

  return { options }
}
