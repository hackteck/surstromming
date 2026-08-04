# @surstromming/combobox

## 0.1.5 — 2026-08-04

### Added

- **`layer`** (`popover | menu | modal`, default `popover`), forwarded to
  `Popover`. Inside a `Dialog` pass `modal`, or the panel is drawn at 30 under a
  dialog at 70.

### Fixed

- Requires `@surstromming/popover@^0.1.5`, so `Escape` with the panel open
  closes the panel only, not the dialog around it. See popover's changelog for
  the detail.

## 0.1.4 — 2026-07-26

### Fixed

- Requires `@surstromming/scroll-area@^0.1.2`, so a tap inside a scroller on a
  touch device is no longer swallowed. See scroll-area's changelog for the
  detail. No change in this package's own source or API.

## 0.1.3 — 2026-07-26

### Fixed

- Requires `@surstromming/popover@^0.1.3`, so a menu is placed where its
  trigger is on a pinch-zoomed page instead of somewhere off screen. See
  popover's changelog for the detail. No change in this package's own source or
  API.

## 0.1.2 — 2026-07-26

### Fixed

- Requires `@surstromming/popover@^0.1.2`, so a panel no longer lands away from
  its trigger — or disappears outright — while the page is pinch-zoomed in
  Safari. See popover's changelog for the detail. No change in this package's
  own source or API.

## 0.1.1 — 2026-07-26

### Fixed

- Requires `@surstromming/popover@^0.1.1`, so the dropdown panel no longer
  slides into place after opening — see popover's changelog for the detail. No
  change in this package's own source or API.
