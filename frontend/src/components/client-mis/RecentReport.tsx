import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { FileSpreadsheet, Table } from "lucide-react";
import { Button } from "../ui/button";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";

const RecentReportsTable: React.FC<{
  reports: any[];
  onView: (type: string) => void;
}> = React.memo(({ reports }) => {
  const navigate = useNavigate();
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <FileSpreadsheet />
          <CardTitle>Recent Reports</CardTitle>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/clients/reports")}
        >
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Report Type</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.length > 0 ? (
              reports.map((r, i) => (
                <TableRow key={r.id ?? i}>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {r.type
                        ? r.type.split(",").map((t: string) => (
                            <Badge
                              key={t}
                              variant="secondary"
                              className="text-[10px]"
                            >
                              {t.trim().toUpperCase()}
                            </Badge>
                          ))
                        : "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {r.startDate && r.endDate
                        ? `${new Date(r.startDate).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })} → ${new Date(r.endDate).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}`
                        : "-"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={r.status ? "default" : "secondary"}
                      className={`${
                        r.status
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-yellow-500 hover:bg-yellow-600 text-white"
                      }`}
                    >
                      {r.status ? "Published" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => navigate("/client/mis-report")}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-500">
                  No reports available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
});

export default RecentReportsTable;

