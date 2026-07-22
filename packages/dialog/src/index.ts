/**
 * `dialog` — a normal modal: an ✕, Escape and an outside click all close it.
 * `alertdialog` — a decision the user must make: no dismissal, they pick an
 * action in the footer. (This is shadcn's AlertDialog, folded in as a role.)
 */
export type DialogRole = 'dialog' | 'alertdialog'

export { default as Dialog } from './Dialog.vue'
