import { fileURLToPath, URL } from 'node:url'
import type { Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { parse } from 'vue/compiler-sfc'

const shim = fileURLToPath(new URL('./src/vue-shim.ts', import.meta.url))

// Everything the shadow-DOM build needs, in one place. plugin-vue rejects
// `<style module>` in customElement mode, so the transform strips the attribute
// — shadow DOM isolates class names per element, so plain unhashed names are
// safe — while the vue-shim alias makes `useCssModule()` an identity map so
// `$style.x` → 'x' matches them.
export function shadowElements(): Plugin[] {
  return [
    {
      name: 'surstromming:shadow-elements',
      enforce: 'pre',
      config: () => ({
        resolve: {
          // Route `vue` through the shim; the shim reaches the real runtime by
          // deep path so this exact-match alias doesn't loop.
          alias: [{ find: /^vue$/, replacement: shim }],
        },
        // Lib mode leaves process.env.NODE_ENV for the consumer's bundler;
        // these run straight in the browser, so inline it (Vue reads it at runtime).
        define: { 'process.env.NODE_ENV': '"production"' },
        css: {
          preprocessorOptions: {
            scss: {
              // Dark rules compile to `:host([data-theme='dark']) …` — an
              // ancestor selector can't reach <html> across the shadow
              // boundary; :host can, once trackTheme mirrors the attribute
              // onto the host.
              additionalData: `@use '@surstromming/design/config.scss' with ($darkThemeSelector: ':host([data-theme="dark"])');\n`,
            },
          },
        },
        build: {
          rollupOptions: {
            // Vue is a peer dependency, provided by the consumer. Only the
            // shim's deep runtime import is external — bare `vue` must NOT be,
            // or Rollup externalizes it before the alias can route it to the
            // shim. So match `vue/…` only.
            external: (id: string) => id.startsWith('vue/'),
          },
        },
      }),
      transform(code, id) {
        if (!id.endsWith('.vue')) return
        const { descriptor } = parse(code, { filename: id })
        const blocks = descriptor.styles.filter((block) => block.module)
        if (blocks.length === 0) return
        let out = code
        // Rebuild each opening tag from the parsed attrs, minus `module` — no
        // regex over the file. Reverse order keeps earlier offsets valid.
        for (const block of blocks.reverse()) {
          const contentStart = block.loc.start.offset
          const tagStart = out.lastIndexOf('<style', contentStart)
          const attrs = Object.entries(block.attrs)
            .filter(([name]) => name !== 'module')
            .map(([name, value]) => (value === true ? name : `${name}="${value}"`))
          out = out.slice(0, tagStart) + ['<style', ...attrs].join(' ') + '>' + out.slice(contentStart)
        }
        return { code: out, map: null }
      },
    },
    vue({ customElement: true }),
  ]
}
