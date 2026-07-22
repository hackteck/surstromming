<template>
  <DemoSection title="Table">
    <Table
      :class="$style.table"
      :columns="columns"
      :rows="invoices"
      row-key="invoice"
      caption="A list of your recent invoices."
    >
      <template #cell-status="{ value }">
        <Badge :variant="statusVariant(value)">{{ value }}</Badge>
      </template>
    </Table>

    <Table :class="$style.table" :columns="columns" :rows="[]" empty="No invoices yet." />
  </DemoSection>
</template>

<script setup lang="ts">
import { Badge, type BadgeVariant } from "@surstromming/badge";
import { Table, type TableColumn, type TableRow } from "@surstromming/table";
import DemoSection from "./DemoSection.vue";

const columns: TableColumn[] = [
  { key: "invoice", header: "Invoice" },
  { key: "status", header: "Status" },
  { key: "method", header: "Method" },
  { key: "amount", header: "Amount", align: "right" },
];

const invoices: TableRow[] = [
  { invoice: "INV001", status: "Paid", method: "Credit Card", amount: "$250.00" },
  { invoice: "INV002", status: "Pending", method: "PayPal", amount: "$150.00" },
  { invoice: "INV003", status: "Unpaid", method: "Bank Transfer", amount: "$350.00" },
  { invoice: "INV004", status: "Paid", method: "Credit Card", amount: "$450.00" },
  { invoice: "INV005", status: "Paid", method: "PayPal", amount: "$550.00" },
];

const statusVariant = (status: unknown): BadgeVariant =>
  status === "Paid" ? "secondary" : "outline";
</script>

<style module lang="scss">
@use '@surstromming/design' as design;

.table {
  max-width: design.spacing(160);
}
</style>
