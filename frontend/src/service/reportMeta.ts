import {
  BarChart3,
  FileSpreadsheet,
  FileSearch,
  Receipt,
  ClipboardList,
} from "lucide-react";

export const REPORT_META: Record<string, { label: string; Icon: any }> = {
  pl: { label: "Profit & Loss", Icon: BarChart3 },
  bs: { label: "Balance Sheet", Icon: FileSpreadsheet },
  gl: { label: "General Ledger", Icon: FileSearch },
  bills: { label: "Accounts Payable", Icon: Receipt },
  invoices: { label: "Accounts Receivable", Icon: ClipboardList },
};

export const GROUPING_ENABLED = ["pl", "bs"];
