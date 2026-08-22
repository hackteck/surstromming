# @surstromming/dropdown-menu

## 0.1.7 — 2026-08-22

### Added

- **Submenus.** An item with `items` instead of a `value` is a row that opens a
  menu of its own beside it, on `side="right" align="start"`. `items` is the
  item type again, so a submenu holds separators and further submenus; `select`
  still fires with the chosen leaf's `value`, however deep, and the whole menu
  closes.

  It opens on hover, on click, and on `→` from the keyboard — which steps into
  it — and `←` steps back out to the row that opened it. A submenu opened by
  hover is left open for a moment after the pointer leaves that row: the panel
  is off to the right, so reaching it means crossing the rows underneath, and
  closing on the first of those is what makes a flyout feel like it is running
  away.

  The panel is a new private `MenuPanel.vue`, and it is recursive — a submenu is
  another `Popover` holding another one of it. Reusing the shell rather than
  drawing a second surface is what keeps the two identical, and it is why there
  is no depth limit to state.

  `Escape` closes the whole menu rather than one level at a time. `Popover`
  claims the key in the capture phase and the outermost one registered first, so
  it answers first; `←` is the key that steps back one.

### Changed

- `DropdownMenuItem` gained a third member, `DropdownMenuSubmenu`. Reading
  `item.value` off a bare `DropdownMenuItem` no longer type-checks without
  narrowing, and an exhaustive `switch` over the union will now have a case it
  does not handle. Narrow with `'separator' in item` and `'items' in item`,
  which is what the component itself does.

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
