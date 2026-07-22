// Vue, re-exported — but with useCssModule() replaced by an identity map.
//
// The build strips the `module` attribute from every `<style>` block so
// plugin-vue's shadow-DOM mode accepts it; that also means the emitted class
// names are plain (`.root`, `.variant-primary`), not hashed. Shadow DOM
// isolates them per element, so plain is safe. The templates still read
// `$style.root`, so `$style` must map every key to itself.
//
// A bare specifier here would resolve back through the `vue` alias to this
// file — the deep path sidesteps the loop and is the same runtime instance.
export * from 'vue/dist/vue.runtime.esm-bundler.js'

export function useCssModule(): Record<string, string> {
  return new Proxy({}, { get: (_target, key) => key }) as Record<string, string>
}
