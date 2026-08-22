<script setup lang="ts">
import type { ProficiencyLevel } from '../types'

defineProps<{ level: ProficiencyLevel }>()
const { t } = useI18n()

const classes: Record<ProficiencyLevel, string> = {
  basic: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  intermediate: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200',
  advanced: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200',
  expert: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
}
</script>

<template>
  <span
    class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
    :class="classes[level]"
  >
    {{ t(`skills.proficiency.${level}`) }}
  </span>
</template>
