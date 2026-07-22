<template>
  <DemoSection title="Pagination">
    <Pagination v-model="page" :page-count="20" />
    <span :class="$style.state">page: {{ page }}</span>
  </DemoSection>

  <DemoSection title="Pagination — few pages">
    <Pagination v-model="smallPage" :page-count="5" />
  </DemoSection>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Pagination } from "@surstromming/pagination";
import DemoSection from "./DemoSection.vue";

const page = ref(1);
const smallPage = ref(2);
</script>

<style module lang="scss">
@use '@surstromming/design' as design;

.state {
  align-self: center;
  color: design.color(muted-foreground);
  font-size: 0.875rem;
}
</style>
