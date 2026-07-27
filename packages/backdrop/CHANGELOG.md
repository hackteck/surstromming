# @surstromming/backdrop

## 0.1.1 — 2026-07-26

### Fixed

- **The scrim no longer swallows presses while it fades out.** `visibility`
  interpolates as a step that holds `visible` for the *whole* transition and
  flips only at the end — which is precisely what makes a fade-out possible
  rather than a vanishing, and also what left a full-viewport `inset: 0`
  element hit-testable at **3% opacity, 190ms after it stopped being wanted**.
  Every press on the page went to it in that window: close a drawer, reach for
  the control beside it, and the tap does nothing at all. It reads as a flaky
  button somewhere else entirely, and it is **not** touch-specific — a mouse
  click landing in the same 200ms was lost the same way.

  `pointer-events` is `none` on the base now and `auto` on `.isVisible`. It
  carries no transition, so the scrim stops capturing on the very frame the
  close begins while the fade plays out behind it; click-to-dismiss is
  unchanged, since that only ever mattered while it was up.

  No API change.
