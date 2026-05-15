<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    content?: string
    collisionPadding?: number
  }>(),
  { content: '', collisionPadding: 8 }
)

const isOpen = ref(false)
const tooltipRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLSpanElement | null>(null)
const adjusted = ref(false)
const positionStyle = ref<Record<string, string>>({})

function reposition() {
  const wrapper = triggerRef.value
  const tooltip = tooltipRef.value
  if (!wrapper || !tooltip) return
  const target = (wrapper.firstElementChild as HTMLElement | null) ?? wrapper
  const tRect = target.getBoundingClientRect()
  const tipRect = tooltip.getBoundingClientRect()
  const vw = window.innerWidth
  const padding = props.collisionPadding

  let left = tRect.left
  const idealRight = left + tipRect.width
  if (idealRight > vw - padding) {
    left = Math.max(padding, vw - padding - tipRect.width)
    adjusted.value = true
  } else {
    adjusted.value = false
  }

  positionStyle.value = {
    position: 'fixed',
    top: `${tRect.bottom + 4}px`,
    left: `${left}px`,
  }
}

async function open() {
  isOpen.value = true
  await nextTick()
  reposition()
}

function close() {
  isOpen.value = false
  adjusted.value = false
}

function onScroll() {
  if (isOpen.value) reposition()
}

window.addEventListener('scroll', onScroll, true)
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll, true))
</script>

<template>
  <span
    ref="triggerRef"
    @mouseenter="open"
    @mouseleave="close"
    @focusin="open"
    @focusout="close"
  >
    <slot />
    <span
      v-if="isOpen"
      ref="tooltipRef"
      role="tooltip"
      :data-collision-adjusted="adjusted ? 'true' : 'false'"
      :style="positionStyle"
      class="z-50 max-w-xs rounded bg-slate-900 px-2 py-1 text-xs text-white shadow"
    >
      {{ content }}
    </span>
  </span>
</template>
