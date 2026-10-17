<template>
  <DemoSection title="SortableList">
    <DemoField :class="$style.wide">
      <SortableList :items="rows" @select="shown = $event" @move="move">
        <template #trailing="{ item }">
          <Button variant="ghost" size="icon" :aria-label="`Remove ${item.label}`" @click="remove(item.value)">
            <Icon :icon="Trash2" :size="16" />
          </Button>
        </template>
      </SortableList>
      <p :class="$style.caption">
        Drag a row by its handle, or focus the handle and use the arrow keys. The
        list emits <code>move</code>; the order here is the demo's.
      </p>
      <Button variant="outline" size="sm" :class="$style.reset" @click="reset">Reset</Button>
    </DemoField>
  </DemoSection>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { Layers, Trash2 } from "lucide";
import { Button } from "@surstromming/button";
import { Icon } from "@surstromming/icon";
import { SortableList, type SortableListItem } from "@surstromming/sortable-list";
import DemoField from "./DemoField.vue";
import DemoSection from "./DemoSection.vue";

const FLOORS = ["Basement", "Ground floor", "First floor", "Second floor", "Attic"];

const floors = ref([...FLOORS]);
const shown = ref("Ground floor");

const rows = computed<SortableListItem[]>(() =>
  floors.value.map((name) => ({ value: name, label: name, icon: Layers, active: name === shown.value })),
);

function move(value: string, to: number) {
  const next = floors.value.filter((name) => name !== value);
  next.splice(to, 0, value);
  floors.value = next;
}

const remove = (value: string) => (floors.value = floors.value.filter((name) => name !== value));
const reset = () => (floors.value = [...FLOORS]);
</script>

<style module lang="scss">
@use '@surstromming/design' as design;

.wide {
  width: 100%;
  max-width: design.spacing(80);
}

.caption {
  color: design.color(muted-foreground);
  font-size: 0.875rem;
}

.reset {
  align-self: flex-start;
}
</style>
