<script setup lang="ts">
import { ChevronDown, LogOut } from 'lucide-vue-next'
import { useAuthStore } from '~/features/auth/stores/auth'
import { formatUserLabel } from '~/shared/users/format-user-label'

const { t } = useI18n()
const auth = useAuthStore()
const { logout, loggingOut } = useLogout()

const open = ref(false)
const menuRef = ref<HTMLElement | null>(null)

const displayName = computed(() =>
  auth.user ? formatUserLabel(auth.user) : '',
)

const initials = computed(() => {
  if (!auth.user) return '?'
  const first = auth.user.first_name?.[0] || auth.user.username?.[0] || auth.user.email?.[0] || '?'
  const last = auth.user.last_name?.[0] || ''
  return (first + last).toUpperCase()
})

function onClickOutside(event: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))

async function onLogout() {
  open.value = false
  await logout()
}
</script>

<template>
  <div v-if="auth.user" ref="menuRef" class="relative">
    <button
      type="button"
      class="touch-target inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-2 py-1.5 text-sm shadow-soft transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
      :aria-expanded="open"
      aria-haspopup="menu"
      @click.stop="open = !open"
    >
      <span class="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
        {{ initials }}
      </span>
      <span class="hidden max-w-[8rem] truncate font-medium md:inline">{{ displayName }}</span>
      <ChevronDown class="hidden h-4 w-4 text-muted md:block" aria-hidden="true" />
    </button>

    <div
      v-if="open"
      class="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-border bg-surface py-2 shadow-soft"
      role="menu"
    >
      <div class="border-b border-border px-4 py-3">
        <p class="truncate text-sm font-medium">{{ displayName }}</p>
        <p class="truncate text-xs text-muted">{{ auth.user.email }}</p>
        <p v-if="auth.user.role" class="mt-1 truncate text-xs text-muted">
          {{ auth.user.role.name }}
        </p>
      </div>
      <button
        type="button"
        role="menuitem"
        class="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-danger transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
        :disabled="loggingOut"
        @click="onLogout"
      >
        <LogOut class="h-4 w-4" aria-hidden="true" />
        {{ loggingOut ? t('auth.signingOut') : t('auth.signOut') }}
      </button>
    </div>
  </div>
</template>
