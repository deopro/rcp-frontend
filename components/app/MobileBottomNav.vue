<script setup lang="ts">
import {
  Briefcase,
  CalendarDays,
  Home,
  MoreHorizontal,
  Users,
} from 'lucide-vue-next'

const { t } = useI18n()
const route = useRoute()

const items = computed(() => [
  { to: '/', label: t('nav.home'), icon: Home, match: /^\/$/ },
  { to: '/allocations', label: t('nav.allocations'), icon: CalendarDays, match: /^\/allocations/ },
  { to: '/projects', label: t('nav.projects'), icon: Briefcase, match: /^\/projects/ },
  { to: '/team', label: t('nav.team'), icon: Users, match: /^\/team/ },
  { to: '/more', label: t('nav.more'), icon: MoreHorizontal, match: /^\/more/ },
])

function isActive(match: RegExp) {
  return match.test(route.path)
}
</script>

<template>
  <nav
    class="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur md:hidden"
    style="padding-bottom: var(--rcp-safe-bottom)"
    :aria-label="t('nav.home')"
  >
    <ul class="mx-auto grid h-nav max-w-lg grid-cols-5">
      <li v-for="item in items" :key="item.to" class="flex">
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
