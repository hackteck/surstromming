# @surstromming/popover

## 0.1.2 — 2026-07-26

### Fixed

- **The panel is placed against the layout viewport, not the visual one.**
  `window.innerWidth` / `innerHeight` describe the *visual* viewport, which
  Safari shrinks while the page is pinch-zoomed — a trackpad pinch on a Mac
  counts, and on iOS it is the normal state of a page someone has zoomed into.
  `position: fixed` and `getBoundingClientRect()` both work in the *layout*
  viewport, so mixing the two had the numbers describing different spaces, and
  both ways it went wrong were bad: clamping a panel against a 1019px visual
  width while its anchor sat at 1474 in the layout one put the panel 464px to
  the left of its own trigger, and the clip built from the short visual height
  cut a 142px panel by 174px — erasing it, which reads as a menu that flat
  refuses to open. Now read from `document.documentElement`, which is the
  layout viewport in every browser.

  No API change, and nothing moves on an unzoomed page: the two viewports are
  the same size there.

## 0.1.1 — 2026-07-26

### Fixed

- **The panel no longer slides into place.** It is placed with a `transform`
  from the viewport's origin instead of with `top` / `left`. An inset offset is
  also what a shrink-to-fit box has left to grow into, so a panel placed 374px
  along a 430px viewport measured 56px wide — which moved it left, which let it
  grow, which moved it again. The `ResizeObserver` walked that loop one frame at
  a time, and it read as the menu sliding out from under its own trigger for a
  tenth of a second. Worst wherever the panel is placed from its far edge
  (`align: end`, `side: left`) or the viewport is narrow — a phone hit both.

  No API change. The panel now carries a `transform`, so it establishes a
  containing block: a `position: fixed` descendant of a panel would resolve
  against the panel rather than the viewport. Nothing in the kit has one — every
  nested overlay teleports to `<body>`.
