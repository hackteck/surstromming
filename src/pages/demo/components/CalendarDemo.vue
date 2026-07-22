<template>
  <DemoSection title="Calendar">
    <DemoField :class="$style.wide">
      <Calendar v-model="day" :class="$style.card" />
      <p :class="$style.caption">{{ selected }}</p>
    </DemoField>

    <DemoField :class="$style.wide">
      <Calendar
        v-model="workday"
        :min="today"
        :is-disabled="isWeekend"
        week-starts-on="sunday"
        :class="$style.card"
      />
      <p :class="$style.caption">From today, weekdays only, weeks from Sunday.</p>
    </DemoField>
  </DemoSection>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { Calendar } from "@surstromming/calendar";
import DemoField from "./DemoField.vue";
import DemoSection from "./DemoSection.vue";

const today = new Date();
const day = ref<Date | null>(today);
const workday = ref<Date | null>(null);

const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;

const selected = computed(() =>
  day.value ? day.value.toDateString() : "Nothing selected.",
);
</script>

<style module lang="scss">
@use '@surstromming/design' as design;

.wide {
  width: auto;
}

.card {
  border: 1px solid design.color(border);
  border-radius: design.radius(lg);
  background-color: design.color(card);
}

.caption {
  margin: 0;
  color: design.color(muted-foreground);
  font-size: 0.875rem;
}
</style>
