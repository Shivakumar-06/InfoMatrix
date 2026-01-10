import { useEffect, useState, useCallback, Suspense } from "react";
import axiosClient from "../../api/axiosClient";
import {
  CalendarHeartIcon,
  CircleUserRound,
  FileSpreadsheet,
  House,
  User,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "../../components/ui/breadcrumb";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import ClientDashboardSkeleton from "@/components/skeleton/ClientDashboardSkeleton";
import SummaryCards from "@/components/client-mis/SummaryCard";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyChartsState from "@/components/reusable/EmptyChartsState";
import DashboardCharts from "@/components/admin-mis/DashboardCharts";
import { RecentReportsTable } from "@/components/client-mis/DashboardRecentReports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type SummaryShape = {
  totalReports?: number;
  publishedReports?: number;
  lastSynced?: string;
  orgId?: string;
  name?: string;
};

const ClientDashboard = () => {
  const navigate = useNavigate();

  // API States
  const [summary, setSummary] = useState<SummaryShape | null>(null);
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const hasChartData =
    chartData?.some((d) => d.Synced > 0 || d.Published > 0) &&
    pieData?.some((p) => p.value > 0);

  const handleView = useCallback(
    (type: string) => {
      switch (type?.toUpperCase()) {
        case "BS":
        case "BALANCE SHEET":
          navigate("/client/balancesheet");
          break;

        case "PL":
        case "PROFIT & LOSS":
        case "PROFIT AND LOSS":
          navigate("/client/balancesheet");
          break;

        case "GL":
        case "GENERAL LEDGER":
          navigate("/client/general-ledger");
          break;

        case "BILLS":
        case "ACCOUNTS PAYABLE":
          navigate("/client/accounts-payable");
          break;

        case "INVOICES":
        case "ACCOUNTS RECEIVABLE":
          navigate("/client/accounts-receivable");
          break;

        default:
          toast.error("Page not available for this report type");
          break;
      }
    },
    [navigate]
  );

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchDashboardData = async () => {
      setLoading(true);

      try {
        // run all three requests in parallel
        const [summaryRes, reportsRes, chartsRes] = await Promise.all([
          axiosClient.get("api/client/dashboard", { signal }),
          axiosClient.get("api/client/reports", { signal }),
          axiosClient.get("api/client/charts", { signal }),
        ]);

        if (signal.aborted) return;

        setSummary(summaryRes.data ?? null);
        setRecentReports(reportsRes.data.reports || []);
        setChartData(chartsRes.data.barData || []);
        setPieData(chartsRes.data.pieData || []);
      } catch (err: any) {
        if (err?.name === "CanceledError" || err?.name === "AbortError") {
          // request cancelled — silently ignore
          return;
        }
        console.error("Error fetching dashboard data:", err);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <div className="flex ps-6 justify-center items-center text-gray-500">
        <div className="flex justify-center items-center ps-6">
          <ClientDashboardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 mt-2">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <House width={20} className="text-black dark:text-white" />
            <BreadcrumbLink asChild>
              <a href="/client/dashboard" className="font-medium">
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
                  <a href="/client/mis-report">MIS Report</a>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <a href="/client/compliance-calendar">Compliance Calendar</a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2">
          Welcome Back {summary?.name ?? ""}!
        </h1>

        <p className="text-muted-foreground">
          Overview of your synced and published reports.
        </p>
      </div>

      {/* Summary Cards (memoized component) */}
      <SummaryCards summary={summary} />

      {/* Recent Reports (memoized component) */}
      <RecentReportsTable reports={recentReports} onView={handleView} />

      {/* Quick navigations */}
      <Card>
        <CardHeader className="flex items-center">
          <CircleUserRound />
          <CardTitle>Quick Action Button</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg dark:hover:bg-gray-700 hover:bg-gray-50 transition">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="text-yellow-600" />
                <span>MIS Reports</span>
              </div>
              <Button
                size="sm"
                className="cursor-pointer"
                onClick={() => navigate("/client/mis-report")}
              >
                Go
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg dark:hover:bg-gray-700 hover:bg-gray-50 transition">
              <div className="flex items-center gap-2">
                <CalendarHeartIcon className="text-green-500" />
                <span>Compliance Calendar</span>
              </div>
              <Button
                size="sm"
                className="cursor-pointer"
                onClick={() => navigate("/client/compliance-calendar")}
              >
                Go
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg dark:hover:bg-gray-700 hover:bg-gray-50 transition">
              <div className="flex items-center gap-2">
                <User className="text-green-500" />
                <span>Profile Settings</span>
              </div>
              <Button
                size="sm"
                className="cursor-pointer"
                onClick={() => navigate("/client/profile")}
              >
                Go
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
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
  );
};

export default ClientDashboard;
