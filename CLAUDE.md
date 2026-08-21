# Project decisions & requirements

A shadcn-style component library for **Vue 3**, styled with **SCSS + CSS Modules**
(no Tailwind, no CSS-in-JS, no class-joining helpers). Code is written for
humans: short, explicit, meaningful — no cleverness.

## Repo layout

- **npm workspaces** wire the repo together; the demo resolves
  `@surstromming/*` through the workspace, not Vite aliases.
- Each component is its **own package** under `packages/`, named
  `@surstromming/<kebab-name>`.
- A package contains only what it needs: `package.json`, `index.ts`,
  its `.vue` file(s), `README.md`.
- Each package's `README.md` carries its own mermaid dependency graph — only
  `@surstromming/*` edges, and the **full transitive closure**, not just the
  direct dependencies: what a consumer actually pulls in is the useful number.
  Every node is declared first, then every edge, so the graphs all read the same
  and are regenerable from the `package.json` files.
- `src/pages/demo` (in the root app) is the **demo app** — it consumes the
  packages exactly as a real consumer would:
  `import { Button } from "@surstromming/button"`.

## Imports

- **Across packages** → the package specifier: `import { Icon } from "@surstromming/icon"`.
  Every such dependency must also appear in that package's `package.json`.
- **Within a package** → relative paths: `import Foo from "./Foo.vue"`.

## Types live in `index.ts`

A component's public types are **declared in `index.ts`** and **imported back
into the `.vue`** with a type-only import. This keeps `<script setup>` free of
`export` statements (which it cannot contain) and gives consumers one import
site for both the component and its types.

```ts
// index.ts
export type FooVariant = 'solid' | 'ghost'
export { default as Foo } from './Foo.vue'
```

## SFC structure

Order inside every `.vue` file: **`<template>` first**, then
`<script setup lang="ts">`, then `<style module lang="scss">`. Always `module`
(CSS Modules), never `scoped`.

```vue
<template>
  <button :class="classes"><slot /></button>
</template>

<script setup lang="ts">
import { computed, useCssModule } from 'vue'
import type { FooVariant } from './index'

const props = withDefaults(defineProps<{ variant?: FooVariant }>(), { variant: 'solid' })

const $style = useCssModule()
const classes = computed(() => [$style.root, $style[`variant-${props.variant}`]])
</script>

<style module lang="scss">
.root { /* reads var(--token) values, no hardcoded colors */ }
.variant-solid { /* … */ }
.variant-ghost { /* … */ }
</style>
```

## Class bindings (the Vue way)

- **Never** use a `cn()`/clsx-style string joiner. Bind classes with Vue's
  native `:class` array/object syntax.
- **Single static class → `$style` in the template**, no `useCssModule()`:
  ```vue
  <li :class="$style.root">…</li>
  ```
- **Dynamic / multiple classes → a `computed` named `classes`** built from
  `useCssModule()`. When you need the module in `<script>`, name the binding
  **`$style`** (same name as the template magic var); never `s`:
  ```ts
  const $style = useCssModule()
  const classes = computed(() => [$style.root, $style[`variant-${props.variant}`]])
  ```
  Don't call `useCssModule()` when classes are only used in the template —
  reach for `$style` there directly and drop the import.
- **All classes unconditional → array;** any conditional class → an **object**
  (standalone or nested in the array): `[$style.root, { [$style.isOpen]: open.value }]`.
- **Dynamic families** (variant/size/orientation/side …) use **hyphenated**
  class names selected by a template-literal key: `` $style[`variant-${props.variant}`] ``.
- **Static** multi-word classes use **camelCase** dot-access: `$style.menuButton`.
  (Vite is configured with `localsConvention: 'camelCase'`, so a class written
  as `.menu-button` is reachable as both `$style['menu-button']` and
  `$style.menuButton`.)

## Styling & tokens

- Design values live in `@surstromming/design/src`, one file per concern
  (`colors.scss`, `fonts.scss`, `radius.scss`, `screens.scss`, `shadows.scss`,
  `spacing.scss`, `zIndexes.scss`), re-exported by `index.scss` via `@forward`. `config.scss` holds `$prefix`, which the getters prepend to
  every custom property — a package constant, **not** consumer configuration
  (each SFC style block compiles separately, so per-consumer config would
  produce mismatched var names) — plus other package constants
  (`$base-spacing`, `$base-radius`, `$darkThemeSelector`, `$sidebar-width`),
  those meant for components `@forward`ed with `show` (accessed `design.$name`).
  `config` can't call the getters (`spacing.scss` etc. `@use` it), so its
  values are plain.
- Components read them **only** through the getters — an unknown name fails
  the build:
  ```scss
  @use '@surstromming/design' as design;
  .root {
    background-color: design.color(primary);
    padding: design.spacing(2);
    @include design.screen(md) { /* md and up */ }
  }
  ```
- **Every getter emits `var(--<prefix><token>, <fallback>)`** — one shape for
  the whole system, so an unthemed app renders the fallback with zero runtime
  and a consumer overrides any token at runtime by setting the custom property.
  `$colors` maps a name to its plain light-theme value; `color()` wraps it as
  `var(--name, <light value>)`; `with-alpha(name, 90%)` is a color token at
  reduced opacity (`color-mix`). `spacing(n)` → `calc(var(--spacing, 0.25rem) * n)`.
  `radius(sm|md|lg|xl)` → shadcn-style offsets from one `var(--radius, 0.625rem)`.
  `shadow(xs|sm|md)` → `var(--shadow-<name>, <layers>)` (a multi-layer value
  rides in the `var()` fallback, commas and all); one set of values across
  themes, but overridable — where an element also draws a focus ring, the
  **ring is the first box-shadow layer** and the ambient shadow sits behind it.
  `font(sans|mono)` → `var(--font-<name>, <stack>)` (loading is separate — see
  `font-list.scss` — so overriding the var to an unloaded family won't fetch
  it). `z-index(name)` → `var(--z-<name>, <n>)` off the one **stacking ladder**
  (`zIndexes.scss`: `header 20 → popover 30 → backdrop 40 → sidebar 50 →
  menu 60 → modal 70 → toast 80 → tooltip 90`). **Every component reads it in
  SCSS; no number lives in TS.** Fixed-layer overlays just declare it (Header,
  Tooltip, Dialog's overlay at `modal`, Sidebar's drawer at `sidebar`, Toaster
  at `toast`) and have no stacking prop at all. Where the layer genuinely varies
  the prop is a **name, not a number** — `layer` on `Popover` and everything
  that wraps it (`DropdownMenu`, `Select`, `Combobox`, `DatePicker`,
  `SidebarGroup`) (`popover | menu | modal`), and on `Backdrop`
  (`backdrop | sidebar | modal`),
  selecting a `.layer-<name>` class exactly like the `variant-*` families —
  written as one, too, in `src/css/popover-layers.scss` /
  `backdrop-layers.scss`. That
  works even for a teleported panel: a *class* reaches it, only `v-bind()`'s
  custom property doesn't. A layered overlay's scrim is `layer − 1`, expressed
  as `calc(#{design.z-index(modal)} - 1)` in Backdrop's own CSS — so Dialog says
  `layer="modal"` and gets 69 without knowing the number. This replaced numeric
  `zIndex` props on six components, whose TS defaults had to restate the ladder
  in a comment because Sass can't be read from TS. Dark-scoped component rules
  use `#{design.$darkThemeSelector} & { … }` (config.scss). Font *loading*
  (`@fontsource`, emits `@font-face`) lives in `font-list.scss` (add families
  there), which the app imports once in `main.ts` — kept out of `reset.scss` so
  the reset carries no `@font-face` and stays safe to inject into a shadow root
  (custom-web-components).
