<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'
import { useAuthStore } from '~/features/auth/stores/auth'

const { locale, setLocale, t } = useI18n()
const auth = useAuthStore()

const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)

const items = [
  { code: 'pt-PT' as const, short: 'PT', full: 'PT Português' },
  { code: 'en' as const, short: 'EN', full: 'EN English' },
]

const current = computed(
  () => items.find((item) => item.code === locale.value) || items[0]!,
)

async function selectLocale(code: 'pt-PT' | 'en') {
  open.value = false
  await setLocale(code)
  if (auth.isAuthenticated) {
    try {
      await auth.setLocale(code)
    } catch {
      // Locale still applied locally; server sync can retry later
    }
  }
}

function onClickOutside(event: MouseEvent) {
  if (rootRef.value && !rootRef.value.contains(event.target as Node)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>

<template>
  <div ref="rootRef" class="relative">
    <button
      type="button"
      class="touch-target inline-flex items-center gap-0.5 px-1 text-sm font-medium text-muted transition-colors hover:text-foreground"
      :aria-expanded="open"
      aria-haspopup="listbox"
      :aria-label="t('actions.language')"
      @click.stop="open = !open"
    >
      {{ current.short }}
      <ChevronDown class="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
    </button>

    <ul
      v-if="open"
      class="absolute right-0 top-full z-50 mt-1 min-w-[9.5rem] overflow-hidden rounded-lg border border-border bg-surface py-1 shadow-soft"
      role="listbox"
    >
      <li v-for="item in items" :key="item.code">
        <button
          type="button"
          role="option"
          class="flex w-full px-3 py-2 text-left text-sm transition-colors hover:bg-hover"
          :class="item.code === locale ? 'font-semibold text-foreground' : 'text-muted'"
          :aria-selected="item.code === locale"
          @click="selectLocale(item.code)"
        >
          {{ item.full }}
        </button>
      </li>
    </ul>
  </div>
</template>
