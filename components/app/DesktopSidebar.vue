<script setup lang="ts">
import {
  BarChart3,
  Briefcase,
  Building2,
  CalendarDays,
  Contact2,
  LayoutDashboard,
  Settings,
  Sparkles,
  UserRound,
  Users,
  UsersRound,
} from 'lucide-vue-next'

const { t } = useI18n()
const route = useRoute()

const links = computed(() => [
  { to: '/', label: t('nav.dashboard'), icon: LayoutDashboard },
  { to: '/allocations', label: t('nav.allocations'), icon: CalendarDays },
  { to: '/bench', label: t('nav.bench'), icon: UsersRound },
  { to: '/projects', label: t('nav.projects'), icon: Briefcase },
  { to: '/clients', label: t('nav.clients'), icon: Contact2 },
  { to: '/skills', label: t('nav.skills'), icon: Sparkles },
  { to: '/team', label: t('nav.team'), icon: Users },
  { to: '/employees', label: t('nav.employees'), icon: UserRound },
  { to: '/departments', label: t('nav.departments'), icon: Building2 },
  { to: '/reports', label: t('nav.reports'), icon: BarChart3 },
  { to: '/settings', label: t('nav.settings'), icon: Settings },
])

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<template>
  <aside
    class="hidden h-full w-64 shrink-0 flex-col overflow-hidden border-r border-border bg-surface md:flex"
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

    <nav class="flex-1 space-y-1 overflow-hidden p-3">
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
        :class="isActive(link.to) ? 'bg-slate-100 text-foreground dark:bg-slate-800' : 'text-muted hover:bg-slate-50 hover:text-foreground dark:hover:bg-slate-800'"
      >
        <component :is="link.icon" class="h-4 w-4" aria-hidden="true" />
        {{ link.label }}
      </NuxtLink>
    </nav>
  </aside>
</template>
