<template>
  <DemoSection title="ScrollArea">
    <DemoField :class="$style.wide">
      <ScrollArea :class="$style.box">
        <p v-for="line in lines" :key="line" :class="$style.line">{{ line }}</p>
      </ScrollArea>
      <p :class="$style.caption">Content overflows — the bar is there, and stays.</p>
    </DemoField>

    <DemoField :class="$style.wide">
      <ScrollArea :class="$style.box">
        <p v-for="line in lines.slice(0, 3)" :key="line" :class="$style.line">{{ line }}</p>
      </ScrollArea>
      <p :class="$style.caption">Nothing to scroll — no bar, and no gutter either.</p>
    </DemoField>

    <DemoField :class="$style.wide">
      <ScrollArea auto-hide :class="$style.box">
        <p v-for="line in lines" :key="line" :class="$style.line">{{ line }}</p>
      </ScrollArea>
      <p :class="$style.caption">
        <code>autoHide</code> — floats over the content and fades out when idle.
        Hover or scroll it.
      </p>
    </DemoField>
  </DemoSection>

  <DemoSection title="ScrollArea — sideways">
    <DemoField :class="$style.wide">
      <ScrollArea :class="$style.strip">
        <div :class="$style.row">
          <div v-for="card in cards" :key="card" :class="$style.card">{{ card }}</div>
        </div>
      </ScrollArea>
      <p :class="$style.caption">
        Nothing passed — the content is wider than the box, so a bar shows up on
        the bottom edge.
      </p>
    </DemoField>

    <DemoField :class="$style.wide">
      <ScrollArea :class="$style.box">
        <div :class="$style.grid">
          <span v-for="cell in cells" :key="cell" :class="$style.cell">{{ cell }}</span>
        </div>
      </ScrollArea>
      <p :class="$style.caption">
        Both axes overflow — two bars, each stopping short of the corner the
        other takes.
      </p>
    </DemoField>

    <DemoField :class="$style.wide">
      <ScrollArea orientation="vertical" :class="$style.strip">
        <div :class="$style.row">
          <div v-for="card in cards" :key="card" :class="$style.card">{{ card }}</div>
        </div>
      </ScrollArea>
      <p :class="$style.caption">
        The same row under <code>orientation="vertical"</code> — cut off, not
        scrolled. Naming an axis is how you forbid the other one.
      </p>
    </DemoField>
  </DemoSection>

  <DemoSection title="ScrollArea — as the page">
    <DemoField :class="$style.note">
      <p :class="$style.caption">
        This page is one: every route root is
        <code>&lt;ScrollArea as="main"&gt;</code>, so the shell scrolls
        through the drawn bar instead of the browser's. It's the one on the
        right edge.
      </p>
    </DemoField>
  </DemoSection>

  <DemoSection title="ScrollArea — in a Popover">
    <DemoField>
      <Label id="zone-label">Time zone</Label>
      <Select v-model="zone" :options="zones" aria-labelledby="zone-label" />
    </DemoField>

    <DemoField :class="$style.note">
      <p :class="$style.caption">
        Every <code>Popover</code> panel scrolls this way — so
        <code>Select</code>, <code>Combobox</code>, <code>DropdownMenu</code>
        and <code>DatePicker</code> do too. There's no prop: it's what a panel
        is.
      </p>
    </DemoField>
  </DemoSection>

  <DemoSection title="ScrollArea — in a Dialog">
    <Button variant="outline" @click="termsOpen = true">Read the terms</Button>

    <Dialog
      v-model:open="termsOpen"
      title="Terms"
      description="Long enough that the body has to scroll."
    >
      <p v-for="line in lines" :key="line" :class="$style.line">{{ line }}</p>
      <template #footer>
        <Button variant="outline" @click="termsOpen = false">Decline</Button>
        <Button @click="termsOpen = false">Accept</Button>
      </template>
    </Dialog>

    <DemoField :class="$style.note">
      <p :class="$style.caption">
        Only the body scrolls — the title, the ✕ and the footer stay put.
      </p>
    </DemoField>
  </DemoSection>

</template>

<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@surstromming/button";
import { Dialog } from "@surstromming/dialog";
import { Label } from "@surstromming/label";
import { ScrollArea } from "@surstromming/scroll-area";
import { Select, type SelectOption } from "@surstromming/select";
import DemoField from "./DemoField.vue";
import DemoSection from "./DemoSection.vue";

const lines = Array.from({ length: 40 }, (_, index) => `Row ${index + 1}`);
const cards = Array.from({ length: 12 }, (_, index) => `Card ${index + 1}`);

const COLUMNS = 8;
const cells = Array.from(
  { length: COLUMNS * 12 },
  (_, index) => `R${Math.floor(index / COLUMNS) + 1}C${(index % COLUMNS) + 1}`,
);

const termsOpen = ref(false);

const zone = ref("");
// Intl knows them all — a list long enough that the panel has to scroll.
const zones: SelectOption[] = Intl.supportedValuesOf("timeZone").map((zone) => ({
  label: zone.replace(/_/g, " "),
  value: zone,
}));
</script>

<style module lang="scss">
@use '@surstromming/design' as design;

.wide {
  width: design.spacing(72);
}

.note {
  width: design.spacing(160);
  max-width: 100%;
}

.box {
  height: design.spacing(56);
  border: 1px solid design.color(border);
  border-radius: design.radius(md);
}

.strip {
  border: 1px solid design.color(border);
  border-radius: design.radius(md);
}

.row {
  display: flex;
  gap: design.spacing(2);
  padding: design.spacing(2);
}

.card {
  flex: 0 0 auto;
  width: design.spacing(28);
  padding: design.spacing(4);
  border: 1px solid design.color(border);
  border-radius: design.radius(md);
  font-size: 0.875rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(8, design.spacing(24));
}

.cell {
  padding: design.spacing(2) design.spacing(3);
  border-bottom: 1px solid design.color(border);
  font-size: 0.875rem;
}

.line {
  margin: 0;
  padding: design.spacing(2) design.spacing(3);
  font-size: 0.875rem;
}

.caption {
  margin: 0;
  color: design.color(muted-foreground);
  font-size: 0.875rem;
  line-height: 1.5;
}
</style>
