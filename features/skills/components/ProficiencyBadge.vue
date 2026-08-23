<script setup lang="ts">
import type { ProficiencyLevel } from '../types'

defineProps<{ level: ProficiencyLevel }>()
const { t } = useI18n()

const classes: Record<ProficiencyLevel, string> = {
  basic: 'rcp-badge-neutral',
  intermediate: 'rcp-badge-info',
  advanced: 'rcp-badge-accent',
  expert: 'rcp-badge-success',
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
