import type { IconNode } from '@surstromming/icon'

/** One row of the list: what it is called, what it stands for, how it looks. */
export interface SortableListItem {
  /** Identity: the row's key, and what `select` and `move` emit. */
  value: string
  label: string
  icon?: IconNode
  /** Paints the current row. The consumer owns which one is. */
  active?: boolean
}

export { default as SortableList } from './SortableList.vue'
