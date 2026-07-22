<template>
  <DemoSection title="Alert">
    <DemoField :class="$style.wide">
      <Alert :icon="Terminal" title="Heads up!">
        You can add components to your app using the CLI.
      </Alert>
    </DemoField>

    <DemoField :class="$style.wide">
      <Alert variant="destructive" :icon="CircleAlert" title="Payment failed">
        Your card was declined. Try another one.
      </Alert>
    </DemoField>
  </DemoSection>
</template>

<script setup lang="ts">
import { CircleAlert, Terminal } from "lucide";
import { Alert } from "@surstromming/alert";
import DemoField from "./DemoField.vue";
import DemoSection from "./DemoSection.vue";
</script>

<style module lang="scss">
@use '@surstromming/design' as design;

.wide {
  width: design.spacing(96);
}
</style>
