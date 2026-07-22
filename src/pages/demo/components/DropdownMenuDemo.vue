<template>
  <DemoSection title="Dropdown menu">
    <DropdownMenu :items="menu" @select="onSelect">
      <template #trigger="{ open, toggle }">
        <Button variant="outline" aria-haspopup="menu" :aria-expanded="open" @click="toggle">
          Options
        </Button>
      </template>
    </DropdownMenu>
    <span :class="$style.state">last: {{ chosen || "—" }}</span>
  </DemoSection>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Copy, Pencil, Trash } from "lucide";
import { Button } from "@surstromming/button";
import { DropdownMenu, type DropdownMenuItem } from "@surstromming/dropdown-menu";
import DemoSection from "./DemoSection.vue";

const chosen = ref("");
const menu: DropdownMenuItem[] = [
  { label: "Edit", value: "edit", icon: Pencil },
  { label: "Duplicate", value: "duplicate", icon: Copy },
  { separator: true },
  { label: "Delete", value: "delete", icon: Trash, destructive: true },
];
const onSelect = (value: string) => {
  chosen.value = value;
};
</script>

<style module lang="scss">
@use '@surstromming/design' as design;

.state {
  color: design.color(muted-foreground);
  font-size: 0.875rem;
}
</style>
