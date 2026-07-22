/**
 * Which layer of the stacking ladder this scrim belongs to. It paints one step
 * *under* the thing it dims (`sidebar` → 49, `modal` → 69); `backdrop` is the
 * ladder's own rung, for a scrim with nothing on top of it.
 *
 * Values live in `zIndexes.scss` — see $z-layers there.
 */
export type BackdropLayer = 'backdrop' | 'sidebar' | 'modal'

export { default as Backdrop } from './Backdrop.vue'
