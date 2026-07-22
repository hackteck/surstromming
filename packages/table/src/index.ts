export interface TableColumn {
  key: string
  header: string
  /** Applies to the header and every cell of the column. */
  align?: 'left' | 'center' | 'right'
}

export type TableRow = Record<string, unknown>

export { default as Table } from './Table.vue'
