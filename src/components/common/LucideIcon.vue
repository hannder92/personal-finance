<script setup lang="ts">
import { type Component, computed } from 'vue'
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle,
  Circle,
  CreditCard,
  History,
  Home,
  Inbox,
  Info,
  Monitor,
  Moon,
  PieChart,
  Settings,
  Sun,
  Target,
  TrendingUp,
  Wallet,
} from 'lucide-vue-next'

const ICON_MAP: Record<string, Component> = {
  'alert-octagon': AlertOctagon,
  'alert-triangle': AlertTriangle,
  'check-circle': CheckCircle,
  circle: Circle,
  'credit-card': CreditCard,
  history: History,
  home: Home,
  inbox: Inbox,
  info: Info,
  monitor: Monitor,
  moon: Moon,
  'pie-chart': PieChart,
  settings: Settings,
  sun: Sun,
  target: Target,
  'trending-up': TrendingUp,
  wallet: Wallet,
}

const props = defineProps<{
  name?: string
  iconClass?: string
}>()

const resolved = computed(() => (props.name ? ICON_MAP[props.name] : null))
</script>

<template>
  <component
    :is="resolved"
    v-if="resolved"
    :class="iconClass"
    aria-hidden="true"
  />
</template>
