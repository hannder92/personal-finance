<script setup lang="ts">
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from 'radix-vue'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import LucideIcon from '@/components/common/LucideIcon.vue'
import { NAV_GROUPS } from '@/lib/navigation/nav-config'
import { useNavActive } from '@/composables/useNavActive'

const { t } = useI18n()
const { activeGroupId, activeItemId } = useNavActive()

const openGroupId = ref<string | null>(null)

function onOpenChange(groupId: string, open: boolean) {
  openGroupId.value = open ? groupId : null
}

function closeDropdown() {
  openGroupId.value = null
}
</script>

<template>
  <nav
    class="hidden flex-1 items-center gap-1 md:flex"
    :aria-label="t('nav.ariaMain')"
  >
    <template
      v-for="group in NAV_GROUPS"
      :key="group.id"
    >
      <RouterLink
        v-if="group.directLink && group.children[0]"
        :to="group.children[0].path"
        class="inline-flex items-center gap-1 rounded px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        :class="{
          'bg-slate-100 !text-slate-900 dark:bg-slate-800 dark:!text-slate-100':
            activeGroupId === group.id,
        }"
        data-nav-group="home"
      >
        {{ t(group.i18nKey) }}
      </RouterLink>

      <DropdownMenuRoot
        v-else
        :open="openGroupId === group.id"
        @update:open="onOpenChange(group.id, $event)"
      >
        <DropdownMenuTrigger
          class="inline-flex items-center gap-1 rounded px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 data-[state=open]:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          :class="{
            'bg-slate-100 !text-slate-900 dark:bg-slate-800 dark:!text-slate-100':
              activeGroupId === group.id,
          }"
          :data-nav-group="group.id"
        >
          {{ t(group.i18nKey) }}
          <LucideIcon
            name="chevron-down"
            icon-class="h-3 w-3"
          />
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent
            :data-testid="`nav-dropdown-${group.id}`"
            class="z-50 min-w-[10rem] rounded-md border border-slate-200 bg-white p-1 shadow-md dark:border-slate-700 dark:bg-slate-900"
            :side-offset="4"
            @pointer-down-outside="closeDropdown"
            @escape-key-down="closeDropdown"
          >
            <DropdownMenuItem
              v-for="item in group.children"
              :key="item.id"
              as-child
            >
              <RouterLink
                :to="item.path"
                class="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-xs text-slate-700 outline-none hover:bg-slate-100 hover:text-slate-900 focus:bg-slate-100 focus:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-slate-50 dark:focus:bg-slate-800 dark:focus:text-slate-50"
                :class="{
                  'font-semibold text-blue-600 dark:text-blue-400': activeItemId === item.id,
                }"
                @click="closeDropdown"
              >
                <LucideIcon
                  :name="item.icon"
                  icon-class="h-3.5 w-3.5"
                />
                {{ t(item.i18nKey) }}
              </RouterLink>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenuRoot>
    </template>
  </nav>
</template>
