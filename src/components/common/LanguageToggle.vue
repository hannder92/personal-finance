<script setup lang="ts">
type Locale = 'es' | 'en'

const props = withDefaults(
  defineProps<{
    modelValue?: Locale
  }>(),
  { modelValue: 'es' }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: Locale): void
}>()

const LABEL: Record<Locale, string> = { es: 'ES', en: 'EN' }
const ARIA: Record<Locale, string> = {
  es: 'Cambiar idioma a inglés',
  en: 'Switch language to Spanish',
}

function onClick() {
  emit('update:modelValue', props.modelValue === 'es' ? 'en' : 'es')
}
</script>

<template>
  <button
    type="button"
    :aria-label="ARIA[modelValue]"
    class="inline-flex h-9 min-w-9 items-center justify-center rounded border border-slate-300 px-2 text-sm font-medium hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-700 dark:hover:bg-slate-800"
    @click="onClick"
  >
    {{ LABEL[modelValue] }}
  </button>
</template>
