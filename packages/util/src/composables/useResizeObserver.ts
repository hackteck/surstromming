import { onBeforeUnmount, onMounted } from 'vue'

/**
 * Watch one or more elements for size changes, for as long as the component
 * lives. Targets come from a getter, not a plain array, because the elements
 * usually don't exist yet at setup — they're template refs filled on mount, or
 * children that only appear once there's something to show.
 *
 * `observe()` is returned for the second case: call it again after the set of
 * targets changes.
 */
export const useResizeObserver = (
  targets: () => (Element | null | undefined)[],
  onResize: () => void,
) => {
  let observer: ResizeObserver | undefined

  const observe = () => {
    if (!observer) return
    observer.disconnect()
    for (const target of targets()) {
      if (target) observer.observe(target)
    }
  }

  onMounted(() => {
    observer = new ResizeObserver(onResize)
    observe()
    onResize() // the first measurement, before anything has resized
  })

  onBeforeUnmount(() => observer?.disconnect())

  return { observe }
}
