<template>
  <DemoSection title="Data table">
    <DataTable
      :class="$style.table"
      :columns="columns"
      :rows="payments"
      row-key="id"
      :page-size="5"
      selectable
      v-model:selected="selected"
    >
      <template #cell-status="{ value }">
        <Badge variant="outline">{{ value }}</Badge>
      </template>
      <template #cell-amount="{ value }">{{ dollars(value) }}</template>
    </DataTable>
  </DemoSection>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Badge } from "@surstromming/badge";
import { DataTable, type DataTableColumn } from "@surstromming/data-table";
import { type TableRow } from "@surstromming/table";
import DemoSection from "./DemoSection.vue";

const columns: DataTableColumn[] = [
  { key: "status", header: "Status", sortable: true },
  { key: "email", header: "Email", sortable: true },
  { key: "amount", header: "Amount", align: "right", sortable: true },
];

const payments: TableRow[] = [
  { id: "m5gr84i9", status: "success", email: "ken99@example.com", amount: 316 },
  { id: "3u1reuv4", status: "success", email: "abe45@example.com", amount: 242 },
  { id: "derv1ws0", status: "processing", email: "monserrat44@example.com", amount: 837 },
  { id: "5kma53ae", status: "success", email: "silas22@example.com", amount: 874 },
  { id: "bhqecj4p", status: "failed", email: "carmella@example.com", amount: 721 },
  { id: "k9dp01xz", status: "processing", email: "liam88@example.com", amount: 159 },
  { id: "w2mv87qt", status: "success", email: "sofia13@example.com", amount: 493 },
  { id: "r7fn34ka", status: "failed", email: "noah67@example.com", amount: 605 },
  { id: "p4jc92ls", status: "success", email: "mia04@example.com", amount: 378 },
  { id: "t8gb56hd", status: "processing", email: "ethan31@example.com", amount: 942 },
  { id: "y3xw19mn", status: "success", email: "ava76@example.com", amount: 264 },
  { id: "q6zr48vc", status: "failed", email: "lucas52@example.com", amount: 550 },
];

const selected = ref<(string | number)[]>([]);

const dollars = (value: unknown) => `$${Number(value).toFixed(2)}`;
</script>

<style module lang="scss">
@use '@surstromming/design' as design;

.table {
  max-width: design.spacing(160);
}
</style>
