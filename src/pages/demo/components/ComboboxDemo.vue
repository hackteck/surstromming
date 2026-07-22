<template>
  <DemoSection title="Combobox">
    <DemoField>
      <Label id="framework-label">Framework</Label>
      <Combobox
        v-model="framework"
        :options="frameworks"
        placeholder="Pick a framework"
        aria-labelledby="framework-label"
      />
    </DemoField>

    <DemoField>
      <Label id="timezone-label">Time zone — a long list</Label>
      <Combobox
        v-model="timezone"
        :options="timezones"
        placeholder="Pick a time zone"
        aria-labelledby="timezone-label"
      />
    </DemoField>
  </DemoSection>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Combobox, type ComboboxOption } from "@surstromming/combobox";
import { Label } from "@surstromming/label";
import DemoField from "./DemoField.vue";
import DemoSection from "./DemoSection.vue";

const framework = ref("");
const frameworks: ComboboxOption[] = [
  { label: "Vue", value: "vue" },
  { label: "React", value: "react" },
  { label: "Svelte", value: "svelte" },
  { label: "Solid", value: "solid" },
  { label: "Angular (sold out)", value: "angular", disabled: true },
];

const timezone = ref("");
// Intl knows them all — a list long enough that the panel has to scroll.
const timezones: ComboboxOption[] = Intl.supportedValuesOf("timeZone").map(
  (zone) => ({ label: zone.replace(/_/g, " "), value: zone }),
);
</script>
