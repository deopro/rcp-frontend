<script setup lang="ts">
import type { EmployeeCapacityRow, GridAllocation } from '../types'
import { cellKey } from '../types'

const props = defineProps<{
  employees: EmployeeCapacityRow[]
  dates: string[]
  allocationsByCell: Map<string, GridAllocation[]>
  selectedCell: { employeeId: number; date: string } | null
  canEdit: boolean
  dragProjectId: number | null
}>()

const emit = defineEmits<{
  selectCell: [employeeId: number, date: string]
  dropProject: [employeeId: number, date: string, projectId: number]
}>()

const { t, locale } = useI18n()

function formatDayHeader(iso: string) {
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString(locale.value, { weekday: 'short', day: 'numeric' })
}

function cellTotal(employeeId: number, date: string): number {
  const rows = props.allocationsByCell.get(cellKey(employeeId, date)) || []
  return rows.reduce((s, r) => s + r.hours, 0)
}

function cellClass(employee: EmployeeCapacityRow, date: string) {
  const day = employee.days.find((d) => d.date === date)
  if (!day?.is_working_day) return 'bg-slate-100 text-muted dark:bg-slate-900'
  const total = cellTotal(employee.employee_id, date)
  if (total > day.daily_capacity) return 'bg-red-100 dark:bg-red-900/30'
  if (total >= day.daily_capacity) return 'bg-amber-100 dark:bg-amber-900/30'
  if (total > 0) return 'bg-emerald-50 dark:bg-emerald-900/20'
  return ''
}

function isSelected(employeeId: number, date: string) {
  return (
    props.selectedCell?.employeeId === employeeId && props.selectedCell?.date === date
  )
}

function onKeydown(e: KeyboardEvent, employeeId: number, date: string, rowIdx: number, colIdx: number) {
  const empCount = props.employees.length
  const dateCount = props.dates.length
  let next: { r: number; c: number } | null = null

  if (e.key === 'ArrowRight') next = { r: rowIdx, c: Math.min(colIdx + 1, dateCount - 1) }
  if (e.key === 'ArrowLeft') next = { r: rowIdx, c: Math.max(colIdx - 1, 0) }
  if (e.key === 'ArrowDown') next = { r: Math.min(rowIdx + 1, empCount - 1), c: colIdx }
  if (e.key === 'ArrowUp') next = { r: Math.max(rowIdx - 1, 0), c: colIdx }

  if (next) {
    e.preventDefault()
    const emp = props.employees[next.r]
    const dt = props.dates[next.c]
    if (emp && dt) emit('selectCell', emp.employee_id, dt)
  }
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    emit('selectCell', employeeId, date)
  }
}

function onDrop(e: DragEvent, employeeId: number, date: string) {
  e.preventDefault()
  const projectId = Number(e.dataTransfer?.getData('application/rcp-project-id'))
  if (projectId) emit('dropProject', employeeId, date, projectId)
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
}
</script>

<template>
  <div class="hidden overflow-auto rounded-lg border border-border md:block">
    <table class="min-w-full border-collapse text-sm">
      <thead class="sticky top-0 z-10 bg-surface">
        <tr class="border-b border-border">
          <th class="sticky left-0 z-20 min-w-[10rem] bg-surface px-3 py-2 text-left font-medium">
            {{ t('allocations.fields.employee') }}
          </th>
          <th
            v-for="date in dates"
            :key="date"
            class="min-w-[5rem] px-2 py-2 text-center text-xs font-medium text-muted"
          >
            {{ formatDayHeader(date) }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(employee, rowIdx) in employees"
          :key="employee.employee_id"
          class="border-b border-border"
        >
          <td class="sticky left-0 z-10 bg-surface px-3 py-2 font-medium">
            <p>{{ employee.full_name }}</p>
            <p class="text-xs font-normal text-muted">{{ employee.team_name || t('org.none') }}</p>
          </td>
          <td
            v-for="(date, colIdx) in dates"
            :key="cellKey(employee.employee_id, date)"
            tabindex="0"
            role="gridcell"
            class="touch-target cursor-pointer border-l border-border px-1 py-1 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            :class="[
              cellClass(employee, date),
              isSelected(employee.employee_id, date) ? 'ring-2 ring-accent ring-inset' : '',
              dragProjectId && canEdit ? 'hover:bg-accent/10' : '',
            ]"
            @click="emit('selectCell', employee.employee_id, date)"
            @keydown="onKeydown($event, employee.employee_id, date, rowIdx, colIdx)"
            @dragover="onDragOver"
            @drop="onDrop($event, employee.employee_id, date)"
          >
            <template v-if="employee.days.find((d) => d.date === date)?.is_working_day">
              <span class="font-semibold">{{ cellTotal(employee.employee_id, date) || '—' }}</span>
              <span class="block text-[10px] text-muted">
                / {{ employee.days.find((d) => d.date === date)?.daily_capacity }}h
              </span>
            </template>
            <span v-else class="text-xs text-muted">—</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
