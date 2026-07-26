# @surstromming/scroll-area

## 0.1.2 — 2026-07-26

### Fixed

- **A tap inside an `autoHide` scroller no longer goes nowhere.** `hovering`
  was set from `pointerenter` regardless of what kind of pointer it was, and
  iOS fires that for a finger, on every tap. With `autoHide` the flag flips an
  idle bar to visible — `.isHidden` drops its `pointer-events: none` — so a
  full-height strip appeared over the content *between* the finger going down
  and coming up. WebKit re-hit-tests at `touchend` to synthesize the click,
  found the layer under the finger had changed, and declined: no `mousedown`,
  no `mouseup`, no `click`.

  The effect was total and baffling in equal measure. **Every** button inside
  the scroller stopped responding — menus, likes, links — while the identical
  component outside it worked, on phones only (`autoHide` is usually a
  breakpoint away), and intermittently: a bar already up because you had just
  scrolled left nothing to change, and the tap went through. It read as "this
  one menu is broken".

  `pointerenter` now sets `hovering` only for a **mouse or pen**. A touch
  scroller still shows its bar while it scrolls, which is the whole of what an
  overlay bar is for.

  No API change.

## 0.1.1 — 2026-07-24

### Added

- **Horizontal scrolling.** Both axes scroll by default now, with a bar each,
  and a bar is only there while its own axis overflows — so a wide table or a
  row of cards gets a bottom bar without asking, and nothing else changes.
- **`orientation`** — `both` (the default), `vertical` or `horizontal`. It
  *forbids* an axis rather than asking for a bar: `vertical` clips sideways
  overflow, `horizontal` clips vertical.
- Exported types `ScrollAreaOrientation` and `ScrollAxis`.

### Changed

- The root is a **CSS grid** (`1fr auto / 1fr auto`), not a flex column. Each
  bar sits in a track of its own, so the space it takes *is* its gutter and two
  bars leave the corner empty without being told about each other.
- The gutter is that track and no longer `padding-right` on the viewport.
  Padding sits at the *end* of the content: it keeps the last row clear of a
  bottom bar but lets every row before it scroll underneath.
- A bar with nothing to scroll now collapses across (`width: 0` / `height: 0`)
  instead of unmounting, so its track stays measurable — and it stops taking
  pointer events while it's out of sight.
- `overscroll-behavior: contain` is applied per axis, only on an axis that
  really scrolls.
- Internals: the bar is a private `ScrollBar.vue`, and `useScrollMetrics` is
  axis-generic (`thumbHeight`/`thumbTop` → `thumbLength`/`thumbOffset`). Not
  exported, but the package ships raw source, so a deep import would notice.

### Might break

- **`display` on the root.** A consumer class that sets `display: flex` — or
  anything else — on the ScrollArea root now fights the grid, and the bars land
  in the wrong place. Set height, width and surface there; leave `display` alone.
- **A horizontal bar can now appear where nothing was there before.** Content
  wider than the viewport used to scroll sideways silently — `overflow-x` was
  never stated and the browser promoted it to `auto` behind the hidden native
  bar. It's a real, drawn bar now, and it takes 18px off the bottom. Where the
  overflow was an accident and clipping is what's wanted, say
  `orientation="vertical"`.

## 0.1.0

Initial release.
