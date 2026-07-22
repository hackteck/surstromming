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

export type DropdownMenuItem = DropdownMenuOption | DropdownMenuSeparator

export { default as DropdownMenu } from './DropdownMenu.vue'
