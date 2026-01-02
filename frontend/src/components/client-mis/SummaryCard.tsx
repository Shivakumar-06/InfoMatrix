import { BarChart3, FileText, PieChart, TrendingUp } from "lucide-react";
import React, { useMemo } from "react";
import { Card, CardTitle } from "../ui/card";

// Helper small components
type SummaryShape = {
  totalReports?: number;
  publishedReports?: number;
  lastSynced?: string;
  orgId?: string;
  name?: string;
};

const SummaryCards: React.FC<{ summary: SummaryShape | null }> = React.memo(
  ({ summary }) => {
    const summaryCards = useMemo(
      () => [
        {
          title: "Total Reports",
          value: summary?.totalReports ?? "-",
          icon: <FileText className="w-6 h-6 text-white" />,
          bg: "bg-blue-500",
        },
        {
          title: "Published",
          value: summary?.publishedReports ?? "-",
          icon: <TrendingUp className="w-6 h-6 text-white" />,
          bg: "bg-green-500",
        },
        {
          title: "Last Synced",
          value: summary?.lastSynced
            ? new Date(summary.lastSynced).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "-",
          icon: <BarChart3 className="w-6 h-6 text-white" />,
          bg: "bg-indigo-500",
        },
        {
          title: "Organization ID",
          value: summary?.orgId ?? "-",
          icon: <PieChart className="w-6 h-6 text-white" />,
          bg: "bg-yellow-500",
        },
      ],
      [summary]
    );

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <Card
            key={card.title}
            className="flex items-center justify-between p-5 shadow-sm hover:shadow-md transition-all hover:bg-accent/50 group"
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-lg text-white shadow-md group-hover:scale-110 transition-transform ${card.bg}`}
              >
                {card.icon}
              </div>
              <div className="flex flex-col">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <p className="text-1xl font-bold text-foreground mt-1">
                  {card.value}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }
);

export default SummaryCards;