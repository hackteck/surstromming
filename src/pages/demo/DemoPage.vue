<template>
  <ScrollArea as="main">
    <div :class="$style.page">
      <h1 :class="$style.title">Components</h1>

      <ButtonDemo />
      <ButtonGroupDemo />
      <InputDemo />
      <TextareaDemo />
      <CheckboxDemo />
      <SwitchDemo />
      <RadioGroupDemo />
      <SelectDemo />
      <ComboboxDemo />
      <SliderDemo />
      <CalendarDemo />
      <DatePickerDemo />
      <BreadcrumbDemo />
      <TabsDemo />
      <AccordionDemo />
      <DropdownMenuDemo />
      <TooltipDemo />
      <DialogDemo />
      <CardDemo />
      <AvatarDemo />
      <SeparatorDemo />
      <TableDemo />
      <PaginationDemo />
      <DataTableDemo />
      <ChartDemo />
      <ScrollAreaDemo />
      <AlertDemo />
      <ToastDemo />
      <BadgeDemo />
      <ProgressDemo />
      <SpinnerDemo />
    </div>
  </ScrollArea>
</template>

<script setup lang="ts">
import { ScrollArea } from "@surstromming/scroll-area";
import AccordionDemo from "./components/AccordionDemo.vue";
import AlertDemo from "./components/AlertDemo.vue";
import AvatarDemo from "./components/AvatarDemo.vue";
import BadgeDemo from "./components/BadgeDemo.vue";
import BreadcrumbDemo from "./components/BreadcrumbDemo.vue";
import ButtonDemo from "./components/ButtonDemo.vue";
import ButtonGroupDemo from "./components/ButtonGroupDemo.vue";
import CalendarDemo from "./components/CalendarDemo.vue";
import CardDemo from "./components/CardDemo.vue";
import ChartDemo from "./components/ChartDemo.vue";
import CheckboxDemo from "./components/CheckboxDemo.vue";
import ComboboxDemo from "./components/ComboboxDemo.vue";
import DataTableDemo from "./components/DataTableDemo.vue";
import DatePickerDemo from "./components/DatePickerDemo.vue";
import DialogDemo from "./components/DialogDemo.vue";
import DropdownMenuDemo from "./components/DropdownMenuDemo.vue";
import InputDemo from "./components/InputDemo.vue";
import PaginationDemo from "./components/PaginationDemo.vue";
import ProgressDemo from "./components/ProgressDemo.vue";
import RadioGroupDemo from "./components/RadioGroupDemo.vue";
import ScrollAreaDemo from "./components/ScrollAreaDemo.vue";
import SelectDemo from "./components/SelectDemo.vue";
import SeparatorDemo from "./components/SeparatorDemo.vue";
import SliderDemo from "./components/SliderDemo.vue";
import SpinnerDemo from "./components/SpinnerDemo.vue";
import SwitchDemo from "./components/SwitchDemo.vue";
import TableDemo from "./components/TableDemo.vue";
import TabsDemo from "./components/TabsDemo.vue";
import TextareaDemo from "./components/TextareaDemo.vue";
import ToastDemo from "./components/ToastDemo.vue";
import TooltipDemo from "./components/TooltipDemo.vue";
</script>

<style module lang="scss">
@use '@surstromming/design' as design;

.page {
  display: flex;
  flex-direction: column;
  gap: design.spacing(10);
  padding: design.spacing(6);
}

.title {
  font-size: 1.5rem;
  font-weight: 600;
}
</style>
