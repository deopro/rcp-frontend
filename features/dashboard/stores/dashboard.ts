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
      // #region agent log
      fetch('http://127.0.0.1:7550/ingest/00e40e9f-34c6-4349-ac97-bfda2cfa152b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'63ba08'},body:JSON.stringify({sessionId:'63ba08',hypothesisId:'E',location:'dashboard/stores/dashboard.ts:load',message:'dashboard payload received',data:{from:from.value,to:to.value,role:res.data?.role,allocatedHours:res.data?.kpis?.allocated_hours,activeProjects:res.data?.kpis?.active_projects,projectChartLen:res.data?.charts?.allocation_by_project?.length??0,dayChartLen:res.data?.charts?.utilization_by_day?.length??0,employees:res.data?.kpis?.employees},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
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
