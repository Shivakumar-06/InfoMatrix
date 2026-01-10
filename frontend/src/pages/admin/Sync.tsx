import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../components/ui/table";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "../../components/ui/breadcrumb";

import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";

import {
  Search,
  CheckCircle,
  Ban,
  ClockAlert,
  Trash2,
  CircleCheckBig,
  House,
} from "lucide-react";

import axiosClient from "../../api/axiosClient";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import Loader from "@/components/loaders/NoData";

const Sync = () => {
    const [clients, setClients] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);

  const [selectedClient, setSelectedClient] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingReports, setLoadingReports] = useState(false);
  const [search, setSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);
  const [deleteReportName, setDeleteReportName] = useState<string | null>(null);

  // FETCH CLIENTS + TEMPLATES + REPORTS

  const fetchReports = useCallback(async () => {
    setLoadingReports(true);
    try {
      const [clientsRes, reportsRes, templatesRes] = await Promise.all([
        axiosClient.get("api/admin/clients"),
        axiosClient.get("api/reports/all-reports"),
        axiosClient.get("api/templates"),
      ]);

      setClients(clientsRes.data.clients || []);
      setReports(reportsRes.data.reports || []);
      setTemplates(templatesRes.data.templates || []);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoadingReports(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // SYNC FUNCTION

  const handleSync = useCallback(async () => {
    if (!selectedClient || !selectedTemplate || !startDate || !endDate) {
      toast.warning("All fields are required");
      return;
    }

    try {
      setLoading(true);

      await axiosClient.post("api/reports/sync", {
        client_id: selectedClient,
        template_id: selectedTemplate,
        start_date: startDate,
        end_date: endDate,
      });

      setSelectedClient("");
      setSelectedTemplate("");
      setStartDate("");
      setEndDate("");

      await fetchReports();

      toast.success("Data Synced Successfully", {
        description: "Preview & publish the synced data",
        icon: <CheckCircle className="text-green-500" />,
      });
    } catch {
      toast.error("Failed to sync data", {
        icon: <Ban className="text-red-500" />,
      });
    } finally {
      setLoading(false);
    }
  }, [selectedClient, selectedTemplate, startDate, endDate, fetchReports]);

  // DELETE REPORT

  const handleDelete = useCallback(async () => {
    if (!reportId) return;

    try {
      await axiosClient.delete(`api/reports/${reportId}`);
      setDialogOpen(false);
      setReportId(null);
      await fetchReports();

      toast.error("Report deleted", {
        icon: <Trash2 className="text-red-500" />,
      });
    } catch {
      toast.error("Failed to delete");
    }
  }, [reportId, fetchReports]);

  // MERGE CLIENT + TEMPLATE INTO REPORT ROWS

  const reportsWithMeta = useMemo(() => {
    return reports.map((r) => {
      const client = clients.find((c) => c.id === r.client_id);
      const template = templates.find((t) => t.id === r.template_id);

      return {
        ...r,
        client_name: client?.name || "Unknown",
        template_name: template?.template_name || "Unknown Template",
      };
    });
  }, [reports, clients, templates]);

  // FILTER REPORTS

  const searchText = search.toLowerCase();

  const filteredReports = useMemo(() => {
    return reportsWithMeta.filter(
      (r) =>
        r.client_name.toLowerCase().includes(searchText) ||
        r.template_name.toLowerCase().includes(searchText)
    );
  }, [reportsWithMeta, searchText]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 mt-2">
      {/* Breadcrumb */}
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
            <BreadcrumbLink asChild>
              <a href="/admin/sync" className="font-medium">
                Sync Data
              </a>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Sync Reports From Zohobooks.
        </h1>
        <p className="text-muted-foreground">
          Automatically fetch financial reports from Zoho Books by selecting the
          client, report template, and date range.
        </p>
      </div>

      {/* SYNC FORM */}
      <div className="flex gap-4 flex-wrap items-center">
        {/* CLIENT SELECT */}
        <Select value={selectedClient} onValueChange={setSelectedClient}>
          <SelectTrigger className="md:w-[100px] lg:w-[200px]">
            <SelectValue placeholder="Select Client" />
          </SelectTrigger>
          <SelectContent position="item-aligned" className="mt-18">
            <SelectGroup>
              <SelectLabel>Clients</SelectLabel>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* TEMPLATE SELECT */}
        <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
          <SelectTrigger className="md:w-[100px] lg:w-[200px]">
            <SelectValue placeholder="Select Template" />
          </SelectTrigger>
          <SelectContent
            position="item-aligned"
            align="start"
            className="mt-18"
          >
            <SelectGroup>
              <SelectLabel>Templates</SelectLabel>
              {templates.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.template_name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* DATE RANGE */}
        <Input
          type="date"
          className="md:w-[100px] lg:w-[150px]"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <Input
          type="date"
          className="md:w-[100px] lg:w-[150px]"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />

        <Button
          onClick={handleSync}
          disabled={loading}
          className="lg:w-[130px]"
        >
          {loading ? "Syncing..." : "Sync"}
        </Button>

        <div className="flex lg:justify-end lg:w-full">
          <Button
            variant="outline"
            className="md:w-[100px] lg:w-[130px]"
            onClick={() => {
              setSelectedClient("");
              setSelectedTemplate("");
              setStartDate("");
              setEndDate("");
            }}
          >
            Clear
          </Button>
        </div>
      </div>

      {/* REPORTS TABLE */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Existing Reports</h2>
          <div className="relative">
            <Search className="absolute left-2 top-2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search..."
              className="pl-8 w-[220px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Template</TableHead>
              <TableHead>Date Range</TableHead>
              <TableHead>Published</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loadingReports ? (
              <>
                {[1, 2].map((i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell>
                      <Skeleton className="h-4 w-48 bg-slate-200" />
                    </TableCell>

                    <TableCell>
                      <Skeleton className="h-4 w-32 bg-slate-200" />
                    </TableCell>

                    <TableCell>
                      <Skeleton className="h-4 w-40 bg-slate-200" />
                    </TableCell>

                    <TableCell>
                      <Skeleton className="h-4 w-24 bg-slate-200" />
                    </TableCell>

                    <TableCell>
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-8 rounded-md bg-slate-200" />
                        <Skeleton className="h-8 w-8 rounded-md bg-slate-200" />
                      </div>
                      
                    </TableCell>
                  </TableRow>
                ))}
              </>
            ) : filteredReports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500 pt-6">
                  <Loader />
                  <p>No reports found</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredReports.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.client_name}</TableCell>
                  <TableCell>{r.template_name}</TableCell>
                  <TableCell>
                    {r.start_date} → {r.end_date}
                  </TableCell>
                  <TableCell>
                    {r.published ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CircleCheckBig /> Published
                      </span>
                    ) : (
                      <span className="text-red-600 flex items-center gap-1">
                        <ClockAlert /> Not Published
                      </span>
                    )}
                  </TableCell>

                  <TableCell>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setReportId(r.id);
                          setDialogOpen(true);
                          setDeleteReportName(r.client_name);
                        }}
                      >
                        <Trash2 size={16} />
                      </Button>

                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Report</DialogTitle>
                        </DialogHeader>

                        <p>
                          Are you sure want to delete report for{" "}
                          <strong>{deleteReportName}</strong>?
                        </p>

                        <DialogFooter className="mt-4">
                          <Button
                            variant="outline"
                            onClick={() => setDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleDelete}>Delete</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Sync;
