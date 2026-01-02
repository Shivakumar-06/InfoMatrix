import React, { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Legend, Bar, CartesianGrid } from "recharts";
import { BarChart3 } from "lucide-react";
import { type MISTable, formatINR } from "./helpers";

type Props = { report?: MISTable };

const BalanceSheetView: React.FC<Props> = ({ report }) => {
  if (!report) return null;

  const months = (report.headers || []).slice(1);

  // Build totals array for chart & monthly cards
  
  const totals = useMemo(() => {
    const allRows = (report.sections || []).flatMap((s) => s.rows || []);
    return months.map((_, mIdx) => {
      const totalAssets = allRows.find((r) => String(r.name || "").toLowerCase() === "total assets")?.values?.[mIdx] ?? 0;
      const totalLiabilities =
        allRows.find((r) => String(r.name || "").toLowerCase().includes("total liabilities"))?.values?.[mIdx] ?? 0;
      const totalEquity =
        allRows.find((r) => {
          const name = String(r.name || "").toLowerCase();
          return name.includes("total equities") || name.includes("total equity");
        })?.values?.[mIdx] ?? 0;

      return { month: months[mIdx], Assets: Number(totalAssets), Liabilities: Number(totalLiabilities), Equity: Number(totalEquity) };
    });
  }, [report, months]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mt-8">Monthly Summary</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {totals.map((t) => (
          <Card key={t.month}>
            <CardHeader>
              <CardTitle>{t.month}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium text-muted-foreground">Assets</span>
                <span className="text-green-700 font-bold">₹{formatINR(t.Assets)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-muted-foreground">Liabilities</span>
                <span className="text-red-700 font-bold">₹{formatINR(t.Liabilities)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-muted-foreground">Equity</span>
                <span className="text-blue-700 font-bold">₹{formatINR(t.Equity)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold mt-8">Balance Sheet Charts</h2>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <BarChart3 />
              Assets vs Liabilities vs Equity Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={totals} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                <Tooltip
  cursor={{ fill: "rgba(99,102,241,0.05)" }}
  content={({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-lg rounded-xl p-3 text-sm animate-fade-in">
          <p className="font-semibold text-gray-700 dark:text-gray-100 mb-2">
            {label}
          </p>

          {payload.map((entry, index) => {
            const color = entry.color || "#000";
            const emoji =
              entry.name === "Synced"
                ? "📈"
                : entry.name === "Published"
                ? "🚀"
                : "📊";

            return (
              <div
                key={index}
                className="flex items-center gap-2 text-gray-700 dark:text-gray-200"
              >
                <span>{emoji}</span>
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                ></div>
                <span>{entry.name}:</span>
                <span className="font-semibold">
                  ₹{formatINR(Number(entry.value))}
                </span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  }}
/>

                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Assets" fill="#16a34a" radius={[6, 6, 0, 0]} barSize={40} />
                <Bar dataKey="Liabilities" fill="#dc2626" radius={[6, 6, 0, 0]} barSize={40} />
                <Bar dataKey="Equity" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BalanceSheetView;
