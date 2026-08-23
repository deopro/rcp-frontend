<script setup lang="ts">
/** Team hub — links to teams & employees (mobile-friendly). */
import { filterNavLinks } from '~/shared/navigation/nav-access'
import { useAuthStore } from '~/features/auth/stores/auth'

definePageMeta({})

const { t } = useI18n()
const auth = useAuthStore()

const allLinks = computed(() => [
  { to: '/teams', label: t('org.teams.title'), hint: t('org.teams.subtitle') },
  { to: '/employees', label: t('org.employees.title'), hint: t('org.employees.subtitle') },
  { to: '/departments', label: t('org.departments.title'), hint: t('org.departments.subtitle') },
])

const links = computed(() => filterNavLinks(allLinks.value, auth.roleType))
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-4">
    <div>
      <h2 class="text-xl font-semibold">{{ t('nav.team') }}</h2>
      <p class="text-sm text-muted">{{ t('org.hubSubtitle') }}</p>
    </div>

    <ul class="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface shadow-soft">
      <li v-for="link in links" :key="link.to">
        <NuxtLink
          :to="link.to"
          class="touch-target block px-4 py-4 hover:bg-hover"
        >
          <p class="text-sm font-medium">{{ link.label }}</p>
          <p class="mt-0.5 text-xs text-muted">{{ link.hint }}</p>
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
