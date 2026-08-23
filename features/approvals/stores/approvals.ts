import { defineStore } from 'pinia'
import { useApprovalsApi } from '../api'
import type { Approval, ApprovalAction, ApprovalInput } from '../types'

export const useApprovalsStore = defineStore('approvals', () => {
  const approvals = ref<Approval[]>([])
  const loading = ref(false)

  function api() {
    return useApprovalsApi()
  }

  async function loadApprovals() {
    loading.value = true
    try {
      const res = await api().list()
      approvals.value = res.data || []
    } finally {
      loading.value = false
    }
  }

  async function saveApproval(input: ApprovalInput, documentId?: string) {
    if (documentId) await api().update(documentId, input)
    else await api().create(input)
    await loadApprovals()
  }

  async function removeApproval(documentId: string) {
    await api().delete(documentId)
    await loadApprovals()
  }

  async function runAction(documentId: string, action: ApprovalAction, comments?: string) {
    const res = await api().action(documentId, action, comments)
    await loadApprovals()
    return res
  }

  return {
    approvals,
    loading,
    loadApprovals,
    saveApproval,
    removeApproval,
    runAction,
  }
})
