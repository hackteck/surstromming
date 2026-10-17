/**
 * `dialog` — a normal modal: an ✕, Escape and an outside click all close it.
 * `alertdialog` — a decision the user must make: no dismissal, they pick an
 * action in the footer. (This is shadcn's AlertDialog, folded in as a role.)
 */
export type DialogRole = 'dialog' | 'alertdialog'

/**
 * `center` — the panel in the middle of the screen.
 * An edge — a sheet: the panel flush with that edge and sliding in from it,
 * a menu drawer on the left, details on the right, a phone's sheet from the
 * bottom. (This is shadcn's Sheet, folded in as a placement.)
 */
export type DialogSide = 'center' | 'top' | 'right' | 'bottom' | 'left'

export { default as Dialog } from './Dialog.vue'
