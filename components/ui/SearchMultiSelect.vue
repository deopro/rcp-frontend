<script setup lang="ts">
import { onKeyStroke } from '@vueuse/core'
import { cn } from '~/utils/cn'

export type SearchMultiSelectOption = {
  id: number
  label: string
  hint?: string
}

const props = defineProps<{
  modelValue: number[]
  options: SearchMultiSelectOption[]
  disabled?: boolean
  id?: string
  title?: string
  placeholder?: string
  searchPlaceholder?: string
  class?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: number[]] }>()

const { t } = useI18n()

const open = ref(false)
const query = ref('')
const panelRef = ref<HTMLElement | null>(null)

const filteredOptions = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return props.options
  return props.options.filter((opt) => {
    const label = opt.label.toLowerCase()
    const hint = opt.hint?.toLowerCase() ?? ''
    return label.includes(q) || hint.includes(q)
  })
})

const selectedOptions = computed(() =>
  props.options.filter((opt) => props.modelValue.includes(opt.id)),
)

const triggerLabel = computed(() => {
  if (!selectedOptions.value.length) {
    return props.placeholder ?? t('org.select')
  }
  return t('forms.selectedCount', { count: selectedOptions.value.length })
})

function toggle(id: number) {
  if (props.disabled) return
  const set = new Set(props.modelValue)
  if (set.has(id)) set.delete(id)
  else set.add(id)
  emit('update:modelValue', [...set])
}

function remove(id: number, event: Event) {
  event.stopPropagation()
  if (props.disabled) return
  emit(
    'update:modelValue',
    props.modelValue.filter((value) => value !== id),
  )
}

function openPanel() {
  if (props.disabled) return
  open.value = true
  nextTick(() => {
    panelRef.value?.querySelector('input')?.focus()
  })
}

function closePanel() {
  open.value = false
  query.value = ''
}

onKeyStroke('Escape', (event) => {
  if (!open.value) return
  event.preventDefault()
  closePanel()
})
</script>

<template>
  <div :class="cn('relative', props.class)">
    <button
      :id="id"
      type="button"
      class="flex min-h-11 w-full items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50"
      :disabled="disabled"
      :aria-expanded="open"
      @click="openPanel"
    >
      <span :class="selectedOptions.length ? 'text-foreground' : 'text-muted'">
        {{ triggerLabel }}
      </span>
      <svg
        class="ml-auto h-4 w-4 shrink-0 text-muted"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fill-rule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.06z"
          clip-rule="evenodd"
        />
      </svg>
    </button>

    <div v-if="selectedOptions.length" class="mt-2 flex flex-wrap gap-1.5">
      <span
        v-for="opt in selectedOptions"
        :key="opt.id"
        class="inline-flex max-w-full items-center gap-1 rounded-md border border-border bg-slate-50 px-2 py-0.5 text-xs dark:bg-slate-900/50"
      >
        <span class="truncate">{{ opt.label }}</span>
        <button
          v-if="!disabled"
          type="button"
          class="rounded p-0.5 text-muted hover:bg-slate-200 hover:text-foreground dark:hover:bg-slate-800"
          :aria-label="t('forms.removeSelected', { label: opt.label })"
          @click="remove(opt.id, $event)"
        >
          ×
        </button>
      </span>
    </div>

    <Teleport to="body">
      <div
        v-if="open"
        class="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 md:items-center"
        role="presentation"
        @click.self="closePanel"
      >
        <div
          ref="panelRef"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="title ? `${id}-picker-title` : undefined"
          class="flex max-h-[85dvh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-soft"
          @click.stop
        >
          <div class="border-b border-border px-5 py-4">
            <h3
              v-if="title"
              :id="`${id}-picker-title`"
              class="text-lg font-semibold"
            >
              {{ title }}
            </h3>
            <div :class="title ? 'mt-3' : ''">
              <UiInput
                v-model="query"
                type="search"
                :placeholder="searchPlaceholder ?? t('forms.searchMultiSelect')"
                @keydown.esc="closePanel"
              />
            </div>
          </div>

          <ul
            class="min-h-0 flex-1 overflow-y-auto p-2"
            role="listbox"
            :aria-multiselectable="true"
          >
            <li v-if="!filteredOptions.length" class="px-3 py-4 text-center text-sm text-muted">
              {{ t('forms.noMatches') }}
            </li>
            <li v-for="opt in filteredOptions" :key="opt.id">
              <button
                type="button"
                role="option"
                :aria-selected="modelValue.includes(opt.id)"
                class="flex w-full cursor-pointer items-start gap-2 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50"
                @click="toggle(opt.id)"
              >
                <input
                  type="checkbox"
                  class="mt-0.5 h-4 w-4 rounded border-border"
                  :checked="modelValue.includes(opt.id)"
                  tabindex="-1"
                  readonly
                >
                <span class="min-w-0">
                  <span class="block font-medium">{{ opt.label }}</span>
                  <span v-if="opt.hint" class="block text-xs text-muted">{{ opt.hint }}</span>
                </span>
              </button>
            </li>
          </ul>

          <div class="flex justify-end gap-2 border-t border-border px-5 py-3">
            <UiButton type="button" variant="outline" @click="closePanel">
              {{ t('actions.cancel') }}
            </UiButton>
            <UiButton type="button" @click="closePanel">
              {{ t('forms.multiSelectDone') }}
            </UiButton>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
