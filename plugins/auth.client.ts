import { clearAuthSessionCache, ensureAuthSession } from '~/composables/useAuthSession'
import { useAuthStore } from '~/features/auth/stores/auth'

export default defineNuxtPlugin((nuxtApp) => {
  // Run after hydration so we do not change layout/auth state mid-hydrate.
  nuxtApp.hook('app:mounted', async () => {
    const auth = useAuthStore()

    // #region agent log
    fetch('http://127.0.0.1:7550/ingest/00e40e9f-34c6-4349-ac97-bfda2cfa152b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'805b23'},body:JSON.stringify({sessionId:'805b23',hypothesisId:'H4',location:'auth.client.ts:boot',message:'client plugin boot',data:{hydrated:auth.hydrated,isAuthenticated:auth.isAuthenticated,hasToken:Boolean(auth.token),hasUser:Boolean(auth.user)},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    if (auth.isAuthenticated) return

    clearAuthSessionCache()
    await ensureAuthSession()

    // #region agent log
    fetch('http://127.0.0.1:7550/ingest/00e40e9f-34c6-4349-ac97-bfda2cfa152b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'805b23'},body:JSON.stringify({sessionId:'805b23',hypothesisId:'H4',location:'auth.client.ts:after',message:'client plugin after hydrate',data:{hydrated:auth.hydrated,isAuthenticated:auth.isAuthenticated,hasToken:Boolean(auth.token),hasUser:Boolean(auth.user)},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    if (!auth.isAuthenticated) return

    const route = useRoute()
    if (route.path === '/login') {
      const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
      await navigateTo(redirect)
    }
  })
})
