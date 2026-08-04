# surströmming

A shadcn-style component library for **Vue 3**, styled with **SCSS + CSS Modules** — no Tailwind, no CSS-in-JS.

Every component is its own npm package under the `@surstromming/` scope; install only what you use.

```ts
import { Button } from '@surstromming/button'
```

🌐 **Demo:** https://surstromming.vercel.app/

---

## ⚠️ Read Before Use

Congratulations.

If you looked at a repository called **Surströmming** and thought:

> "Yeah, this seems like a reasonable dependency."

That's entirely on you.

This UI kit was built for my own projects because none of the existing libraries fit my workflow.

The fact that it's public on GitHub **doesn't** magically make it a stable library.

You should expect that I might:

- break APIs because I found a better design;
- rename things without warning;
- rewrite entire components from scratch;
- ignore semantic versioning whenever it gets in my way;
- merge, reject, rewrite, or accidentally obliterate your pull request.

Issues, ideas, and pull requests are always welcome. They just don't come with any guarantee that I'll follow them.

Version numbers are decorative.  
Breaking changes are a lifestyle.  
Stability is a rumor.

If it works for you — awesome.

If not... well, at least the name was honest.

---

## Requirements

Packages ship **raw source** (`.vue`, `.ts`, `.scss`) — your build compiles them. That keeps the packages thin but sets expectations for the consumer:

- **Vite** with `@vitejs/plugin-vue`
- **sass** installed
- **vue-tsc** for type checking (types come straight from the source)

Two Vite settings are **required**, not optional. Neither is needed inside this monorepo — workspace
symlinks are treated as source — so they only bite real consumers installing from npm:

```ts
// vite.config.ts
export default defineConfig({
  plugins: [vue()],
  css: {
    // Without this, `$style.menuButton` is silently undefined.
    modules: { localsConvention: 'camelCase' },
  },
  optimizeDeps: {
    // The packages ship raw .vue/.scss, which esbuild's dependency
    // pre-bundler cannot parse. List the ones you install.
    exclude: ['@surstromming/button', '@surstromming/design' /* … */],
  },
})
```

## Setup

Import the reset (and fonts, if you want the bundled Geist) once:

```ts
// main.ts
import '@surstromming/design/font-list.scss'
import '@surstromming/design/reset.scss'
```

## Theming

Components read design tokens through CSS custom properties with light-theme fallbacks baked in—an unthemed app renders light with zero setup.

To theme, override the properties on the root element under a `data-theme` attribute:

```css
[data-theme='dark'] {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  /* … */
}
```

See [`public/globals.css`](public/globals.css) for the full dark theme used by the demo. Component SCSS never hardcodes colors, spacing, or radii—everything runtime-themeable is exposed through CSS custom properties.

## Packages

| Package | What it is |
| --- | --- |
| `@surstromming/design` | Tokens, reset, app-shell layout — SCSS functions/mixins every component reads |
| `@surstromming/accordion` | Collapsible sections |
| `@surstromming/alert` | Callout for a message that stays on the page |
| `@surstromming/avatar` | A user's picture, with initials as a fallback |
| `@surstromming/backdrop` | Dimmed full-screen overlay behind drawers and dialogs |
| `@surstromming/badge` | Small status label |
| `@surstromming/breadcrumb` | Trail of links back up the hierarchy |
| `@surstromming/button` | Button with shadcn variants/sizes |
| `@surstromming/card` | A surface that groups related content |
| `@surstromming/checkbox` | Checkbox with a drawn box over a native input |
| `@surstromming/combobox` | Select with a search field |
| `@surstromming/custom-web-components` | Selected components compiled as framework-agnostic custom elements |
| `@surstromming/dialog` | Modal dialog, with an alert-dialog mode |
| `@surstromming/dropdown-menu` | A menu of actions anchored to a trigger |
| `@surstromming/header` | App-shell header bar |
| `@surstromming/icon` | Renders any Lucide icon as an inline SVG |
| `@surstromming/input` | Single-line text input with `v-model` |
| `@surstromming/label` | Caption for a form control |
| `@surstromming/popover` | Panel anchored under a trigger; closes on outside click and Escape |
| `@surstromming/progress` | Progress bar |
| `@surstromming/radio-group` | Pick one of several options |
| `@surstromming/select` | Pick one option from a list |
| `@surstromming/separator` | A thin rule between content |
| `@surstromming/sidebar` | Responsive sidebar: collapsible panel on desktop, drawer on mobile |
| `@surstromming/sidebar-group` | A labelled group of sidebar navigation, rendered from data |
| `@surstromming/slider` | Pick a number from a range |
| `@surstromming/spinner` | Spinning loading indicator |
| `@surstromming/switch` | On/off switch over a native checkbox |
| `@surstromming/tabs` | Switch between panels of content |
| `@surstromming/textarea` | Multi-line text input |
| `@surstromming/toast` | Transient messages stacked over the page |
| `@surstromming/tooltip` | A short label on hover or focus |
| `@surstromming/util` | Shared non-component helpers |

Each package's README contains a full reference: props, anatomy, design tokens, and usage recipes.

## Development

This is an npm workspaces monorepo. The demo app in [`src/`](src/) consumes the packages exactly as a real application would.

```sh
npm install
npm run dev      # demo app
npm run build    # type-check + build the demo
```

## License

[MIT](LICENSE) © Evgeniy Mnatsakanov