<template>
  <span :class="$style.root">
    <input v-model="model" :class="$style.input" type="checkbox" role="switch" v-bind="$attrs" />
    <span :class="$style.track">
      <span :class="$style.thumb" />
    </span>
  </span>
</template>

<script setup lang="ts">
// The native input is the interactive element — id/aria/name belong on it.
defineOptions({ inheritAttrs: false })

const model = defineModel<boolean>()
</script>

<style module lang="scss">
@use '@surstromming/design' as design;

$track-width: design.spacing(8);
$track-height: design.spacing(5);
$thumb-size: design.spacing(4);

.root {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
  width: $track-width;
  height: $track-height;
}

// Kept real (not display:none) so clicks, focus and forms stay native;
// it sits on top of the drawn track and is simply invisible.
.input {
  position: absolute;
  inset: 0;
  z-index: 1;
  margin: 0;
  opacity: 0;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
  }
}

.track {
  display: flex;
  flex: 1;
  align-items: center;
  border: 1px solid transparent;
  border-radius: 9999px;
  background-color: design.color(input);
  padding: 2px;
  box-shadow: design.shadow(xs);
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;

  #{design.$darkThemeSelector} & {
    background-color: design.with-alpha(input, 80%);
  }
}

.thumb {
  width: $thumb-size;
  height: $thumb-size;
  border-radius: 9999px;
  background-color: design.color(background);
  transition: transform 0.15s ease;

  // On a dark surface `background` is near-black — the thumb would vanish
  // into the track. Both states get an explicit, contrasting fill.
  #{design.$darkThemeSelector} & {
    background-color: design.color(foreground);
  }
}

// Track width less the thumb, its 2px padding and the 1px border on each side.
.input:checked + .track {
  background-color: design.color(primary);

  .thumb {
    transform: translateX(calc(#{$track-width} - #{$thumb-size} - 6px));
  }

  #{design.$darkThemeSelector} & {
    background-color: design.color(primary);

    .thumb {
      background-color: design.color(primary-foreground);
    }
  }
}

.input:focus-visible + .track {
  border-color: design.color(ring);
  box-shadow: 0 0 0 3px design.with-alpha(ring, 50%);
}

// Same invalid treatment as Checkbox — a form shouldn't mark one control and
// leave the one beside it looking fine.
.input[aria-invalid='true'] + .track {
  border-color: design.color(destructive);
  box-shadow: 0 0 0 3px design.with-alpha(destructive, 20%);

  #{design.$darkThemeSelector} & {
    box-shadow: 0 0 0 3px design.with-alpha(destructive, 40%);
  }
}

.input:disabled + .track {
  opacity: 0.5;
}

@media (prefers-reduced-motion: reduce) {
  .thumb {
    transition: none;
  }
}
</style>
