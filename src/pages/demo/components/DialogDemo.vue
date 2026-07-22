<template>
  <DemoSection title="Dialog">
    <Button variant="outline" @click="editOpen = true">Edit profile</Button>
    <Button variant="outline" @click="confirmOpen = true">Delete…</Button>

    <Dialog v-model:open="editOpen" title="Edit profile" description="Change your details here.">
      <Input v-model="displayName" placeholder="Display name" />
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
  </DemoSection>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@surstromming/button";
import { Dialog } from "@surstromming/dialog";
import { Input } from "@surstromming/input";
import DemoSection from "./DemoSection.vue";

const editOpen = ref(false);
const confirmOpen = ref(false);
const displayName = ref("");
</script>