- Layout is **mobile-first**: base styles are mobile; the `screen()` mixin
  wraps `@content` in `@media (min-width: …)` (plain values — media queries
  can't read custom properties).
- `reset.scss` (design package) is the one CSS-emitting stylesheet: a small
  modern reset that puts `font`/`background`/`foreground` tokens on `body` (font
  *loading* is separate, in `font-list.scss`). It also gives interactive
  elements **`touch-action: manipulation`**: a tap on a zoomable page could be
  the first half of a double-tap-to-zoom, so Safari holds the `click` back
  ~300ms to find out, and a menu that opens a third of a second after the finger
  reads as broken. Scoped to those elements, never `body` — pinch and page
  double-tap are still the reader's. The app imports it **once** in `main.ts`;
  custom-web-components imports it `?inline` to seed each shadow root. Component
  styles must only `@use` function/mixin files — anything that emits CSS would
  be duplicated into every SFC style block.
- Components never hardcode colors, spacing, or radii.
- Theming (incl. dark mode) overrides the custom properties under
  **`data-theme`** on the root; the token-generation tool comes later — don't
  build it now. Dark values live in `public/globals.css` (linked from
  `index.html`); the app's `useTheme` composable stamps `data-theme` on
  `<html>` — localStorage first, system preference as fallback (`initTheme()`
  runs in `main.ts` before mount).
- SCSS is authoring convenience only (nesting, mixins); anything a consumer
  should be able to change at runtime goes through a CSS custom property.
- Bigger style blocks split into `src/css/*.scss` partials `@use`'d by the SFC
  (`button-variants`, `sidebar-panel`/`-drawer`/`-content`). Anything
  `v-bind()`-bound stays in the SFC block (invisible to `@use`'d files). A Sass
  value shared across partials lives in a tiny `@use`'d config partial that
  every consumer imports (`sidebar/src/css/sidebar-config.scss` holds
  `$sidebar-width`) — a var declared in the SFC's own block isn't visible to
  `@use`'d files, so the shared file is what lets them all read one value. Reach
  for a **CSS custom property only when a consumer must override it at runtime**
  (theme tokens); a fixed internal metric stays a Sass constant. Partials
  compile **before** the SFC block, so the base (`.root`) may only declare what
  variants never override — a property variants own (button borders, focus
  rings) is declared explicitly in **every** variant, never via
  custom-property indirection.
- **Never `v-bind()` design tokens in `<style>`.** The SFC compiler can't see
  `v-bind()` inside `@use`'d files (vars render but the runtime inline style is
  never generated), and it bakes one theme into the component. A component's
  **own props** are the legitimate use — that's how runtime values reach CSS
  when a class family can't express it (a continuous value like a progress
  percentage). A discrete set is a class family instead: stacking used to be
  `v-bind('props.zIndex')` and is now a `.layer-<name>` class.
- The app shell is `design.layout($selector, $sidebarInset)` (layout.scss): a
  `grid-template-areas` grid over semantic direct children `aside` / `header` /
  `main` / `footer` — no wrapper divs, and a page's root element is `<main>`.
  An absent child (route without a sidebar, drawer teleported away, no footer
  at all) collapses its `auto` track. The footer is a status-bar row spanning
  the full width in both modes — beside a full-height sidebar too, since a
  status bar stopping at the sidebar's edge reads as a fragment of one — and
  the mixin gives it no styling of its own. By default the sidebar runs
  full-height with the header beside it;
  `$sidebarInset: true` tucks it inside, below a full-width header. The shell
  is **viewport-locked** (`height: 100dvh`) and `main` is the scroller — with
  the document scrolling, the inset sidebar (sticky `top: 0`, starting *below*
  the sticky header) slid up by the header's height before pinning. Header and
  panel keep their sticky rules for document-scroll consumers; teleported
  overlays don't chain scroll to `main` (not an ancestor), so Dialog's body
  lock simply becomes a no-op here.
