import { defineStore } from 'pinia'
import { useNotificationsApi } from '../api'
import type { AppNotification } from '../types'

export const useNotificationsStore = defineStore('notifications', () => {
  const items = ref<AppNotification[]>([])
  const unreadCount = ref(0)
  const loading = ref(false)
  const scanning = ref(false)
  let pollTimer: ReturnType<typeof setInterval> | null = null

  function api() {
    return useNotificationsApi()
  }

  async function load() {
    loading.value = true
    try {
      const res = await api().list({ limit: 50 })
      items.value = res.data
      unreadCount.value = res.meta.unread_count
    } finally {
      loading.value = false
    }
  }

  async function refreshUnread() {
    const res = await api().unreadCount()
    unreadCount.value = res.data.unread_count
  }

  async function markRead(documentId: string) {
    const res = await api().markRead(documentId)
    const idx = items.value.findIndex((n) => n.document_id === documentId)
    if (idx >= 0) items.value[idx] = res.data
    if (unreadCount.value > 0) unreadCount.value -= 1
  }

  async function markAllRead() {
    await api().markAllRead()
    items.value = items.value.map((n) => ({
      ...n,
      read_at: n.read_at || new Date().toISOString(),
    }))
    unreadCount.value = 0
  }

  async function scan() {
    scanning.value = true
    try {
      const res = await api().scan()
      await load()
      return res.data
    } finally {
      scanning.value = false
    }
  }

  function startPolling(intervalMs = 60_000) {
    stopPolling()
    pollTimer = setInterval(() => {
      refreshUnread().catch(() => undefined)
    }, intervalMs)
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  return {
    items,
    unreadCount,
    loading,
    scanning,
    load,
    refreshUnread,
    markRead,
    markAllRead,
    scan,
    startPolling,
    stopPolling,
  }
})
