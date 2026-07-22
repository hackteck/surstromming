<template>
  <DemoSection title="Badge">
    <Badge>New</Badge>
    <Badge variant="secondary">Draft</Badge>
    <Badge variant="destructive">Failed</Badge>
    <Badge variant="outline">v1.2.0</Badge>
    <Badge variant="ghost">Ghost</Badge>
    <Badge as="a" href="#" variant="link">View all</Badge>
  </DemoSection>
</template>

<script setup lang="ts">
import { Badge } from "@surstromming/badge";
import DemoSection from "./DemoSection.vue";
</script>
