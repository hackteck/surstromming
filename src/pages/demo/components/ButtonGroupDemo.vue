<template>
  <DemoSection title="ButtonGroup">
    <ButtonGroup aria-label="Text alignment">
      <Button variant="outline"><Icon :icon="AlignLeft" :size="16" /></Button>
      <Button variant="outline"><Icon :icon="AlignCenter" :size="16" /></Button>
      <Button variant="outline"><Icon :icon="AlignRight" :size="16" /></Button>
    </ButtonGroup>

    <ButtonGroup>
      <Button variant="outline">Copy</Button>
      <Button variant="outline">Paste</Button>
      <Button variant="outline">Cut</Button>
    </ButtonGroup>
  </DemoSection>

  <DemoSection title="ButtonGroup — split button">
    <ButtonGroup>
      <Button @click="save()">Save</Button>
      <DropdownMenu :items="saveOptions" align="end" @select="save">
        <template #trigger="{ toggle }">
          <Button aria-label="More save options" @click="toggle">
            <Icon :icon="ChevronDown" :size="16" />
          </Button>
        </template>
      </DropdownMenu>
    </ButtonGroup>

    <span :class="$style.state">{{ lastAction }}</span>
  </DemoSection>

  <DemoSection title="ButtonGroup — vertical">
    <ButtonGroup orientation="vertical">
      <Button variant="outline">Top</Button>
      <Button variant="outline">Middle</Button>
      <Button variant="outline">Bottom</Button>
    </ButtonGroup>
  </DemoSection>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { AlignCenter, AlignLeft, AlignRight, ChevronDown } from "lucide";
import { Button } from "@surstromming/button";
import { ButtonGroup } from "@surstromming/button-group";
import { DropdownMenu, type DropdownMenuItem } from "@surstromming/dropdown-menu";
import { Icon } from "@surstromming/icon";
import DemoSection from "./DemoSection.vue";

const lastAction = ref("Nothing saved yet.");

const saveOptions: DropdownMenuItem[] = [
  { label: "Save a copy", value: "copy" },
  { label: "Save as template", value: "template" },
  { separator: true },
  { label: "Discard", value: "discard", destructive: true },
];

const save = (value?: string) => {
  lastAction.value = value ? `Chose "${value}"` : "Saved";
};
</script>

<style module lang="scss">
@use '@surstromming/design' as design;

.state {
  align-self: center;
  color: design.color(muted-foreground);
  font-size: 0.875rem;
}
</style>
