<script setup lang="ts">
export interface NavItem {
  id: string
  label: string
  to: string
  icon?: string
}

withDefaults(
  defineProps<{
    items?: NavItem[]
    activeId?: string
  }>(),
  { items: () => [], activeId: '' }
)

const emit = defineEmits<{
  (e: 'navigate', id: string): void
}>()

function onClick(event: MouseEvent, item: NavItem) {
  emit('navigate', item.id)
  // Allow router-level navigation via parent; do not prevent default here so the test sees the href.
  void event
}
</script>

<template>
  <nav
    class="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 md:hidden"
    role="navigation"
    aria-label="Secciones principales"
  >
    <ul class="flex">
      <li
        v-for="item in items"
        :key="item.id"
        class="flex-1"
      >
        <a
          :href="item.to"
          :aria-current="item.id === activeId ? 'page' : undefined"
          :data-nav-id="item.id"
          class="flex h-14 flex-col items-center justify-center gap-0.5 text-xs text-slate-600 hover:text-slate-900 focus-visible:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-slate-300 dark:focus-visible:bg-slate-800"
          @click="onClick($event, item)"
        >
          <span
            v-if="item.icon"
            :data-icon="item.icon"
            class="inline-block h-5 w-5"
            aria-hidden="true"
          />
          <span>{{ item.label }}</span>
        </a>
      </li>
    </ul>
  </nav>
</template>
