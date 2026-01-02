import {
  PieChart,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Pie,
  Cell,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

interface Props {
  chartData: any[];
  pieData: any[];
}

export default function DashboardCharts({ chartData, pieData }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="shadow-sm h-[380px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            Reports Synced vs Published
          </CardTitle>
        </CardHeader>

        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
            >
              {/* Light Grid */}
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

              {/* X Axis */}
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
              />

              {/* Y Axis */}
              <YAxis
                tick={{ fontSize: 12, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
              />

              {/* Tooltip */}
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
                                {entry.value}
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

              {/* Legend */}
              <Legend
                verticalAlign="top"
                height={36}
                wrapperStyle={{ fontSize: 12 }}
              />

              {/* Barchart */}
              <Bar
                dataKey="Synced"
                fill="#dc2626" // green
                radius={[6, 6, 0, 0]}
                barSize={40}
              />
              <Bar
                dataKey="Published"
                fill="#16a34a" // red
                radius={[6, 6, 0, 0]}
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pie chart */}

      <Card className="shadow-sm h-[380px]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Report Type Distribution
          </CardTitle>
        </CardHeader>

        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
              >
                {pieData.map((_, index) => {
                  const COLORS = ["#16a34a", "#dc2626", "#3b82f6", "#f59e0b"];
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  );
                })}
              </Pie>

              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const entry = payload[0];
                    return (
                      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-lg rounded-xl p-3 text-sm animate-fade-in">
                        <p className="font-semibold text-gray-700 dark:text-gray-100 mb-2">
                          {entry.name}
                        </p>
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: entry.color }}
                          ></div>
                          <span>📊 Value:</span>
                          <span className="font-semibold">{entry.value}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
