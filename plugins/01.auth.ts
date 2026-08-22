import { ensureAuthSession } from '~/composables/useAuthSession'

export default defineNuxtPlugin(async () => {
  await ensureAuthSession()
})
