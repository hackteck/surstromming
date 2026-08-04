# @surstromming/dialog

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
