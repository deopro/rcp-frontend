import { defineStore } from 'pinia'
import { useAllocationsApi } from '../api'
import type {
  AllocationInput,
  CopyMode,
  GridAllocation,
  GridData,
} from '../types'
import { cellKey } from '../types'

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

export const useAllocationsStore = defineStore('allocations', () => {
  const grid = ref<GridData | null>(null)
  const weekStart = ref(mondayOfWeek(new Date()))
  const teamId = ref<number | undefined>(undefined)
  const loading = ref(false)

  const weekDates = computed(() => {
    return Array.from({ length: 5 }, (_, i) => toIso(addDays(weekStart.value, i)))
  })

  const from = computed(() => weekDates.value[0])
  const to = computed(() => weekDates.value[4])

  const allocationsByCell = computed(() => {
    const map = new Map<string, GridAllocation[]>()
    for (const row of grid.value?.allocations || []) {
      if (!row.employee_id) continue
      const key = cellKey(row.employee_id, row.allocation_date)
      const list = map.get(key) || []
      list.push(row)
      map.set(key, list)
    }
    return map
  })

  function api() {
    return useAllocationsApi()
  }

  async function loadGrid() {
    loading.value = true
    try {
      const res = await api().loadGrid(from.value, to.value, teamId.value)
      grid.value = res.data
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

  async function saveAllocation(input: AllocationInput, documentId?: string) {
    if (documentId) await api().updateAllocation(documentId, input)
    else await api().createAllocation(input)
    await loadGrid()
  }

  async function removeAllocation(documentId: string) {
    await api().deleteAllocation(documentId)
    await loadGrid()
  }

  async function copyDay(targetDate: string, mode: CopyMode) {
    const res = await api().copyAllocations(targetDate, mode)
    await loadGrid()
    return res.data
  }

  return {
    grid,
    weekStart,
    weekDates,
    from,
    to,
    teamId,
    loading,
    allocationsByCell,
    loadGrid,
    shiftWeek,
    goToToday,
    saveAllocation,
    removeAllocation,
    copyDay,
  }
})
