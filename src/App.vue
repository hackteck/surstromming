<template>
  <AppHeader v-if="showHeader" />

  <!-- Each page brings its own sidebar via the `sidebar` named view -->
  <RouterView v-if="hasSidebar" name="sidebar" v-slot="{ Component, route: sidebarRoute }">
    <KeepAlive>
      <component :is="Component" :key="sidebarRoute.name" />
    </KeepAlive>
  </RouterView>

  <!-- Main view -->
  <RouterView v-slot="{ Component }">
    <Suspense v-if="Component" :timeout="0">
      <component :is="Component" />
      <template #fallback>
        <PageLoader />
      </template>
    </Suspense>
  </RouterView>

  <!-- Teleported to <body>; one for the whole app -->
  <Toaster :toasts="toasts.items" @dismiss="toasts.dismiss" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { RouterView, useRoute } from "vue-router";
import { Toaster } from "@surstromming/toast";
import AppHeader from "@/components/AppHeader.vue";
import PageLoader from "@/components/PageLoader.vue";
import { useToasts } from "@/stores/toasts";

const route = useRoute();
const toasts = useToasts();

// The header is shared; a route opts out with `meta.header: false`.
const showHeader = computed(() => route.meta.header !== false);
const hasSidebar = computed(() =>
  route.matched.some(
    (record) => !!record.components && "sidebar" in record.components,
  ),
);
</script>

<style lang="scss">
@use '@surstromming/design' as design;
@include design.layout($sidebarInset: true);
</style>
