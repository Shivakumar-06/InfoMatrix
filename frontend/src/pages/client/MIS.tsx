import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import axiosClient from "../../api/axiosClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui/tabs";

import DataLoader from "../../components/loaders/DataLoader";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "../../components/ui/breadcrumb";

import { Filter, FileText, House, ChevronRight, FileHeart } from "lucide-react";

import ProfitLossView from "../../components/client-mis/ProfitLossView";
import BalanceSheetView from "../../components/client-mis/BalanceSheetView";
import NoData from "../../components/loaders/NoData";

import { type MISTable } from "../../components/client-mis/helpers";
import { Badge } from "@/components/ui/badge";

// TYPES
type MISData = Record<string, MISTable>;

const TAB_LABELS: Record<string, string> = {
  pl: "Profit & Loss",
  bs: "Balance Sheet",
  gl: "General Ledger",
  bills: "Bills",
  invoices: "Invoices",
};

const ClientMIS = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [mis, setMis] = useState<MISData | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [tabs, setTabs] = useState<string[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  // Group open state
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  // Render MIS with table accordion
  const renderMIS = (misItem: MISTable | undefined) => {
    if (!misItem) return null;

    const headers = misItem.headers || [];
    const sections = misItem.sections || [];

    return (
      <div className="space-y-10 mt-6">
        {sections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-4">
            <h3 className="text-lg font-semibold border-l-4 border-primary pl-3">
              {section.heading}
            </h3>

            <div className="rounded-xl border bg-white shadow-sm">
              <Table>
                <TableHeader className="bg-neutral-50">
                  <TableRow>
                    {headers.map((h, i) => (
                      <TableHead
                        key={i}
                        className={
                          i === 0 ? "pl-5 text-left" : "pr-5 text-right"
                        }
                      >
                        {h}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {(() => {
                    const rows = section.rows || [];
                    const rendered: React.ReactNode[] = [];

                    for (let i = 0; i < rows.length; i++) {
                      const row = rows[i];

                      const isCustomGroup =
                        row.isGroup === true && row.isCustomGroup === true;

                      const isZohoGroup =
                        row.isGroup === true && !row.isCustomGroup;

                      // Custom group
                      if (isCustomGroup) {
                        const key = `${section.heading}-${row.name}`;
                        const isOpen = openGroups[key];

                        const children = [];
                        let j = i + 1;

                        while (j < rows.length) {
                          children.push(rows[j]);
                          if (rows[j].isSummary) break;
                          j++;
                        }

                        i = j;

                        rendered.push(
                          <TableRow
                            key={key}
                            onClick={() =>
                              setOpenGroups((p) => ({
                                ...p,
                                [key]: !p[key],
                              }))
                            }
                            className="font-semibold cursor-pointer hover:bg-neutral-50"
                          >
                            <TableCell className="pl-5 border-l-4 border-primary">
                              <div className="flex items-center gap-2">
                                <ChevronRight
                                  size={16}
                                  className={`transition-transform ${
                                    isOpen ? "rotate-90" : ""
                                  }`}
                                />
                                {row.name}
                              </div>
                            </TableCell>

                            {row.values?.map((v: any, idx: number) => (
                              <TableCell
                                key={idx}
                                className="pr-5 text-right tabular-nums"
                              >
                                {v == null || v === 0
                                  ? "-"
                                  : v.toLocaleString("en-IN", {
                                      maximumFractionDigits: 2,
                                    })}
                              </TableCell>
                            ))}
                          </TableRow>
                        );

                        // Child rows
                        if (isOpen) {
                          children.forEach((child, cIdx) => {
                            rendered.push(
                              <TableRow
                                key={`${key}-${cIdx}`}
                                className={
                                  child.isSummary
                                    ? "bg-neutral-100 font-semibold border-t"
                                    : "hover:bg-neutral-50"
                                }
                              >
                                <TableCell className="pl-10 text-sm">
                                  {child.name}
                                </TableCell>

                                {child.values?.map((v: any, vIdx: number) => (
                                  <TableCell
                                    key={vIdx}
                                    className="pr-5 text-right text-sm tabular-nums"
                                  >
                                    {v == null || v === 0
                                      ? "-"
                                      : v.toLocaleString("en-IN", {
                                          maximumFractionDigits: 2,
                                        })}
                                  </TableCell>
                                ))}
                              </TableRow>
                            );
                          });
                        }

                        continue;
                      }

                      // Normal / Zoho row
                      rendered.push(
                        <TableRow
                          key={i}
                          className={isZohoGroup ? "font-semibold" : ""}
                        >
                          <TableCell
                            className={`pl-5 ${
                              isZohoGroup ? "border-l-4 border-blue-600" : ""
                            }`}
                          >
                            {row.name}
                          </TableCell>

                          {row.values?.map((v: any, idx: number) => (
                            <TableCell
                              key={idx}
                              className="pr-5 text-right tabular-nums"
                            >
                              {v == null || v === 0
                                ? "-"
                                : v.toLocaleString("en-IN", {
                                    maximumFractionDigits: 2,
                                  })}
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    }

                    return rendered;
                  })()}
                </TableBody>
              </Table>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const handleFetch = async () => {
    if (!startDate || !endDate) return;

    try {
      setHasSearched(true);
      setLoading(true);

      // reset view-related state
      setReports([]);
      setSelectedReport(null);
      setMis(null);
      setTabs([]);
      setOpenGroups({});

      const res = await axiosClient.get(
        `/reports/published?start_date=${startDate}&end_date=${endDate}`
      );

      const result = res.data.reports || [];

      if (!result.length) {
        setReports([]);
        return;
      }

      setReports(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setHasSearched(false);
    setReports([]);
    setSelectedReport(null);
    setMis(null);
    setTabs([]);
    setOpenGroups({});
  };

  return (
    <div className="max-w-4xl mx-auto mt-2 space-y-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <House className="text-black dark:text-white" size={20} />
            <BreadcrumbLink asChild>
              <a href="/client/dashboard" className="font-medium">
                Dashboard
              </a>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <a href="#" className="font-medium">
                MIS Report
              </a>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-2xl font-bold mb-2">MIS Reports</h1>
        <p className="text-gray-600 mt-2">
          View your MIS summary and insights for the selected period.
        </p>
      </div>

      {/* Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter size={18} />
            Filter by Date
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-wrap gap-5 items-end">
          <div>
            <p className="font-medium mb-1">From</p>
            <Input
              type="date"
              className="w-[200px]"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <p className="font-medium mb-1">To</p>
            <Input
              type="date"
              className="w-[200px]"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <Button onClick={handleFetch}>Get Reports</Button>
          <Button variant="outline" onClick={clearFilters}>
            Clear
          </Button>
        </CardContent>
      </Card>

      {reports.length > 0 && !selectedReport && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileHeart />
              <CardTitle>Select a report to access MIS insights</CardTitle>
            </div>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data Types</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {reports.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {r.types.map((type: string) => (
                          <Badge key={type} className="bg-red-500 text-white">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {r.start_date} → {r.end_date}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          r.published
                            ? "bg-green-500 text-white hover:bg-green-600"
                            : "bg-red-500 text-white hover:bg-red-600"
                        }
                      >
                        {r.published ? "Published" : "Not Published"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedReport(r);

                          const misData: MISData = r.mis_data || {};
                          setMis(misData);
                          setTabs(
                            ["pl", "bs", "gl", "bills", "invoices"].filter(
                              (k) => misData[k]
                            )
                          );
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Report data */}
      {(loading || hasSearched || reports.length > 0 || selectedReport) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText size={18} />
              Report Data
            </CardTitle>
          </CardHeader>

          <CardContent>
            {/* Loading */}
            {loading && (
              <div className="flex justify-center py-10">
                <DataLoader />
              </div>
            )}

            {/* After search but no reports */}
            {!loading && hasSearched && reports.length === 0 && (
              <div className="text-center py-16 text-gray-500">
                <NoData />
                No reports found for selected date range
              </div>
            )}

            {/* Reports exist but none selected */}
            {!loading && reports.length > 0 && !selectedReport && (
              <div className="text-center py-16 text-gray-500">
                <FileText size={36} className="mx-auto mb-3 opacity-40" />
                Select a report to view MIS data
              </div>
            )}

            {/* Actual MIS */}
            {!loading && mis && tabs.length > 0 && (
              <Tabs defaultValue={tabs[0]}>
                <TabsList className="flex flex-wrap gap-2 mb-6">
                  {tabs.map((key) => (
                    <TabsTrigger key={key} value={key}>
                      {TAB_LABELS[key]}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {tabs.map((key) => (
                  <TabsContent key={key} value={key}>
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-semibold uppercase">
                        {mis[key]?.title || TAB_LABELS[key]}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300">
                        {mis[key]?.period}
                      </p>
                    </div>

                    {renderMIS(mis[key])}

                    {key === "pl" && <ProfitLossView report={mis[key]} />}
                    {key === "bs" && <BalanceSheetView report={mis[key]} />}
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClientMIS;
