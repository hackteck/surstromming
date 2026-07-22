<template>
  <DemoSection title="Spinner">
    <Spinner />
    <Spinner :size="28" />
    <Button disabled><Spinner /> Saving…</Button>
  </DemoSection>
</template>

<script setup lang="ts">
import { Button } from "@surstromming/button";
import { Spinner } from "@surstromming/spinner";
import DemoSection from "./DemoSection.vue";
</script>
