<template>
  <DemoSection title="Tooltip">
    <Tooltip content="Add to library">
      <Button variant="outline" size="icon" aria-label="Add"><Icon :icon="Plus" /></Button>
    </Tooltip>
    <Tooltip content="Shown below, after a beat" side="bottom">
      <Button variant="outline">Hover me</Button>
    </Tooltip>
  </DemoSection>
</template>

<script setup lang="ts">
import { Plus } from "lucide";
import { Button } from "@surstromming/button";
import { Icon } from "@surstromming/icon";
import { Tooltip } from "@surstromming/tooltip";
import DemoSection from "./DemoSection.vue";
</script>