- Overlays live on `<body>` via `<Teleport>` (`Backdrop`; the sidebar's mobile
  drawer). The sidebar is **one `<aside>`** whose Teleport is `:disabled` on
  desktop; crossing the breakpoint (util's reactive `isMobile`, mirrors `md`)
  reparents it, which resets CSS transitions — resize never plays the
  open/close animation. Stacking is declared in SCSS — the drawer on the
  `sidebar` rung, its Backdrop (`layer="sidebar"`) one step under.
  **A faded-out scrim must also stop taking presses**, and `visibility` alone
  does not do it: it interpolates as a step that stays `visible` for the whole
  transition and flips only at the end — which is exactly what makes a fade-out
  a fade rather than a disappearance, and also what left a full-viewport
  `inset: 0` element hit-testable at 3% opacity, 190ms after it was dismissed.
  Every press on the page went to it in that window. `pointer-events: none` on
  the base and `auto` on `.isVisible` fixes it, because `pointer-events` carries
  no transition and so drops on the frame the close begins. Measured, not
  reasoned: a mouse click in that window was lost too, so it is not a touch bug.

## Workflow

- Components are built **one at a time**, starting with **Button**; the user
  decides what's next.
- **No tests** — the user verifies manually via the demo app. Demo files are
  **one per component**, named `<ComponentName>Demo.vue`
  (`src/pages/demo/components/TableDemo.vue`) — no grouped/thematic demo files.
- **The demo app is a mini docs site.** A landing/index page (`src/pages/home`,
  route `/`) promotes the library — hero, feature grid, and the components
  listed by category — and is the sidebar's first item. Every component also has
  its **own page** at `/components/:slug` (`src/pages/components`): one generic
  `ComponentPage.vue` driven by `registry.ts` (name, slug, category,
  description, a lucide icon, and the component's existing `*Demo.vue` **reused**
  as the live example — one source, no duplication), with prev/next paging over
  the registry order. Data-driven, not 26 page files. The all-in-one page moved
  from `/` to **`/demo`** ("All components"), otherwise unchanged. `DemoSidebar`
  is rebuilt from the registry: a "Get started" group (Overview + a **Playground**
  disclosure over All components / Web components — this is the surviving
  nested-`items` example) then one flat `SidebarGroup` per category. The old
  action-menu example was **dropped** from the sidebar (still fully documented in
  sidebar-group's README) — the sidebar is now real nav, not a feature demo.
  Added a `mono` **font token** (`design.font(mono)`, a system stack, no
  `@font-face` so nothing to load) for the code snippets on these pages.
- **Done so far:** design (tokens, reset, `layout()`), button, icon, spinner,
  util, backdrop, sidebar, header (header is layout only — its content API
  comes later), sidebar-group, input, label, textarea, checkbox, switch,
  radio-group, slider, popover, select, combobox, accordion, breadcrumb, tabs,
  alert, toast, progress, badge, separator, card, avatar, tooltip,
  dropdown-menu, dialog, custom-web-components, table, pagination, data-table,
  scroll-area, calendar, date-picker, chart, button-group.
  **Not on the docs site** (no `*Demo.vue`, no registry entry, README only):
  icon, label, popover, backdrop, sidebar, sidebar-group, header. The last four
  are demonstrated *by the app shell itself*, and Popover by everything built on
  it — but a consumer installing one of those packages has nothing to look at.
  `DialogDemo` carries the one **overlay-inside-overlay** example (a `Select`
  with `layer="modal"`), because that combination is where the stacking prop
  stops being theoretical.
- `custom-web-components` is the **one compiled package** (all others ship raw
  `.vue`); it exports **components** (`Button`) plus `util` (`defineElement`)
  — the consumer turns a component into a **shadow-DOM**
  element and names the tag (`customElements.define('ss-button',
  defineElement(Button))`), self-contained (styles injected into each shadow
  root). Each ported component is one re-export file
  `src/components/<name>.ts`, mirrored as a vite lib entry and a
  `package.json` export (the dist filename keeps the entry name). All build
  magic is one plugin — `plugin.ts` exports `shadowElements()`
  returning `[pre plugin, vue({ customElement: true })]`; its `config` hook
  contributes the alias/define/scss/external config, so `vite.config.ts` holds
  only the lib entries. `<style module>` is rejected in plugin-vue's shadow-DOM
  build, so two build-time moves reconcile it with **no component changes**:
  (1) the `pre` plugin's transform strips the `module` attribute — rebuilding
  each opening tag from the parsed SFC descriptor's attrs (no regex over the
  file; `vue/compiler-sfc`) — shadow DOM isolates class names, so plain
  unhashed names are safe and plugin-vue injects them; (2) a `vue` alias
  to `src/vue-shim.ts` makes `useCssModule()` an identity map so `$style.x` →
  `'x'` matches those plain names. **Vue is a peer dep (external)** — only the
  shim's deep `vue/dist/…` import is external, never bare `vue`, else Rollup
  externalizes it before the alias can route it to the shim.
  `process.env.NODE_ENV` is inlined to `production`. `additionalData` (not
  per-block injection) carries the `:host` dark selector so `reset.scss?inline`
  is covered by the same Sass config. The plugin is deliberately **not
  exported** from the package yet. `public/` (copied verbatim into `dist` by
  the build, lib mode included) holds a **standalone preview** — plain HTML, no
  Vue on the page, served by `npm run preview` (`vite build && vite preview`,
  since the page only reaches `dist` via a build). It's the no-bundler consumer
  story verbatim: an **import map** points the externalized
  `vue/dist/vue.runtime.esm-bundler.js` at a CDN `vue.runtime.esm-browser.prod.js`
  — the bundler build reads `process.env.NODE_ENV`, which a raw browser lacks.
  Its `public/globals.css` duplicates the app's dark token values (the preview
  has no app to inherit them from); both copies go away with the token tool.
  The page's own theme toggle is an `<ss-button>` — clicks are composed and
  bubble out of the shadow root. The page defines tags by looping the barrel —
  `ss-` + lowercased export name
  (`Button` → `ss-button`; a multi-word export would give `ss-dropdownmenu`,
  no kebab transform). The global `reset.scss`
  can't reach a shadow root (inner controls would get UA button styling), so
  `defineElement` injects `@surstromming/design/reset.scss?inline` (the same
  reset the app uses — now `@font-face`-free, so safe per element) as the
  **first** shadow style; the component's styles follow and win where set,
  while `ghost`/`link` (no explicit background/color) keep the reset's
  transparent/`inherit`. The
  **demo lives in the app** (`src/pages/webcomponents`, route `/webcomponents`);
  the app's Vite marks `<ss-*>` as custom elements (`isCustomElement`). It's
  the one package the app consumes from `dist` (its `exports` point there), so
  the root `vite.config.ts` pre-builds it on `command === 'build'` via
  `execSync` — `vue-tsc` is unaffected (its `types` resolve to `src/`); dev
  needs a one-time manual package build. Dark: token *values*
  inherit across the shadow boundary from `<html data-theme>`, so elements
  follow the page theme with no extra wiring; the dark-*gated* component rules
  compile to `:host([data-theme='dark'])` (build swaps `design.$darkThemeSelector`,
  a `!default` var, via Sass `additionalData`) and match only when the consumer
  sets `data-theme="dark"` on the element itself — the escape hatch to force a
  theme per component.
- `SidebarGroup` is the sidebar's content API: a `label` plus `items`, dropped
  into `<Sidebar>` (which stays layout-only and knows nothing about it). Nested
  nav and a per-item action menu both want the row's trailing control and so
  can't coexist — **the data names which**, a tagged union
  (`submenu: { type: 'items' | 'menu', entries }`), never two fields the
  consumer could set at once. `type: 'menu'` reuses `DropdownMenu`'s own item
  type, so separators/`destructive` come free. Two emits keep the intents
  apart: `select(value)` navigates, `action(item, action)` names *whose* menu
  fired. **Fully controlled:** `active` *and* `expanded` are item data — the
  component holds no open/closed state; the chevron emits `toggle(value)` and
  the app flips the flag (started as `v-model:expanded` plus an `exclusive`
  prop, replaced because per-item data is one shape for all row state, and
  policy belongs where the state lives: one-at-a-time is the app holding a
  single `openSection` value, several is a list — not a component prop).
  Nothing auto-opens from `active`. The demo builds `items` in a `computed`
  over `route.path` (values are route paths) and `openSection` — the package
  never touches the router. The app's shared `select` handler is `go`
  (`src/router/index.ts`): resolves the value, navigates on a match, logs
  otherwise (the router's dev warn flags typo'd paths).
  A row with `href` renders `<a>`, else `<button>`; the click handler
  is RouterLink's contract — plain clicks `preventDefault` + emit, modified
  ones fall through to the browser, and middle-click never arrives (it fires
  `auxclick`). Faking that on a `<button>` via `auxclick`+`window.open` was
  rejected: it buys one affordance and lies about context menu, Cmd+click, URL
  preview and the a11y tree. The collapsed nested list is `inert` — clipped
  rows stay tabbable otherwise.
- **Neither `Accordion` nor `Button` is reused by `SidebarGroup`**, deliberately.
  Accordion renders its own text-only trigger whose whole surface toggles; a
  sidebar row navigates while only the chevron expands, only *some* items
  collapse, and its styling can't be reached from outside (CSS Modules hash the
  classes — only the root class falls through). Button paints from
  `accent`, not `sidebar-accent`, centers its content, and has no `active`
  variant. Both would need sidebar-shaped variants added to a general
  component. What's shared is the *pattern*, not the code: the collapse is ~12
  local lines, and Button's `as` prop is the precedent for `<a>`-or-`<button>`.
