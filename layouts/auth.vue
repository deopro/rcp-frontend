<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="flex h-full flex-col overflow-y-auto bg-background text-foreground">
    <header class="flex h-header items-center justify-between border-b border-border bg-surface px-4">
      <div class="flex items-center gap-2">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
          R
        </div>
        <div>
          <p class="text-sm font-semibold">{{ t('app.name') }}</p>
          <p class="text-xs text-muted">{{ t('app.tagline') }}</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <AppThemeToggle />
        <AppLanguageSwitcher />
      </div>
    </header>
    <main class="flex flex-1 items-center justify-center px-4 py-8">
      <slot />
    </main>
  </div>
</template>
