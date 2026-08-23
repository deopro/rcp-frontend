<script setup lang="ts">
import { Monitor, Moon, Sun } from 'lucide-vue-next'

const { t } = useI18n()
const colorMode = useColorMode()

// Avoid SSR/localStorage preference mismatch on first paint
const ready = ref(false)
onMounted(() => {
  ready.value = true
})

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
  <button
    type="button"
    class="touch-target inline-flex items-center justify-center rounded-lg border border-border bg-input text-foreground shadow-soft transition-colors hover:bg-hover"
    :aria-label="t('theme.toggle')"
    :title="t('theme.toggle')"
    @click="cycleTheme"
  >
    <span v-if="!ready" class="h-4 w-4" aria-hidden="true" />
    <component :is="currentIcon" v-else class="h-4 w-4" aria-hidden="true" />
  </button>
</template>
