<script setup lang="ts">
import type { ApprovalStatus } from '../types'

const props = defineProps<{ status: ApprovalStatus }>()
const { t } = useI18n()

const className = computed(() => {
  switch (props.status) {
    case 'locked':
      return 'bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-slate-100'
    case 'approved':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
    case 'returned':
      return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200'
    case 'submitted':
      return 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200'
    default:
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'
  }
})
</script>

<template>
  <span
    class="inline-flex rounded-md px-2 py-0.5 text-xs font-medium"
    :class="className"
  >
    {{ t(`approvals.status.${status}`) }}
  </span>
</template>
