import { readonly, ref } from 'vue'

/** True when running in a browser (false during SSR). */
export const isBrowser = typeof window !== 'undefined'

/** Mirrors the design `md` breakpoint — see $screens in screens.scss. */
export const MOBILE_BREAKPOINT = 768

const query = isBrowser
  ? window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT}px)`)
  : undefined

const matches = ref(!query?.matches)
query?.addEventListener('change', (event) => {
  matches.value = !event.matches;
})

/** Reactive: the viewport is narrower than the `md` breakpoint. */
export const isMobile = readonly(matches)

export { useResizeObserver } from './composables/useResizeObserver'
