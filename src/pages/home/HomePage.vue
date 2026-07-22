<template>
  <ScrollArea as="main">
    <div :class="$style.page">
      <!-- Hero -->
      <section :class="$style.hero">
        <div :class="$style.heroText">
          <Badge variant="secondary">
            <Icon :icon="Sparkles" :size="14" />
            Vue 3 · SCSS + CSS Modules
          </Badge>

          <h1 :class="$style.title">surströmming</h1>

          <p :class="$style.tagline">
            A shadcn-style component library for Vue 3 — no Tailwind, no
            CSS-in-JS. Every component is its own npm package; install only
            what you use.
          </p>

          <div :class="$style.actions">
            <RouterLink to="/demo" custom v-slot="{ href, navigate }">
              <Button as="a" size="lg" :href="href" @click="navigate">
                Explore components
                <Icon :icon="ArrowRight" />
              </Button>
            </RouterLink>
            <RouterLink to="/webcomponents" custom v-slot="{ href, navigate }">
              <Button as="a" size="lg" variant="outline" :href="href" @click="navigate">
                <Icon :icon="Puzzle" />
                Web components
              </Button>
            </RouterLink>
          </div>

          <dl :class="$style.stats">
            <div :class="$style.stat">
              <dt :class="$style.statNum">{{ components.length }}</dt>
              <dd :class="$style.statLabel">Components</dd>
            </div>
            <div :class="$style.stat">
              <dt :class="$style.statNum">{{ componentCategories.length }}</dt>
              <dd :class="$style.statLabel">Categories</dd>
            </div>
            <div :class="$style.stat">
              <dt :class="$style.statNum">Vue 3</dt>
              <dd :class="$style.statLabel">Framework</dd>
            </div>
          </dl>
        </div>

        <!-- The consumer story, verbatim. -->
        <div :class="$style.code" aria-hidden="true">
          <div :class="$style.codeBar">
            <span :class="$style.dot" />
            <span :class="$style.dot" />
            <span :class="$style.dot" />
          </div>
          <pre :class="$style.codeBody"><span :class="$style.comment"># install only what you use</span>
  npm i <span :class="$style.string">@surstromming/button</span>

  <span :class="$style.keyword">import</span> { Button } <span :class="$style.keyword">from</span> <span :class="$style.string">"@surstromming/button"</span></pre>
        </div>
      </section>

      <!-- Features -->
      <section :class="$style.section">
        <h2 :class="$style.sectionTitle">Built for humans</h2>
        <div :class="$style.features">
          <article v-for="feature in features" :key="feature.title" :class="$style.feature">
            <span :class="$style.featureIcon"><Icon :icon="feature.icon" :size="20" /></span>
            <h3 :class="$style.featureTitle">{{ feature.title }}</h3>
            <p :class="$style.featureText">{{ feature.text }}</p>
          </article>
        </div>
      </section>

      <!-- Components, by category -->
      <section :class="$style.section">
        <h2 :class="$style.sectionTitle">Components</h2>
        <div v-for="group in sections" :key="group.category" :class="$style.category">
          <div :class="$style.categoryHead">
            <h3 :class="$style.categoryTitle">{{ group.category }}</h3>
            <Badge variant="secondary">{{ group.items.length }}</Badge>
          </div>
          <div :class="$style.grid">
            <RouterLink
              v-for="item in group.items"
              :key="item.slug"
              :class="$style.tile"
              :to="`/components/${item.slug}`"
            >
              <span :class="$style.tileIcon"><Icon :icon="item.icon" :size="18" /></span>
              <span :class="$style.tileBody">
                <span :class="$style.tileName">{{ item.name }}</span>
                <span :class="$style.tileDesc">{{ item.description }}</span>
              </span>
            </RouterLink>
          </div>
        </div>
      </section>
    </div>
  </ScrollArea>
</template>

<script setup lang="ts">
import { ScrollArea } from "@surstromming/scroll-area";
import { RouterLink } from "vue-router";
import { ArrowRight, Boxes, Feather, Package, Paintbrush, Palette, Puzzle, Sparkles } from "lucide";
import { Badge } from "@surstromming/badge";
import { Button } from "@surstromming/button";
import { Icon } from "@surstromming/icon";
import type { IconNode } from "@surstromming/icon";
import { components, componentCategories, componentsByCategory } from "@/pages/components/registry";

const features: { icon: IconNode; title: string; text: string }[] = [
  {
    icon: Package,
    title: "One package per component",
    text: "Each component ships under the @surstromming scope. Install only what you use — no monolith.",
  },
  {
    icon: Paintbrush,
    title: "SCSS + CSS Modules",
    text: "Styled the plain way: no Tailwind, no CSS-in-JS, no class-joining helpers.",
  },
  {
    icon: Palette,
    title: "Tokens & dark mode",
    text: "Every color, space and radius is a CSS variable. Theme by overriding data-theme — light renders with zero setup.",
  },
  {
    icon: Boxes,
    title: "Data-driven APIs",
    text: "Components take arrays and objects and render the UI. Slots are the escape hatch, not the primary API.",
  },
  {
    icon: Feather,
    title: "Ships raw source",
    text: "Packages ship .vue, .ts and .scss — your Vite build compiles them. Types come straight from the source.",
  },
  {
    icon: Puzzle,
    title: "Web components",
    text: "Selected components compile to framework-agnostic, shadow-DOM custom elements for any page.",
  },
];

