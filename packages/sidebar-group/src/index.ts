import type { DropdownMenuItem } from '@surstromming/dropdown-menu'
import type { IconNode } from '@surstromming/icon'

/**
 * Which side the *sidebar* is on — mirror the `side` given to `<Sidebar>`.
 * An item's action menu opens on the opposite side, towards the content.
 */
export type SidebarGroupSide = 'left' | 'right'

export interface SidebarGroupSubItem {
  label: string
  value: string
  /** Renders the row as a real <a>: middle-click and Cmd+click open a tab. */
  href?: string
  active?: boolean
}

/**
 * Nested nav and an action menu both hang off the row's trailing control, so
 * they can't coexist — the data names which one it is.
 */
export type SidebarGroupSubmenu =
  | { type: 'items'; entries: SidebarGroupSubItem[] }
  | { type: 'menu'; entries: DropdownMenuItem[] }

export interface SidebarGroupItem extends SidebarGroupSubItem {
  icon?: IconNode
  submenu?: SidebarGroupSubmenu
  /**
   * Opens the nested list (`submenu.type: 'items'`; ignored otherwise). The
   * chevron doesn't write it — it emits `toggle`, and the app flips the flag.
   */
  expanded?: boolean
}

export { default as SidebarGroup } from './SidebarGroup.vue'
