import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import { shadowElements } from './plugin'

// The one *compiled* package: everything else ships raw .vue source, but a
// custom-element consumer has no Vue/Sass pipeline, so we build for them —
// as self-contained shadow-DOM elements (styles injected into the shadow
// root). All the build magic lives in plugin.ts.
export default defineConfig({
  plugins: [shadowElements()],
  build: {
    lib: {
      // One entry per component, a barrel, and the element/theming utilities.
      entry: {
        index: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        button: fileURLToPath(new URL('./src/components/button.ts', import.meta.url)),
        input: fileURLToPath(new URL('./src/components/input.ts', import.meta.url)),
        util: fileURLToPath(new URL('./src/util.ts', import.meta.url)),
      },
      formats: ['es'],
    },
  },
})
