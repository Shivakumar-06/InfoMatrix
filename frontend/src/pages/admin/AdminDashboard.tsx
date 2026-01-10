import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import {
  User,
  FileText,
  CheckCircle,
  AlertTriangle,
  Plus,
  UserRoundSearch,
  TableOfContents,
  CircleUserRound,
  ClipboardClock,
  Users,
  RefreshCcw,
  FileSpreadsheet,
  House,
  ClipboardPenLine,
  CalendarHeartIcon,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "../../components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import axiosClient from "../../api/axiosClient";
import { useNavigate } from "react-router-dom";
import EmptyChartsState from "@/components/reusable/EmptyChartsState";
import Loader from "@/components/loaders/NoData";

const DashboardCharts = lazy(
  () => import("../../components/admin-mis/DashboardCharts")
);

const AdminDashboard = () => {
   const navigate = useNavigate();

  const [summary, setSummary] = useState({
    totalClients: 0,
    totalReports: 0,
    publishReport: 0,
    pendingPreview: 0,
  });

  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [pendingReports, setPendingReports] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingReports, setLoadingReports] = useState(false);

  const [searchClient, setSearchClient] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [noReportsMessage, setNoReportsMessage] = useState("");

  const hasChartData =
    chartData.length > 0 && pieData.length > 0;

  // API Calls

  const fetchDashboardSummary = useCallback(async () => {
    const { data } = await axiosClient.get("api/dashboard/summary");
    setSummary(data);
  }, []);

  const fetchRecentReports = useCallback(async () => {
    const { data } = await axiosClient.get("api/dashboard/recent-report");
    setRecentReports(data.reports || []);
  }, []);

  const fetchPendingActions = useCallback(async () => {
    const { data } = await axiosClient.get("api/dashboard/pending-actions");
    setPendingReports(data.pendingReports || []);
  }, []);

  const fetchDashboardCharts = useCallback(async () => {
    const { data } = await axiosClient.get("api/dashboard/charts");

    if (!data?.charts) return;

    const monthly = data.charts.monthly_reports?.map((item: any) => ({
      month: item.month,
      Synced: item.total_reports || 0,
      Published: item.published || 0,
    }));

    const typeDist = data.charts.type_distribution?.map((item: any) => ({
      name: item.type.toUpperCase(),
      value: item.total,
    }));

    setChartData(monthly || []);
    setPieData(typeDist || []);
  }, []);

  // Filters  

  const handleFilter = useCallback(async () => {
    setLoadingReports(true);
    setRecentReports([]);
    setNoReportsMessage("");

    try {
      const params: any = {};
      if (searchClient.trim()) params.client = searchClient.trim();
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const { data } = await axiosClient.get("api/dashboard/reports", { params });

      if (!data?.reports?.length) {
        setNoReportsMessage("No reports found");
      } else {
        setRecentReports(data.reports);
      }
    } catch {
      setNoReportsMessage("Failed to fetch reports");
    } finally {
      setLoadingReports(false);
    }
  }, [searchClient, startDate, endDate]);

  const handleClear = useCallback(() => {
    setSearchClient("");
    setStartDate("");
    setEndDate("");
    setNoReportsMessage("");
    setRecentReports([]);
    setLoadingReports(false);
    fetchRecentReports();
  }, [fetchRecentReports]);

  // Initial Load

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchDashboardSummary(),
          fetchRecentReports(),
          fetchPendingActions(),
          fetchDashboardCharts(),
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [
    fetchDashboardSummary,
    fetchRecentReports,
    fetchPendingActions,
    fetchDashboardCharts,
  ]);

  // Summary Cards

  const summaryCards = useMemo(
    () => [
      {
        title: "Total Clients",
        value: summary.totalClients,
        icon: <User className="w-6 h-6 text-white" />,
        bg: "bg-blue-500",
      },
      {
        title: "Reports Synced",
        value: summary.totalReports,
        icon: <FileText className="w-6 h-6 text-white" />,
        bg: "bg-green-500",
      },
      {
        title: "Published",
        value: summary.publishReport,
        icon: <CheckCircle className="w-6 h-6 text-white" />,
        bg: "bg-indigo-500",
      },
      {
        title: "Pending",
        value: summary.pendingPreview,
        icon: <AlertTriangle className="w-6 h-6 text-white" />,
        bg: "bg-red-500",
      },
    ],
    [summary]
  );

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6 mt-2">
        {/* Bread Crumbs */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <House width={20} className="text-black dark:text-white" />
              <BreadcrumbLink asChild>
                <a href="/admin/dashboard" className="font-medium">
                  Dashboard
                </a>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1">
                  <BreadcrumbEllipsis className="size-4" />
                  <span className="sr-only">Toggle menu</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="p-2">
                  <DropdownMenuItem>
                    <a href="/admin/clients">Add Clients</a>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <a href="/admin/templates">Templates</a>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <a href="/admin/sync">Sync Data</a>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <a href="/admin/reports">Reports</a>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <a href="/admin/compliance-types">Compliance Types</a>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <a href="/admin/compliance-calendar">Compliance Calendar</a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}

        <div>
          <h1 className="text-2xl font-bold mb-2">Welcome Back Nirvaaha!</h1>
          <p className="text-muted-foreground">
            Overview of reports, clients, and pending actions.
          </p>
        </div>

        {/* Summary Cards */}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="p-5">
                  <div className="flex items-center gap-3">
                    <Skeleton className="bg-slate-200 h-12 w-12 rounded-lg" />
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-4 w-24 bg-slate-200" />
                      <Skeleton className="h-8 w-16 bg-slate-200" />
                    </div>
                  </div>
                </Card>
              ))
            : summaryCards.map((card) => (
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
                      <p className="text-2xl font-bold text-foreground mt-1">
                        {card.value}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
        </div>

        {/* Search & Filter */}

        <Card>
          <CardHeader className="flex items-center">
            <UserRoundSearch />
            <CardTitle>Search & Filter Clients</CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <Input
              placeholder="Search by client name..."
              value={searchClient}
              onChange={(e) => setSearchClient(e.target.value)}
              className="sm:max-w-xs"
            />

            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="sm:max-w-xs"
            />

            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="sm:max-w-xs"
            />

            <div className="flex gap-2">
              <Button
                className="ml-auto sm:w-auto w-full"
                onClick={handleFilter}
              >
                Apply Filter
              </Button>
              <Button
                className="ml-auto sm:w-auto w-full"
                onClick={handleClear}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Reports */}

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <TableOfContents className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Recent Reports</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/admin/sync")}
            >
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Report Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingReports || loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="animate-pulse">
                      <TableCell>
                        <Skeleton className="h-4 w-40 bg-slate-300" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-52 bg-slate-200" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-25 rounded-full bg-slate-300" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-20 bg-slate-200" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : recentReports && recentReports.length > 0 ? (
                  recentReports.slice(0, 5).map((r, i) => (
                    <TableRow key={i} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        {r.client_id?.name || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(r.types || []).length > 0
                            ? r.types.map((t: string) => (
                                <Badge
                                  key={t}
                                  variant="secondary"
                                  className="text-[10px]"
                                >
                                  {t.toUpperCase()}
                                </Badge>
                              ))
                            : "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={r.published ? "default" : "secondary"}
                          className={`${
                            r.published
                              ? "bg-green-500 hover:bg-green-600"
                              : "bg-yellow-500 hover:bg-yellow-600 text-white"
                          }`}
                        >
                          {r.published ? "Published" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate("/admin/reports")}
                          >
                            Preview
                          </Button>
                          {!r.published && (
                            <Button
                              size="sm"
                              onClick={() => navigate("/admin/reports")}
                            >
                              Publish
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 text-center text-muted-foreground pt-6"
                    >
                      <Loader/>
                      <p> {noReportsMessage || "No reports found."}</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Client Management - Quick Navigate */}

        <Card>
          <CardHeader className="flex items-center">
            <CircleUserRound />
            <CardTitle>Quick Action Button</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-4 border rounded-lg dark:hover:bg-gray-700 hover:bg-gray-50 transition">
                <div className="flex items-center gap-2">
                  <Plus className="text-yellow-600" />
                  <span>Add Client</span>
                </div>
                <Button
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => navigate("/admin/clients")}
                >
                  Go
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg dark:hover:bg-gray-700 hover:bg-gray-50 transition">
                <div className="flex items-center gap-2">
                  <Users className="text-green-500" />
                  <span>Templates</span>
                </div>
                <Button
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => navigate("/admin/templates")}
                >
                  Go
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg dark:hover:bg-gray-700 hover:bg-gray-50 transition">
                <div className="flex items-center gap-2">
                  <RefreshCcw className="text-red-500" />
                  <span>Sync Reports</span>
                </div>
                <Button
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => navigate("/admin/sync")}
                >
                  Go
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg dark:hover:bg-gray-700 hover:bg-gray-50 transition">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="text-indigo-500" />
                  <span>Reports</span>
                </div>
                <Button
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => navigate("/admin/reports")}
                >
                  Go
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg dark:hover:bg-gray-700 hover:bg-gray-50 transition">
                <div className="flex items-center gap-2">
                  <ClipboardPenLine className="text-indigo-500" />
                  <span>Compliance Types</span>
                </div>
                <Button
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => navigate("/admin/compliance-types")}
                >
                  Go
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg dark:hover:bg-gray-700 hover:bg-gray-50 transition">
                <div className="flex items-center gap-2">
                  <CalendarHeartIcon className="text-indigo-500" />
                  <span>Compliance Calendar</span>
                </div>
                <Button
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => navigate("/admin/compliance-calendar")}
                >
                  Go
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Actions */}

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <ClipboardClock className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Pending Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 min-w-1/2 bg-slate-300" />
                  <Skeleton className="h-8 w-20 bg-slate-200" />
                </div>
              ))
            ) : pendingReports && pendingReports.length > 0 ? (
              pendingReports.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-yellow-500" />
                    <span className="text-sm font-medium flex gap-2">
                      {r.client_id?.name}
                      <Badge className="bg-yellow-500">
                        <span className="font-normal">
                          {r.templates?.template_name}
                        </span>
                      </Badge>
                      <span className="text-muted-foreground font-normal">
                        - Template
                      </span>
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate("/admin/reports")}
                  >
                    Review
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="mx-auto h-8 w-8 text-green-500 mb-2 opacity-50" />
                <p>No pending actions</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Charts */}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-[380px] bg-slate-300" />
            <Skeleton className="h-[380px] bg-slate-200" />
          </div>
        ) : !hasChartData ? (
          // Loaded but No Data
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EmptyChartsState />
            <EmptyChartsState />
          </div>
        ) : (
          <Suspense
            fallback={
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-[380px] bg-slate-200" />
                <Skeleton className="h-[380px] bg-slate-200" />
              </div>
            }
          >
            <DashboardCharts chartData={chartData} pieData={pieData} />
          </Suspense>
        )}
      </div>
    </>
  );
};

export default AdminDashboard;
