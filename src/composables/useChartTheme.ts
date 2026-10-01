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
        color: '#cbd5e1', // slate-300: axis text on dark
        gridColor: '#1e293b', // slate-800: hairline grid
        backgroundColor: '#0f172a', // slate-900
      }
    }
    return {
      color: '#64748b', // slate-500: muted axis text on light
      gridColor: '#e2e8f0', // slate-200: hairline grid
      backgroundColor: '#ffffff', // card surface
    }
  })

  return { options }
}
