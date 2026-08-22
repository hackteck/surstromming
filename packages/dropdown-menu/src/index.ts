import type { IconNode } from '@surstromming/icon'
import type { PopoverAlign, PopoverSide } from '@surstromming/popover'

export type DropdownMenuAlign = PopoverAlign
export type DropdownMenuSide = PopoverSide

export interface DropdownMenuOption {
  label: string
  value: string
  icon?: IconNode
  disabled?: boolean
  /** A dangerous action — delete, revoke — painted in the destructive colour. */
  destructive?: boolean
}

export interface DropdownMenuSeparator {
  separator: true
}

/**
 * A row that opens a menu of its own beside it instead of choosing anything.
 *
 * It carries no `value`, deliberately: only a leaf can be selected, so a
 * submenu that could also be picked would be one row meaning two things.
 * `items` is the item type again, so a submenu holds separators — and further
 * submenus, though a menu deep enough to want that is usually a dialog.
 */
export interface DropdownMenuSubmenu {
  label: string
  items: DropdownMenuItem[]
  icon?: IconNode
  disabled?: boolean
}

export type DropdownMenuItem = DropdownMenuOption | DropdownMenuSubmenu | DropdownMenuSeparator

export { default as DropdownMenu } from './DropdownMenu.vue'
