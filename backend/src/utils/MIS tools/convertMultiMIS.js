import { convertToMIS } from "./convertToMIS.js";

export const convertMultiMIS = (reportRow) => {
  const output = {};

  for (const type of reportRow.types) {
    output[type] = convertToMIS({
      type,
      start_date: reportRow.start_date,
      end_date: reportRow.end_date,
      data: reportRow.data[type],   // <– only that type's data
    });
  }

  return output;
};
