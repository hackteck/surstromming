<template>
  <input ref="input" :class="classes" :type="type" :value="inputValue" @input="onInput" />
</template>

<script setup lang="ts">
import { computed, useCssModule, useTemplateRef } from 'vue'
import type { InputSize, InputType } from './index'

const props = withDefaults(
  defineProps<{
    type?: InputType
    size?: InputSize
  }>(),
  {
    type: 'text',
    size: 'md',
  },
)

const model = defineModel<string | number>()

// A file input's value can't be set programmatically — leave it uncontrolled.
const inputValue = computed(() => (props.type === 'file' ? undefined : model.value))

const onInput = (event: Event) => {
  if (props.type === 'file') return
  model.value = (event.target as HTMLInputElement).value
}

// So a parent (Combobox) can focus the field without reaching for its DOM node.
const input = useTemplateRef<HTMLInputElement>('input')
defineExpose({ focus: () => input.value?.focus() })

const $style = useCssModule()
const classes = computed(() => [$style.root, $style[`size-${props.size}`]])
</script>

<style module lang="scss">
@use '@surstromming/design' as design;
@use 'css/input-sizes';

.root {
  @include design.field;

  width: 100%;
  min-width: 0; // don't overflow a flex/grid track
  padding-block: design.spacing(1);
  font-size: 1rem; // under 16px iOS Safari zooms the viewport on focus

  @include design.screen(md) {
    font-size: 0.875rem;
  }

  &::placeholder {
    color: design.color(muted-foreground);
  }

  &::selection {
    background-color: design.color(primary);
    color: design.color(primary-foreground);
  }

  &::file-selector-button {
    display: inline-flex;
    height: design.spacing(7);
    border: none;
    background-color: transparent;
    color: design.color(foreground);
    font-size: 0.875rem;
    font-weight: 500;
  }

}
</style>
