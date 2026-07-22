// The shim imports Vue's runtime by deep path to dodge the `vue` alias loop
// (see vue-shim.ts). That path has no bundled types, so borrow `vue`'s — this
// is type-check only; at runtime the alias/deep-path resolution is what runs.
declare module 'vue/dist/vue.runtime.esm-bundler.js' {
  export * from 'vue'
}
