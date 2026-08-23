<script setup lang="ts">
import { useAuthStore } from '~/features/auth/stores/auth'

const { t } = useI18n()
const auth = useAuthStore()

const actions = computed(() => [
  { to: '/allocations', label: t('nav.allocations'), desc: t('allocations.subtitle') },
  {
    to: '/leave',
    label: auth.hasRole('employee') ? t('leave.employee.title') : t('leave.title'),
    desc: auth.hasRole('employee') ? t('leave.employee.subtitle') : t('leave.subtitle'),
  },
  { to: '/skills', label: t('nav.skills'), desc: t('skills.subtitle') },
])
</script>

<template>
  <section class="rounded-lg border border-border bg-surface p-4 shadow-soft">
    <h3 class="mb-3 text-sm font-semibold">{{ t('dashboard.quickActions.title') }}</h3>
    <div class="grid gap-2 sm:grid-cols-3">
      <NuxtLink
        v-for="action in actions"
        :key="action.to"
        :to="action.to"
        class="rounded-lg border border-border px-3 py-3 transition-colors hover:border-accent hover:bg-hover"
      >
        <p class="text-sm font-medium">{{ action.label }}</p>
        <p class="mt-1 text-xs text-muted">{{ action.desc }}</p>
      </NuxtLink>
    </div>
  </section>
</template>
