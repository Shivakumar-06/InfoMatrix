import axiosClient from "@/api/axiosClient";
import Loader from "@/components/loaders/NoData";
import StatusBadge from "@/components/reusable/StatusBadge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  Building2,
  CheckCircle,
  FileText,
  Filter,
  House,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState, useCallback } from "react";
import { toast } from "sonner";

// Types

type ComplianceType = {
  id: string;
  name: string;
  description: string;
};

type Compliance = {
  id: string;
  title: string;
  due_date: string;
  filing_date: string | null;
  description: string;
  status: "completed" | "pending" | "overdue" | "upcoming";
  client_id: string;
  compliance_type_id: string;
  clients: { id: string; name: string };
  compliance_types: { id: string; name: string };
};

const formatDate = (date?: string | null) =>
  date ? new Date(date).toLocaleDateString("en-IN") : "—";

const Compliance = () => {
  const [summary, setSummary] = useState({
    totalItems: 0,
    totalCompleted: 0,
    totalPending: 0,
    totalOverdue: 0,
  });

  const [loading, setLoading] = useState(true);
  const [loadingReports, setLoadingReports] = useState(false);

  const [client, setClient] = useState<any[]>([]);
  const [complianceType, setComplianceType] = useState<ComplianceType[]>([]);
  const [compliance, setCompliance] = useState<Compliance[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [editingCompliance, setEditingCompliance] = useState<Compliance | null>(
    null
  );
  const [selectedCompliance, setSelectedCompliance] =
    useState<Compliance | null>(null);

  const [title, setTitle] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [complianceDescription, setComplianceDescription] = useState("");
  const [type, setType] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [filingDate, setFilingDate] = useState("");

  const [search, setSearch] = useState("");
  const [filterClient, setFilterClient] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // API calls

  const fetchDataSummary = useCallback(async () => {
    const { data } = await axiosClient.get("/compliances/summary");
    setSummary(data);
  }, []);

  const fetchClients = useCallback(async () => {
      const res = await axiosClient.get("/admin/clients");
      setClient(res.data.clients);
  }, []);

  const fetchComplianceTypes = useCallback(async () => {
   
    
      const res = await axiosClient.get("/compliance-types/all");
      setComplianceType(res.data);
    
  }, []);

  const fetchCompliances = useCallback(async () => {
    setLoadingReports(true);
    try {
      const res = await axiosClient.get("/compliances/all");
      setCompliance(res.data);
    } finally {
      setLoadingReports(false);
    }
  }, []);

  // Mutations

  const createCompliance = useCallback(async () => {
    if (!selectedClientId || !type || !dueDate) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      await axiosClient.post("/compliances/create", {
        title,
        client_id: selectedClientId,
        compliance_type_id: type,
        due_date: dueDate,
        filing_date: filingDate || null,
        description: complianceDescription,
      });

      await Promise.all([fetchCompliances(), fetchDataSummary()]);
      resetForm();
      setDialogOpen(false);
      toast.success("Compliance created successfully");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to create compliance"
      );
    }
  }, [
    title,
    selectedClientId,
    type,
    dueDate,
    filingDate,
    complianceDescription,
    fetchCompliances,
    fetchDataSummary,
  ]);

  const updateCompliance = useCallback(async () => {
    if (!editingCompliance) return;

    try {
      await axiosClient.put(`/compliances/${editingCompliance.id}/update`, {
        title,
        client_id: selectedClientId,
        compliance_type_id: type,
        due_date: dueDate,
        filing_date: filingDate || null,
        description: complianceDescription,
      });

      await Promise.all([fetchCompliances(), fetchDataSummary()]);
      resetForm();
      setDialogOpen(false);
      toast.success("Compliance updated successfully");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to update compliance"
      );
    }
  }, [
    editingCompliance,
    title,
    selectedClientId,
    type,
    dueDate,
    filingDate,
    complianceDescription,
    fetchCompliances,
    fetchDataSummary,
  ]);

  const deleteCompliance = useCallback(async () => {
    if (!selectedCompliance) return;

    try {
      await axiosClient.delete(`/compliances/${selectedCompliance.id}/delete`);
      await Promise.all([fetchCompliances(), fetchDataSummary()]);
      setDeleteDialogOpen(false);
      toast.success("Compliance deleted successfully");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to delete compliance"
      );
    }
  }, [selectedCompliance, fetchCompliances, fetchDataSummary]);

  const resetForm = () => {
    setEditingCompliance(null);
    setTitle("");
    setSelectedClientId("");
    setType("");
    setDueDate("");
    setFilingDate("");
    setComplianceDescription("");
  };

  // Initial load

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchDataSummary(),
          fetchClients(),
          fetchComplianceTypes(),
          fetchCompliances(),
        ]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchDataSummary, fetchClients, fetchComplianceTypes, fetchCompliances]);

  // Derived data

  const summaryCards = useMemo(
    () => [
      {
        title: "Total Items",
        value: summary.totalItems,
        icon: <FileText className="w-6 h-6 text-white" />,
        bg: "bg-blue-500",
      },
      {
        title: "Completed",
        value: summary.totalCompleted,
        icon: <CheckCircle className="w-6 h-6 text-white" />,
        bg: "bg-green-500",
      },
      {
        title: "Pending",
        value: summary.totalPending,
        icon: <FileText className="w-6 h-6 text-white" />,
        bg: "bg-yellow-500",
      },
      {
        title: "Overdue",
        value: summary.totalOverdue,
        icon: <AlertTriangle className="w-6 h-6 text-white" />,
        bg: "bg-red-500",
      },
    ],
    [summary]
  );

  const searchText = search.toLowerCase();

  const filteredCompliance = useMemo(() => {
    return compliance.filter((c) => {
      const searchMatch =
        c.title.toLowerCase().includes(searchText) ||
        c.clients?.name.toLowerCase().includes(searchText) ||
        c.compliance_types?.name.toLowerCase().includes(searchText);

      const clientMatch =
        filterClient === "all" || c.client_id === filterClient;
      const typeMatch =
        filterType === "all" || c.compliance_type_id === filterType;
      const statusMatch = filterStatus === "all" || c.status === filterStatus;

      return searchMatch && clientMatch && typeMatch && statusMatch;
    });
  }, [compliance, searchText, filterClient, filterType, filterStatus]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 mt-2">
      {/* Bread Crumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <House width={20} className="text-black dark:text-white" />
            <BreadcrumbLink asChild>
              <a href="/admin/dashboard">Dashboard</a>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <a href="/admin/compliance-calendar">Compliance Calendar</a>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        {/* Left side - Text */}
        <div>
          <h1 className="text-2xl font-bold mb-2">Compliance Calendar</h1>
          <p className="text-muted-foreground">
            Manage all clients compliances by creating, updating, and tracking
            deadlines.
          </p>
        </div>

        <div>
          {/* Right side - Button */}
          <Button
            onClick={() => {
              setDialogOpen(true);
              resetForm();
            }}
          >
            Add Compliance +
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-5">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 bg-slate-200" />
                  <div className="flex flex-col gap-2">
                    <Skeleton className="w-20 h-4 bg-slate-200" />
                    <Skeleton className="w-24 h-4 bg-slate-200" />
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

      {/* Filters */}
      <CardContent className="px-1 py-2">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search compliance items..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={filterClient} onValueChange={setFilterClient}>
            <SelectTrigger className="w-[160px]">
              <Building2 className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              {client.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[140px]">
              <FileText className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {complianceType.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => {
              setSearch("");
              setFilterClient("all");
              setFilterType("all");
              setFilterStatus("all");
            }}
          >
            Clear
          </Button>
        </div>
      </CardContent>

      <div className="mt-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Existing Compliance</h2>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Filing Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingReports ? (
              <>
                {[1, 2].map((i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell>
                      <Skeleton className="h-4 w-20 bg-slate-300" />
                    </TableCell>

                    <TableCell>
                      <Skeleton className="h-4 w-20 bg-slate-200" />
                    </TableCell>

                    <TableCell>
                      <Skeleton className="h-4 w-20 bg-slate-300" />
                    </TableCell>

                    <TableCell>
                      <Skeleton className="h-4 w-20 bg-slate-200" />
                    </TableCell>

                    <TableCell>
                      <Skeleton className="h-4 w-20 bg-slate-300" />
                    </TableCell>

                    <TableCell>
                      <Skeleton className="h-4 w-20 bg-slate-200" />
                    </TableCell>

                    <TableCell>
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-8 rounded-md bg-slate-300" />
                        <Skeleton className="h-8 w-8 rounded-md bg-slate-200" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </>
            ) : filteredCompliance.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center pt-4 text-muted-foreground"
                >
                  <Loader />
                  <p>No compliances match your filters</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredCompliance.map((c) => (
                <TableRow
                  key={c.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  {/* Title */}
                  <TableCell className="font-medium">{c.title}</TableCell>

                  {/* Client */}
                  <TableCell className="text-muted-foreground">
                    {c.clients?.name}
                  </TableCell>

                  {/* Type */}
                  <TableCell>
                    <span className="px-2 py-1 text-xs rounded-md bg-slate-100 text-slate-700">
                      {c.compliance_types?.name}
                    </span>
                  </TableCell>

                  {/* Due Date */}
                  <TableCell>{formatDate(c.due_date)}</TableCell>

                  {/* Filing Date */}
                  <TableCell className="text-muted-foreground">
                    {formatDate(c.filing_date)}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <StatusBadge status={c.status} />
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setEditingCompliance(c);

                          setTitle(c.title);
                          setSelectedClientId(c.client_id);
                          setType(c.compliance_type_id);
                          setDueDate(
                            c.due_date ? c.due_date.split("T")[0] : ""
                          );
                          setFilingDate(
                            c.filing_date ? c.filing_date.split("T")[0] : ""
                          );
                          setComplianceDescription(c.description || "");

                          setDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setSelectedCompliance(c);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create + Edit + Delete Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Compliance</DialogTitle>
            <DialogDescription>
              Add a new compliance item to the calendar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="flex gap-4">
              <div className="space-y-2">
                <Label htmlFor="client">Client</Label>
                <Select
                  value={selectedClientId}
                  onValueChange={setSelectedClientId}
                >
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent position="item-aligned" className="mt-10">
                    <SelectGroup>
                      {client.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {complianceType.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild className="w-[220px]">
                    <Input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0"></PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Filing Date</Label>
                <Popover>
                  <PopoverTrigger asChild className="w-[220px]">
                    <Input
                      type="date"
                      value={filingDate}
                      onChange={(e) => setFilingDate(e.target.value)}
                    />
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0"></PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Description</Label>
              <Input
                id="title"
                placeholder="Enter title"
                value={complianceDescription}
                onChange={(e) => setComplianceDescription(e.target.value)}
              />
            </div>

            <Button
              className="w-full"
              onClick={editingCompliance ? updateCompliance : createCompliance}
            >
              {editingCompliance ? "Update Compliance" : "Create Compliance"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Compliance</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>{selectedCompliance?.title}</strong>? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>

            <Button variant="destructive" onClick={deleteCompliance}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Compliance;
