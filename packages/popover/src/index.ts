export type PopoverAlign = 'start' | 'end'

/**
 * Which side of the trigger the panel opens on. `align` runs along that side:
 * for `top`/`bottom` it's the horizontal edges, for `right`/`left` the vertical
 * ones.
 *
 * **`top` exists because a trigger can be at the bottom of the screen.** The
 * panel is placed against the side it was asked for and the anchor axis is
 * deliberately not clamped — that is what lets it track the trigger out of view
 * rather than pinning itself to an edge — so a `bottom` panel opened from a
 * control near the viewport's lower edge is simply cut off, with nowhere to go.
 * The answer is the same one this prop already is: say which side. A Select in
 * a composer at the foot of a pane wants `top`, and before this it could not
 * ask. Found by NanosecEditor.
 */
export type PopoverSide = 'top' | 'bottom' | 'right' | 'left'

/**
 * Which rung of the stacking ladder the panel sits on. `popover` is the one to
 * want; `menu` clears a teleported sidebar drawer, `modal` clears a dialog.
 *
 * Values live in `zIndexes.scss` — see $z-layers there.
 */
export type PopoverLayer = 'popover' | 'menu' | 'modal'

export { default as Popover } from './Popover.vue'
