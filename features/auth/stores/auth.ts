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
      // #region agent log
      fetch('http://127.0.0.1:7550/ingest/00e40e9f-34c6-4349-ac97-bfda2cfa152b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'805b23'},body:JSON.stringify({sessionId:'805b23',hypothesisId:'H5',location:'auth.ts:hydrate-skip',message:'hydrate skipped already hydrated',data:{side:import.meta.server?'server':'client'},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      return
    }
    loading.value = true
    try {
      const session = await fetchSession(options?.fetcher ?? $fetch)
      token.value = session.token
      user.value = session.user
      // #region agent log
      fetch('http://127.0.0.1:7550/ingest/00e40e9f-34c6-4349-ac97-bfda2cfa152b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'805b23'},body:JSON.stringify({sessionId:'805b23',hypothesisId:'H3',location:'auth.ts:hydrate-ok',message:'hydrate completed',data:{side:import.meta.server?'server':'client',force:Boolean(options?.force),hasToken:Boolean(session.token),hasUser:Boolean(session.user),authenticated:session.authenticated??null},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
    } catch (err) {
      token.value = null
      user.value = null
      // #region agent log
      fetch('http://127.0.0.1:7550/ingest/00e40e9f-34c6-4349-ac97-bfda2cfa152b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'805b23'},body:JSON.stringify({sessionId:'805b23',hypothesisId:'H1',location:'auth.ts:hydrate-error',message:'hydrate fetch failed',data:{side:import.meta.server?'server':'client',err:String(err)},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
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
