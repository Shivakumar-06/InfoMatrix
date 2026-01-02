import { FileSpreadsheet } from "lucide-react";
import { Card } from "../ui/card";

const EmptyChartsState = () => (
  <Card className="h-[380px] flex flex-col items-center justify-center text-center">
    <FileSpreadsheet className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
    <h3 className="text-sm font-medium">No chart data available</h3>
    <p className="text-xs text-muted-foreground mt-1 max-w-xs">
      Sync reports or publish data to see analytics and insights here.
    </p>
  </Card>
);

export default EmptyChartsState;
