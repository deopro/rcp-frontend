<script setup lang="ts">
import { formatRoleLabel } from '~/shared/auth/format-role'
import { formatUserLabel } from '~/shared/users/format-user-label'
import { useAuthStore } from '~/features/auth/stores/auth'
import { filterNavLinks } from '~/shared/navigation/nav-access'

const { t, te } = useI18n()
const auth = useAuthStore()
const { logout, loggingOut } = useLogout()

const displayName = computed(() =>
  auth.user ? formatUserLabel(auth.user) : '',
)

const roleLabel = computed(() => formatRoleLabel(t, te, auth.user?.role))

const allLinks = computed(() => [
  { to: '/projects', label: t('nav.projects') },
  { to: '/clients', label: t('nav.clients') },
  { to: '/employees', label: t('nav.employees') },
  { to: '/departments', label: t('nav.departments') },
  { to: '/teams', label: t('org.teams.title') },
  { to: '/leave', label: t('leave.title') },
  { to: '/holidays', label: t('leave.holidays.title') },
  { to: '/settings', label: t('nav.settings') },
  { to: '/notifications', label: t('nav.notifications') },
  { to: '/reports', label: t('nav.reports') },
  { to: '/skills', label: t('nav.skills') },
  { to: '/bench', label: t('nav.bench') },
  { to: '/forecast', label: t('nav.forecast') },
  { to: '/ai', label: t('nav.ai') },
  { to: '/approvals', label: t('nav.approvals') },
])

const links = computed(() => filterNavLinks(allLinks.value, auth.roleType))

async function onLogout() {
  await logout()
}
</script>

<template>
  <div class="space-y-4">
    <h2 class="text-xl font-semibold">{{ t('nav.more') }}</h2>

    <div
      v-if="auth.user"
      class="rounded-lg border border-border bg-surface p-4 shadow-soft"
    >
      <p class="text-sm font-medium">{{ displayName }}</p>
      <p class="text-xs text-muted">{{ auth.user.email }}</p>
      <p v-if="roleLabel" class="mt-1 text-xs text-muted">
        {{ roleLabel }}
      </p>
    </div>

    <ul class="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface shadow-soft">
      <li v-for="link in links" :key="link.to">
        <NuxtLink
          :to="link.to"
          class="touch-target flex items-center px-4 py-3 text-sm font-medium hover:bg-hover"
        >
          {{ link.label }}
        </NuxtLink>
      </li>
      <li>
        <button
          type="button"
          class="touch-target flex w-full items-center px-4 py-3 text-left text-sm font-medium text-danger hover:bg-hover disabled:opacity-50"
          :disabled="loggingOut"
          @click="onLogout"
        >
          {{ loggingOut ? t('auth.signingOut') : t('auth.signOut') }}
        </button>
      </li>
    </ul>
  </div>
</template>
