import { defineStore } from 'pinia'
import { useBenchApi } from '../api'
import type { BenchResult, ForecastResult } from '../types'
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

export const useBenchStore = defineStore('bench', () => {
  const data = ref<BenchResult | null>(null)
  const forecast = ref<ForecastResult | null>(null)
  const loading = ref(false)
  const weekStart = ref(mondayOfWeek(new Date()))
  const teamId = ref<number | undefined>(undefined)
  const skillIds = ref<number[]>([])

  const from = computed(() => toIso(weekStart.value))
  const to = computed(() => toIso(addDays(weekStart.value, 4)))

  function api() {
    return useBenchApi()
  }

  async function load() {
    loading.value = true
    try {
      const [benchRes, forecastRes] = await Promise.all([
        api().loadBench({
          from: from.value,
          to: to.value,
          teamId: teamId.value,
          skillIds: skillIds.value,
        }),
        api().loadForecast({
          from: from.value,
          to: to.value,
          teamId: teamId.value,
        }),
      ])
      data.value = benchRes.data
      forecast.value = forecastRes.data
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

  function toggleSkill(id: number) {
    if (skillIds.value.includes(id)) {
      skillIds.value = skillIds.value.filter((s) => s !== id)
    } else {
      skillIds.value = [...skillIds.value, id]
    }
  }

  function clearSkills() {
    skillIds.value = []
  }

  return {
    data,
    forecast,
    loading,
    weekStart,
    from,
    to,
    teamId,
    skillIds,
    load,
    shiftWeek,
    goToToday,
    toggleSkill,
    clearSkills,
  }
})
