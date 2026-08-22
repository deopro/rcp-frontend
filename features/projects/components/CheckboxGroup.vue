<script setup lang="ts">
const props = defineProps<{
  modelValue: number[]
  options: { id: number; label: string; hint?: string }[]
  disabled?: boolean
}>()

const emit = defineEmits<{ 'update:modelValue': [value: number[]] }>()

function toggle(id: number) {
  if (props.disabled) return
  const set = new Set(props.modelValue)
  if (set.has(id)) set.delete(id)
  else set.add(id)
  emit('update:modelValue', [...set])
}
</script>

<template>
  <div class="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-border p-3">
    <label
      v-for="opt in options"
      :key="opt.id"
      class="flex cursor-pointer items-start gap-2 text-sm"
      :class="disabled ? 'cursor-not-allowed opacity-50' : ''"
    >
      <input
        type="checkbox"
        class="mt-1 h-4 w-4 rounded border-border"
        :checked="modelValue.includes(opt.id)"
        :disabled="disabled"
        @change="toggle(opt.id)"
      >
      <span>
        <span class="font-medium">{{ opt.label }}</span>
        <span v-if="opt.hint" class="block text-xs text-muted">{{ opt.hint }}</span>
      </span>
    </label>
    <p v-if="!options.length" class="text-sm text-muted">{{ $t('empty.generic') }}</p>
  </div>
</template>
