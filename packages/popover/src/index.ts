export type PopoverAlign = 'start' | 'end'

/**
 * Which side of the trigger the panel opens on. `align` runs along that side:
 * for `bottom` it's the horizontal edges, for `right`/`left` the vertical ones.
 */
export type PopoverSide = 'bottom' | 'right' | 'left'

/**
 * Which rung of the stacking ladder the panel sits on. `popover` is the one to
 * want; `menu` clears a teleported sidebar drawer, `modal` clears a dialog.
 *
 * Values live in `zIndexes.scss` — see $z-layers there.
 */
export type PopoverLayer = 'popover' | 'menu' | 'modal'

export { default as Popover } from './Popover.vue'
