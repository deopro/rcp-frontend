<script setup lang="ts">
import { useAuthStore } from '~/features/auth/stores/auth'
import { usePushNotifications } from '~/features/notifications/composables/usePushNotifications'
import { useNotificationsStore } from '~/features/notifications/stores/notifications'
import type { AppNotification } from '~/features/notifications/types'
import { formatNotificationCopy } from '~/shared/notifications/format-copy'

definePageMeta({})

const { t, te, locale } = useI18n()
const auth = useAuthStore()
const store = useNotificationsStore()
const push = usePushNotifications()
const toast = useToast()
const { showApiError } = useApiErrorToast()

const canScan = computed(() =>
  auth.hasRole('administrator', 'executive', 'department_manager', 'team_leader'),
)

onMounted(async () => {
  try {
    await Promise.all([store.load(), push.refreshStatus()])
  } catch (e) {
    showApiError(e)
  }
})

function typeLabel(type: string) {
  return t(`notifications.types.${type}`)
}

function copyFor(n: AppNotification) {
  return formatNotificationCopy(t, te, n)
}

function formatWhen(iso?: string) {
  if (!iso) return ''
  try {
    return new Intl.DateTimeFormat(locale.value, {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

function linkFor(n: AppNotification): string | null {
  const link = n.payload?.link
  return typeof link === 'string' ? link : null
}

async function onMarkRead(n: AppNotification) {
  if (n.read_at) return
  try {
    await store.markRead(n.document_id)
  } catch (e) {
    showApiError(e)
  }
}

async function onMarkAll() {
  try {
    await store.markAllRead()
    toast.success({ title: t('notifications.markedAll') })
  } catch (e) {
    showApiError(e)
  }
}

async function onScan() {
  try {
    const result = await store.scan()
    toast.success({
      title: t('notifications.scanDone'),
      description: t('notifications.scanResult', {
        created: result.created,
        employees: result.scanned_employees,
      }),
    })
  } catch (e) {
    showApiError(e)
  }
}

async function onEnablePush() {
  const result = await push.enable()
  if (result.ok) {
    toast.success({ title: t('notifications.push.enabled') })
    return
  }
  toast.info({
    title: t('notifications.push.title'),
    description: t(`notifications.push.${result.reason}`),
  })
}
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-4">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 class="text-xl font-semibold">{{ t('notifications.title') }}</h2>
        <p class="text-sm text-muted">{{ t('notifications.subtitle') }}</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <UiButton
          v-if="canScan"
          variant="outline"
          size="sm"
          :disabled="store.scanning"
          @click="onScan"
        >
          {{ store.scanning ? t('notifications.scanning') : t('notifications.scan') }}
        </UiButton>
        <UiButton
          variant="outline"
          size="sm"
          :disabled="!store.unreadCount"
          @click="onMarkAll"
        >
          {{ t('notifications.markAll') }}
        </UiButton>
      </div>
    </div>

    <div class="rounded-lg border border-border bg-surface p-4 text-sm">
      <p class="font-medium">{{ t('notifications.push.title') }}</p>
      <p class="mt-1 text-muted">{{ t('notifications.push.hint') }}</p>
      <UiButton class="mt-3" size="sm" variant="outline" @click="onEnablePush">
        {{ t('notifications.push.enable') }}
      </UiButton>
    </div>

    <UiPageSkeleton v-if="store.loading" variant="list" :rows="5" />

    <div
      v-else-if="!store.items.length"
      class="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted"
    >
      {{ t('notifications.empty') }}
    </div>

    <ul v-else class="space-y-2">
      <li
        v-for="item in store.items"
        :key="item.document_id"
        class="rounded-lg border border-border bg-surface p-4 shadow-soft"
        :class="item.read_at ? 'opacity-70' : ''"
      >
        <div class="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p class="text-xs font-medium uppercase tracking-wide text-muted">
              {{ typeLabel(item.type) }}
            </p>
            <p class="mt-1 font-medium">{{ copyFor(item).title }}</p>
            <p v-if="copyFor(item).body" class="mt-1 text-sm text-muted">{{ copyFor(item).body }}</p>
            <p class="mt-2 text-xs text-muted">{{ formatWhen(item.created_at) }}</p>
          </div>
          <div class="flex gap-2">
            <UiButton
              v-if="!item.read_at"
              size="sm"
              variant="outline"
              @click="onMarkRead(item)"
            >
              {{ t('notifications.markRead') }}
            </UiButton>
            <NuxtLink
              v-if="linkFor(item)"
              :to="linkFor(item)!"
              class="inline-flex items-center rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-hover"
              @click="onMarkRead(item)"
            >
              {{ t('notifications.open') }}
            </NuxtLink>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>
