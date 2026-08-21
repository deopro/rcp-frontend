<script setup lang="ts">
import { useAuthStore } from '~/features/auth/stores/auth'

const { locale, locales, setLocale, t } = useI18n()
const auth = useAuthStore()

const items = computed(() =>
  (locales.value as Array<{ code: string; name: string }>).map((l) => ({
    code: l.code,
    label: l.code === 'pt-PT' ? '🇵🇹 Português' : '🇬🇧 English',
    name: l.name,
  })),
)

async function onChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value as 'pt-PT' | 'en'
  await setLocale(value)
  if (auth.isAuthenticated) {
    try {
      await auth.setLocale(value)
    } catch {
      // Locale still applied locally; server sync can retry later
    }
  }
}
</script>

<template>
  <label class="inline-flex items-center gap-2 text-sm text-muted">
    <span class="sr-only">{{ t('actions.language') }}</span>
    <select
      class="touch-target rounded-lg border border-border bg-surface px-3 text-sm text-foreground shadow-soft"
      :value="locale"
      :aria-label="t('actions.language')"
      @change="onChange"
    >
      <option v-for="item in items" :key="item.code" :value="item.code">
        {{ item.label }}
      </option>
    </select>
  </label>
</template>
