<template>
  <DemoSection title="Breadcrumb">
    <Breadcrumb :items="crumbs" />
  </DemoSection>

  <DemoSection title="Breadcrumb — collapsed">
    <Breadcrumb :items="longCrumbs" :max-items="3" />
  </DemoSection>
</template>

<script setup lang="ts">
import { Breadcrumb, type BreadcrumbItem } from "@surstromming/breadcrumb";
import DemoSection from "./DemoSection.vue";

const crumbs: BreadcrumbItem[] = [
  { label: "Home", to: "/" },
  { label: "Components", href: "#" },
  { label: "Breadcrumb" },
];

const longCrumbs: BreadcrumbItem[] = [
  { label: "Home", href: "#" },
  { label: "Docs", href: "#" },
  { label: "Components", href: "#" },
  { label: "Navigation", href: "#" },
  { label: "Breadcrumb" },
];
</script>
