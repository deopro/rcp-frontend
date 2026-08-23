import { defineStore } from 'pinia'
import { useForecastApi } from '../api'
import type {
  ForecastFilters,
  ForecastGranularity,
  ForecastResult,
  ForecastScope,
} from '../types'

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

export const useForecastStore = defineStore('forecast', () => {
  const data = ref<ForecastResult | null>(null)
  const loading = ref(false)
  const scope = ref<ForecastScope>('org')
  const granularity = ref<ForecastGranularity>('week')
  const filters = ref<ForecastFilters>({})

  const fromDate = ref(mondayOfWeek(new Date()))
  const toDate = ref(addDays(mondayOfWeek(new Date()), 55))

  const from = computed(() => toIso(fromDate.value))
  const to = computed(() => toIso(toDate.value))

  function api() {
    return useForecastApi()
  }

  async function load() {
    loading.value = true
    try {
      const res = await api().load({
        from: from.value,
        to: to.value,
        scope: scope.value,
        granularity: granularity.value,
        filters: filters.value,
      })
      data.value = res.data
    } finally {
      loading.value = false
    }
  }

  function setFilter(key: keyof ForecastFilters, value: number | undefined) {
    filters.value = { ...filters.value, [key]: value }
  }

  function clearFilters() {
    filters.value = {}
  }

  function shiftWindow(weeks: number) {
    fromDate.value = addDays(fromDate.value, weeks * 7)
    toDate.value = addDays(toDate.value, weeks * 7)
  }

  function resetWindow() {
    fromDate.value = mondayOfWeek(new Date())
    toDate.value = addDays(mondayOfWeek(new Date()), 55)
  }

  function initForTeamLeader(teamIds: number[]) {
    scope.value = 'team'
    if (teamIds.length && !filters.value.teamId) {
      filters.value = { ...filters.value, teamId: teamIds[0] }
    }
  }

  return {
    data,
    loading,
    scope,
    granularity,
    filters,
    from,
    to,
    fromDate,
    toDate,
    load,
    setFilter,
    clearFilters,
    shiftWindow,
    resetWindow,
    initForTeamLeader,
  }
})
