import { defineStore } from 'pinia'
import { fetchSession, loginRequest, logoutRequest, updatePreferredLocale, type SessionFetcher } from '../api'
import type { AuthUser, RcpRoleType } from '../types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const token = ref<string | null>(null)
  const hydrated = ref(false)
  const loading = ref(false)

  const isAuthenticated = computed(() => Boolean(token.value && user.value))
  const roleType = computed(() => (user.value?.role?.type as RcpRoleType | undefined) || null)

  function hasRole(...roles: RcpRoleType[]) {
    if (!roleType.value) return false
    return roles.includes(roleType.value)
  }

  async function hydrate(options?: { fetcher?: SessionFetcher; force?: boolean }) {
    if (hydrated.value && !options?.force) {
      return
    }
    loading.value = true
    try {
      const session = await fetchSession(options?.fetcher ?? $fetch)
      token.value = session.token
      user.value = session.user
    } catch {
      token.value = null
      user.value = null
    } finally {
      hydrated.value = true
      loading.value = false
    }
  }

  async function login(identifier: string, password: string) {
    loading.value = true
    try {
      const result = await loginRequest(identifier, password)
      token.value = result.jwt
      user.value = result.user
      hydrated.value = true
      return result
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      await logoutRequest()
    } finally {
      token.value = null
      user.value = null
    }
  }

  async function setLocale(locale: 'pt-PT' | 'en') {
    if (!isAuthenticated.value) return
    const updated = await updatePreferredLocale(locale)
    user.value = updated
  }

  function clearSession() {
    token.value = null
    user.value = null
  }

  return {
    user,
    token,
    hydrated,
    loading,
    isAuthenticated,
    roleType,
    hasRole,
    hydrate,
    login,
    logout,
    setLocale,
    clearSession,
  }
})
