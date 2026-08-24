<script setup lang="ts">
import { Bell } from 'lucide-vue-next'
import { useAuthStore } from '~/features/auth/stores/auth'
import { useNotificationsStore } from '~/features/notifications/stores/notifications'

const { t } = useI18n()
const auth = useAuthStore()
const store = useNotificationsStore()
const route = useRoute()

const badge = computed(() => {
  if (store.unreadCount <= 0) return ''
  return store.unreadCount > 99 ? '99+' : String(store.unreadCount)
})

onMounted(async () => {
  if (!auth.isAuthenticated) return
  try {
    await store.refreshUnread()
    store.startPolling()
  } catch {
    // ignore bootstrap failures
  }
})

onBeforeUnmount(() => {
  store.stopPolling()
})

watch(
  () => auth.isAuthenticated,
  async (ok) => {
    if (ok) {
      await store.refreshUnread().catch(() => undefined)
      store.startPolling()
    } else {
      store.stopPolling()
      store.unreadCount = 0
    }
  },
)

watch(
  () => route.path,
  async (path) => {
    if (path.startsWith('/notifications') && auth.isAuthenticated) {
      await store.refreshUnread().catch(() => undefined)
    }
  },
)
</script>

<template>
  <NuxtLink
    v-if="auth.isAuthenticated"
    to="/notifications"
    class="touch-target inline-flex items-center justify-center text-muted transition-colors hover:text-foreground"
    :aria-label="t('notifications.title')"
    :title="t('notifications.title')"
  >
    <span class="relative inline-flex">
      <Bell class="h-4 w-4" aria-hidden="true" />
      <span
        v-if="badge"
        class="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-0.5 text-[10px] font-semibold leading-none text-white"
      >
        {{ badge }}
      </span>
    </span>
  </NuxtLink>
</template>
