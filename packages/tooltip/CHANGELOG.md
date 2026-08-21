# @surstromming/tooltip

## 0.1.3 — 2026-08-16

### Fixed

- **A tip raised by a dialog closing could not be dismissed.** Any `focusin`
  opened it, and a `Dialog` hands focus back to the control that opened it — so
  clicking a tooltipped opener and then closing the dialog with the mouse left
  the tip up for good: the pointer is wherever that dialog's ✕ was, so no
  `mouseleave` was ever coming for the trigger. Only `Escape`, or moving focus
  elsewhere, took it down.

  Focus now shows the tip **only while the trigger matches `:focus-visible`**,
  so it appears exactly when the focus ring does. Hover is unchanged, and a
  keyboard user still gets the tip when the dialog hands focus back. Found by a
  consumer (NanosecEditor). No API change.

### Changed

- **Focus shows a tip only when the browser is showing that focus.** A
  programmatic `element.focus()` no longer raises one, which matters most in a
  scripted check: a script's focus does not match `:focus-visible`, so drive the
  keyboard path with a real `Tab` (CDP) rather than `element.focus()`, or the
  tip you are asserting on will never appear.

## 0.1.2 — 2026-07-26

### Fixed

- **A tip is placed and flipped correctly on a pinch-zoomed page**, and follows
  the zoom rather than keeping a position measured before it. Same cause and
  same fix as popover 0.1.3 — see its changelog.

### Changed

- Placement mechanics moved to `@surstromming/util`'s `useAnchored`
  (a **new dependency**, `^0.1.1`), shared with Popover. The policy here is
  unchanged and still the opposite one: a tip flips where a panel shifts, and is
  never clipped. No API change.

## 0.1.1 — 2026-07-26

### Fixed

- **The tip flips and clamps against the layout viewport, not the visual one.**
  Same fix as popover 0.1.2 — see its changelog. `window.innerHeight` is the
  visual viewport, which Safari shrinks under pinch-zoom, so the "does it fit
  below?" test and the cross-axis clamp were measuring against an edge that
  wasn't where the rects said it was.

  No API change, and nothing moves on an unzoomed page.
