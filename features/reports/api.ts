import type { ReportDownloadInput } from './types'

function toProxyPath(strapiPath: string): string {
  return strapiPath.replace(/^\/api\//, '/api/strapi/')
}

export function useReportsApi() {
  const { locale } = useI18n()

  async function download(input: ReportDownloadInput): Promise<void> {
    const params = new URLSearchParams({
      format: input.format,
      from: input.from,
      to: input.to,
      locale: locale.value,
    })

    const filters = input.filters || {}
    if (filters.departmentId) params.set('department', String(filters.departmentId))
    if (filters.teamId) params.set('team', String(filters.teamId))
    if (filters.projectId) params.set('project', String(filters.projectId))
    if (filters.employeeId) params.set('employee', String(filters.employeeId))
    if (filters.scope) params.set('scope', filters.scope)
    if (filters.granularity) params.set('granularity', filters.granularity)

    const path = toProxyPath(`/api/reports/${input.type}?${params.toString()}`)
    const response = await fetch(path, { credentials: 'include' })
    if (!response.ok) {
      let message = `Export failed (${response.status})`
      try {
        const data = (await response.json()) as { statusMessage?: string; error?: { message?: string } }
        message = data.statusMessage || data.error?.message || message
      } catch {
        // binary or empty error body
      }
      throw new Error(message)
    }

    const blob = await response.blob()
    const disposition = response.headers.get('content-disposition') || ''
    const match = disposition.match(/filename="([^"]+)"/)
    const filename = match?.[1] || `report.${input.format}`

    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return { download }
}
