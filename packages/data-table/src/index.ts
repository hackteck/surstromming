import type { TableColumn } from '@surstromming/table'

export type SortDirection = 'asc' | 'desc'

export interface DataTableSort {
  key: string
  direction: SortDirection
}

export interface DataTableColumn extends TableColumn {
  sortable?: boolean
}

export { default as DataTable } from './DataTable.vue'