- `Dialog` folds shadcn's AlertDialog in as `role="alertdialog"`; dismissal
  (✕/Escape/outside) follows `role`, never a boolean prop — an absent boolean
  prop is `false`, not `undefined`, so it can't carry a role-dependent default.
  It focus-traps, locks body scroll, and returns focus to the opener on close.
  The overlay is teleported to `<body>`, so its z-index is an **inline
  `:style`, not `v-bind()`** — same trap as Popover: the v-bind custom property
  lands on the component root, never reaches the teleported node, and z-index
  resolves to `auto` (the scrim then paints over the panel). Sits on the `modal`
  layer (70); its Backdrop at `modal − 1` covers the sidebar and header. The
  panel is `tabindex="-1"` so it can take focus itself when it holds nothing
  focusable (an alertdialog whose actions haven't rendered) — otherwise focus
  stayed outside and neither Escape nor the Tab trap ever fired. The body-scroll
  lock is **counted, not a boolean**: a dialog opened from inside another one
  handed the page's scroll back the moment *it* closed, and releasing now
  restores the page's own inline `overflow` rather than blanking it.
  Initial focus honours **`autofocus`** inside the panel before falling back to
  the first focusable — which is the ✕, so `Enter` on a freshly opened dialog
  dismissed it instead of answering it, and a consumer could not override it (a
  parent watcher on `open` loses the race to the dialog's own). On close, focus
  returns to the opener **a macrotask later**: the browser runs a keydown's
  default action — activating the focused element — after the microtask flush
  the close happens in, so a synchronous return put the opener under that
  activation and Enter-to-confirm clicked it and reopened the dialog. Real
  mouse click behind it only; a synthetic `.click()` never focuses the button,
  which is how a scripted check misses it. The body's slot
  content sits in a **`div.content` with `spacing(1)` of padding**, and `.body`
  takes the same back off its margin: a scroller clips at its own padding edge
  and a full-width field ends exactly there, so `design.field`'s 3px ring was
  shaved flat on both sides. The room has to be *inside* the scroller — a
  negative margin on `.body` alone would push the content out of the box doing
  the clipping.
- `useImageStatus(srcRef)` (avatar) preloads a src off-DOM and reports
  idle/loading/loaded/error, so the image shows only once ready — a broken src
  never flashes. Exported for reuse.
- **Form-control pattern:** style a *real* native input — keep it in the DOM,
  make it invisible on top of the drawn control (`checkbox`, `switch`,
  `radio-group`), or paint it directly (`input`, `textarea`, `slider`). Clicks,
  keyboard, form submission and the a11y tree stay the browser's; only the
  paint is ours. `inheritAttrs: false` + `v-bind="$attrs"` puts `id`/`aria-*`
  on that inner input, so a `Label`'s `for` lands on the right element.
- `Popover` (outside-click/Escape dismissal) is the
  shared shell under `Select`, `Combobox` and `DropdownMenu`; the data-driven
  ones keep focus on the trigger. Every one of them **forwards `layer`** —
  `Select`, `Combobox`, `DatePicker`, `DropdownMenu`, `SidebarGroup` — because
  the default `popover` rung (30) is wrong in exactly one place and it's a
  common one: inside a `Dialog` (70) the panel opens *behind* the dialog. The
  prop is the fix (`layer="modal"`), not a heuristic — a component can't know
  what it was mounted inside, and guessing from the DOM would be a lie the one
  time it guessed wrong.
  **An open panel owns Escape**, and that takes the **capture phase**: Dialog
  listens for Escape on its own panel, a `Select` trigger sits inside that
  panel, so one press closed the list *and* the dialog behind it (measured, not
  reasoned). Popover's `keydown` is registered with `capture: true` and
  `stopPropagation`s, so it runs before the event reaches anything below. The
  same is **deliberately not done for `mousedown`**: an outside press on a
  dialog's own overlay still dismisses both, and buying the same rule there
  would mean swallowing `mousedown` page-wide while a popover is open — which
  is where sliders and drag handles start their gestures. A key nobody drags
  with is safe to claim; a press is not. It **teleports its panel to `<body>` and
  positions it `fixed`** from the trigger's measured rect — so no ancestor's
  `overflow` clips it (a menu opens cleanly out of the scrolling sidebar). The
  rect is re-measured on scroll (capture-phase, since any ancestor scrolling
  moves the trigger) and resize; `side` (`top | bottom | right | left`) picks
  the edge, `align` runs along it. **All four sides exist** because not flipping
  is a policy about what the panel does once placed, not a reason to leave a
  consumer unable to *say* `top` — a trigger at the foot of the screen (a Select
  in a composer) otherwise has its panel cut off with nowhere to send it, and
  `top` is `bottom`'s mirror with no new policy: same clamped alignment axis,
  same unclamped anchor axis, the panel's own height putting its lower edge
  against the trigger. `Select` forwards it, exactly like `layer`.
  The `spacing(1)` gap stays a margin so the token stays in CSS, but only
  `margin-top`/`margin-left` can move the panel: it is `fixed` at
  `top: 0; left: 0` and shifted by `transform`, so with `bottom`/`right` left
  `auto` the browser absorbs the end margins into solving for those edges and
  they move nothing — which is why `side: left` shipped flush against its
  trigger (measured 0.5px) until `top` was added and the same reasoning caught
  it. Both buy the gap with a **negative** start margin.
  Consequences the teleport forces: outside-click
  now tests the trigger *or* the panel (no longer nested); `z-index` is an
  inline style, not `v-bind()` (the panel doesn't descend from the trigger that
  carries the custom property); and `side: bottom`/`top` copy the trigger width
  to the panel's `min-width` in JS (CSS `100%` would resolve against the
  viewport).
  Placement lives in **`useAnchoredPosition`** (popover's `src/composables/`),
  leaving the component with dismissal and the template. It **shifts, never
  flips**, and only along the axis the *alignment* runs on (clamped to an 8px
  viewport margin) — `align: end` on a trigger near the left edge otherwise put
  a menu's left edge at `-63px`. The **other axis is deliberately unclamped**:
  it tracks the trigger, and clamping it pinned the panel to the top of the
  screen — floating over the header — while the trigger scrolled away beneath
  it. The panel is **clipped** (`clip-path: inset(…)`) at the edges of the area
  its trigger is visible in, so it slides *under* the app chrome as you scroll
  rather than over it — a menu painting on the header is otherwise unavoidable
  (popover 30 > header 20 on the ladder). Not `visibility: hidden`: a panel that
  blinks out mid-scroll reads as a glitch, one that slides behind the header
  reads as depth. That area is the viewport narrowed by the trigger's **scrolling
  ancestors, each only on the axis it actually scrolls** — the viewport alone
  isn't enough (a trigger sliding behind the sticky header is still inside it),
  but both axes is too much: `main` scrolls vertically and its left edge is the
  sidebar, so a leftward menu got cut off there. Per-axis gives both — under the
  header, still out over the sidebar. The clipping chain is collected once on open
  (only its rects are re-read per scroll — `getComputedStyle` is too heavy for
  that), and the `clip-path` is omitted entirely when nothing needs cutting,
  since it would otherwise make a containing block on every open popover. The
  scroll handler writes the position **straight to the element** rather than
  through a reactive `:style`: a render tick late reads as the panel lagging and
  snapping back. One frame of lag remains and is inherent — scroll events fire
  after the browser has painted the scroll — and only CSS anchor positioning
  would remove it. Clamping needs the panel's own size (a
  right/bottom edge only becomes a left/top once you know how wide it is),
  measured on open inside `nextTick` so the clamped position is the first one
  painted, and kept fresh by a `ResizeObserver`. That measurement is also why
  the panel is parked at the viewport's origin and moved by **`transform`, never
  by `top`/`left`**: an inset offset is *also* the room a shrink-to-fit box has
  left to grow into, so a panel placed 374px along a 430px viewport measured
  56px wide — which moved it left, which let it grow, which moved it again. The
  `ResizeObserver` walked that loop a frame at a time and it read as the menu
  sliding out from under its trigger; from the origin the width is settled
  before the position is applied. The cost is that the panel makes a containing
  block, which is only a problem for a `position: fixed` descendant — every
  nested overlay teleports out instead.

  **Pinch-zoom is its own coordinate system, and this is where two releases went
  wrong.** Zoom splits the viewport in two: the **layout** viewport keeps the
  size the page was laid out at, and the **visual** viewport is the smaller
  window the reader looks through and pans around inside it. Three facts, and
  only the third is intuitive: `window.innerWidth`/`innerHeight` report the
  *visual* viewport; WebKit reports `getBoundingClientRect()` against the
  *visual* viewport too; and a `position: fixed` element is placed against the
  **layout** one. So a measured rect and a written position are in different
  spaces on Safari, and `visualOffset()` (util) is the one line that reconciles
  them — `visualViewport.offsetLeft`/`offsetTop`, added to every rect on the way
  in, under the same capability probe `@floating-ui/dom` uses
  (`CSS.supports('-webkit-backdrop-filter', 'none')`, false in Blink since it
  dropped the alias — **not** UA sniffing). Without it a menu is drawn
  `offsetLeft` away from its trigger: hundreds of pixels to the left, or off
  screen entirely once someone has panned right to reach a trailing control,
  which reads as a ⋯ that highlights and does nothing. 0.1.2 moved the *bounds*
  off `innerWidth` and onto `document.documentElement` and changed nothing,
  because the bound was never the half that was wrong.

  The bounds stay the **layout** viewport (`layoutViewport()`), and clamping
  against the *visible* part instead was tried and reverted the same day. It
  looks right — keep the panel where the reader is looking — and it makes the
  panel chase them: the visible box moves with every pan, so the clamp re-answers
  and the panel slides out from under its trigger and crawls along the screen
  edge, 168px off it. Keeping a panel inside the *page* is a layout question
  whose answer holds still, which is the same reason the anchor-tracking axis is
  unclamped. `visualViewport`'s `resize` and `scroll` are still tracked — a pinch
  fires them when `window` fires neither — because on WebKit both halves of the
  conversion move together and a rect read mid-gesture has to re-converge.

  All of that — the rects, the space, the bounds, the listeners, the overlay's
  own size — is **`useAnchored` in util**, which Popover and Tooltip now share.
  What is *not* shared is the policy: each passes in a `place` function, and
  those stay opposite (below). They were two copies of one mechanism with two
  different bugs in it. Both also start from **`onMounted`**, not only from the
  `open` watcher: handed `open: true` at mount there's no change to react to,
  and an unmeasured panel has no position at all — it landed in the body's flow,
  unstacked.
- `Tooltip` teleports its tip to `<body>` too, for the same reason and with the
  opposite placement rule. Left `position: absolute` inside the trigger's own
  box it was clipped by any `overflow` ancestor — and **every page here scrolls
  through a `ScrollArea`**, so a `side: top` tip on a trigger near the top of one
  was cut away *entirely* (measured: tip at y 25–53, viewport starting at 53).
  Its `useAnchoredTip` (tooltip's own `src/composables/`, ~90 lines) **flips
  where Popover shifts**: `side` is a preference, and a tip that won't fit moves
  to the opposite edge — but only if *that* one fits, else flipping just moves
  the problem. The cross axis is then clamped 8px inside the viewport. The split
  is deliberate: a popover is a surface you work in, so it stays on the side it
  was asked for and slides under the chrome; a tip is a label, and a label
  off-screen is no label. It's **not** clipped like Popover's panel — on the
  ladder's top rung (`tooltip`, 90) it is supposed to paint over the header.
  It does not reuse `useAnchoredPosition` — that one has no `top` side, and its
  clip-path chain is the behaviour a tooltip specifically must not have. What it
  reuses is everything *under* both: `useAnchored`. The split is mechanism from
  policy, and the reason to draw it there is that the mechanism is where the
  hard-won cross-browser knowledge lives — fixing pinch-zoom in one copy and not
  the other is exactly what happened before the extraction.
  It shows on hover, but on focus **only while the trigger matches
  `:focus-visible`**. `Dialog` hands focus back to the control that opened it,
  so a tooltipped opener clicked with the mouse got a tip on the hand-back that
  nothing could dismiss — the pointer is wherever that dialog's ✕ was, so no
  `mouseleave` is ever coming for the trigger. Letting the browser's own answer
  decide means the tip appears exactly when the focus ring does; it's the same
  predicate SidebarGroup's hover-reveal already leans on. Found by NanosecEditor.
- `SidebarGroup`'s action menu passes `side` opposite the sidebar (`left`
  sidebar → menu opens `right`, toward the content; the flip is also what RTL
  will want) and `layer: 'menu'` — above the sidebar's rung, because the mobile
  drawer is teleported too and a lower menu would render behind it. The `…`
  trigger's hover-reveal can no longer use `:focus-within` (the menu it opens
  is teleported away): it's `:hover`/`:focus-visible` on the trigger plus an
  `isOpen` class the trigger slot exposes.
