import { defineStore } from 'pinia'
import { useAiApi } from '../api'
import type { RecommendationResult } from '../types'

function mondayOfWeek(d: Date): Date {
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const mon = new Date(d)
  mon.setDate(mon.getDate() + diff)
  mon.setHours(0, 0, 0, 0)
  return mon
}

function addDays(d: Date, n: number): Date {
  const out = new Date(d)
  out.setDate(out.getDate() + n)
  return out
}

function toIso(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const useAiStore = defineStore('ai', () => {
  const result = ref<RecommendationResult | null>(null)
  const loading = ref(false)
  const applying = ref(false)

  const fromDate = ref(mondayOfWeek(new Date()))
  const toDate = ref(addDays(mondayOfWeek(new Date()), 27))
  const projectId = ref<number | undefined>(undefined)
  const teamId = ref<number | undefined>(undefined)

  const from = computed(() => toIso(fromDate.value))
  const to = computed(() => toIso(toDate.value))

  function api() {
    return useAiApi()
  }

  async function recommend() {
    if (!projectId.value) return
    loading.value = true
    try {
      const res = await api().recommend({
        project_id: projectId.value,
        from: from.value,
        to: to.value,
        team_id: teamId.value,
      })
      result.value = res.data
    } finally {
      loading.value = false
    }
  }

  async function applyMatch(opts: {
    employeeId: number
    allocationDate: string
    hours: number
    notes?: string
  }) {
    if (!result.value) return
    applying.value = true
    try {
      await api().apply({
        recommendation_id: result.value.recommendation_id,
        employee_id: opts.employeeId,
        allocation_date: opts.allocationDate,
        hours: opts.hours,
        notes: opts.notes,
      })
      result.value = null
    } finally {
      applying.value = false
    }
  }

  return {
    result,
    loading,
    applying,
    fromDate,
    toDate,
    from,
    to,
    projectId,
    teamId,
    recommend,
    applyMatch,
  }
})
