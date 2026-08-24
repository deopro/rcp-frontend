import * as client from 'openid-client'
import { ApiErrorCode } from '../../../shared/api/error-codes'
import {
  oidcCookieOptions,
  oidcEnabled,
  safeInternalPath,
} from '../../utils/auth-session'

const STATE_COOKIE = 'rcp_oidc_state'
const VERIFIER_COOKIE = 'rcp_oidc_verifier'
const NONCE_COOKIE = 'rcp_oidc_nonce'
const REDIRECT_COOKIE = 'rcp_oidc_redirect'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  if (!oidcEnabled()) {
    return sendRedirect(event, `/login?error=${ApiErrorCode.AUTH_OIDC_NOT_CONFIGURED}`)
  }

  const discovery = await client.discovery(
    new URL(String(config.oidcIssuer)),
    String(config.public.oidcClientId),
    String(config.oidcClientSecret),
  )

  const verifier = client.randomPKCECodeVerifier()
  const challenge = await client.calculatePKCECodeChallenge(verifier)
  const state = client.randomState()
  const nonce = client.randomNonce()
  const cookies = oidcCookieOptions()

  setCookie(event, STATE_COOKIE, state, cookies)
  setCookie(event, VERIFIER_COOKIE, verifier, cookies)
  setCookie(event, NONCE_COOKIE, nonce, cookies)
  setCookie(event, REDIRECT_COOKIE, safeInternalPath(getQuery(event).redirect), cookies)

  const authorizationUrl = client.buildAuthorizationUrl(discovery, {
    redirect_uri: String(config.oidcCallbackUrl),
    scope: 'openid profile email',
    code_challenge: challenge,
    code_challenge_method: 'S256',
    state,
    nonce,
  })

  return sendRedirect(event, authorizationUrl.href)
})
