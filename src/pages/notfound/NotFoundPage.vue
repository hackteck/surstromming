<template>
  <ScrollArea as="main">
    <div :class="$style.page">
      <span :class="$style.icon"><Icon :icon="Compass" :size="28" /></span>

      <p :class="$style.code">404</p>
      <h1 :class="$style.title">Page not found</h1>
      <p :class="$style.text">
        Nothing lives at <code :class="$style.path">{{ route.fullPath }}</code>.
        It may have moved, or the link was mistyped.
      </p>

      <div :class="$style.actions">
        <RouterLink to="/" custom v-slot="{ href, navigate }">
          <Button as="a" :href="href" @click="navigate">
            <Icon :icon="Home" />
            Back home
          </Button>
        </RouterLink>
        <RouterLink to="/demo" custom v-slot="{ href, navigate }">
          <Button as="a" variant="outline" :href="href" @click="navigate">
            All components
          </Button>
        </RouterLink>
      </div>
    </div>
  </ScrollArea>
</template>

<script setup lang="ts">
import { ScrollArea } from "@surstromming/scroll-area";
import { RouterLink, useRoute } from "vue-router";
import { Compass, Home } from "lucide";
import { Button } from "@surstromming/button";
import { Icon } from "@surstromming/icon";

const route = useRoute();
</script>

<style module lang="scss">
@use '@surstromming/design' as design;

.page {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: design.spacing(3);
  width: 100%;
  max-width: design.spacing(160);
  margin-inline: auto;
  padding: design.spacing(24) design.spacing(6);
  text-align: center;
}

.icon {
  display: grid;
  place-items: center;
  width: design.spacing(14);
  height: design.spacing(14);
  border-radius: design.radius(lg);
  background-color: design.color(accent);
  color: design.color(foreground);
}

.code {
  color: design.color(muted-foreground);
  font-family: design.font(mono);
  font-size: 0.875rem;
  letter-spacing: 0.2em;
}

.title {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.text {
  color: design.color(muted-foreground);
  line-height: 1.6;
}

.path {
  font-family: design.font(mono);
  font-size: 0.875em;
  word-break: break-all;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: design.spacing(3);
  margin-top: design.spacing(3);
}
</style>
