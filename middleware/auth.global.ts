import { ensureAuthSession } from '~/composables/useAuthSession'
import { useAuthStore } from '~/features/auth/stores/auth'

const PUBLIC_PATHS = ['/login']

export default defineNuxtRouteMiddleware(async (to) => {
  if (PUBLIC_PATHS.some((path) => to.path === path || to.path.startsWith(`${path}/`))) {
    return
  }

  await ensureAuthSession()
  const auth = useAuthStore()

  // #region agent log
  fetch('http://127.0.0.1:7550/ingest/00e40e9f-34c6-4349-ac97-bfda2cfa152b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'805b23'},body:JSON.stringify({sessionId:'805b23',hypothesisId:'H4',location:'auth.global.ts:after-hydrate',message:'auth middleware state',data:{side:import.meta.server?'server':'client',path:to.path,hydrated:auth.hydrated,isAuthenticated:auth.isAuthenticated,hasToken:Boolean(auth.token),hasUser:Boolean(auth.user)},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  if (!auth.isAuthenticated) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath },
    })
  }
})
