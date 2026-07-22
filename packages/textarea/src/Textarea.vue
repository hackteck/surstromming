<template>
  <textarea :class="$style.root" :value="model" @input="onInput" />
</template>

<script setup lang="ts">
const model = defineModel<string>()

const onInput = (event: Event) => {
  model.value = (event.target as HTMLTextAreaElement).value
}
</script>

<style module lang="scss">
@use '@surstromming/design' as design;

.root {
  @include design.field;

  width: 100%;
  min-width: 0;
  min-height: design.spacing(16);
  padding: design.spacing(2) design.spacing(3);
  font-size: 1rem; // under 16px iOS Safari zooms the viewport on focus
  field-sizing: content; // grows with what's typed; ignored where unsupported
  resize: vertical; // horizontal resizing breaks the layout it sits in

  @include design.screen(md) {
    font-size: 0.875rem;
  }

  &::placeholder {
    color: design.color(muted-foreground);
  }
}
</style>
