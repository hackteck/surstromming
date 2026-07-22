<template>
  <DemoSection title="Slider">
    <DemoField>
      <Label for="volume">Volume — {{ volume }}%</Label>
      <Slider id="volume" v-model="volume" :step="5" />
    </DemoField>

    <DemoField>
      <Label for="muted-slider" disabled>Disabled</Label>
      <Slider id="muted-slider" :model-value="30" disabled />
    </DemoField>
  </DemoSection>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Label } from "@surstromming/label";
import { Slider } from "@surstromming/slider";
import DemoField from "./DemoField.vue";
import DemoSection from "./DemoSection.vue";

const volume = ref(40);
</script>
