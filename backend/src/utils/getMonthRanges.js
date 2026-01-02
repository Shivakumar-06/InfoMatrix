import { formatDateLocal } from "./formatDateLocal.js";

export function getMonthRanges(start_date, end_date) {
  const ranges = [];
  let current = new Date(start_date);
  const end = new Date(end_date);

  while (current <= end) {
    const from = new Date(current.getFullYear(), current.getMonth(), 1);
    const to = new Date(current.getFullYear(), current.getMonth() + 1, 0);
    const safeTo = to > end ? end : to;

    const label = from.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });

    ranges.push({
      from: formatDateLocal(from),
      to: formatDateLocal(safeTo),
      label,
    });

    current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
  }

  return ranges;
}