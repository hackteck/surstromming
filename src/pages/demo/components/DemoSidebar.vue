<template>
  <Sidebar v-model:open="sidebar.open">
    <SidebarGroup label="Get started" :items="getStarted" @select="go" @toggle="toggleSection" />
    <SidebarGroup
      v-for="group in categoryGroups"
      :key="group.label"
      :label="group.label"
      :items="group.items"
      @select="go"
    />
  </Sidebar>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { Home, SquareTerminal } from "lucide";

import { Sidebar } from "@surstromming/sidebar";
import { SidebarGroup, type SidebarGroupItem } from "@surstromming/sidebar-group";
import { useSidebar } from "@/stores/sidebar";
import { go } from "@/router";
import { componentCategories, componentsByCategory } from "@/pages/components/registry";

const sidebar = useSidebar();
const route = useRoute();

// One open section: the "exclusive" behaviour is just this being a single value.
const openSection = ref<string | null>("playground");
const toggleSection = (value: string) => {
  openSection.value = openSection.value === value ? null : value;
};

// Values are route paths, so `go` navigates and `active` follows the URL.
const getStarted = computed<SidebarGroupItem[]>(() => [
  {
    label: "Overview",
    value: "/",
    href: "/",
    icon: Home,
    active: route.path === "/",
  },
  {
    label: "Playground",
    value: "playground",
    icon: SquareTerminal,
    expanded: openSection.value === "playground",
    submenu: {
      type: "items",
      entries: [
        { label: "All components", value: "/demo", href: "/demo", active: route.path === "/demo" },
        {
          label: "Web components",
          value: "/webcomponents",
          href: "/webcomponents",
          active: route.path === "/webcomponents",
        },
      ],
    },
  },
]);

// One group per category, each a flat list of links to the component pages.
const categoryGroups = computed(() =>
  componentCategories.map((category) => ({
    label: category,
    items: componentsByCategory(category).map<SidebarGroupItem>((component) => {
      const path = `/components/${component.slug}`;
      return {
        label: component.name,
        value: path,
        href: path,
        icon: component.icon,
        active: route.path === path,
      };
    }),
  })),
);
</script>
