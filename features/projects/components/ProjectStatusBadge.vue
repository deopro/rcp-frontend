<script setup lang="ts">
import type { ProjectStatus } from '../types'

defineProps<{ status: ProjectStatus }>()
const { t } = useI18n()

const classes: Record<ProjectStatus, string> = {
  planned: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200',
  active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  on_hold: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  completed: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
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
