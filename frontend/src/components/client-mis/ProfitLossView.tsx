import React, { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  CartesianGrid,
} from "recharts";
import {
  BarChart3,
  PieChart as BanknoteArrowUp,
  BanknoteArrowDown,
  ArrowUpDown,
} from "lucide-react";
import { type MISTable, formatINR, findRowByNames } from "./helpers";

type Props = { report?: MISTable };

const ProfitLossView: React.FC<Props> = ({ report }) => {
  const plComputed = useMemo(() => {
    if (!report)
      return {
        chartData: [],
        pieData: [],
        summary: { income: 0, expense: 0, net: 0 },
      };

    const months = (report.headers || []).slice(1);

    const incomeRow = findRowByNames(report, [
      "Operating Income",
      "Total Operating Income",
      "Total Income",
      "Income",
    ]);

    const expenseRow = findRowByNames(report, [
      "Total Operating Expense",
      "Total Operating Expenses",
      "Operating Expense Total",
      "Total Expense",
      "Expense",
    ]);

    const incomeVals = incomeRow?.values ?? [];
    const expenseVals = expenseRow?.values ?? [];

    const chartData = months.map((m, i) => ({
      month: m,
      Income: Number(incomeVals[i] ?? 0),
      Expense: Number(expenseVals[i] ?? 0),
    }));

    const totalIncome = incomeVals.reduce(
      (s: number, v: any) => s + (Number(v) || 0),
      0
    );
    const totalExpense = expenseVals.reduce(
      (s: number, v: any) => s + (Number(v) || 0),
      0
    );
    const net = totalIncome - totalExpense;

    const summary = { income: totalIncome, expense: totalExpense, net };
    const pieData = [
      { name: "Income", value: summary.income },
      { name: "Expense", value: summary.expense },
    ];

    return { chartData, pieData, summary };
  }, [report]);

  if (!report) return null;

  return (
    <div className="space-y-8 mt-8">
      {/* Monthly Summary */}
      {plComputed.chartData.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Monthly Summary</h2>

          {plComputed.chartData.length > 1 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {plComputed.chartData.map((item: any, idx: number) => {
                const net = item.Income - item.Expense;
                return (
                  <Card key={idx}>
                    <CardHeader>
                      <CardTitle>{item.month}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Income
                        </span>
                        <span className="text-green-600 font-semibold">
                          ₹{formatINR(item.Income)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Expense
                        </span>
                        <span className="text-red-600 font-semibold">
                          ₹{formatINR(item.Expense)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-t pt-2">
                        <span className="text-sm font-medium">Net</span>
                        <span
                          className={`font-bold ${
                            net >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          ₹{formatINR(net)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Total Income</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-4 items-center">
                  <BanknoteArrowUp className="w-6 h-6 text-green-600" />
                  <p className="text-2xl font-bold text-green-600">
                    ₹{formatINR(plComputed.summary.income)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Total Expenses</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-4 items-center">
                  <BanknoteArrowDown className="w-6 h-6 text-red-600" />
                  <p className="text-2xl font-bold text-red-600">
                    ₹{formatINR(plComputed.summary.expense)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Net Profit / Loss</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-4">
                  <ArrowUpDown className="w-6 h-6" />
                  <p
                    className={`text-2xl font-bold ${
                      plComputed.summary.net >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    ₹{formatINR(plComputed.summary.net)}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Charts */}
      {plComputed.chartData.length > 0 && (
        <div className="mt-8">
          <Card className="shadow-sm h-[380px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <BarChart3 />
                Income vs Expense Over Time
              </CardTitle>
            </CardHeader>

            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={plComputed.chartData}
                  margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                  />

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

                  <Legend
                    verticalAlign="top"
                    height={36}
                    wrapperStyle={{ fontSize: 12 }}
                  />

                  <Bar
                    dataKey="Income"
                    fill="#16a34a"
                    radius={[6, 6, 0, 0]}
                    barSize={40}
                  />

                  <Bar
                    dataKey="Expense"
                    fill="#dc2626"
                    radius={[6, 6, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProfitLossView;
