# @surstromming/popover

## 0.1.5 — 2026-08-04

### Fixed

- **An open panel now owns `Escape`.** A `Select` inside a `Dialog` sits in the
  dialog's own panel, and that panel is where the dialog listens for `Escape` —
  so one press closed the list *and* the dialog behind it. Measured, not
  reasoned.

  The `keydown` listener is registered with `capture: true` and stops the event,
  so it runs before anything below it can see the key. Dismissal is otherwise
  unchanged, and a popover with nothing under it behaves exactly as before.

  The same is **deliberately not done for `mousedown`**: an outside press on a
  dialog's own overlay still dismisses both. Claiming that gesture would mean
  swallowing `mousedown` page-wide while a panel is open, and that is where
  sliders, drag handles and text selection start theirs. A key nobody drags
  with is safe to claim; a press is not.

## 0.1.4 — 2026-07-26

### Fixed

- Requires `@surstromming/scroll-area@^0.1.2`. Every panel in this library
  lives in one, and a tap on a trigger inside a scroller was being swallowed
  whole — see scroll-area's changelog. No change in this package's own source
  or API.

## 0.1.3 — 2026-07-26

### Fixed

- **A panel is placed correctly on a pinch-zoomed page.** Zoom splits the
  viewport in two — the *layout* viewport the page was laid out at, and the
  smaller *visual* one the reader looks through and pans around. WebKit reports
  `getBoundingClientRect()` against the visual viewport while a
  `position: fixed` element is still placed against the layout one, so a panel
  drawn at the number its trigger measured landed `visualViewport.offsetLeft`
  away from it: hundreds of pixels to the left, or off screen altogether once
  someone had panned right to reach a trailing control. That is the same
  correction `@floating-ui/dom` makes, and 0.1.2's move to
  `document.documentElement` fixed the *bound* while leaving the coordinates
  unconverted — which is why it changed nothing.

- **A panel stays on its trigger while the page is zoomed and panned.** The
  clamp that keeps a panel on screen is measured against the **layout** viewport
  — the page's own box — and not against the part of the screen currently
  visible. Zoomed in those differ, and clamping to the visible part re-answers
  the question on every pan: the panel slid out from under its trigger and
  crawled along the screen edge, 168px off it in the reported case. Keeping a
  panel inside the page is a layout question whose answer holds still, and it is
  the same reason the axis that tracks the anchor was already left unclamped.

  `visualViewport` is still tracked (`resize` and `scroll`, which a pinch fires
  when `window` fires neither), because on WebKit both halves of the coordinate
  conversion move together and a rect read mid-gesture has to re-converge.

  No API change. Placement mechanics moved to `@surstromming/util`'s
  `useAnchored` (`^0.1.1`), shared with Tooltip; this package keeps the policy
  — shift, never flip, and clip under the app's chrome.

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
