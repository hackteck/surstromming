<template>
  <DemoSection title="Toast">
    <Button variant="outline" @click="saved">Show toast</Button>
    <Button variant="outline" @click="failed">Show error (sticky)</Button>
  </DemoSection>
</template>

<script setup lang="ts">
import { Button } from "@surstromming/button";
import { useToasts } from "@/stores/toasts";
import DemoSection from "./DemoSection.vue";

const toasts = useToasts();

const saved = () => {
  toasts.push({ title: "Saved", description: "Your changes are live." });
};

const failed = () => {
  toasts.push({
    title: "Upload failed",
    description: "The file is larger than 10 MB.",
    variant: "destructive",
    duration: 0,
  });
};
</script>
