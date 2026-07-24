<template>
  <ScrollArea :class="$style.root">
    <table :class="$style.table" v-bind="$attrs">
      <caption v-if="props.caption" :class="$style.caption">
        {{ props.caption }}
      </caption>
      <thead>
        <tr :class="$style.headerRow">
          <th v-for="column in props.columns" :key="column.key" :class="headClasses(column)">
            <slot :name="`head-${column.key}`" :column="column">{{ column.header }}</slot>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="{ key, row } in keyedRows" :key="key" :class="rowClasses(row)">
          <td v-for="column in props.columns" :key="column.key" :class="cellClasses(column)">
            <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
              {{ row[column.key] }}
            </slot>
          </td>
        </tr>
        <tr v-if="showEmpty" :class="$style.row">
          <td :class="$style.emptyCell" :colspan="props.columns.length">{{ props.empty }}</td>
        </tr>
      </tbody>
    </table>
  </ScrollArea>
</template>

<script setup lang="ts">
import { computed, useCssModule } from 'vue'
import { ScrollArea } from '@surstromming/scroll-area'
import type { TableColumn, TableRow } from './index'

// Attrs describe the table itself, not the private scroll wrapper.
defineOptions({ inheritAttrs: false })

const props = defineProps<{
  columns: TableColumn[]
  rows: TableRow[]
  /** Column key with unique values; the row index is the fallback. */
  rowKey?: string
  caption?: string
  /** Shown as a single full-width row when `rows` is empty. */
  empty?: string
  /** Rows whose `row[rowKey]` is listed get the selected background. Paint only. */
  selectedKeys?: (string | number)[]
}>()

const keyedRows = computed(() =>
  props.rows.map((row, index) => ({
    key: props.rowKey ? String(row[props.rowKey]) : index,
    row,
  })),
)

const showEmpty = computed(() => props.rows.length === 0 && Boolean(props.empty))

const isSelected = (row: TableRow) => {
  if (!props.rowKey || !props.selectedKeys) return false
  return props.selectedKeys.includes(row[props.rowKey] as string | number)
}

const $style = useCssModule()
const alignClass = (column: TableColumn) => $style[`align-${column.align ?? 'left'}`]
const headClasses = (column: TableColumn) => [$style.head, alignClass(column)]
const cellClasses = (column: TableColumn) => [$style.cell, alignClass(column)]
const rowClasses = (row: TableRow) => [$style.row, { [$style.isSelected]: isSelected(row) }]
</script>

<style module lang="scss">
@use '@surstromming/design' as design;

// The wrapper is the ScrollArea itself — a wide table scrolls sideways under
// the drawn bar, like everything else here. It brings its own overflow, and
// nothing needs saying about the axis: the wrapper is auto-height, so the
// vertical bar has nothing to appear for.
.root {
  width: 100%;
}

.table {
  width: 100%;
  border-collapse: collapse;
  caption-side: bottom;
  font-size: 0.875rem;
}

.caption {
  margin-top: design.spacing(4);
  color: design.color(muted-foreground);
}

.header-row {
  border-bottom: 1px solid design.color(border);
}

.head {
  height: design.spacing(10);
  padding: 0 design.spacing(2);
  vertical-align: middle;
  color: design.color(muted-foreground);
  font-weight: 500;
  white-space: nowrap;
}

.row {
  border-bottom: 1px solid design.color(border);
  transition: background-color 0.15s ease;

  &:last-child {
    border-bottom: 0;
  }

  &:hover {
    background-color: design.with-alpha(muted, 50%);
  }
}

.cell {
  padding: design.spacing(2);
  vertical-align: middle;
  white-space: nowrap;
}

// Selected paint holds through hover — hover's higher specificity would
// otherwise lighten it back.
.is-selected {
  &,
  &:hover {
    background-color: design.color(muted);
  }
}

.empty-cell {
  height: design.spacing(24);
  padding: design.spacing(2);
  text-align: center;
  color: design.color(muted-foreground);
}

.align-left {
  text-align: left;
}

.align-center {
  text-align: center;
}

.align-right {
  text-align: right;
}
</style>
