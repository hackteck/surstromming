import { readonly, ref, watch, type Ref } from 'vue'

export type ImageStatus = 'idle' | 'loading' | 'loaded' | 'error'

// Loads the src off-DOM and reports where it got to, so a component can show a
// fallback until (and unless) the real image is ready. Re-runs when src changes.
export function useImageStatus(src: Ref<string | undefined>) {
  const status = ref<ImageStatus>('idle')

  watch(
    src,
    (value) => {
      if (!value) {
        status.value = 'idle'
        return
      }
      status.value = 'loading'
      const image = new Image()
      image.onload = () => {
        if (src.value === value) status.value = 'loaded'
      }
      image.onerror = () => {
        if (src.value === value) status.value = 'error'
      }
      image.src = value
    },
    { immediate: true },
  )

  return readonly(status)
}
