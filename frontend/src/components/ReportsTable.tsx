import { CircleCheckBig, SquarePen } from "lucide-react";
import { Card, CardContent } from "./ui/card";

import NoData from "./loaders/NoData";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/button";
import DataLoader from "./loaders/DataLoader";

type ReportsTableProps = {
  reports: any[];
  loading: boolean;
  noData: boolean;
  onPreview: (reportId: string) => void;
};

const ReportsTable = ({
  reports,
  loading,
  noData,
  onPreview,
}: ReportsTableProps) => {
  return (
    <Card>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-10">
            <DataLoader />
          </div>
        ) : noData ? (
          <div className="flex flex-col justify-center items-center py-12">
            <NoData />
            <p className="pt-6 text-gray-600">No reports found</p>
          </div>
        ) : reports.length === 0 ? (
          <div>
            <NoData />
            <p className="text-center py-6 text-gray-500">
              Select filters to load reports
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template</TableHead>
                <TableHead>Date Range</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {reports.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.templates.template_name}</TableCell>

                  <TableCell>
                    {r.start_date} → {r.end_date}
                  </TableCell>

                  <TableCell>
                    {r.published ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <CircleCheckBig size={16} />
                        Published
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-yellow-600">
                        <SquarePen size={16} />
                        Draft
                      </span>
                    )}
                  </TableCell>

                  <TableCell>
                    <Button variant="outline" onClick={() => onPreview(r.id)}>
                      Preview
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default ReportsTable;
