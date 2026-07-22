<template>
  <DemoSection title="Progress">
    <DemoField>
      <Progress :value="progress" aria-label="Upload" />
      <div :class="$style.row">
        <Button size="sm" variant="outline" @click="progress = Math.max(0, progress - 10)">
          −10
        </Button>
        <Button size="sm" variant="outline" @click="progress = Math.min(100, progress + 10)">
          +10
        </Button>
        <span :class="$style.state">{{ progress }}%</span>
      </div>
    </DemoField>
  </DemoSection>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@surstromming/button";
import { Progress } from "@surstromming/progress";
import DemoField from "./DemoField.vue";
import DemoSection from "./DemoSection.vue";

const progress = ref(40);
</script>

<style module lang="scss">
@use '@surstromming/design' as design;

.row {
  display: flex;
  align-items: center;
  gap: design.spacing(2);
}

.state {
  color: design.color(muted-foreground);
  font-size: 0.875rem;
}
</style>
