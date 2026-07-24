# @surstromming/scroll-area

A scroll container that hides the native scrollbar and paints its own: a step
arrow at each end, a draggable thumb, and a track you can page on.

It behaves like a browser's, not like a phone's overlay bar — **present whenever
there's something to scroll, and then it stays**. When the content fits, there's
no bar and no gutter: the space comes back.

`autoHide` swaps that for the overlay behaviour — the bar floats over the
content and fades out when idle, appearing on hover, drag or scroll.

Only the *painting* is ours. The element is a real scroll container, so the
wheel, trackpad, keyboard, `scrollIntoView` and anchor links keep working
untouched.

**Both axes by default**, one bar each, and each bar is there only while its own
axis overflows. `orientation` narrows that — `vertical` or `horizontal` forbids
the other axis outright — so you reach for it to *stop* something scrolling, not
to ask for a bar.

## Dependency graph

```mermaid
graph LR
  scroll_area["@surstromming/scroll-area"]
  design["@surstromming/design"]
  util["@surstromming/util"]
  scroll_area --> design
  scroll_area --> util
```

## Usage

The component brings no height of its own — give it one (or a `max-height`) and
it scrolls what overflows.

```vue
<template>
  <ScrollArea :class="$style.box">
    <p v-for="line in lines" :key="line">{{ line }}</p>
  </ScrollArea>
</template>

<script setup lang="ts">
import { ScrollArea } from '@surstromming/scroll-area'

const lines = Array.from({ length: 60 }, (_, index) => `Line ${index + 1}`)
</script>

<style module lang="scss">
.box {
  height: 240px;
}
</style>
```

Sideways is the same component with no height given to it — the content's own
width is what overflows, and the bar's row is all the height it adds:

```vue
<ScrollArea>
  <div :class="$style.row">
    <article v-for="card in cards" :key="card.id" :class="$style.card">…</article>
  </div>
</ScrollArea>
```

The children have to be laid out so they *can't* wrap — a flex row of
`flex: 0 0 auto` items, or a grid of fixed columns. Nothing here forces that,
and content that wraps has nothing to scroll sideways.

`orientation` only comes up when an axis must be shut off rather than scrolled:

```vue
<!-- Long lines are cut, never scrolled; the list still scrolls down. -->
<ScrollArea orientation="vertical" :class="$style.box">…</ScrollArea>
```

## Props

| Prop          | Type                                   | Default  | Notes                                             |
| ------------- | -------------------------------------- | -------- | ------------------------------------------------- |
| `as`          | `string`                               | `'div'`  | Root element — `main` makes the page the scroller |
| `orientation` | `'vertical' \| 'horizontal' \| 'both'` | `'both'` | Which axes *may* scroll                           |
| `autoHide`    | `boolean`                              | `false`  | Float over the content and fade out when idle     |

`orientation` is what the viewport's `overflow` is set from, both axes always
stated: leaving one `visible` makes the browser promote it to `auto`, and an
axis that scrolls without a bar of ours scrolls behind the hidden native one
instead. So `vertical` really does clip sideways, and `horizontal` clips
vertically — that's the whole reason to pass either. On the default, whichever
axes overflow get a bar, and two bars stop short of the corner the other takes.

`autoHide` also drops the gutter — a bar that comes and goes can't reserve
space without the layout jumping — and gives the bar a `background` wash at 85%,
since it now paints over whatever it covers.

### Slots

| Slot      | Description                  |
| --------- | ---------------------------- |
| `default` | The content that scrolls.    |

### Fallthrough

`class`, `style` and listeners land on the root — that's where you set the
height. The scrolling element is a private inner `div`.

Leave `display` alone, though: the root's grid is what places the bars.

## Where it's used

The app's pages are `<ScrollArea as="main">`, so the whole shell scrolls through
it rather than the browser's bar (the `.page` styles move to an inner `div`, so
padding and `max-width` stay *inside* the scroller).

Three components scroll through it too — always, not behind a prop. A boolean
every consumer would set to `true` is noise, and one scrollbar everywhere is the
point of having one. **Only the consumer's content is wrapped**, never their
chrome:

| Component               | What scrolls                                        |
| ----------------------- | --------------------------------------------------- |
| [`Popover`](../popover) | The panel — so `Select`, `Combobox`, `DropdownMenu` and `DatePicker` inherit it |
| [`Sidebar`](../sidebar) | The nav column                                       |
| [`Dialog`](../dialog)   | The body; header, ✕ and footer stay put              |

Each drops its own `overflow` and puts its class straight on the ScrollArea
root — that root is already the column those classes used to create, so a
`max-height` on it still bounds what scrolls.

The escape hatch isn't a prop either: under **`forced-colors`** (Windows high
contrast) the painted bar hides itself and the native one comes back. Forced
colors replaces the tokens the bar is drawn from, and the OS scrollbar is what
the user asked for — so that decision lives here, once, instead of at every call
site.

## Anatomy

```
root (grid: 1fr auto / 1fr auto)   ← your height goes here
├── viewport (1/1, overflow per orientation, native bar hidden)
│   └── slot
├── ScrollBar vertical (1/2)       ┐ a track of the grid each — the space one
│   ├── arrow ▲  press and hold to repeat
│   ├── track    click past the thumb to page
│   │   └── thumb  drag to scroll
│   └── arrow ▼                    │ takes *is* its gutter, and the corner cell
└── ScrollBar horizontal (2/1)     ┘ stays empty on its own
```

A bar that has nothing to scroll collapses to zero across the bar (`width: 0` /
`height: 0`) rather than leaving: the grid gives the space straight back, and
the track stays measurable, which is what the numbers below are read from. An
`autoHide` bar leaves the grid entirely (`position: absolute`) and floats.

The gutter is a track and not `padding` on the viewport, because padding sits at
the *end* of the content: it keeps the last row clear of a bottom bar but lets
every row before it scroll underneath. A track shortens the viewport itself.

Each bar is drawn from four measured numbers along its own axis — scroll offset,
viewport length, content length, track length. A `ResizeObserver` watches the
viewport, its first child (which is what reports the content's size) and the
track, so content that grows re-sizes the thumb.

## Tokens

| Part  | Token                                            |
| ----- | ------------------------------------------------ |
| caret | `muted-foreground` → `foreground` on hover       |
| thumb | `foreground` at 45% / 60% hover / 75% dragging   |

Parked, the bar itself paints nothing — no track fill, no wash. It sits in a
track of its own beside the content, so whatever surface it's on shows through
and it reads correctly in the sidebar, a popover and a dialog alike. Only
`autoHide` adds the wash, because only then does it cover content.

The carets are a 12×9 inline `<svg>` triangle, not an icon: a stroked lucide
chevron reads as a link affordance at this size and there's no solid caret in
the set, so the package doesn't depend on `@surstromming/icon`. The corners are
rounded by stroking the path in its own colour with `stroke-linejoin: round` —
which is also why that colour is opaque, since fill and stroke overlap and a
translucent one would draw a darker rim along the edge.

## Behaviour

| Gesture                     | Result                                  |
| --------------------------- | --------------------------------------- |
| Arrow click                 | 40px; press and hold repeats            |
| Track click                 | One viewport towards the click, smooth  |
| Thumb drag                  | Proportional, grabbed where you clicked |
| Wheel / keyboard / trackpad | Native, untouched                       |

## Accessibility

The bar is `aria-hidden` and its arrows are `tabindex="-1"`: it duplicates
scrolling that the viewport already offers to the keyboard, so exposing it twice
would only add noise. Screen readers and keyboard users get the native
behaviour.
