<template>
  <span :class="classes">
    <img v-if="status === 'loaded'" :class="$style.image" :src="src" :alt="alt" />
    <span v-else :class="$style.fallback">{{ initials }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed, toRef, useCssModule } from 'vue'
import type { AvatarSize } from './index'
import { useImageStatus } from './composables/useImageStatus'

const props = withDefaults(
  defineProps<{
    src?: string
    alt?: string
    /** Shown until the image loads, and instead of it if loading fails. */
    fallback?: string
    size?: AvatarSize
  }>(),
  { size: 'md' },
)

// The image is only shown once it has actually loaded, so a broken or slow src
// never flashes a missing-image glyph — the fallback holds until then.
const status = useImageStatus(toRef(props, 'src'))

const initials = computed(() => {
  if (props.fallback) return props.fallback
  if (!props.alt) return ''
  return props.alt
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
})

const $style = useCssModule()
const classes = computed(() => [$style.root, $style[`size-${props.size}`]])
</script>

<style module lang="scss">
@use '@surstromming/design' as design;
@use 'css/avatar-sizes';

.root {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background-color: design.color(muted);
  color: design.color(muted-foreground);
  overflow: hidden;
  user-select: none;
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.fallback {
  font-weight: 500;
}
</style>
