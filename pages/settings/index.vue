<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="mx-auto max-w-lg space-y-6">
    <div>
      <h2 class="text-xl font-semibold">{{ t('nav.settings') }}</h2>
      <p class="mt-1 text-sm text-muted">{{ t('settings.subtitle') }}</p>
    </div>

    <section class="space-y-3 rounded-lg border border-border bg-surface p-4 shadow-soft">
      <h3 class="text-sm font-semibold">{{ t('theme.label') }}</h3>
      <AppThemeToggle />
    </section>

    <section class="space-y-3 rounded-lg border border-border bg-surface p-4 shadow-soft">
      <h3 class="text-sm font-semibold">{{ t('actions.language') }}</h3>
      <AppLanguageSwitcher />
    </section>
  </div>
</template>
