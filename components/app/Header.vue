<script setup lang="ts">
import { Settings } from 'lucide-vue-next'
import NotificationBell from '~/features/notifications/components/NotificationBell.vue'

const { t } = useI18n()

defineProps<{
  title?: string
}>()
</script>

<template>
  <header
    class="z-30 flex h-header shrink-0 items-center justify-between border-b border-border bg-surface px-4 md:px-6"
  >
    <div class="flex min-w-0 items-center gap-3">
      <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground md:hidden">
        R
      </div>
      <div class="min-w-0">
        <h1 class="truncate text-base font-semibold leading-none tracking-tight">
          {{ title || t('app.name') }}
          <span class="ml-2 text-sm font-normal text-muted">{{ t('app.tagline') }}</span>
        </h1>
      </div>
    </div>
    <div class="flex shrink-0 items-center gap-2">
      <slot name="actions" />
      <NotificationBell />
      <NuxtLink
        to="/settings"
        class="touch-target inline-flex items-center justify-center rounded-lg border border-border bg-input text-foreground shadow-soft transition-colors hover:bg-hover"
        :aria-label="t('nav.settings')"
        :title="t('nav.settings')"
      >
        <Settings class="h-4 w-4" aria-hidden="true" />
      </NuxtLink>
      <AppThemeToggle />
      <AppLanguageSwitcher />
      <AppUserMenu />
    </div>
  </header>
</template>
