# @surstromming/design

## 0.1.2 — 2026-08-16

### Added

- **`layout()` places a `footer` child.** The shell grid gains a third `auto`
  row spanning the full width in both modes — a status bar stopping at the
  sidebar's edge reads as a fragment of one — and `> footer` lands in it. With
  no footer in the markup the row collapses to nothing, so existing apps render
  identically; that is the same contract every other absent child already has.
  The footer brings no styling of its own: like `aside` and `header`, what it
  looks like is the app's business.

## 0.1.1 — 2026-07-26

### Fixed

- **`reset.scss` gives interactive elements `touch-action: manipulation`.** A
  tap on a zoomable page can still turn out to be the first half of a
  double-tap-to-zoom, so Safari holds the `click` back around 300ms to find out
  — long enough that a menu opening reads as broken, and worst on a phone where
  every tap pays it. `manipulation` drops double-tap zoom on those elements
  only: pinch still zooms, double-tapping the page still zooms, and a control
  answers the finger straight away. Deliberately not on `body`, which would take
  the gesture away from the text as well.

  Only `reset.scss` changed — no token, getter or mixin moved, so a consumer
  that doesn't import the reset sees nothing.
