import { defineStore } from 'pinia'
import { useLeaveApi } from '../api'
import type { Holiday, HolidayInput, Leave, LeaveInput } from '../types'

export const useLeaveStore = defineStore('leave', () => {
  const holidays = ref<Holiday[]>([])
  const leaves = ref<Leave[]>([])
  const loading = ref(false)

  function api() {
    return useLeaveApi()
  }

  async function loadHolidays() {
    loading.value = true
    try {
      const res = await api().listHolidays()
      holidays.value = res.data || []
    } finally {
      loading.value = false
    }
  }

  async function loadLeaves() {
    loading.value = true
    try {
      const res = await api().listLeaves()
      leaves.value = res.data || []
    } finally {
      loading.value = false
    }
  }

  async function saveHoliday(input: HolidayInput, documentId?: string) {
    if (documentId) await api().updateHoliday(documentId, input)
    else await api().createHoliday(input)
    await loadHolidays()
  }

  async function removeHoliday(documentId: string) {
    await api().deleteHoliday(documentId)
    await loadHolidays()
  }

  async function saveLeave(input: LeaveInput, documentId?: string) {
    if (documentId) await api().updateLeave(documentId, input)
    else await api().createLeave(input)
    await loadLeaves()
  }

  async function removeLeave(documentId: string) {
    await api().deleteLeave(documentId)
    await loadLeaves()
  }

  async function setLeaveStatus(documentId: string, status: 'approved' | 'rejected') {
    await api().updateLeave(documentId, { status })
    await loadLeaves()
  }

  return {
    holidays,
    leaves,
    loading,
    loadHolidays,
    loadLeaves,
    saveHoliday,
    removeHoliday,
    saveLeave,
    removeLeave,
    setLeaveStatus,
  }
})
