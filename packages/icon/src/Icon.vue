<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    :width="size"
    :height="size"
    :stroke-width="strokeWidth"
    :aria-hidden="ariaHidden"
  >
    <component
      :is="tag"
      v-for="([tag, nodeAttrs], index) in icon"
      :key="index"
      v-bind="nodeAttrs"
    />
  </svg>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import type { IconNode } from './index'

withDefaults(
  defineProps<{
    /** A lucide icon (`import { Search } from 'lucide'`) or a custom IconNode. */
    icon: IconNode
    /** Width & height. Defaults to 1em, so the icon scales with the surrounding
     *  text. A number is treated as pixels; pass any CSS length to override. */
    size?: number | string
    /** Stroke width of the icon paths. */
    strokeWidth?: number | string
  }>(),
  { size: '1em', strokeWidth: 2 },
)

// Decorative by default; consumers providing aria-label/aria-hidden win.
const attrs = useAttrs()
const ariaHidden = computed(() =>
  'aria-label' in attrs || 'aria-hidden' in attrs ? undefined : 'true',
)
</script>
