<script setup lang="ts">
import { type Component, computed } from 'vue'
import {
  AlertOctagon,
  AlertTriangle,
  Banknote,
  CheckCircle,
  ChevronDown,
  Circle,
  CreditCard,
  Flag,
  History,
  Home,
  Inbox,
  Info,
  Landmark,
  Monitor,
  Moon,
  MoreHorizontal,
  PieChart,
  Receipt,
  Settings,
  ShoppingCart,
  Sun,
  Target,
  TrendingUp,
  Wallet,
} from 'lucide-vue-next'

const ICON_MAP: Record<string, Component> = {
  'alert-octagon': AlertOctagon,
  'alert-triangle': AlertTriangle,
  banknote: Banknote,
  'check-circle': CheckCircle,
  'chevron-down': ChevronDown,
  circle: Circle,
  'credit-card': CreditCard,
  flag: Flag,
  history: History,
  home: Home,
  inbox: Inbox,
  info: Info,
  landmark: Landmark,
  monitor: Monitor,
  moon: Moon,
  'more-horizontal': MoreHorizontal,
  'pie-chart': PieChart,
  receipt: Receipt,
  settings: Settings,
  'shopping-cart': ShoppingCart,
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
