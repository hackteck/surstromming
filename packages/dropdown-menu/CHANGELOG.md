# @surstromming/dropdown-menu

## 0.1.6 — 2026-08-04

### Fixed

- Requires `@surstromming/popover@^0.1.5`, so `Escape` with the menu open closes
  the menu only, not a dialog around it. See popover's changelog for the detail.
  No change in this package's own source or API.

## 0.1.5 — 2026-07-26

### Fixed

- Requires `@surstromming/scroll-area@^0.1.2`, so a tap inside a scroller on a
  touch device is no longer swallowed. See scroll-area's changelog for the
  detail. No change in this package's own source or API.

## 0.1.4 — 2026-07-26

### Fixed

- Requires `@surstromming/popover@^0.1.3`, so a menu is placed where its
  trigger is on a pinch-zoomed page instead of somewhere off screen. See
  popover's changelog for the detail. No change in this package's own source or
  API.

## 0.1.3 — 2026-07-26

### Fixed

- Requires `@surstromming/popover@^0.1.2`, so a panel no longer lands away from
  its trigger — or disappears outright — while the page is pinch-zoomed in
  Safari. See popover's changelog for the detail. No change in this package's
  own source or API.

## 0.1.2 — 2026-07-26

### Fixed

- **Closing a menu no longer scrolls its trigger back into view.** Focus still
  returns to the trigger, but with `preventScroll` now. What usually closes a
  menu is a press somewhere else, and the return runs before that press has
  focused what it hit — so in a long list, opening a menu on the first row,
  scrolling well past it and pressing another row's trigger yanked the page
  back to the first row. The press places focus itself a moment later, so only
  the scroll is given up; Escape and selecting an item are unchanged, and a
  trigger reached by keyboard is on screen to begin with.

  No API change.

## 0.1.1 — 2026-07-26

### Fixed

- Requires `@surstromming/popover@^0.1.1`, so the menu panel no longer slides
  into place after opening — see popover's changelog for the detail. No change
  in this package's own source or API.
