<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import LucideIcon from '@/components/common/LucideIcon.vue'

type Theme = 'system' | 'light' | 'dark'

const props = withDefaults(
  defineProps<{
    modelValue?: Theme
  }>(),
  { modelValue: 'system' }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: Theme): void
}>()

const { t } = useI18n()

const ORDER: Theme[] = ['system', 'light', 'dark']

function nextTheme(current: Theme): Theme {
  const idx = ORDER.indexOf(current)
  return ORDER[(idx + 1) % ORDER.length] ?? 'system'
}

function applyHtmlClass(theme: Theme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else if (theme === 'light') {
    root.classList.remove('dark')
  } else {
    const prefersDark =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    root.classList.toggle('dark', prefersDark)
  }
}

onMounted(() => applyHtmlClass(props.modelValue))

watch(
  () => props.modelValue,
  (val) => applyHtmlClass(val)
)

function onClick() {
  emit('update:modelValue', nextTheme(props.modelValue))
}

const ICONS: Record<Theme, string> = {
  system: 'monitor',
  light: 'sun',
  dark: 'moon',
}

const ariaLabel = computed(() => t(`theme.${props.modelValue}`))
</script>

<template>
  <button
    type="button"
    :aria-label="ariaLabel"
    class="inline-flex h-9 w-9 items-center justify-center rounded border border-slate-300 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-700 dark:hover:bg-slate-800"
    @click="onClick"
  >
    <LucideIcon
      :name="ICONS[modelValue]"
      icon-class="h-4 w-4"
    />
  </button>
</template>