// Group once for the section list; the badge reads each group's length.
const sections = componentCategories.map((category) => ({
  category,
  items: componentsByCategory(category),
}));
</script>

<style module lang="scss">
@use '@surstromming/design' as design;

.page {
  display: flex;
  flex-direction: column;
  gap: design.spacing(20);
  width: 100%;
  max-width: design.spacing(280);
  margin-inline: auto;
  padding: design.spacing(8) design.spacing(6) design.spacing(16);
}

/* Hero */
.hero {
  display: grid;
  gap: design.spacing(10);
  align-items: center;

  @include design.screen(lg) {
    grid-template-columns: 1.1fr 0.9fr;
  }
}

.heroText {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: design.spacing(5);
}

.title {
  font-size: clamp(2.75rem, 7vw, 4.5rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.02;
}

.tagline {
  max-width: design.spacing(160);
  color: design.color(muted-foreground);
  font-size: 1.125rem;
  line-height: 1.6;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: design.spacing(3);
}

.stats {
  display: flex;
  gap: design.spacing(10);
  margin-top: design.spacing(2);
}

.stat {
  display: flex;
  flex-direction: column;
  gap: design.spacing(1);
}

.statNum {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1;
}

.statLabel {
  color: design.color(muted-foreground);
  font-size: 0.875rem;
}

/* Hero code card */
.code {
  overflow: hidden;
  border: 1px solid design.color(border);
  border-radius: design.radius(xl);
  background-color: design.color(card);
  box-shadow: design.shadow(md);
}

.codeBar {
  display: flex;
  gap: design.spacing(1.5);
  border-bottom: 1px solid design.color(border);
  padding: design.spacing(3) design.spacing(4);
}

.dot {
  width: design.spacing(2.5);
  height: design.spacing(2.5);
  border-radius: 50%;
  background-color: design.color(border);
}

.codeBody {
  overflow-x: auto;
  padding: design.spacing(5);
  color: design.color(foreground);
  font-family: design.font(mono);
  font-size: 0.8125rem;
  line-height: 1.7;
}

.comment {
  color: design.color(muted-foreground);
}

.keyword {
  color: design.color(muted-foreground);
}

.string {
  color: design.color(foreground);
  font-weight: 500;
}

/* Sections */
.section {
  display: flex;
  flex-direction: column;
  gap: design.spacing(8);
}

.sectionTitle {
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

/* Features */
.features {
  display: grid;
  gap: design.spacing(4);
  grid-template-columns: 1fr;

  @include design.screen(sm) {
    grid-template-columns: repeat(2, 1fr);
  }

  @include design.screen(lg) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.feature {
  display: flex;
  flex-direction: column;
  gap: design.spacing(2);
  border: 1px solid design.color(border);
  border-radius: design.radius(lg);
  background-color: design.color(card);
  padding: design.spacing(5);
}

.featureIcon {
  display: grid;
  place-items: center;
  width: design.spacing(10);
  height: design.spacing(10);
  margin-bottom: design.spacing(1);
  border-radius: design.radius(md);
  background-color: design.color(accent);
  color: design.color(foreground);
}

.featureTitle {
  font-size: 1rem;
  font-weight: 600;
}

.featureText {
  color: design.color(muted-foreground);
  font-size: 0.875rem;
  line-height: 1.55;
}

/* Component category grids */
.category {
  display: flex;
  flex-direction: column;
  gap: design.spacing(4);
}

.categoryHead {
  display: flex;
  align-items: center;
  gap: design.spacing(2);
}

.categoryTitle {
  font-size: 1rem;
  font-weight: 600;
  color: design.color(muted-foreground);
}

.grid {
  display: grid;
  gap: design.spacing(3);
  grid-template-columns: 1fr;

  @include design.screen(sm) {
    grid-template-columns: repeat(2, 1fr);
  }

  @include design.screen(lg) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.tile {
  display: flex;
  gap: design.spacing(3);
  border: 1px solid design.color(border);
  border-radius: design.radius(lg);
  background-color: design.color(card);
  padding: design.spacing(4);
  color: design.color(card-foreground);
  text-decoration: none;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease,
    box-shadow 0.15s ease;

  &:hover {
    border-color: design.color(ring);
    background-color: design.color(accent);
    box-shadow: design.shadow(sm);
  }

  &:focus-visible {
    outline: 2px solid design.color(ring);
    outline-offset: 2px;
  }
}

.tileIcon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: design.spacing(9);
  height: design.spacing(9);
  border-radius: design.radius(md);
  background-color: design.color(muted);
  color: design.color(foreground);
}

.tileBody {
  display: flex;
  flex-direction: column;
  gap: design.spacing(1);
  min-width: 0;
}

.tileName {
  font-weight: 600;
  font-size: 0.9375rem;
}

.tileDesc {
  color: design.color(muted-foreground);
  font-size: 0.8125rem;
  line-height: 1.45;
}
</style>
