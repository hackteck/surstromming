<template>
  <DemoSection title="Input">
    <DemoField>
      <Label for="email">Email</Label>
      <Input id="email" v-model="email" type="email" placeholder="you@example.com" />
    </DemoField>

    <DemoField>
      <Label for="broken">Invalid</Label>
      <Input id="broken" aria-invalid="true" aria-describedby="broken-error" />
      <p id="broken-error" :class="$style.error">Enter a valid email.</p>
    </DemoField>

    <DemoField>
      <Label for="plan" disabled>Disabled</Label>
      <Input id="plan" placeholder="Disabled" disabled />
    </DemoField>

    <DemoField>
      <Label for="avatar">Picture</Label>
      <Input id="avatar" type="file" />
    </DemoField>

    <DemoField>
      <Label for="search">Search with a button</Label>
      <div :class="$style.row">
        <Input id="search" v-model="query" type="search" placeholder="Search…" />
        <Button>Search</Button>
      </div>
    </DemoField>
  </DemoSection>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@surstromming/button";
import { Input } from "@surstromming/input";
import { Label } from "@surstromming/label";
import DemoField from "./DemoField.vue";
import DemoSection from "./DemoSection.vue";

const email = ref("");
const query = ref("");
</script>

<style module lang="scss">
@use '@surstromming/design' as design;

.row {
  display: flex;
  gap: design.spacing(2);
}

.error {
  color: design.color(destructive);
  font-size: 0.875rem;
}
</style>
