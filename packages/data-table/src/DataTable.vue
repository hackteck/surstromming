<template>
  <div :class="$style.root">
    <Table
      :columns="tableColumns"
      :rows="pageRows"
      :row-key="props.rowKey"
      :caption="props.caption"
      :empty="props.empty"
      :selected-keys="selectedKeys"
    >
      <template #head-__select>
        <Checkbox
          :model-value="allSelected"
          :indeterminate="someSelected"
          aria-label="Select all on page"
          @update:model-value="toggleAll"
        />
      </template>
      <template #cell-__select="{ row }">
        <Checkbox
          :model-value="isSelected(row)"
          aria-label="Select row"
          @update:model-value="(checked?: boolean) => setSelected(row, checked)"
        />
      </template>

      <template v-for="column in sortableColumns" :key="column.key" #[`head-${column.key}`]>
        <button :class="$style.sortButton" type="button" @click="toggleSort(column.key)">
          {{ column.header }}
          <Icon :icon="sortIcon(column.key)" :size="14" />
        </button>
      </template>

      <template v-for="name in forwardedSlots" :key="name" #[name]="{ row, value }">
        <slot :name="name" :row="row" :value="value" />
      </template>
    </Table>

    <div v-if="footerVisible" :class="$style.footer">
      <span v-if="props.selectable" :class="$style.count">
        {{ selected.length }} of {{ sortedRows.length }} row(s) selected
      </span>
      <Pagination v-model="pageModel" :page-count="pageCount" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide'
import { Checkbox } from '@surstromming/checkbox'
import { Icon } from '@surstromming/icon'
import { Pagination } from '@surstromming/pagination'
import { Table, type TableColumn, type TableRow } from '@surstromming/table'
import type { DataTableColumn, DataTableSort } from './index'

const props = withDefaults(
  defineProps<{
    columns: DataTableColumn[]
    rows: TableRow[]
    /** Column key with unique values — selection and page keys need identity. */
    rowKey: string
    /** Rows per page; absent → no pagination. */
    pageSize?: number
    selectable?: boolean
    caption?: string
    empty?: string
  }>(),
  { selectable: false },
)

const sort = defineModel<DataTableSort | null>('sort', { default: null })
const page = defineModel<number>('page', { default: 1 })
const selected = defineModel<(string | number)[]>('selected', { default: () => [] })

// --- sorting ---

const toggleSort = (key: string) => {
  const direction = sort.value?.key === key && sort.value.direction === 'asc' ? 'desc' : 'asc'
  sort.value = { key, direction }
  page.value = 1 // the row you were looking at is no longer where it was
}

// Numbers numerically, anything else as text; nullish last in both directions.
const compare = (a: unknown, b: unknown, sign: number) => {
  if (a == null || b == null) return (a == null ? 1 : 0) - (b == null ? 1 : 0)
  if (typeof a === 'number' && typeof b === 'number') return sign * (a - b)
  return sign * String(a).localeCompare(String(b))
}

const sortedRows = computed(() => {
  const active = sort.value
  if (!active) return props.rows

  const sign = active.direction === 'asc' ? 1 : -1
  return [...props.rows].sort((a, b) => compare(a[active.key], b[active.key], sign))
})

const sortIcon = (key: string) => {
  if (sort.value?.key !== key) return ArrowUpDown
  return sort.value.direction === 'asc' ? ArrowUp : ArrowDown
}

// --- pagination ---

const pageCount = computed(() => {
  if (!props.pageSize) return 1
  return Math.max(1, Math.ceil(sortedRows.value.length / props.pageSize))
})

// Clamped for display only — a shrunk data set shows its last page without
// writing the model back.
const pageModel = computed({
  get: () => Math.min(page.value, pageCount.value),
  set: (value: number) => {
    page.value = value
  },
})

const pageRows = computed(() => {
  if (!props.pageSize) return sortedRows.value

  const start = (pageModel.value - 1) * props.pageSize
  return sortedRows.value.slice(start, start + props.pageSize)
})

const footerVisible = computed(() => props.pageSize !== undefined)

// --- selection ---

const keyOf = (row: TableRow) => row[props.rowKey] as string | number
const isSelected = (row: TableRow) => selected.value.includes(keyOf(row))

const setSelected = (row: TableRow, checked?: boolean) => {
  const key = keyOf(row)
  if (checked) selected.value = [...selected.value, key]
  else selected.value = selected.value.filter((k) => k !== key)
}

const allSelected = computed(() => pageRows.value.length > 0 && pageRows.value.every(isSelected))
// Some but not all of *this page* — the header box shows a dash rather than
// claiming the page is either fully in or fully out.
const someSelected = computed(() => !allSelected.value && pageRows.value.some(isSelected))

const toggleAll = (checked?: boolean) => {
  const keys = pageRows.value.map(keyOf)
  if (checked) selected.value = [...new Set([...selected.value, ...keys])]
  else selected.value = selected.value.filter((key) => !keys.includes(key))
}

const selectedKeys = computed(() => (props.selectable ? selected.value : undefined))

// --- composition ---

const selectColumn: TableColumn = { key: '__select', header: '' }
const tableColumns = computed<TableColumn[]>(() =>
  props.selectable ? [selectColumn, ...props.columns] : props.columns,
)
const sortableColumns = computed(() => props.columns.filter((column) => column.sortable))

// Only the consumer's cell slots pass through — head-* is this component's.
const slots = useSlots()
const forwardedSlots = computed(() => Object.keys(slots).filter((name) => name.startsWith('cell-')))
</script>

<style module lang="scss">
@use '@surstromming/design' as design;

.root {
  display: flex;
  flex-direction: column;
  gap: design.spacing(4);
  width: 100%;
}

// Inherits the head's muted color and 500 weight; the reset strips the
// button chrome.
.sort-button {
  display: inline-flex;
  align-items: center;
  gap: design.spacing(2);
  padding: 0;
  color: inherit;
  font: inherit;
  cursor: pointer;
  outline: none;

  &:hover {
    color: design.color(foreground);
  }

  &:focus-visible {
    border-radius: design.radius(sm);
    box-shadow: 0 0 0 3px design.with-alpha(ring, 50%);
  }
}

.footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: design.spacing(4);
}

.count {
  margin-right: auto;
  color: design.color(muted-foreground);
  font-size: 0.875rem;
}
</style>
