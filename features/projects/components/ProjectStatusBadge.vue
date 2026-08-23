<script setup lang="ts">
import type { ProjectStatus } from '../types'

defineProps<{ status: ProjectStatus }>()
const { t } = useI18n()

const classes: Record<ProjectStatus, string> = {
  planned: 'rcp-badge-info',
  active: 'rcp-badge-success',
  on_hold: 'rcp-badge-warning',
  completed: 'rcp-badge-neutral',
  cancelled: 'rcp-badge-danger',
}
</script>

<template>
  <span
    class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
    :class="classes[status]"
  >
    {{ t(`projects.status.${status}`) }}
  </span>
</template>
