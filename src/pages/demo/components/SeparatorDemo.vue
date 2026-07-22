<template>
  <DemoSection title="Separator">
    <div :class="$style.sep">
      <span>Blog</span>
      <Separator orientation="vertical" />
      <span>Docs</span>
      <Separator orientation="vertical" />
      <span>Source</span>
    </div>
  </DemoSection>
</template>

<script setup lang="ts">
import { Separator } from "@surstromming/separator";
import DemoSection from "./DemoSection.vue";
</script>

<style module lang="scss">
@use '@surstromming/design' as design;

.sep {
  display: flex;
  align-items: center;
  gap: design.spacing(3);
  height: design.spacing(5);
  font-size: 0.875rem;
}
</style>
