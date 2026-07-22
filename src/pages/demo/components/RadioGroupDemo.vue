<template>
  <DemoSection title="Radio group">
    <DemoField>
      <Label id="plan-label">Plan</Label>
      <RadioGroup v-model="plan" :options="plans" aria-labelledby="plan-label" />
    </DemoField>

    <DemoField>
      <Label id="side-label">Horizontal</Label>
      <RadioGroup
        v-model="side"
        :options="sides"
        orientation="horizontal"
        aria-labelledby="side-label"
      />
    </DemoField>
  </DemoSection>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Label } from "@surstromming/label";
import { RadioGroup, type RadioOption } from "@surstromming/radio-group";
import DemoField from "./DemoField.vue";
import DemoSection from "./DemoSection.vue";

const plan = ref("pro");
const plans: RadioOption[] = [
  { label: "Free", value: "free" },
  { label: "Pro", value: "pro" },
  { label: "Enterprise (sold out)", value: "enterprise", disabled: true },
];

const side = ref("left");
const sides: RadioOption[] = [
  { label: "Left", value: "left" },
  { label: "Right", value: "right" },
];
</script>
