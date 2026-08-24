<script setup lang="ts">
import { Monitor, Moon, Sun } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    /** Icon button for chrome; select shows labeled options (settings). */
    variant?: 'icon' | 'select'
  }>(),
  { variant: 'icon' },
)

const { t } = useI18n()
const colorMode = useColorMode()

// Avoid SSR/localStorage preference mismatch on first paint
const ready = ref(false)
onMounted(() => {
  ready.value = true
})

const options = computed(() => [
  { value: 'system', label: t('theme.system') },
  { value: 'light', label: t('theme.light') },
  { value: 'dark', label: t('theme.dark') },
])

function cycleTheme() {
  const order = ['system', 'light', 'dark'] as const
  const current = colorMode.preference
  const idx = order.indexOf(current as (typeof order)[number])
  colorMode.preference = order[(idx + 1) % order.length]
}

function onSelect(value: string) {
  if (value === 'system' || value === 'light' || value === 'dark') {
    colorMode.preference = value
  }
}

const currentIcon = computed(() => {
  const pref = colorMode.preference
  if (pref === 'dark') return Moon
  if (pref === 'light') return Sun
  return Monitor
})

const preferenceLabel = computed(() => {
  const pref = colorMode.preference
  if (pref === 'dark') return t('theme.dark')
  if (pref === 'light') return t('theme.light')
  return t('theme.system')
})
</script>

<template>
  <UiSelect
    v-if="props.variant === 'select'"
    id="theme-preference"
    class="max-w-xs"
    :model-value="ready ? colorMode.preference : 'system'"
    :aria-label="t('theme.label')"
    @update:model-value="onSelect"
  >
    <option v-for="opt in options" :key="opt.value" :value="opt.value">
      {{ opt.label }}
    </option>
  </UiSelect>

  <button
    v-else
    type="button"
    class="touch-target inline-flex items-center justify-center text-muted transition-colors hover:text-foreground"
    :aria-label="t('theme.toggle')"
    :title="preferenceLabel"
    @click="cycleTheme"
  >
    <span v-if="!ready" class="h-4 w-4" aria-hidden="true" />
    <component :is="currentIcon" v-else class="h-4 w-4" aria-hidden="true" />
  </button>
</template>
