<script setup lang="ts">
withDefaults(
  defineProps<{
    open?: boolean
    title?: string
    message?: string
    confirmLabel?: string
    cancelLabel?: string
  }>(),
  {
    open: false,
    title: '',
    message: '',
    confirmLabel: 'Confirmar',
    cancelLabel: 'Cancelar',
  }
)

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

function onConfirm() {
  emit('confirm')
  emit('update:open', false)
}

function onCancel() {
  emit('cancel')
  emit('update:open', false)
}
</script>

<template>
  <div
    v-if="open"
    role="dialog"
    aria-modal="true"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
  >
    <div class="rounded-lg bg-white p-6 shadow-lg dark:bg-slate-800">
      <h2 class="mb-2 text-lg font-semibold">
        {{ title }}
      </h2>
      <p class="mb-4 text-sm text-slate-600 dark:text-slate-300">
        {{ message }}
      </p>
      <div class="flex justify-end gap-2">
        <button
          type="button"
          class="rounded border px-3 py-1.5 text-sm"
          @click="onCancel"
        >
          {{ cancelLabel }}
        </button>
        <button
          type="button"
          class="rounded bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
          @click="onConfirm"
        >
          {{ confirmLabel }}
        </button>
      </div>
    </div>
  </div>
</template>
