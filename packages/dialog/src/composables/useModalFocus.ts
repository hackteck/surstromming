import { nextTick, onBeforeUnmount, watch, type Ref } from 'vue'

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

// Counted, not a boolean: a dialog opened from inside another one would
// otherwise hand the page's scroll back the moment *it* closed. The page's own
// inline overflow is remembered, so releasing restores what was there rather
// than blanking it.
let lockCount = 0
let overflowBeforeLock = ''

const acquireScrollLock = () => {
  if (lockCount === 0) {
    overflowBeforeLock = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }
  lockCount += 1
}

const releaseScrollLock = () => {
  lockCount = Math.max(0, lockCount - 1)
  if (lockCount === 0) document.body.style.overflow = overflowBeforeLock
}

/**
 * What a modal owes the keyboard: trap Tab inside the panel, lock body scroll
 * while it's up, move focus in on open and hand it back on close. A modal that
 * leaks scroll or drops focus is the classic accessibility failure, and none of
 * it is about what the dialog *looks* like — so it lives here.
 *
 * `trapTab` is returned for the panel's own `keydown`: it doesn't listen on
 * `document`, so a dialog can't fight another one for the same key.
 */
export const useModalFocus = (
  panel: Readonly<Ref<HTMLElement | null>>,
  open: Ref<boolean>,
) => {
  // Recomputed per key press, so it tracks content that appears or disappears
  // while the dialog is open.
  const focusables = () => {
    if (!panel.value) return []
    return [...panel.value.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
      (element) => element.offsetParent !== null,
    )
  }

  /**
   * Where focus lands on open. The first focusable is usually the ✕, which is
   * the wrong place to start a dialog that asks a question — `Enter` there
   * dismisses it instead of answering it. A consumer marks the control it wants
   * with `autofocus` and that wins; unmarked dialogs are unchanged.
   */
  const initialFocus = () => {
    const marked = panel.value?.querySelectorAll<HTMLElement>('[autofocus]') ?? []
    return [...marked].find((element) => element.offsetParent !== null) ?? focusables()[0]
  }

  const trapTab = (event: KeyboardEvent) => {
    const items = focusables()
    if (!items.length) {
      event.preventDefault()
      return
    }

    const first = items[0]
    const last = items[items.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  let previouslyFocused: HTMLElement | null = null
  // This dialog's share of the lock, so unmounting can release exactly what it
  // took — nothing more, even if it never opened.
  let holdsLock = false

  const lock = () => {
    if (holdsLock) return
    holdsLock = true
    acquireScrollLock()
  }

  const unlock = () => {
    if (!holdsLock) return
    holdsLock = false
    releaseScrollLock()
  }

  watch(open, async (isOpen) => {
    if (isOpen) {
      previouslyFocused = document.activeElement as HTMLElement
      lock()
      await nextTick()
      // The panel is `tabindex="-1"`, so it can take focus itself when it holds
      // nothing focusable — an alertdialog whose actions haven't rendered yet.
      ;(initialFocus() ?? panel.value)?.focus()
    } else {
      unlock()
      // A macrotask, deliberately. A dialog often closes *from a keydown* —
      // Enter in a field wired to confirm — and the browser runs that key's
      // default action, activating whichever element is focused, only after
      // the microtask flush this watcher runs in. Restoring focus
      // synchronously put the opener button under that activation: Enter
      // confirmed, focus returned, the same press clicked the opener, and the
      // dialog blinked shut and open again. By the time a timeout runs the
      // key's default action is spent; the panel is still in the DOM (the
      // leave transition holds it), so focus has not fallen to `body` in the
      // gap.
      const opener = previouslyFocused
      window.setTimeout(() => opener?.focus(), 0)
    }
  })

  onBeforeUnmount(unlock)

  return { trapTab }
}
