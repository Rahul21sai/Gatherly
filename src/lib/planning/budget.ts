import type { BudgetItem, EventInput } from "../types";
import { allocations } from "./configuration";
import { contingencyAmount, PRIORITY_WEIGHT_MULTIPLIER } from "./policies";

const colors = [
  "#7761C9",
  "#B59BDC",
  "#E7BDA7",
  "#A4B7AC",
  "#D9C68F",
  "#99AEC8",
  "#D7D2E5",
];

export function allocateBudget(input: EventInput): BudgetItem[] {
  const reserve = contingencyAmount(input.budget);
  const distributable = input.budget - reserve;
  const priorities = input.priorities.join(" ").toLowerCase();
  const weighted = allocations[input.eventType].map((item) => ({
    ...item,
    weight:
      item.weight *
      (item.aliases.some((alias) => priorities.includes(alias))
        ? PRIORITY_WEIGHT_MULTIPLIER
        : 1),
  }));
  const totalWeight = weighted.reduce((total, item) => total + item.weight, 0);
  const portions = weighted.map(
    (item) => (distributable * item.weight) / totalWeight,
  );
  const whole = portions.map(Math.floor);
  const remaining =
    distributable - whole.reduce((total, value) => total + value, 0);
  const order = portions
    .map((value, index) => ({ index, fraction: value - whole[index] }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index);
  for (let index = 0; index < remaining; index++) whole[order[index].index]++;
  return [
    ...weighted.map((item, index) => ({
      id: item.id,
      category: item.category,
      allocated: whole[index],
      spent: 0,
      color: colors[index],
    })),
    {
      id: "contingency",
      category: "Contingency",
      allocated: reserve,
      spent: 0,
      color: colors[6],
    },
  ];
}
