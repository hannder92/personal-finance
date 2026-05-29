<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'radix-vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import LucideIcon from '@/components/common/LucideIcon.vue'
import { NAV_GROUPS, type NavGroupId } from '@/lib/navigation/nav-config'

const props = defineProps<{
  open: boolean
  groupId: NavGroupId | null
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const { t } = useI18n()

const group = computed(() => NAV_GROUPS.find((g) => g.id === props.groupId) ?? null)

const titleKey = computed(() => {
  switch (props.groupId) {
    case 'money':
      return 'nav.sheet.titleMoney'
    case 'plan':
      return 'nav.sheet.titlePlan'
    case 'more':
      return 'nav.sheet.titleMore'
    default:
      return 'nav.groups.more'
  }
})

function close() {
  emit('update:open', false)
}
</script>

<template>
  <DialogRoot
    :open="open && groupId !== null && groupId !== 'home'"
    @update:open="emit('update:open', $event)"
  >
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out"
      />
      <DialogContent
        role="dialog"
        data-testid="nav-bottom-sheet"
        class="fixed inset-x-0 bottom-0 z-50 max-h-[70vh] rounded-t-2xl border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-slate-900"
        @pointer-down-outside="close"
        @escape-key-down="close"
      >
        <DialogTitle class="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
          {{ t(titleKey) }}
        </DialogTitle>
        <ul
          v-if="group"
          class="flex flex-col gap-1"
          role="list"
        >
          <li
            v-for="item in group.children"
            :key="item.id"
          >
            <RouterLink
              :to="item.path"
              class="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              @click="close"
            >
              <LucideIcon
                :name="item.icon"
                icon-class="h-5 w-5 shrink-0"
              />
              {{ t(item.i18nKey) }}
            </RouterLink>
          </li>
        </ul>
        <DialogClose
          class="mt-4 w-full rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
          @click="close"
        >
          {{ t('nav.sheet.close') }}
        </DialogClose>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
