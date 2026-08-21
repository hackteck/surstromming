<template>
  <DemoSection title="Select">
    <DemoField>
      <Label id="fruit-label">Fruit</Label>
      <Select v-model="fruit" :options="fruits" aria-labelledby="fruit-label" />
    </DemoField>

    <DemoField>
      <Label id="fruit-disabled-label" disabled>Disabled</Label>
      <Select :options="fruits" disabled aria-labelledby="fruit-disabled-label" />
    </DemoField>

    <DemoField>
      <Label id="fruit-top-label">Opens upward</Label>
      <Select
        v-model="fruitAbove"
        :options="fruits"
        side="top"
        aria-labelledby="fruit-top-label"
      />
    </DemoField>
  </DemoSection>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Label } from "@surstromming/label";
import { Select, type SelectOption } from "@surstromming/select";
import DemoField from "./DemoField.vue";
import DemoSection from "./DemoSection.vue";

const fruit = ref("");
const fruitAbove = ref("");
const fruits: SelectOption[] = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Blueberry", value: "blueberry" },
  { label: "Durian (sold out)", value: "durian", disabled: true },
  { label: "Grapes", value: "grapes" },
];
</script>
