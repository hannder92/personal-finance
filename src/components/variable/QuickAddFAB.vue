<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    route?: string
    categories?: Array<{ id: string; name: string }>
  }>(),
  { route: '/', categories: () => [] }
)

const emit = defineEmits<{
  (e: 'record', payload: { categoryId: string; amount: number }): void
}>()

const visible = computed(() => props.route === '/' || props.route === '/dashboard')
const open = ref(false)
const selectedId = ref('')
const amount = ref('')

function onClick() {
  open.value = !open.value
}
function onSubmit(event: Event) {
  event.preventDefault()
  const numeric = Number.parseInt(amount.value.replace(/\D/g, ''), 10) || 0
  if (selectedId.value && numeric > 0) {
    emit('record', { categoryId: selectedId.value, amount: numeric })
    amount.value = ''
    open.value = false
  }
}
</script>

<template>
  <div
    v-if="visible"
    class="fixed bottom-20 right-4 z-40 flex flex-col items-end gap-2"
  >
    <form
      v-if="open"
      class="flex flex-col gap-2 rounded-lg bg-white p-3 shadow-lg dark:bg-slate-800"
      @submit="onSubmit"
    >
      <label class="flex flex-col gap-1">
        <span class="text-xs">Categoría</span>
        <select
          v-model="selectedId"
          aria-label="Categoría"
          class="rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-900"
        >
          <option
            v-for="c in categories"
            :key="c.id"
            :value="c.id"
          >
            {{ c.name }}
          </option>
        </select>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-xs">Monto</span>
        <input
          v-model="amount"
          type="text"
          inputmode="numeric"
          aria-label="Monto"
          class="rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-900"
        >
      </label>
      <button
        type="submit"
        class="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white"
      >
        Guardar
      </button>
    </form>

    <button
      type="button"
      aria-label="Registrar gasto rápido"
      class="h-12 w-12 rounded-full bg-blue-600 text-2xl text-white shadow-lg hover:bg-blue-700"
      @click="onClick"
    >
      +
    </button>
  </div>
</template>
