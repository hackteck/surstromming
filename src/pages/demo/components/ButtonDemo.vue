<template>
  <DemoSection title="Button">
    <Button>Primary</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="destructive">Destructive</Button>
    <Button variant="outline">Outline</Button>
    <Button variant="ghost">Ghost</Button>
    <Button variant="link">Link</Button>
  </DemoSection>

  <DemoSection title="Button — sizes">
    <Button size="sm">Small</Button>
    <Button>Medium</Button>
    <Button size="lg">Large</Button>
    <Button size="icon" aria-label="Add"><Icon :icon="Plus" /></Button>
    <Button><Icon :icon="Mail" /> Login with Email</Button>
    <Button variant="outline" disabled>Disabled</Button>
    <Button as="a" href="https://github.com" variant="outline">As a link</Button>
  </DemoSection>
</template>

<script setup lang="ts">
import { Mail, Plus } from "lucide";
import { Button } from "@surstromming/button";
import { Icon } from "@surstromming/icon";
import DemoSection from "./DemoSection.vue";
</script>
