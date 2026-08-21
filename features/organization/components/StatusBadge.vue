<script setup lang="ts">
import type { OrgStatus } from '~/features/organization/types'

defineProps<{ status: OrgStatus }>()
const { t } = useI18n()
</script>

<template>
  <span
    class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
    :class="
      status === 'active'
        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
    "
  >
    {{ t(`org.status.${status}`) }}
  </span>
</template>
