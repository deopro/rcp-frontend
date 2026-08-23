<script setup lang="ts">
import type { ApprovalStatus } from '../types'

const props = defineProps<{ status: ApprovalStatus }>()
const { t } = useI18n()

const className = computed(() => {
  switch (props.status) {
    case 'locked':
      return 'rcp-badge-neutral'
    case 'approved':
      return 'rcp-badge-success'
    case 'returned':
      return 'rcp-badge-danger'
    case 'submitted':
      return 'rcp-badge-info'
    default:
      return 'rcp-badge-warning'
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
