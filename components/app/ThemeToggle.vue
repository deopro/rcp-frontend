<script setup lang="ts">
import { Monitor, Moon, Sun } from 'lucide-vue-next'

const { t } = useI18n()
const colorMode = useColorMode()

// Avoid SSR/localStorage preference mismatch on first paint
const ready = ref(false)
onMounted(() => {
  ready.value = true
})

const options = computed(() => [
  { value: 'system', label: t('theme.system'), icon: Monitor },
  { value: 'light', label: t('theme.light'), icon: Sun },
  { value: 'dark', label: t('theme.dark'), icon: Moon },
])

function cycleTheme() {
  const order = ['system', 'light', 'dark'] as const
  const current = colorMode.preference
  const idx = order.indexOf(current as (typeof order)[number])
  colorMode.preference = order[(idx + 1) % order.length]
}

const currentIcon = computed(() => {
  const pref = colorMode.preference
  if (pref === 'dark') return Moon
  if (pref === 'light') return Sun
  return Monitor
})
</script>

<template>
  <div class="inline-flex items-center gap-1">
    <button
      type="button"
      class="touch-target inline-flex items-center justify-center rounded-lg border border-border bg-surface text-foreground shadow-soft transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
      :aria-label="t('theme.toggle')"
      :title="t('theme.toggle')"
      @click="cycleTheme"
    >
      <span v-if="!ready" class="h-4 w-4" aria-hidden="true" />
      <component :is="currentIcon" v-else class="h-4 w-4" aria-hidden="true" />
    </button>
    <label class="sr-only" for="theme-select">{{ t('theme.label') }}</label>
    <select
      id="theme-select"
      class="hidden rounded-lg border border-border bg-surface px-2 py-2 text-sm text-foreground shadow-soft sm:block"
      :value="ready ? colorMode.preference : 'system'"
      @change="colorMode.preference = ($event.target as HTMLSelectElement).value"
    >
      <option v-for="opt in options" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>
  </div>
</template>
