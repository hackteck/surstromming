import { computed, nextTick, ref, watch, type Ref } from 'vue'
import { useResizeObserver } from '@surstromming/util'

/** Shortest the thumb ever gets, so a very long page still has something to grab. */
const MIN_THUMB = 30

/**
 * The whole bar is drawn from four measured numbers — nothing here reads the
 * DOM lazily, so a render never depends on layout it hasn't asked for.
 *
 * Kept apart from the component because it's the half with no interaction in
 * it: give it the two elements and it reports geometry.
 */
export const useScrollMetrics = (
  viewport: Readonly<Ref<HTMLElement | null>>,
  track: Readonly<Ref<HTMLElement | null>>,
) => {
  const scrollTop = ref(0)
  const viewportHeight = ref(0)
  const contentHeight = ref(0)
  const trackHeight = ref(0)

  const measure = () => {
    const element = viewport.value
    if (!element) return
    scrollTop.value = element.scrollTop
    viewportHeight.value = element.clientHeight
    contentHeight.value = element.scrollHeight
    trackHeight.value = track.value?.clientHeight ?? 0
  }

  const scrollable = computed(() => contentHeight.value > viewportHeight.value + 1)
  const maxScroll = computed(() => Math.max(0, contentHeight.value - viewportHeight.value))

  const thumbHeight = computed(() => {
    const proportional = (viewportHeight.value / contentHeight.value) * trackHeight.value
    return Math.max(MIN_THUMB, Math.round(proportional))
  })

  /** Travel available to the thumb — the track minus the thumb itself. */
  const thumbTravel = computed(() => Math.max(0, trackHeight.value - thumbHeight.value))

  const thumbTop = computed(() =>
    maxScroll.value === 0 ? 0 : (scrollTop.value / maxScroll.value) * thumbTravel.value,
  )

  // Content that grows and a viewport that resizes both change the thumb. The
  // viewport's first child is what actually reports the content's height.
  const { observe } = useResizeObserver(
    () => [viewport.value, viewport.value?.firstElementChild],
    measure,
  )

  // The track only exists once the bar is shown, and its height is half the math.
  watch(scrollable, async () => {
    await nextTick()
    observe()
    measure()
  })

  return { measure, scrollable, maxScroll, thumbHeight, thumbTravel, thumbTop }
}
