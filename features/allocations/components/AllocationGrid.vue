<script setup lang="ts">
import { Plus } from 'lucide-vue-next'
import type { EmployeeCapacityRow, GridAllocation } from '../types'
import { cellKey } from '../types'
import {
  formatAllocationHours,
  MAX_VISIBLE_PROJECT_CHIPS,
  projectChipClass,
  projectChipLabel,
} from '~/shared/projects/project-color'
import { formatNameInitials } from '~/shared/users/format-name-initials'

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
  const weekday = d.toLocaleDateString(locale.value, { weekday: 'short' }).replace(/\.$/, '')
  const label = weekday ? weekday.charAt(0).toUpperCase() + weekday.slice(1) : weekday
  return `${label} ${d.getDate()}`
}

function cellRows(employeeId: number, date: string): GridAllocation[] {
  return props.allocationsByCell.get(cellKey(employeeId, date)) || []
}

function cellTotal(employeeId: number, date: string): number {
  return cellRows(employeeId, date).reduce((s, r) => s + r.hours, 0)
}

function visibleRows(employeeId: number, date: string): GridAllocation[] {
  return cellRows(employeeId, date).slice(0, MAX_VISIBLE_PROJECT_CHIPS)
}

function overflowCount(employeeId: number, date: string): number {
  return Math.max(0, cellRows(employeeId, date).length - MAX_VISIBLE_PROJECT_CHIPS)
}

function dayMeta(employee: EmployeeCapacityRow, date: string) {
  return employee.days.find((d) => d.date === date)
}

function capacityPercent(employee: EmployeeCapacityRow, date: string): number {
  const capacity = Number(dayMeta(employee, date)?.daily_capacity || 0)
  if (capacity <= 0) return 0
  return Math.min(100, (cellTotal(employee.employee_id, date) / capacity) * 100)
}

function cellClass(employee: EmployeeCapacityRow, date: string) {
  const day = employee.days.find((d) => d.date === date)
  if (!day?.is_working_day) {
    if (day?.is_holiday) return 'rcp-cell-holiday'
    if (day?.is_leave) return 'rcp-cell-leave'
    return 'rcp-cell-off'
  }
  const total = cellTotal(employee.employee_id, date)
  if (total > day.daily_capacity) return 'rcp-cell-over'
  if (total >= day.daily_capacity) return 'rcp-cell-full'
  if (total > 0) return 'rcp-cell-partial'
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
      <thead class="sticky top-0 z-10 border-y border-border bg-subtle">
        <tr>
          <th class="sticky left-0 z-20 min-w-[13rem] bg-subtle px-3 py-2.5 text-left text-xs font-semibold">
            {{ t('allocations.fields.employee') }}
          </th>
          <th
            v-for="date in dates"
            :key="date"
            class="rcp-grid-day min-w-[8rem] px-2 py-2.5 text-center text-xs font-semibold"
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
          <td class="sticky left-0 z-10 bg-surface px-3 py-2.5 align-top">
            <div class="flex items-start gap-2.5">
              <span
                class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground"
                aria-hidden="true"
              >
                {{ formatNameInitials(employee.full_name) }}
              </span>
              <div class="min-w-0">
                <p class="truncate font-medium leading-snug">{{ employee.full_name }}</p>
                <p class="text-xs font-normal text-subtle-foreground">
                  {{ employee.team_name || t('org.none') }}
                </p>
              </div>
            </div>
          </td>
          <td
            v-for="(date, colIdx) in dates"
            :key="cellKey(employee.employee_id, date)"
            tabindex="0"
            role="gridcell"
            class="group rcp-grid-day touch-target cursor-pointer px-1.5 py-1.5 align-top transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            :class="[
              cellClass(employee, date),
              isSelected(employee.employee_id, date) ? 'ring-2 ring-accent ring-inset' : '',
              dragProjectId && canEdit ? 'hover:bg-accent/10' : '',
            ]"
            :aria-label="
              canEdit && dayMeta(employee, date)?.is_working_day && !cellTotal(employee.employee_id, date)
                ? t('allocations.addHours')
                : undefined
            "
            @click="emit('selectCell', employee.employee_id, date)"
            @keydown="onKeydown($event, employee.employee_id, date, rowIdx, colIdx)"
            @dragover="onDragOver"
            @drop="onDrop($event, employee.employee_id, date)"
          >
            <template v-if="dayMeta(employee, date)?.is_working_day">
              <div v-if="cellTotal(employee.employee_id, date)" class="flex flex-col gap-1">
                <div
                  v-for="row in visibleRows(employee.employee_id, date)"
                  :key="row.documentId"
                  :class="projectChipClass(row.project_id)"
                  :title="`${projectChipLabel(row.project_code, row.project_name)} - ${formatAllocationHours(row.hours)}h`"
                >
                  <span class="min-w-0 truncate text-[11px] font-medium">
                    {{ projectChipLabel(row.project_code, row.project_name) }}
                  </span>
                  <span class="rcp-project-chip-hours shrink-0 whitespace-nowrap">
                    - {{ formatAllocationHours(row.hours) }}h
                  </span>
                </div>
                <span
                  v-if="overflowCount(employee.employee_id, date)"
                  class="rcp-cell-footer"
                >
                  {{ t('allocations.moreProjects', { count: overflowCount(employee.employee_id, date) }) }}
                </span>
                <div class="rcp-cell-footer">
                  {{ formatAllocationHours(cellTotal(employee.employee_id, date)) }}
                  / {{ dayMeta(employee, date)?.daily_capacity }}h
                </div>
                <div class="rcp-cell-meter" aria-hidden="true">
                  <div
                    class="rcp-cell-meter-fill"
                    :style="{ width: `${capacityPercent(employee, date)}%` }"
                  />
                </div>
              </div>
              <div
                v-else
                class="rcp-cell-empty"
                :class="canEdit ? 'rcp-cell-empty-editable' : ''"
              >
                <Plus
                  v-if="canEdit"
                  class="h-3.5 w-3.5 text-subtle-foreground opacity-40 transition-opacity group-hover:opacity-90 group-focus-visible:opacity-90"
                  aria-hidden="true"
                />
              </div>
            </template>
            <span
              v-else-if="dayMeta(employee, date)?.is_holiday"
              class="block py-2 text-center text-[11px] font-medium"
            >
              {{ t('leave.grid.holiday') }}
            </span>
            <span
              v-else-if="dayMeta(employee, date)?.is_leave"
              class="block py-2 text-center text-[11px] font-medium"
            >
              {{ t('leave.grid.leave') }}
            </span>
            <span v-else class="block py-2 text-center text-xs text-subtle-foreground">—</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
