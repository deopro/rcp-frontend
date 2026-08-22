import type { AuthUser, SessionResponse } from '../../../features/auth/types'

export default defineEventHandler(async (event): Promise<SessionResponse> => {
  const config = useRuntimeConfig()
  const token = getCookie(event, 'rcp_jwt')

  // #region agent log
  fetch('http://127.0.0.1:7550/ingest/00e40e9f-34c6-4349-ac97-bfda2cfa152b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'805b23'},body:JSON.stringify({sessionId:'805b23',hypothesisId:'H1',location:'session.get.ts:entry',message:'session request',data:{hasCookie:Boolean(token),cookieLen:token?.length??0,path:event.path},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  if (!token) {
    return { authenticated: false, token: null, user: null }
  }

  try {
    const user = await $fetch<AuthUser>(`${config.public.apiUrl}/api/account/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (user.status === 'inactive') {
      deleteCookie(event, 'rcp_jwt', { path: '/' })
      // #region agent log
      fetch('http://127.0.0.1:7550/ingest/00e40e9f-34c6-4349-ac97-bfda2cfa152b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'805b23'},body:JSON.stringify({sessionId:'805b23',hypothesisId:'H2',location:'session.get.ts:inactive',message:'user inactive cookie cleared',data:{userId:user.id},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      return { authenticated: false, token: null, user: null }
    }

    // #region agent log
    fetch('http://127.0.0.1:7550/ingest/00e40e9f-34c6-4349-ac97-bfda2cfa152b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'805b23'},body:JSON.stringify({sessionId:'805b23',hypothesisId:'H3',location:'session.get.ts:account-me-ok',message:'session ok via account/me',data:{userId:user.id,hasRole:Boolean(user.role),roleType:user.role?.type??null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    return { authenticated: true, token, user }
  } catch (accountErr) {
    // Fallback to Strapi users/me
    try {
      const user = await $fetch<AuthUser>(`${config.public.apiUrl}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
        query: { populate: 'role' },
      })
      // #region agent log
      fetch('http://127.0.0.1:7550/ingest/00e40e9f-34c6-4349-ac97-bfda2cfa152b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'805b23'},body:JSON.stringify({sessionId:'805b23',hypothesisId:'H3',location:'session.get.ts:users-me-ok',message:'session ok via users/me fallback',data:{userId:user.id,hasRole:Boolean(user.role),roleType:user.role?.type??null},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      return { authenticated: true, token, user }
    } catch (usersErr) {
      deleteCookie(event, 'rcp_jwt', { path: '/' })
      // #region agent log
      fetch('http://127.0.0.1:7550/ingest/00e40e9f-34c6-4349-ac97-bfda2cfa152b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'805b23'},body:JSON.stringify({sessionId:'805b23',hypothesisId:'H2',location:'session.get.ts:strapi-fail',message:'strapi validation failed cookie cleared',data:{accountErr:String(accountErr),usersErr:String(usersErr)},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      return { authenticated: false, token: null, user: null }
    }
  }
})
