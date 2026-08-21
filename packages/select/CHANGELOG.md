# @surstromming/select

## 0.1.6 — 2026-08-21

### Added

- **A `side` prop, forwarded to `Popover`.** `Select` passed `layer` through and
  nothing else, so a list that opened into the bottom of the viewport was cut
  off and a consumer had no way to move it. Same prop, same reasoning as
  `layer`: the component cannot know how much room is under it, and guessing
  from the DOM would be a lie the one time it guessed wrong.

  Needs `@surstromming/popover@^0.1.6` — the range moves with the version,
  because `side: 'top'` is a value the older popover does not know. Additive
  otherwise; the default is still `bottom`.

## 0.1.5 — 2026-08-04

### Added

- **`layer`** (`popover | menu | modal`, default `popover`), forwarded to
  `Popover`. Inside a `Dialog` pass `modal` — the list is drawn on the `popover`
  rung (30) otherwise, while the dialog sits at 70, and the options open behind
  it.

### Fixed

- Requires `@surstromming/popover@^0.1.5`, so `Escape` with the list open closes
  the list only, not the dialog around it. See popover's changelog for the
  detail.

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
