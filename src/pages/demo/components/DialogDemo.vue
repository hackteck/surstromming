<template>
  <DemoSection title="Dialog">
    <Button variant="outline" @click="editOpen = true">Edit profile</Button>
    <Button variant="outline" @click="confirmOpen = true">Delete…</Button>
    <Button v-for="sheet in sheets" :key="sheet.side" variant="outline" @click="openSheet(sheet.side)">
      {{ sheet.label }}
    </Button>

    <Dialog v-model:open="editOpen" title="Edit profile" description="Change your details here.">
      <Input v-model="displayName" placeholder="Display name" />
      <!-- `layer="modal"` — a popover inside a dialog opens behind it otherwise. -->
      <Select v-model="role" :options="roles" layer="modal" />
      <template #footer>
        <Button variant="outline" @click="editOpen = false">Cancel</Button>
        <Button @click="editOpen = false">Save</Button>
      </template>
    </Dialog>

    <Dialog
      v-model:open="confirmOpen"
      role="alertdialog"
      title="Delete project?"
      description="This action cannot be undone."
    >
      <template #footer>
        <Button variant="outline" @click="confirmOpen = false">Cancel</Button>
        <Button variant="destructive" @click="confirmOpen = false">Delete</Button>
      </template>
    </Dialog>

    <!-- A sheet: the same dialog, flush with an edge. `close-label` names the ✕
         in the app's own language. -->
    <Dialog
      v-model:open="sheetOpen"
      :side="sheetSide"
      title="Preferences"
      description="A sheet slides in from the edge it sits on."
      close-label="Close preferences"
    >
      <Input v-model="displayName" placeholder="Display name" />
      <template #footer>
        <Button @click="sheetOpen = false">Done</Button>
      </template>
    </Dialog>
  </DemoSection>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@surstromming/button";
import { Dialog, type DialogSide } from "@surstromming/dialog";
import { Input } from "@surstromming/input";
import { Select, type SelectOption } from "@surstromming/select";
import DemoSection from "./DemoSection.vue";

const editOpen = ref(false);
const confirmOpen = ref(false);
const displayName = ref("");
const role = ref("editor");
const roles: SelectOption[] = [
  { label: "Owner", value: "owner" },
  { label: "Editor", value: "editor" },
  { label: "Viewer", value: "viewer" },
];

const sheets: { side: DialogSide; label: string }[] = [
  { side: "left", label: "Left sheet" },
  { side: "right", label: "Right sheet" },
  { side: "top", label: "Top sheet" },
  { side: "bottom", label: "Bottom sheet" },
];
const sheetOpen = ref(false);
const sheetSide = ref<DialogSide>("left");

function openSheet(side: DialogSide) {
  sheetSide.value = side;
  sheetOpen.value = true;
}
</script>
