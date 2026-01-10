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
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
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
  CheckCircle,
  FileText,
  Filter,
  House,
  Search,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

// Types  

type Compliance = {
  id: string;
  title: string;
  due_date: string;
  filing_date: string | null;
  status: "completed" | "pending" | "overdue" | "upcoming";
  compliance_types: {
    name: string;
  };
};

const formatDate = (date?: string | null) =>
  date ? new Date(date).toLocaleDateString("en-IN") : "—";


const ClientCompliance = () => {
  const [summary, setSummary] = useState({
    totalItems: 0,
    totalCompleted: 0,
    totalPending: 0,
    totalOverdue: 0,
  });

  const [loading, setLoading] = useState(true);
  const [compliance, setCompliance] = useState<Compliance[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Fetch APIs

  const fetchSummary = async () => {
    try {
      const { data } = await axiosClient.get(
        "api/compliances/client/summary"
      );
      setSummary(data);
    } catch {
      toast.error("Failed to load compliance summary");
    }
  };

  const fetchCompliances = async () => {
    try {
      const { data } = await axiosClient.get("api/compliances/client");
      setCompliance(data || []);
    } catch {
      toast.error("Failed to load compliances");
    }
  };

  useEffect(() => {
    Promise.all([fetchSummary(), fetchCompliances()]).finally(() =>
      setLoading(false)
    );
  }, []);

  // Filters

  const filteredCompliance = useMemo(() => {
    const s = search.toLowerCase();

    return compliance.filter((c) => {
      const searchMatch =
        c.title.toLowerCase().includes(s) ||
        c.compliance_types?.name.toLowerCase().includes(s);

      const statusMatch =
        filterStatus === "all" || c.status === filterStatus;

      return searchMatch && statusMatch;
    });
  }, [compliance, search, filterStatus]);

  // Summary Cards

  const summaryCards = [
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
  ];


  return (
    <div className="max-w-4xl mx-auto space-y-6 mt-2">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <House width={20} />
            <BreadcrumbLink asChild>
              <a href="/client/dashboard">Dashboard</a>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>Compliance Calendar</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2">
          Compliance Calendar
        </h1>
        <p className="text-muted-foreground">
          Track your compliance deadlines and filing status.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-5">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12" />
                  <div className="space-y-2">
                    <Skeleton className="w-20 h-4" />
                    <Skeleton className="w-24 h-4" />
                  </div>
                </div>
              </Card>
            ))
          : summaryCards.map((card) => (
              <Card key={card.title} className="p-5">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${card.bg}`}>
                    {card.icon}
                  </div>
                  <div>
                    <CardTitle className="text-sm text-muted-foreground">
                      {card.title}
                    </CardTitle>
                    <p className="text-2xl font-bold">
                      {card.value}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
      </div>

      {/* Filters */}
      <CardContent className="px-1 py-2">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search compliance..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Filing Date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6">
                <Loader />
              </TableCell>
            </TableRow>
          ) : filteredCompliance.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6">
                <Loader />
                <p>No compliances found</p>
              </TableCell>
            </TableRow>
          ) : (
            filteredCompliance.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">
                  {c.title}
                </TableCell>
                <TableCell>
                  {c.compliance_types?.name}
                </TableCell>
                <TableCell>{formatDate(c.due_date)}</TableCell>
                <TableCell>{formatDate(c.filing_date)}</TableCell>
                <TableCell>
                  <StatusBadge status={c.status} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ClientCompliance;
