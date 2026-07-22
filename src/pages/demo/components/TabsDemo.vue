<template>
  <DemoSection title="Tabs">
    <DemoField :class="$style.wide">
      <Tabs v-model="tab" :tabs="tabs">
        <template #account>Make changes to your account here.</template>
        <template #password>Change your password here.</template>
      </Tabs>
    </DemoField>
  </DemoSection>

  <DemoSection title="Tabs — line">
    <DemoField :class="$style.wide">
      <Tabs v-model="tab2" :tabs="tabs" variant="line">
        <template #account>Line variant, underline indicator.</template>
        <template #password>Second panel.</template>
      </Tabs>
    </DemoField>
  </DemoSection>

  <DemoSection title="Tabs — vertical">
    <DemoField :class="$style.wide">
      <Tabs v-model="tab3" :tabs="tabs" orientation="vertical">
        <template #account>Vertical tabs, ↑/↓ to move.</template>
        <template #password>Second panel.</template>
      </Tabs>
    </DemoField>
  </DemoSection>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Tabs, type TabItem } from "@surstromming/tabs";
import DemoField from "./DemoField.vue";
import DemoSection from "./DemoSection.vue";

const tab = ref("account");
const tab2 = ref("account");
const tab3 = ref("account");
const tabs: TabItem[] = [
  { label: "Account", value: "account" },
  { label: "Password", value: "password" },
  { label: "Billing", value: "billing", disabled: true },
];
</script>

<style module lang="scss">
@use '@surstromming/design' as design;

.wide {
  width: design.spacing(96);
}
</style>
