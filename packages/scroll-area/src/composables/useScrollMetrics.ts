import { computed, onBeforeUnmount, ref, watch, type Ref } from 'vue'
import { useResizeObserver } from '@surstromming/util'
import type { ScrollAxis } from '../index'

/** Shortest the thumb ever gets, so a very long page still has something to grab. */
const MIN_THUMB = 30

/**
 * The whole bar is drawn from four measured numbers — nothing here reads the
 * DOM lazily, so a render never depends on layout it hasn't asked for.
 *
 * Kept apart from the component because it's the half with no interaction in
 * it: give it the two elements and it reports geometry along one axis. Lengths
 * and offsets, not heights and tops — the same arithmetic runs sideways.
 */
export const useScrollMetrics = (
  viewport: Readonly<Ref<HTMLElement | null>>,
  track: Readonly<Ref<HTMLElement | null>>,
  axis: ScrollAxis,
) => {
  const horizontal = axis === 'horizontal'

  const scrollOffset = ref(0)
  const viewportLength = ref(0)
  const contentLength = ref(0)
  const trackLength = ref(0)

  const measure = () => {
    const element = viewport.value
    if (!element) return
    scrollOffset.value = horizontal ? element.scrollLeft : element.scrollTop
    viewportLength.value = horizontal ? element.clientWidth : element.clientHeight
    contentLength.value = horizontal ? element.scrollWidth : element.scrollHeight
    trackLength.value = (horizontal ? track.value?.clientWidth : track.value?.clientHeight) ?? 0
  }

  const scrollable = computed(() => contentLength.value > viewportLength.value + 1)
  const maxScroll = computed(() => Math.max(0, contentLength.value - viewportLength.value))

  const thumbLength = computed(() => {
    if (contentLength.value === 0) return MIN_THUMB // nothing measured yet
    const proportional = (viewportLength.value / contentLength.value) * trackLength.value
    return Math.max(MIN_THUMB, Math.round(proportional))
  })

  /** Travel available to the thumb — the track minus the thumb itself. */
  const thumbTravel = computed(() => Math.max(0, trackLength.value - thumbLength.value))

  const thumbOffset = computed(() =>
    maxScroll.value === 0 ? 0 : (scrollOffset.value / maxScroll.value) * thumbTravel.value,
  )

  // Content that grows, a viewport that resizes, and a track the other bar cuts
  // short all change the thumb. The viewport's first child is what actually
  // reports the content's size.
  const { observe } = useResizeObserver(
    () => [viewport.value, viewport.value?.firstElementChild, track.value],
    measure,
  )

  // The bar is handed its viewport, so the element arrives a render after the
  // component exists — everything that reads it starts from here.
  watch(
    viewport,
    (element, previous) => {
      previous?.removeEventListener('scroll', measure)
      element?.addEventListener('scroll', measure, { passive: true })
      observe()
      measure()
    },
    { immediate: true },
  )

  onBeforeUnmount(() => viewport.value?.removeEventListener('scroll', measure))

  return { measure, scrollable, maxScroll, thumbLength, thumbTravel, thumbOffset }
}
