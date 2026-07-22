<template>
  <DemoSection title="Accordion">
    <DemoField :class="$style.wide">
      <Accordion v-model="open" :items="faq" multiple>
        <template #shipping>
          Ships in <strong>2–3 days</strong> — tracked, worldwide.
        </template>
      </Accordion>
    </DemoField>
  </DemoSection>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Accordion, type AccordionItem } from "@surstromming/accordion";
import DemoField from "./DemoField.vue";
import DemoSection from "./DemoSection.vue";

const open = ref(["refunds"]);
const faq: AccordionItem[] = [
  { title: "Is it refundable?", value: "refunds", content: "Yes, within 30 days." },
  { title: "How fast is shipping?", value: "shipping" },
  { title: "Do you ship to Antarctica?", value: "antarctica", disabled: true },
];
</script>

<style module lang="scss">
@use '@surstromming/design' as design;

.wide {
  width: design.spacing(96);
}
</style>
