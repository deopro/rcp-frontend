<script setup lang="ts">
import {
  Briefcase,
  CalendarDays,
  Home,
  MoreHorizontal,
  Palmtree,
} from 'lucide-vue-next'
import { useAuthStore } from '~/features/auth/stores/auth'
import { filterNavLinks } from '~/shared/navigation/nav-access'

const { t } = useI18n()
const route = useRoute()
const auth = useAuthStore()

const allItems = computed(() => [
  { to: '/', label: t('nav.home'), icon: Home, match: /^\/$/ },
  { to: '/allocations', label: t('nav.allocations'), icon: CalendarDays, match: /^\/allocations/ },
  { to: '/leave', label: t('leave.title'), icon: Palmtree, match: /^\/leave/ },
  { to: '/projects', label: t('nav.projects'), icon: Briefcase, match: /^\/projects/ },
  { to: '/more', label: t('nav.more'), icon: MoreHorizontal, match: /^\/more/ },
])

const items = computed(() => filterNavLinks(allItems.value, auth.roleType))

function isActive(match: RegExp) {
  return match.test(route.path)
}
</script>

<template>
  <nav
    class="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface md:hidden"
    style="padding-bottom: var(--rcp-safe-bottom)"
    :aria-label="t('a11y.mainNav')"
  >
    <ul class="mx-auto flex h-nav max-w-lg">
      <li v-for="item in items" :key="item.to" class="flex min-w-0 flex-1">
        <NuxtLink
          :to="item.to"
          class="touch-target flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors"
          :class="isActive(item.match) ? 'text-accent' : 'text-muted'"
        >
          <component :is="item.icon" class="h-5 w-5" aria-hidden="true" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>
