<template>
  <DemoSection title="Switch">
    <Label for="airplane"><Switch id="airplane" v-model="airplane" /> Airplane mode</Label>
    <Label for="wifi" disabled><Switch id="wifi" disabled /> Disabled</Label>
    <span :class="$style.state">airplane: {{ airplane }}</span>
  </DemoSection>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Label } from "@surstromming/label";
import { Switch } from "@surstromming/switch";
import DemoSection from "./DemoSection.vue";

const airplane = ref(false);
</script>

<style module lang="scss">
@use '@surstromming/design' as design;

.state {
  color: design.color(muted-foreground);
  font-size: 0.875rem;
}
</style>
