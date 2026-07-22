<template>
  <DemoSection title="DatePicker">
    <DemoField>
      <Label id="due-label">Due date</Label>
      <DatePicker v-model="due" aria-labelledby="due-label" />
    </DemoField>

    <DemoField>
      <Label id="ship-label">Ship date — from today, weekdays only</Label>
      <DatePicker
        v-model="ship"
        :min="today"
        :is-disabled="isWeekend"
        placeholder="Choose a weekday"
        aria-labelledby="ship-label"
      />
    </DemoField>

    <DemoField>
      <Label id="disabled-label" disabled>Disabled</Label>
      <DatePicker disabled aria-labelledby="disabled-label" />
    </DemoField>
  </DemoSection>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { DatePicker } from "@surstromming/date-picker";
import { Label } from "@surstromming/label";
import DemoField from "./DemoField.vue";
import DemoSection from "./DemoSection.vue";

const today = new Date();
const due = ref<Date | null>(null);
const ship = ref<Date | null>(null);

const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;
</script>
