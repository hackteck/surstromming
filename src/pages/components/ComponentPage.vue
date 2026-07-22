<template>
  <ScrollArea as="main">
    <div :class="$style.page">
      <template v-if="meta">
        <header :class="$style.head">
          <span :class="$style.eyebrow">{{ meta.category }}</span>
          <h1 :class="$style.title">{{ meta.name }}</h1>
          <p :class="$style.description">{{ meta.description }}</p>
          <code :class="$style.import">{{ importLine }}</code>
        </header>

        <!-- The live example: the same demo the all-in-one page renders. -->
        <Suspense>
          <component :is="meta.demo" :key="meta.slug" />
          <template #fallback>
            <PageLoader />
          </template>
        </Suspense>

        <nav :class="$style.pager">
          <RouterLink v-if="prev" :class="$style.prev" :to="`/components/${prev.slug}`">
            <span :class="$style.pagerCap">Previous</span>
            <span :class="$style.pagerName">{{ prev.name }}</span>
          </RouterLink>
          <RouterLink v-if="next" :class="$style.next" :to="`/components/${next.slug}`">
            <span :class="$style.pagerCap">Next</span>
            <span :class="$style.pagerName">{{ next.name }}</span>
          </RouterLink>
        </nav>
      </template>

      <div v-else :class="$style.missing">
        <h1 :class="$style.title">Not found</h1>
        <p :class="$style.description">There is no component named “{{ slug }}”.</p>
        <RouterLink :class="$style.import" to="/">Back to overview</RouterLink>
      </div>
    </div>
  </ScrollArea>
</template>

<script setup lang="ts">
import { ScrollArea } from "@surstromming/scroll-area";
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";
import PageLoader from "@/components/PageLoader.vue";
import { components, componentBySlug } from "./registry";

const route = useRoute();
const slug = computed(() => String(route.params.slug));
const meta = computed(() => componentBySlug(slug.value));

const importLine = computed(() =>
  meta.value ? `import { ${meta.value.name} } from "@surstromming/${meta.value.slug}"` : "",
);

// Prev/next walk the registry order, like a docs site.
const index = computed(() => components.findIndex((c) => c.slug === slug.value));
const prev = computed(() => (index.value > 0 ? components[index.value - 1] : undefined));
const next = computed(() =>
  index.value >= 0 && index.value < components.length - 1
    ? components[index.value + 1]
    : undefined,
);
</script>

<style module lang="scss">
@use '@surstromming/design' as design;

.page {
  display: flex;
  flex-direction: column;
  gap: design.spacing(10);
  max-width: design.spacing(240);
  padding: design.spacing(6);
}

.head {
  display: flex;
  flex-direction: column;
  gap: design.spacing(2);
}

.eyebrow {
  color: design.color(muted-foreground);
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.title {
  font-size: 1.875rem;
  font-weight: 600;
  line-height: 1.15;
}

.description {
  max-width: design.spacing(160);
  color: design.color(muted-foreground);
  font-size: 1rem;
}

.import {
  align-self: flex-start;
  margin-top: design.spacing(1);
  border: 1px solid design.color(border);
  border-radius: design.radius(md);
  background-color: design.color(muted);
  padding: design.spacing(2) design.spacing(3);
  color: design.color(foreground);
  font-family: design.font(mono);
  font-size: 0.8125rem;
  text-decoration: none;
}

.pager {
  display: flex;
  gap: design.spacing(3);
  border-top: 1px solid design.color(border);
  padding-top: design.spacing(6);
}

.prev,
.next {
  display: flex;
  flex-direction: column;
  gap: design.spacing(1);
  flex: 1;
  border: 1px solid design.color(border);
  border-radius: design.radius(lg);
  padding: design.spacing(3) design.spacing(4);
  color: design.color(foreground);
  text-decoration: none;
  transition: border-color 0.15s ease, background-color 0.15s ease;

  &:hover {
    border-color: design.color(ring);
    background-color: design.color(accent);
  }
}

.next {
  text-align: right;
}

.pagerCap {
  color: design.color(muted-foreground);
  font-size: 0.75rem;
}

.pagerName {
  font-weight: 500;
}

.missing {
  display: flex;
  flex-direction: column;
  gap: design.spacing(3);
  align-items: flex-start;
}
</style>
