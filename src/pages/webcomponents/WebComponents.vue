<template>
  <ScrollArea as="main">
    <div :class="$style.page">
      <h1 :class="$style.title">Web components</h1>
      <p :class="$style.note">
        These are <code>&lt;ss-*&gt;</code> custom elements — shadow-DOM
        encapsulated, framework-agnostic. No Vue component on this page, just the
        registered tags (see <code>useWebComponents.ts</code>).
      </p>

      <section :class="$style.row">
        <ss-button>Primary</ss-button>
        <ss-button variant="secondary">Secondary</ss-button>
        <ss-button variant="destructive">Destructive</ss-button>
        <ss-button variant="outline">Outline</ss-button>
        <ss-button variant="ghost">Ghost</ss-button>
        <ss-button variant="link">Link</ss-button>
      </section>

      <section :class="$style.row">
        <ss-button size="sm">Small</ss-button>
        <ss-button>Medium</ss-button>
        <ss-button size="lg">Large</ss-button>
        <ss-button disabled>Disabled</ss-button>
      </section>

      <p :class="$style.note">
        <code>&lt;ss-input&gt;</code> is registered with
        <code>defineFormElement</code>: it's form-associated (an outer
        <code>&lt;form&gt;</code> sees its value), exposes <code>.value</code> on
        the host (so <code>v-model</code> works even though it compiles to the
        native input contract), and delegates focus (clicking the label focuses
        the inner input).
      </p>

      <section :class="$style.row">
        <ss-input size="sm" placeholder="Small" />
        <ss-input placeholder="Medium" />
        <ss-input size="lg" placeholder="Large" />
        <ss-input type="password" placeholder="Password" />
        <ss-input disabled placeholder="Disabled" />
      </section>

      <section :class="$style.row">
        <ss-input v-model="typed" placeholder="v-model round-trip" />
        <code :class="$style.echo">{{ typed || '—' }}</code>
      </section>

      <form ref="form" :class="$style.row">
        <label for="wc-email">Email</label>
        <ss-input id="wc-email" name="email" type="email" placeholder="you@example.com" />
        <ss-button size="sm" @click="readForm">Read FormData</ss-button>
        <code :class="$style.echo">{{ formData || '—' }}</code>
      </form>
    </div>
  </ScrollArea>
</template>

<script setup lang="ts">
import { ScrollArea } from '@surstromming/scroll-area';
import { ref, useTemplateRef } from 'vue';
import { useWebComponents } from './composables/useWebComponents';

useWebComponents();

const typed = ref('');

const form = useTemplateRef<HTMLFormElement>('form');
const formData = ref('');

const readForm = () => {
  if (!form.value) return;
  formData.value = JSON.stringify(Object.fromEntries(new FormData(form.value)));
};
</script>

<style module lang="scss">
@use '@surstromming/design' as design;

.page {
  display: flex;
  flex-direction: column;
  gap: design.spacing(6);
  padding: design.spacing(6);
}

.title {
  font-size: 1.5rem;
  font-weight: 600;
}

.note {
  max-width: 42rem;
  color: design.color(muted-foreground);
  font-size: 0.875rem;
  line-height: 1.6;
}

.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: design.spacing(3);

  // Input fills its container by design; as an element, the host is the container.
  ss-input {
    width: design.spacing(56);
  }
}

.echo {
  color: design.color(muted-foreground);
  font-size: 0.875rem;
}
</style>
