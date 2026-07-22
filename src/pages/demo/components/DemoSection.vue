<template>
  <section :class="$style.root">
    <h2 :class="$style.title">{{ title }}</h2>
    <div :class="$style.body">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{ title: string }>();
</script>

<style module lang="scss">
@use '@surstromming/design' as design;

.root {
  display: flex;
  flex-direction: column;
  gap: design.spacing(3);
}

.title {
  font-size: 1rem;
  font-weight: 600;
  color: design.color(muted-foreground);
}

.body {
  display: flex;
  flex-wrap: wrap;
  gap: design.spacing(3);
}
</style>
