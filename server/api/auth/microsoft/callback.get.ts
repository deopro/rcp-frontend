import * as client from 'openid-client'
import type { AuthUser } from '../../../../features/auth/types'
import { ApiErrorCode } from '../../../../shared/api/error-codes'
import {
  JWT_COOKIE,
  authCookieOptions,
  loadAccount,
  oidcEnabled,
  safeInternalPath,
} from '../../../utils/auth-session'

const STATE_COOKIE = 'rcp_oidc_state'
const VERIFIER_COOKIE = 'rcp_oidc_verifier'
const NONCE_COOKIE = 'rcp_oidc_nonce'
const REDIRECT_COOKIE = 'rcp_oidc_redirect'

type StrapiOidcError = {
  error?: { name?: string; message?: string }
}

function loginErrorRedirect(code: ApiErrorCode) {
  return `/login?error=${code}`
}

function mapOidcName(name?: string): ApiErrorCode {
  if (name === 'OidcUserNotFound') return ApiErrorCode.AUTH_OIDC_USER_NOT_FOUND
  if (name === 'OidcUserInactive') return ApiErrorCode.AUTH_USER_INACTIVE
  if (name === 'OidcNotConfigured') return ApiErrorCode.AUTH_OIDC_NOT_CONFIGURED
  return ApiErrorCode.AUTH_OIDC_INVALID
}

function clearOidcCookies(event: Parameters<typeof deleteCookie>[0]) {
  const opts = { path: '/' }
  deleteCookie(event, STATE_COOKIE, opts)
  deleteCookie(event, VERIFIER_COOKIE, opts)
  deleteCookie(event, NONCE_COOKIE, opts)
  deleteCookie(event, REDIRECT_COOKIE, opts)
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const redirectTo = safeInternalPath(getCookie(event, REDIRECT_COOKIE))

  if (!oidcEnabled()) {
    clearOidcCookies(event)
    return sendRedirect(event, loginErrorRedirect(ApiErrorCode.AUTH_OIDC_NOT_CONFIGURED))
  }

  const state = getCookie(event, STATE_COOKIE)
  const verifier = getCookie(event, VERIFIER_COOKIE)
  const nonce = getCookie(event, NONCE_COOKIE)
  const query = getQuery(event)

  if (query.error || !state || !verifier || !nonce) {
    clearOidcCookies(event)
    return sendRedirect(event, loginErrorRedirect(ApiErrorCode.AUTH_OIDC_INVALID))
  }

  try {
    const discovery = await client.discovery(
      new URL(String(config.oidcIssuer)),
      String(config.public.oidcClientId),
      String(config.oidcClientSecret),
    )

    const callbackUrl = new URL(String(config.oidcCallbackUrl))
    for (const [key, value] of Object.entries(query)) {
      if (typeof value === 'string') callbackUrl.searchParams.set(key, value)
    }

    const tokens = await client.authorizationCodeGrant(discovery, callbackUrl, {
      pkceCodeVerifier: verifier,
      expectedState: state,
      expectedNonce: nonce,
      idTokenExpected: true,
    })

    const idToken = tokens.id_token
    if (!idToken) {
      clearOidcCookies(event)
      return sendRedirect(event, loginErrorRedirect(ApiErrorCode.AUTH_OIDC_INVALID))
    }

    const result = await $fetch<{ jwt: string; user: AuthUser }>(
      `${config.public.apiUrl}/api/auth/oidc/exchange`,
      {
        method: 'POST',
        body: { id_token: idToken },
      },
    )

    if (result.user?.status === 'inactive') {
      clearOidcCookies(event)
      return sendRedirect(event, loginErrorRedirect(ApiErrorCode.AUTH_USER_INACTIVE))
    }

    const user = await loadAccount(config.public.apiUrl, result.jwt, result.user)
    if (user.status === 'inactive') {
      clearOidcCookies(event)
      return sendRedirect(event, loginErrorRedirect(ApiErrorCode.AUTH_USER_INACTIVE))
    }

    setCookie(event, JWT_COOKIE, result.jwt, authCookieOptions(60 * 60 * 24 * 7))
    clearOidcCookies(event)
    return sendRedirect(event, redirectTo)
  } catch (error: unknown) {
    clearOidcCookies(event)
    const err = error as { data?: StrapiOidcError; response?: { _data?: StrapiOidcError } }
    const code = mapOidcName(err.data?.error?.name || err.response?._data?.error?.name)
    return sendRedirect(event, loginErrorRedirect(code))
  }
})
