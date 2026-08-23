export const PAGE_SIZE_OPTIONS = [5, 10, 25, 50] as const
export const MIN_PAGE_SIZE = 5

export function useClientPagination<T>(
  items: MaybeRefOrGetter<readonly T[]>,
  options?: { initialPageSize?: number },
) {
  const page = ref(1)
  const pageSize = ref(Math.max(MIN_PAGE_SIZE, options?.initialPageSize ?? MIN_PAGE_SIZE))

  const total = computed(() => toValue(items).length)
  const pageCount = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value) || 1))

  watch([total, pageSize], () => {
    if (page.value > pageCount.value) page.value = pageCount.value
    if (page.value < 1) page.value = 1
  })

  const pageItems = computed(() => {
    const list = toValue(items)
    const start = (page.value - 1) * pageSize.value
    return list.slice(start, start + pageSize.value) as T[]
  })

  const from = computed(() => (total.value === 0 ? 0 : (page.value - 1) * pageSize.value + 1))
  const to = computed(() => Math.min(page.value * pageSize.value, total.value))

  function setPageSize(size: number) {
    pageSize.value = Math.max(MIN_PAGE_SIZE, size)
    page.value = 1
  }

  return {
    page,
    pageSize,
    pageCount,
    total,
    pageItems,
    from,
    to,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    setPageSize,
  }
}
