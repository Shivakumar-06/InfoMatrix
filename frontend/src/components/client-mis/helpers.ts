export type MISSection = {
  heading?: string;
  rows?: any[];
};

export type MISTable = {
  title?: string;
  period?: string;
  headers?: string[];
  sections?: MISSection[];
};

export const formatINR = (num: any) => {
  const n = Number(num);
  if (Number.isNaN(n)) return num ?? "-";
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export type MISRow = {
  name: string;
  values?: number[];
  isGroup?: boolean;
};


export const findRowByNames = (report: MISTable | undefined, names: string[]) => {
  if (!report || !report.sections) return undefined;
  for (const sec of report.sections) {
    if (!sec.rows) continue;
    for (const r of sec.rows) {
      if (!r || !r.name) continue;
      const rn = String(r.name).trim().toLowerCase();
      for (const n of names) {
        if (rn === n.toLowerCase()) return r;
      }
    }
  }
  return undefined;
};
