<template>
  <component
    :is="as"
    :class="classes"
    :type="buttonType"
    :disabled="nativeDisabled"
    :aria-disabled="ariaDisabled"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed, useCssModule } from 'vue'
import type { ButtonVariant, ButtonSize } from './index'

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariant
    size?: ButtonSize
    as?: string
    /** Native button type (ignored when `as` is not a button). */
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
  }>(),
  {
    variant: 'primary',
    size: 'md',
    as: 'button',
    type: 'button',
  },
)

const $style = useCssModule()
const classes = computed(() => [
  $style.root, 
  $style[`variant-${props.variant}`], 
  $style[`size-${props.size}`]
]);

// Native <button> takes `type`/`disabled`; other elements get `aria-disabled`.
const isNativeButton = computed(() => props.as === 'button')
const buttonType = computed(() => (isNativeButton.value ? props.type : undefined))
const nativeDisabled = computed(() => (isNativeButton.value && props.disabled) || undefined)
const ariaDisabled = computed(() => (!isNativeButton.value && props.disabled ? 'true' : undefined))
</script>

<style module lang="scss">
@use '@surstromming/design' as design;
@use 'css/button-variants';
@use 'css/button-sizes';

.root {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  gap: design.spacing(2);
  border-radius: design.radius(md);
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.25rem;
  white-space: nowrap;
  cursor: pointer;
  outline: none;
  transition:
    color 0.15s ease,
    background-color 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;

  // Each variant brings its own ring color (see button-variants.scss).
  &:focus-visible {
    border-color: design.color(ring);
  }

  &:disabled,
  &[aria-disabled='true'] {
    pointer-events: none;
    opacity: 0.5;
  }

  // 1rem, not the inherited 1em: at the button's 0.875rem font that would draw
  // 14px icons, half a pixel off every shadcn mock.
  svg {
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
    pointer-events: none;
  }
}
</style>
