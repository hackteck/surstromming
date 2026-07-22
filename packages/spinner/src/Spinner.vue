<template>
  <svg
    :class="$style.root"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2.5"
    role="status"
    aria-label="Loading"
  >
    <!-- Faint full ring behind the moving arc. -->
    <circle cx="12" cy="12" r="9" opacity="0.25" />
    <path d="M21 12a9 9 0 0 0-9-9" stroke-linecap="round" />
  </svg>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Width/height, in text-relative units by default so it scales with font-size. */
    size?: number | string
  }>(),
  { size: '1em' },
)
</script>

<style module lang="scss">
.root {
  display: inline-block;
  vertical-align: middle;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .root {
    animation: none;
  }
}
</style>
