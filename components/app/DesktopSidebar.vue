<script setup lang="ts">
import {
  BarChart3,
  Briefcase,
  Building2,
  CalendarDays,
  ClipboardCheck,
  Contact2,
  LayoutDashboard,
  LogOut,
  Palmtree,
  Settings,
  Sparkles,
  UserRound,
  TrendingUp,
  Users,
  UsersRound,
} from 'lucide-vue-next'
import { useAuthStore } from '~/features/auth/stores/auth'
import { formatUserLabel } from '~/shared/users/format-user-label'
import { filterNavLinks } from '~/shared/navigation/nav-access'

const { t } = useI18n()
const route = useRoute()
const auth = useAuthStore()
const { logout, loggingOut } = useLogout()

const displayName = computed(() =>
  auth.user ? formatUserLabel(auth.user) : '',
)

const allLinks = computed(() => [
  { to: '/', label: t('nav.dashboard'), icon: LayoutDashboard },
  { to: '/allocations', label: t('nav.allocations'), icon: CalendarDays },
  { to: '/leave', label: t('leave.title'), icon: Palmtree },
  { to: '/bench', label: t('nav.bench'), icon: UsersRound },
  { to: '/forecast', label: t('nav.forecast'), icon: TrendingUp },
  { to: '/approvals', label: t('nav.approvals'), icon: ClipboardCheck },
  { to: '/projects', label: t('nav.projects'), icon: Briefcase },
  { to: '/clients', label: t('nav.clients'), icon: Contact2 },
  { to: '/skills', label: t('nav.skills'), icon: Sparkles },
  { to: '/team', label: t('nav.team'), icon: Users },
  { to: '/employees', label: t('nav.employees'), icon: UserRound },
  { to: '/departments', label: t('nav.departments'), icon: Building2 },
  { to: '/reports', label: t('nav.reports'), icon: BarChart3 },
  { to: '/settings', label: t('nav.settings'), icon: Settings },
])

const links = computed(() => filterNavLinks(allLinks.value, auth.roleType))

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<template>
  <aside
    class="fixed bottom-0 z-40 flex w-64 flex-col overflow-hidden border-r border-border bg-surface max-md:hidden"
    style="top: var(--rcp-safe-top); left: var(--rcp-safe-left);"
    aria-label="Sidebar"
  >
    <div class="flex h-header items-center gap-2 border-b border-border px-5">
      <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
        R
      </div>
      <div>
        <p class="text-sm font-semibold tracking-tight">{{ t('app.name') }}</p>
        <p class="text-xs text-muted">{{ t('app.tagline') }}</p>
      </div>
    </div>

    <nav class="scrollbar-thin min-h-0 flex-1 space-y-1 overflow-y-auto p-3">
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
        :class="isActive(link.to) ? 'bg-hover text-foreground' : 'text-muted hover:bg-hover hover:text-foreground'"
      >
        <component :is="link.icon" class="h-4 w-4" aria-hidden="true" />
        {{ link.label }}
      </NuxtLink>
    </nav>

    <div v-if="auth.user" class="shrink-0 border-t border-border p-3">
      <div class="px-3 py-2">
        <p class="truncate text-sm font-medium">{{ displayName }}</p>
        <p class="truncate text-xs text-muted">{{ auth.user.email }}</p>
      </div>
      <button
        type="button"
        class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-danger transition-colors hover:bg-hover disabled:opacity-50"
        :disabled="loggingOut"
        @click="logout"
      >
        <LogOut class="h-4 w-4" aria-hidden="true" />
        {{ loggingOut ? t('auth.signingOut') : t('auth.signOut') }}
      </button>
    </div>
  </aside>
</template>
