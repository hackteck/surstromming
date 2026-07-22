<template>
  <DemoSection title="Textarea">
    <DemoField>
      <Label for="bio">Bio</Label>
      <Textarea id="bio" v-model="bio" rows="4" placeholder="Tell us about yourself" />
    </DemoField>

    <DemoField>
      <Label for="bio-invalid">Invalid</Label>
      <Textarea id="bio-invalid" aria-invalid="true" placeholder="Too short" />
    </DemoField>
  </DemoSection>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Label } from "@surstromming/label";
import { Textarea } from "@surstromming/textarea";
import DemoField from "./DemoField.vue";
import DemoSection from "./DemoSection.vue";

const bio = ref("");
</script>
