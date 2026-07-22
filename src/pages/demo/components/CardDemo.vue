<template>
  <DemoSection title="Card">
    <Card
      :class="$style.card"
      title="Create project"
      description="Deploy your new project in one click."
    >
      <Input v-model="name" placeholder="Project name" />
      <template #footer>
        <Button variant="outline">Cancel</Button>
        <Button>Deploy</Button>
      </template>
    </Card>
  </DemoSection>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@surstromming/button";
import { Card } from "@surstromming/card";
import { Input } from "@surstromming/input";
import DemoSection from "./DemoSection.vue";

const name = ref("");
</script>

<style module lang="scss">
@use '@surstromming/design' as design;

.card {
  width: design.spacing(80);
}
</style>
