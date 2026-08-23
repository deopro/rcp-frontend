import { defineStore } from 'pinia'
import { useDashboardApi } from '../api'
import type { DashboardFilters, DashboardResult } from '../types'

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

export const useDashboardStore = defineStore('dashboard', () => {
  const data = ref<DashboardResult | null>(null)
  const loading = ref(false)
  const weekStart = ref(mondayOfWeek(new Date()))
  const filters = ref<DashboardFilters>({})

  const from = computed(() => toIso(weekStart.value))
  const to = computed(() => toIso(addDays(weekStart.value, 4)))

  function api() {
    return useDashboardApi()
  }

  async function load() {
    loading.value = true
    try {
      const res = await api().load({
        from: from.value,
        to: to.value,
        filters: filters.value,
      })
      data.value = res.data
    } finally {
      loading.value = false
    }
  }

  function shiftWeek(delta: number) {
    weekStart.value = addDays(weekStart.value, delta * 7)
  }

  function goToToday() {
    weekStart.value = mondayOfWeek(new Date())
  }

  function setFilter(key: keyof DashboardFilters, value: number | undefined) {
    filters.value = { ...filters.value, [key]: value }
  }

  function clearFilters() {
    filters.value = {}
  }

  return {
    data,
    loading,
    weekStart,
    from,
    to,
    filters,
    load,
    shiftWeek,
    goToToday,
    setFilter,
    clearFilters,
  }
})