- `Table` is presentational and data-driven: `columns` (`{ key, header, align? }`)
  + `rows` (records), `#cell-<key>` scoped slots as the escape hatch, attrs on
  the `<table>` (`inheritAttrs: false`) while the wrapper — a `ScrollArea` on
  `orientation="horizontal"`, the package's one dependency besides design —
  stays private. `#head-<key>` slots mirror the cell slots (string `header`
  stays the default), and paint-only `selectedKeys` tints rows by
  `row[rowKey]` — both exist for `DataTable`; Table itself holds no state and
  has no sorting or `<tfoot>`.
- `DataTable` is pure composition: paint in `Table`, page controls in
  `Pagination`, checkboxes in `Checkbox`; it owns only state + wiring. Three
  models, each optional to bind (`defineModel` keeps local state otherwise):
  `sort` (`{ key, direction } | null`, two-state asc⇄desc toggle),
  `page` (display-clamped, not written back), `selected` (raw `row[rowKey]`
  values, survives sort/page). Client-side only — server-side consumers
  compose Table + Pagination themselves; no filtering (filter `rows` before
  passing). Sorting: numbers numeric, else `localeCompare`, nullish last;
  resets page to 1. Selection column key `__select` is reserved; header
  checkbox toggles the current page and shows Checkbox's `indeterminate` dash
  when only some of that page is selected.
  Consumer `#cell-<key>` slots are forwarded to Table; `head-*` is not.
