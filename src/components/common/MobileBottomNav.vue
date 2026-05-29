<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRoute } from 'vue-router'
import LucideIcon from '@/components/common/LucideIcon.vue'
import NavBottomSheet from '@/components/common/NavBottomSheet.vue'
import { NAV_GROUPS, type NavGroupId } from '@/lib/navigation/nav-config'
import { useNavActive } from '@/composables/useNavActive'

const { t } = useI18n()
const route = useRoute()
const { activeGroupId } = useNavActive()

const sheetOpen = ref(false)
const sheetGroupId = ref<NavGroupId | null>(null)

const mobileTabs = NAV_GROUPS

function openSheet(groupId: NavGroupId) {
  if (groupId === 'home') return
  sheetGroupId.value = groupId
  sheetOpen.value = true
}

function onTabClick(groupId: NavGroupId, event: MouseEvent) {
  if (groupId === 'home') return
  event.preventDefault()
  openSheet(groupId)
}
</script>

<template>
  <nav
    class="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 md:hidden"
    :aria-label="t('nav.ariaMain')"
  >
    <ul class="flex">
      <li
        v-for="group in mobileTabs"
        :key="group.id"
        class="flex-1"
      >
        <RouterLink
          v-if="group.id === 'home'"
          to="/"
          class="flex h-14 flex-col items-center justify-center gap-0.5 text-xs text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 dark:text-slate-300"
          :class="{
            'font-semibold text-blue-600 dark:text-blue-400': route.name === 'dashboard',
          }"
          :aria-current="route.name === 'dashboard' ? 'page' : undefined"
        >
          <LucideIcon
            :name="group.icon"
            icon-class="h-5 w-5"
          />
          <span>{{ t(group.i18nKey) }}</span>
        </RouterLink>
        <button
          v-else
          type="button"
          class="flex h-14 w-full flex-col items-center justify-center gap-0.5 text-xs text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 dark:text-slate-300"
          :class="{
            'font-semibold text-blue-600 dark:text-blue-400': activeGroupId === group.id,
          }"
          @click="onTabClick(group.id, $event)"
        >
          <LucideIcon
            :name="group.icon"
            icon-class="h-5 w-5"
          />
          <span>{{ t(group.i18nKey) }}</span>
        </button>
      </li>
    </ul>
  </nav>

  <NavBottomSheet
    v-model:open="sheetOpen"
    :group-id="sheetGroupId"
  />
</template>
