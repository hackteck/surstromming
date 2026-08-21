# @surstromming/dialog

## 0.1.5 — 2026-08-21

### Fixed

- **Focus no longer lands on a scrollbar arrow.** The focus trap's selector
  guarded against a negative `tabindex` in only one of its clauses —
  `[tabindex]:not([tabindex="-1"])` — so a `<button tabindex="-1">` matched the
  earlier `button:not([disabled])` clause and came through anyway. An element
  whose author had deliberately taken it out of the tab order was therefore
  treated as being at the front of it.

  It bites this component in particular because the body **is** a `ScrollArea`,
  and each of its bars draws two step arrows carrying `tabindex="-1"` precisely
  so that nothing treats them as controls. They sit ahead of the footer in DOM
  order, so *every* dialog with body content had four phantom entries at the
  head of its focus list. Two consequences, both measured in a consumer
  (NanosecEditor), on an `alertdialog` asking whether to discard uncommitted
  work:

  - **Opening focused an arrow instead of the first control.** `Enter` on a
    freshly opened dialog pressed a scroll step. `autofocus` — added in
    `0.1.4` for exactly this class of problem — was the only way to avoid it,
    and it should not have to be.
  - **The Tab trap wrapped on the wrong elements.** The arrows were the first
    and last "focusables", so `Shift+Tab` from the first real control went to
    an arrow rather than to the last one.

  The rule now lives in the filter rather than in the selector, and reads the
  resolved `element.tabIndex` — 0 for a plain button, -1 for one taken out —
  which covers every element type at once, and `tabindex="-2"` with them. After
  the fix, in that same dialog: focus opens on `Cancel`, and `Shift+Tab` from
  `Cancel` wraps to `Discard`.

  No API change, and nothing to do in a consumer. A dialog that added
  `autofocus` only to escape this keeps working exactly as it did — and
  `autofocus` remains the right way to say which control should be the default,
  which is worth doing on its own account wherever the first control is not the
  safe one.

## 0.1.4 — 2026-08-16

### Fixed

- **Closing from a keydown no longer clicks the opener.** Focus was handed back
  to the opener synchronously, in the same microtask flush the closing keydown
  was still being processed in — and the browser runs that key's default
  action, activating whichever element is focused, *after* that flush. So Enter
  in a field wired to close the dialog confirmed, returned focus, and then
  clicked the button that opened it: the dialog blinked shut and open again.
  Only with a real mouse click behind it — a synthetic `.click()` never focuses
  the button, which is exactly how a scripted check misses it.

  Focus now returns in a macrotask. By then the key's default action is spent,
  and the panel is still in the DOM (the leave transition holds it), so focus
  has not fallen to `body` in the gap. Consumers wiring Enter to a close should
  still `preventDefault()` — that states the intent and covers the same ground
  from the other side — but they no longer have to know to.

- **A focus ring inside the body is no longer shaved off.** The body is a
  `ScrollArea`, a scroller clips at its own padding edge, and a full-width
  control inside one ends exactly on that edge — so the 3px ring `design.field`
  paints *outside* the border box was cut flat on both sides. Measured in a
  dialog with an `Input`: field and viewport both 741→1171, ring 738→1174.

  The room had to go **inside** the scroller, so the slot content now sits in a
  `div` with `spacing(1)` of padding and `.body` takes the same amount back off
  its margin. Content lines up with the header and footer exactly as before;
  the only visible difference is the scrollbar sitting 4px nearer the panel
  edge. A negative margin on `.body` alone cannot do this — it would push the
  content out of the very box that does the clipping.

  **If you style the body's children from outside**, note the extra element:
  `.body > *` now matches that wrapper, and a child asking for `height: 100%`
  resolves against it (auto) rather than against the scroller.

### Added

- **`autofocus` inside the panel now decides where focus lands on open.**
  Previously it was always the first focusable, which is the ✕ — so `Enter` on
  a freshly opened dialog dismissed it instead of answering it, and a consumer
  had no way to say otherwise (a parent watcher on `open` loses the race, since
  the dialog's own runs after it).

  ```vue
  <Dialog v-model:open="open" title="Workspace directory">
    <Input v-model="path" autofocus />
  </Dialog>
  ```

  The first *visible* `[autofocus]` in the panel wins; with none, behaviour is
  unchanged.

## 0.1.3 — 2026-08-04

### Fixed

- Attributes now reach the panel. The root is a fragment (`Backdrop` +
  `Teleport`), so Vue dropped fallthrough attrs entirely: `class` landed
  nowhere, and the panel's 30rem `max-width` could not be overridden, which made
  a wide dialog impossible. Now `inheritAttrs: false` with `v-bind="$attrs"` on
  the panel, as this repo's own rule requires for a multi-node root.

  To override the width, the selector has to outrank the library's single class
  — `.wide.wide { max-width: 58rem }` — rather than reach for `!important`.

## 0.1.2 — 2026-07-26

### Fixed

- Requires `@surstromming/backdrop@^0.1.1`, so the scrim stops swallowing
  presses while it fades out. See backdrop's changelog for the detail. No change
  in this package's own source or API.

## 0.1.1 — 2026-07-26

### Fixed

- Requires `@surstromming/scroll-area@^0.1.2`, so a tap inside a scroller on a
  touch device is no longer swallowed. See scroll-area's changelog for the
  detail. No change in this package's own source or API.
