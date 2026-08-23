<script setup lang="ts">
const { t } = useI18n()

defineProps<{
  title?: string
}>()
</script>

<template>
  <header
    class="z-30 flex h-header shrink-0 items-center justify-between border-b border-border bg-surface/95 px-4 backdrop-blur md:px-6"
  >
    <div class="flex min-w-0 items-center gap-3">
      <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground md:hidden">
        R
      </div>
      <div class="min-w-0">
        <h1 class="truncate text-base font-semibold tracking-tight md:text-lg">
          {{ title || t('app.name') }}
        </h1>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <slot name="actions" />
      <AppThemeToggle />
      <AppLanguageSwitcher />
    </div>
  </header>
</template>
