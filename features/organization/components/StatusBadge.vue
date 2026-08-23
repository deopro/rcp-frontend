<script setup lang="ts">
import type { OrgStatus } from '~/features/organization/types'

defineProps<{ status: OrgStatus }>()
const { t } = useI18n()
</script>

<template>
  <span
    class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
    :class="status === 'active' ? 'rcp-badge-success' : 'rcp-badge-neutral'"
  >
    {{ t(`org.status.${status}`) }}
  </span>
</template>