- `ScrollArea` hides the native scrollbar (`scrollbar-width: none`) and paints
  its own: a step arrow at each end (press-and-hold repeats), a rounded thumb,
  and a track that pages. It behaves like a **browser** bar, not a phone's
  overlay — **present whenever there's overflow and then it stays**. Because
  it's permanent, it takes a **track of its own** instead of covering the last
  18px of every row, and the bar paints no background of its own — so it reads
  correctly on any surface (sidebar, popover, dialog). No overflow → no bar and
  no gutter. The old
  fading behaviour lives on as **`autoHide`** (default `false`, replacing the
  inverted `alwaysVisible`): the bar floats over the content, fades out when
  idle and returns on drag/scroll — and on **hover, from a mouse or a pen but
  never a finger**. That last word is load-bearing. iOS fires `pointerenter` for
  a touch, on every tap, and taking it for a hover flipped an idle bar visible
  *during* the gesture: `.isHidden` drops `pointer-events: none`, so a
  full-height strip appeared over the content between the finger going down and
  coming up. WebKit re-hit-tests at `touchend` to synthesize the click, found
  the layer under the finger had changed, and declined — no `mousedown`, no
  `mouseup`, no `click`. **Every** button inside the scroller went dead while
  the same component outside it worked, on phones only, and intermittently (a
  bar already up because you'd just scrolled left nothing to change). It cost a
  consuming app a day of bisecting to find, because it presents as one broken
  menu rather than as a scroller bug. A touch scroller still shows its bar while
  it *scrolls*, which is the whole of what an overlay bar is for.
  It's the one mode that drops the gutter
  (a bar that comes and goes can't reserve space without the layout jumping) and
  the one that gets a `background` wash, since only then does it cover content. Only the paint is ours — the viewport is a real scroll
  container, so wheel/keyboard/`scrollIntoView` are untouched; the bar is
  `aria-hidden` with `tabindex="-1"` arrows rather than exposing the same
  scrolling twice. Drawn from four measured numbers (scroll offset, viewport,
  content, track **length** — the composable is axis-generic) kept fresh by a
  `ResizeObserver` on the viewport, **its first child** and the track. The
  carets are an **inline `<svg>` triangle, not `Icon`** —
  a stroked lucide chevron reads as a link affordance at this size and there's no
  solid caret in the set, so the package doesn't depend on `@surstromming/icon`;
  corners round by stroking the path in its own colour with
  `stroke-linejoin: round`, and that colour must be **opaque** (fill and stroke
  overlap, so alpha compounds into a dark rim). The component
  brings no height: the consumer's `class` (root fallthrough) sets it — and must
  leave `display` alone, since the root's **grid** is what places the bars
  (`1fr auto / 1fr auto`; `viewport { min-width: 0; min-height: 0 }` is what
  makes it work from a `max-height` as well as a fixed height — `height: 100%`
  can't resolve against an auto-height parent).
- **`orientation` (`both | vertical | horizontal`, default `both`)** picks the
  axes, and the one bar became a private **`ScrollBar.vue`** the area renders
  once per painted axis (`axis` prop; it owns its metrics and its
  drag/step/page). **Both axes by default** because presence is already the
  rule — a bar exists only while its own axis overflows, so `both` costs
  nothing where nothing overflows, and the prop's job is to **forbid** an axis
  (clip it), not to ask for a bar. No consumer in the repo passes it any more —
  Table and the home page's code card are auto-height, so their vertical bar has
  nothing to appear for — and the demo keeps one `vertical` example to show what
  naming an axis is *for* (the same wide row, cut off instead of scrolled). The
  viewport's
  `overflow` is a `.orientation-*` class stating **both** axes — leaving one
  `visible` makes the browser promote it to `auto`, and an axis that scrolls
  without a bar of ours scrolls behind the hidden native one. Each bar sits in a
  **grid track** (`1/2` and `2/1`), which is what leaves the corner empty and
  what replaced the `padding-right` gutter: padding sits at the *end* of the
  content, so it keeps the last row clear of a bottom bar but lets every row
  before it scroll underneath — a track shortens the viewport itself. A bar with
  nothing to scroll **collapses across** (`width: 0` / `height: 0`) rather than
  unmounting: the grid gives the space straight back while the track stays
  measurable, which is what removed the old `watch(scrollable) → nextTick →
  observe()` dance. An `autoHide` bar leaves the grid (`position: absolute`) and
  floats. `overscroll-behavior` is per-axis and gated on that axis really
  scrolling (the bars emit `scrollable` up for it) — `contain` on a dead axis
  still swallows the wheel instead of letting an ancestor use it.
- **The app scrolls through `ScrollArea`, not the browser.** Every page root is
  `<ScrollArea as="main">` (the `as` prop mirrors Button's) with the old `.page`
  styles on an inner `div`, so padding and `max-width` stay *inside* the
  scroller. `Popover`, `Sidebar` and `Dialog` scroll through it too — **always,
  not behind a prop**: a boolean every consumer would set to `true` is noise,
  and all three are vertical-only scrollers, so there's nothing the native bar
  would still be needed for. Since `orientation` exists, the sideways ones went
  the same way — **`Table`'s wrapper *is* a `ScrollArea` on `horizontal`** (its
  `overflow-x: auto` div is gone, so `DataTable` inherits it), as is the home
  page's code card. Nothing in the app scrolls behind a native bar any more.
  Started as an opt-in `scrollArea` prop on the
  three plus four forwarders; that was seven props saying the same thing and was
  dropped. Only the consumer's **content** is wrapped, never their chrome (a
  dialog's header, ✕ and footer stay put). There's **no wrapper element**: each
  host puts its own class straight on the `ScrollArea` (Popover's `.panel`,
  Dialog's `.body`, Sidebar's `.content`), because the root is already the
  column those classes used to create — so they shrank to what's actually
  theirs (surface, max-height, width). Two consequences: Popover's `panel` ref
  is a **component** ref, so the element for the outside-click test comes off
  `$el`; and its `position: fixed` moved into the inline `panelStyle`, since as
  a class it would race ScrollArea's own `position: relative` on the same
  element and cross-package rule order isn't worth betting placement on.
  `overscroll-behavior: contain` is scoped to the scrollable state — on a
  viewport with nothing to scroll it still eats the wheel instead of letting an
  ancestor use it, which is what once made the sidebar look frozen. The one escape hatch is also not a prop: under
  **`forced-colors`** ScrollArea hides its painted bar and restores the native
  one — forced colors replaces the tokens the bar is drawn from, and the OS
  scrollbar is what the user asked for.
- **ScrollArea as a web component** would need two fixes first (not done): the
  `ResizeObserver` on `viewport.firstElementChild` goes deaf, because in a
  shadow root that child is the `<slot>` — measured: slotted content grew
  100→400px, `scrollHeight` tracked it, the slot's observer never fired and its
  rect stays `0` (observe `assignedElements()` and re-bind on `slotchange`); and
  the host needs `:host { display: block }` + `.root { height: 100% }`, since a
  custom element is `display: inline` and the component brings no height. `as`
  is meaningless there (the shell grid targets `#app > main`).
- `Calendar` is a month grid, no date library — `Intl.DateTimeFormat` for month
  and weekday names, plain `Date` at local midnight. Day cells and the paging
  chevrons **reuse `Button`** (`primary` selected / `ghost` otherwise, `size:
  icon`); today is an inset ring, since the fill already means "selected".
  Always six rows so the grid keeps one height and a popover never resizes while
  paging. Days from the neighbouring months render as **muted spans, not
  buttons** — context, not targets, and it keeps the month at ~30 tab stops.
  `v-model:month` is bindable but setting `v-model` pages to that month (a
  selection you can't see isn't one). `DatePicker` is pure composition —
  `Button` trigger (outline, full width, left-aligned: it reads as a field) +
  `Popover` + `Calendar`, closing on select. **No typed entry**: a date you can
  type is an `Input` with parsing and its own error state, i.e. a second input
  model in one component. Popover's panel `max-height` went `spacing(72)` →
  `spacing(96)` so a month grid fits without an inner scrollbar.
- `Chart` is one data-driven SVG component (`type: line | area | bar`, `data`,
  `series`, `xKey`) — no charting library. Zero is always in range; y ticks snap
  to a "nice" step (1/2/5 × a power of ten); x labels thin out rather than
  overlap; hit targets are one full-height transparent rect per row, so the
  tooltip appears anywhere over the column. Markers only on the hovered point.
  **Palette:** `chart-1…5` assigned in order and never cycled (a filter must not
  repaint the survivors); past five, the consumer passes `color`. SVG attributes
  can't call a Sass function, so `.root` declares `--series-1…5` from the tokens
  and the marks read them back as `var()`. The neutral grayscale `chart-*` values
  were **replaced with a validated categorical set** (light in `colors.scss`,
  dark chosen against the dark surface in `public/globals.css` — not flipped):
  each step inside the lightness band, over the chroma floor, ≥ 3:1 on the
  surface, every adjacent pair surviving simulated deuteranopia. Re-validate
  before re-picking any of them. Deliberately absent: a second y axis, stacking,
  pie, curve smoothing.
- `ButtonGroup` joins buttons into one control (inner corners squared, the
  shared edge drawn once via a `-1px` margin, `z-index: 1` on hover/focus so a
  ring isn't half-covered). It's the **one slot-driven exception** to the
  data-driven rule: what goes in a group isn't a list of one shape — a Button,
  then a `DropdownMenu` trigger, then maybe a `Select` — and an `items` array
  would only take the first. It holds no state and does **not** depend on
  `@surstromming/button`: CSS Modules hash Button's classes, so the group
  reaches its children as **elements** (`> *`), and one level deeper
  (`> * > :is(button, a)`) because a child isn't always the button itself —
  `DropdownMenu` hands over `Popover`'s measuring wrapper. Every rule is written
  with **both** root classes (`.root.orientation-horizontal > *`): a single
  class only *ties* with Button's own `border-radius`, and a tie is settled by
  whichever package's CSS was injected last. Deliberately absent: shadcn's
  `ButtonGroupText`/`ButtonGroupSeparator` (a `<span>` and the existing
  `Separator`) and any selected state — that's `Tabs` or a toggle group.
- `Pagination` **reuses `Button`** (`ghost` pages/chevrons, `outline` current,
  all `size="icon"`) — unlike the sidebar rows, pagination is exactly Button's
  existing paint. Plain `v-model` (1-based page) + `pageCount`; `≤ 1` renders
  nothing. Fixed windowing (ends always visible, one sibling per side, ≤ 7
  slots, no `siblingCount` prop); buttons only, no `href` mode; no clamping —
  ends are `disabled`, the consumer owns the state.
- `design.field` (field.scss) is the shared **surface** of a text-entry control
  — border, background, focus ring, `aria-invalid`, disabled, dark. Input,
  Textarea and the Select/Combobox triggers `@include` it; metrics (height,
  padding, font) stay with each component. A mixin, not `@extend`/CSS vars: it's
  explicit at the call site and doesn't relocate rules in the cascade.
- Animate a collapse with **`grid-template-rows: 0fr → 1fr`** plus
  `overflow: hidden` on the inner element (Accordion) — real height, no JS
  measuring. Animate progress by **translating** a full-width bar, not by
  animating `width` (compositor, no layout per frame).
- Roving `tabindex` for a list of same-purpose controls (Tabs): the active one
  is `0`, the rest `-1`, arrows move within — one Tab stop for the whole set.
  One `useId()` names the pair (`aria-controls` on every tab, `aria-labelledby`
  back on the single panel), and the panel is `tabindex="0"` — a panel holding
  only text is otherwise unreachable from the tab it belongs to. The ref array
  is trimmed to `tabs.length` on every set, so a shrinking list leaves no
  unmounted buttons for the arrow keys to land on.
- **Reopening is not a state change.** `Select` reveals its active option with
  an explicit call in the `open` watcher, not by leaning on the
  `watch(activeIndex)` that scrolls it: reopening on the same choice doesn't
  change the index, so nothing fired and a selection far down a long list opened
  off screen.
- **Alert stays, Toast leaves.** `Toaster` is presentational (renders the array
  it's given, each toast owns its dismiss timer); the queue is a Pinia store in
  the app (`src/stores/toasts.ts`), mounted once in `App.vue`. The timer
  **pauses on hover/focus and resumes with what was left of it** — reading a
  toast shouldn't be a race against it, and reaching for the ✕ must not make it
  vanish first. Tracking the remainder (not just restarting) is what stops a
  pointer crossing the stack from granting a fresh countdown each time.
- Component READMEs are full references (props table, fallthrough contract,
  anatomy, tokens, a11y, recipes) — see button's. For a new component, the
  README is written first as a spec and reviewed before implementation.
- **404:** the router ends with a catch-all (`/:pathMatch(.*)*` →
  `src/pages/notfound`, sidebar like every other page) that renders a 404 page
  linking back to `/`. Because the catch-all matches everything,
  `go` tests the resolved route's **name** against it instead of
  `matched.length` (non-route values still just log). Server side,
  `vercel.json` rewrites `/(.*)` → `/` so a deep link reaches the SPA instead
  of Vercel's own 404. That `vercel.json` isn't committed — the deploy
  workflow writes it right before `vercel build` (the only thing that reads
  it), pinning what the dashboard would otherwise guess: `framework: vite`,
  `npm install` (workspaces), `npm run build`, `dist`, plus the rewrite.
- **Deploy:** `.github/workflows/vercel.yml` (every push to `master`, plus
  manual dispatch for a redeploy with no commit behind it) uses the Vercel
  prebuilt flow — `vercel link --project <package.json name>` → `pull` →
  `build --prod` → `deploy --prebuilt --prod`, then `remove --safe` for old
  deployments. `vercel build` runs the install itself (no `npm ci` step);
  needs the `VERCEL_TOKEN` secret.
- **Publishing:** every package under `packages/` is published to npm under the
  `@surstromming` scope, each **versioned independently** — they're independent
  packages, so a change in one is no reason to reprint the other 40; the repo
  root stays `private`. Licence is **MIT** — a `LICENSE` file sits at the root *and* in
  each package, because npm's tarball only carries what's in the package
  directory and MIT requires the text to travel with the copy. Each manifest
  carries `license`, `author`, `repository` (with `directory`), `homepage`,
  `bugs`, `keywords`, `files` and — the one that actually blocks a first
  publish — `publishConfig.access: "public"`, since a scoped package is
  restricted (paid) by default. `files: ["src"]` everywhere: packages ship raw
  source, so there is nothing to build. `custom-web-components` is the
  exception — `["dist/**/*.js", "src"]` (its `exports.*.types` point into
  `src/`, so `src` must ship too, and the glob keeps the `public/` preview page
  and its `globals.css` out of the tarball) plus a `prepublishOnly` build.
- Internal deps are **`^<version>`, never `*`** — `*` resolves to whatever is
  latest on the registry at install time. **Version bumps are done on request,
  never automated** (a `set-version` script existed briefly and was removed —
  the user asks when a bump is wanted). Only the **affected** packages move —
  the ones whose own source changed — and a small change is a **patch**
  (`0.1.0 → 0.1.1`), not a minor. **A bump writes the package's
  `CHANGELOG.md`** — one per package, like the version it documents, newest
  version first, and **anything that might break a consumer gets its own
  section** saying what and what to do instead. npm does *not* auto-include it
  (only `package.json`, README and LICENSE ride along), so `files` has to list
  it: `["src", "CHANGELOG.md"]`. A dependent moves only if it *needs* the new
  version: `^0.1.0` already accepts `0.1.1`, so the range is left alone unless
  the code now uses something the old version doesn't have (Table asks for
  `scroll-area@^0.1.1` because it passes `orientation`; Popover/Sidebar/Dialog
  stayed on `^0.1.0`). A range that does move has to move **with** the version
  it points at — `npm version --workspaces` writes versions only, so on its own
  it leaves a fresh `table@0.1.1` asking npm for a `scroll-area` that predates
  the prop it uses. Then `npm install`, so the lockfile's `packages/*` entries
  follow — it pins the old version otherwise.
  First bump: **scroll-area + table → 0.1.1** (2026-07-24, `orientation`).
  Second: **popover → 0.1.1** (2026-07-26, the `transform` placement fix). Its
  five dependents — select, combobox, dropdown-menu, date-picker, sidebar-group
  — were bumped to `0.1.1` too **on request**, against the "only what changed"
  rule: `^0.1.0` already accepts the fix, so nothing forced it. The point was to
  make the fix the *floor* rather than a lucky resolution — each range moved to
  `^0.1.1` (sidebar-group's `dropdown-menu` with it), so a consumer with an old
  lockfile gets the fixed popover instead of the panel sliding into place. Their
  own source is untouched and each changelog says so.
  Third: **dropdown-menu → 0.1.2** (2026-07-26, `preventScroll` on the focus
  handed back to the trigger). Its one dependent, sidebar-group, moved to
  `0.1.2` with it on the same "make the fix the floor" reasoning.
  Fourth: **popover → 0.1.2 and tooltip → 0.1.1** (2026-07-26, placing against
  the layout viewport rather than the visual one). Popover's five dependents
  moved with it again — select, combobox, date-picker to `0.1.2`, dropdown-menu
  and sidebar-group to `0.1.3` — and tooltip has none.
  Fifth: **util → 0.1.1, popover → 0.1.3, tooltip → 0.1.2** (2026-07-26, the
  real pinch-zoom fix and the `useAnchored` extraction that carries it). util is
  additive, so only the two packages that use the new export ask for `^0.1.1`;
  everything else stays on `^0.1.0`. Popover's dependents moved again — select,
  combobox, date-picker to `0.1.3`, dropdown-menu and sidebar-group to `0.1.4`.
  **design → 0.1.1** rides along (`touch-action: manipulation` in the reset).
  **Held back from npm** at the user's request until the fix is confirmed on a
  real iPhone; YMusic links the whole of `packages/*` through an npm
  `workspaces` entry meanwhile — which does work across repos, with a plain
  relative path (`../surstromming/packages/*`).
  Sixth, in the same batch: **scroll-area → 0.1.2** (a touch read as a hover,
  which killed every tap inside an `autoHide` scroller — see ScrollArea above).
  Its four dependents moved with it — dialog `0.1.1`, sidebar `0.1.1`, table
  `0.1.2`, popover `0.1.4` — and popover's five moved again behind it.
  Seventh: **backdrop → 0.1.1** (2026-07-26, the scrim swallowing presses while
  it fades out); its two dependents moved with it — dialog `0.1.2`, sidebar
  `0.1.2`.
  Eighth: **popover → 0.1.5** (2026-08-04, an open panel owns `Escape`) and
  **select / combobox / date-picker → 0.1.5** (the `layer` prop). A new prop is
  a **patch** here, following `scroll-area@0.1.1`'s `orientation` — additive, so
  nothing to break. Popover's other two dependents moved on the "make the fix
  the floor" rule again: dropdown-menu and sidebar-group → `0.1.6`.
  Ninth: **dialog → 0.1.4** (2026-08-16, three in one: the body scroller
  shaving focus rings; `autofocus` choosing where focus lands; and focus
  returning to the opener a macrotask after close, because returning it
  synchronously put the opener under the closing keydown's own activation and
  the dialog reopened). All found by a consumer (NanosecEditor); no dependent
  to carry along.
  Tenth: **design → 0.1.2** (2026-08-16, `layout()` places a `footer` child —
  a full-width status-bar row in both modes, collapsing to nothing when
  absent). Additive; nothing else moves.
  Both published 2026-08-16.
  Eleventh: **tooltip → 0.1.3** (2026-08-16, a tip raised by a dialog handing
  focus back that nothing could then dismiss — the focus path is gated on
  `:focus-visible`). Found by NanosecEditor as well; tooltip has no dependents,
  so nothing moves behind it. Published 2026-08-16.
  Twelfth: **popover → 0.1.6 and select → 0.1.6** (2026-08-21, `side: 'top'`,
  plus the gap `side: 'left'` never had). A new value on an existing prop is a
  patch here, like `scroll-area@0.1.1`'s `orientation`. Select's range moves to
  `^0.1.6` **with** the version — `top` is a value the older popover doesn't
  know — while popover's other four dependents stay on `^0.1.5`: `caret`-ranges
  already accept the new one, `DropdownMenuSide` is a plain alias of
  `PopoverSide` so it widens on its own, and nothing there needed a floor.
  `SelectDemo` gained an "Opens upward" field — the demo of a prop that only
  looks like a no-op until the viewport runs out.
  The earlier **"held back from npm"** note is spent — the registry is level
  with the repo, so `npm view <pkg> version` is the check before any bump.
  `npm run release` / `release:dry` must run **from the repo root** — invoked
  from inside a package directory, npm silently scopes them to that one
  package. They publish **every** workspace, though, which independent versions
  outgrew: npm refuses a version that's already on the registry, so a release
  now names what moved — `npm publish -w @surstromming/scroll-area -w
  @surstromming/table`.

## Data-driven components (the Vue way)

Components **take data and render UI from it**; consumers pass arrays/objects,
not walls of nested markup. Slots are the escape hatch, not the primary API.

## Component API rules

- Props via `withDefaults(defineProps<{…}>(), {…})`. Variants/sizes are string
  literal unions (declared in `index.ts`).
- Two-way state uses `defineModel()`.
- **No `"default"` prop values.** A value literally named `default` conveys
  nothing. Use descriptive names — sizes `sm | md | lg`, variants
  `solid | ghost`, sides `top | right | bottom | left` — so the default is
  self-describing.
- Let `class`, `@click`, `aria-*` **fall through** to the root (default
  `inheritAttrs: true`). To target an inner element instead, set
  `defineOptions({ inheritAttrs: false })` and `v-bind="$attrs"` there. This is
  **required** whenever the root can be a fragment / teleport / multi-node
  component.
- **One wrapper differs, not the content → don't duplicate the slot.** When two
  render paths share the same children and only the wrapping element differs,
  select the wrapper with a dynamic `<component :is="wrapper.is"
  v-bind="wrapper.props">` driven by a `computed` returning `{ is, props }`,
  and write the shared children (`<slot />`) exactly once. When even the
  element is the same and only its *location* differs, keep one element and
  move it with `<Teleport :disabled>` (the sidebar).
- **No logic-heavy expressions in templates.** Lift ternaries/`&&` chains into
  named `computed` vars and bind each attribute explicitly
  (`:type="buttonType" :disabled="nativeDisabled"`). Prefer explicit bindings
  over `v-bind="obj"` — they read more clearly. Templates should be plain
  bindings, not expressions.
- Keep it simple and readable. Accessibility is nice-to-have, not required —
  prefer the simplest correct markup (add obvious roles/labels when free).
- **Comments:** short and meaningful — explain a non-obvious *why*, never
  narrate *what* the code plainly does. Most lines need no comment. Write like a
  human reviewer would, not like a tutorial.

## State & communication

**`provide`/`inject` is prohibited.** Instead:

- Hold state in the stateful component via `defineModel()` and pass it down
  as **props** (e.g. `CollapsibleContent :open`) or a **scoped slot**
  (`<Collapsible v-slot="{ open, toggle }">`).
- Send intent **up** with `emit` (`DropdownMenuItem`'s `select`); coordinate
  siblings with event delegation where it's simpler (the menu closes on any
  menuitem click).
- Collapse a tiny compound into **one component** when the parts only exist to
  share state (`Avatar`, `Tooltip`, `DropdownMenu`).
- Extract logic into a **composable** in the package's own
  `src/composables/` (`avatar`'s `useImageStatus`, `dialog`'s `useModalFocus`,
  `scroll-area`'s `useScrollMetrics`, `chart`'s `useChartGeometry`,
  `tooltip`'s `useAnchoredTip`). It earns
  its own file when it's *shared*, or when it's a self-contained slab the
  component doesn't otherwise care about — a focus trap, the geometry that turns
  rows into coordinates. The split to aim for is **data vs pointer**: Chart
  keeps its hover layer and hands the scales out; ScrollArea keeps drag/step/page
  and hands the four measured numbers out. A composable used by **more than one
  package** lives in `@surstromming/util` instead (`useResizeObserver`, which
  Chart and ScrollArea share) — don't put a single-consumer one there.
- Genuinely app-wide state lives in a **Pinia store in the app**
  (`src/stores/sidebar.ts` holds the sidebar's `open`/`toggle`); packages stay
  presentational and take it via props/`defineModel()`.
