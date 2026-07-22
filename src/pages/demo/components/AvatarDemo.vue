<template>
  <DemoSection title="Avatar">
    <Avatar src="https://i.pravatar.cc/100?img=12" alt="Ada Lovelace" />
    <Avatar alt="Grace Hopper" />
    <Avatar alt="Broken Image" src="https://example.com/nope.jpg" />
    <Avatar fallback="?" size="lg" />
    <Avatar alt="Small" size="sm" />
  </DemoSection>
</template>

<script setup lang="ts">
import { Avatar } from "@surstromming/avatar";
import DemoSection from "./DemoSection.vue";
</script>
