<template>
  <DemoSection title="Chart — bar">
    <DemoField :class="$style.wide">
      <Chart type="bar" :data="visits" :series="platforms" x-key="month" />
    </DemoField>
  </DemoSection>

  <DemoSection title="Chart — line">
    <DemoField :class="$style.wide">
      <Chart :data="visits" :series="platforms" x-key="month" />
    </DemoField>
  </DemoSection>

  <DemoSection title="Chart — area, one series">
    <DemoField :class="$style.wide">
      <Chart
        type="area"
        :data="visits"
        :series="revenue"
        x-key="month"
        :format-value="asEuro"
      />
    </DemoField>
  </DemoSection>
</template>

<script setup lang="ts">
import { Chart, type ChartSeries } from "@surstromming/chart";
import DemoField from "./DemoField.vue";
import DemoSection from "./DemoSection.vue";

const platforms: ChartSeries[] = [
  { key: "desktop", label: "Desktop" },
  { key: "mobile", label: "Mobile" },
  { key: "tablet", label: "Tablet" },
];

const revenue: ChartSeries[] = [{ key: "revenue", label: "Revenue" }];

const visits = [
  { month: "Jan", desktop: 186, mobile: 80, tablet: 40, revenue: 4200 },
  { month: "Feb", desktop: 305, mobile: 200, tablet: 62, revenue: 5100 },
  { month: "Mar", desktop: 237, mobile: 120, tablet: 51, revenue: 4800 },
  { month: "Apr", desktop: 173, mobile: 190, tablet: 88, revenue: 6300 },
  { month: "May", desktop: 209, mobile: 130, tablet: 71, revenue: 5900 },
  { month: "Jun", desktop: 264, mobile: 140, tablet: 45, revenue: 7400 },
];

const euro = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});
const asEuro = (value: number) => euro.format(value);
</script>

<style module lang="scss">
@use '@surstromming/design' as design;

.wide {
  width: design.spacing(160);
  max-width: 100%;
}
</style>
