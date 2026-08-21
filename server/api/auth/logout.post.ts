export default defineEventHandler((event) => {
  deleteCookie(event, 'rcp_jwt', { path: '/' })
  return { ok: true }
})
