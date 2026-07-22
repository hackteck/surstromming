<template>
  <DemoSection title="Checkbox">
    <Label for="terms"><Checkbox id="terms" v-model="agreed" /> Accept terms and conditions</Label>
    <Label for="news"><Checkbox id="news" v-model="news" /> Subscribe to the newsletter</Label>
    <Label for="locked" disabled><Checkbox id="locked" disabled /> Disabled</Label>
    <span :class="$style.state">agreed: {{ agreed }}</span>
  </DemoSection>

  <DemoSection title="Checkbox — indeterminate">
    <div :class="$style.tree">
      <Label for="all">
        <Checkbox id="all" :model-value="allToppings" :indeterminate="someToppings" @update:model-value="toggleAll" />
        All toppings
      </Label>
      <Label v-for="topping in toppings" :key="topping" :for="topping" :class="$style.child">
        <Checkbox :id="topping" v-model="chosen[topping]" />
        {{ topping }}
      </Label>
    </div>
  </DemoSection>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { Checkbox } from "@surstromming/checkbox";
import { Label } from "@surstromming/label";
import DemoSection from "./DemoSection.vue";

const agreed = ref(false);
const news = ref(true);

const toppings = ["Anchovy", "Caper", "Olive"];
const chosen = reactive<Record<string, boolean>>({ Anchovy: true, Caper: false, Olive: false });

const allToppings = computed(() => toppings.every((topping) => chosen[topping]));
const someToppings = computed(
  () => !allToppings.value && toppings.some((topping) => chosen[topping]),
);

// The parent box is a display of the children, so a click sets all of them —
// what "mixed" should resolve to is the app's call, not the component's.
const toggleAll = (checked?: boolean) => {
  for (const topping of toppings) chosen[topping] = !!checked;
};
</script>

<style module lang="scss">
@use '@surstromming/design' as design;

.tree {
  display: flex;
  flex-direction: column;
  gap: design.spacing(2);
}

.child {
  margin-left: design.spacing(6);
}

.state {
  color: design.color(muted-foreground);
  font-size: 0.875rem;
}
</style>
