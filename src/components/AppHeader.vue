<template>
  <Header>
    <Button variant="ghost" size="icon" aria-label="Toggle sidebar" @click="toggle">
      <Icon :icon="PanelLeft" />
    </Button>
    <slot />
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      :class="$style.themeToggle"
      @click="toggleTheme"
    >
      <Icon :icon="themeIcon" />
    </Button>
  </Header>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Moon, PanelLeft, Sun } from "lucide";
import { useSidebar } from "@/stores/sidebar";
import { useTheme } from "@/composables/useTheme";
import { Button } from "@surstromming/button";
import { Header } from "@surstromming/header";
import { Icon } from "@surstromming/icon";

const { toggle } = useSidebar();
const { theme, toggle: toggleTheme } = useTheme();
const themeIcon = computed(() => (theme.value === "dark" ? Sun : Moon));
</script>

<style module lang="scss">
.themeToggle {
  margin-left: auto;
}
</style>
