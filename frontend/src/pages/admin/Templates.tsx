import { useState, useEffect, useMemo, useCallback } from "react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Checkbox } from "../../components/ui/checkbox";
import { Switch } from "../../components/ui/switch";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  House,
  Search,
  Trash2,
  Plus,
  FileBox,
  LayoutTemplate,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import axiosClient from "../../api/axiosClient";
import { toast } from "sonner";

interface TemplateItem {
  id: string;
  template_name: string;
  status: "active" | "offline";
  types: string[];
}

type ReportTypeKey = "pl" | "bs" | "bills" | "invoices";

export default function Template() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [status, setStatus] = useState("active");
  const [search, setSearch] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateItem | null>(
    null
  );

  const [types, setTypes] = useState<Record<ReportTypeKey, boolean>>({
    pl: false,
    bs: false,
    bills: false,
    invoices: false,
  });

  const [templateList, setTemplateList] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(false);

  // FETCH TEMPLATES

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get("api/templates");
      setTemplateList(res.data.templates || []);
    } catch (err) {
      console.error("Failed to fetch templates:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // FILTER

  const searchText = search.toLowerCase();

  const filtered = useMemo(
    () =>
      templateList.filter((t) =>
        t.template_name.toLowerCase().includes(searchText)
      ),
    [templateList, searchText]
  );

  // TOGGLE TYPE

  const toggleType = useCallback((key: ReportTypeKey) => {
    setTypes((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // CREATE

  const handleCreate = useCallback(async () => {
    const selectedTypes = Object.keys(types).filter(
      (k) => types[k as ReportTypeKey]
    );

    if (!templateName.trim()) {
      toast.error("Template name is required");
      return;
    }

    if (selectedTypes.length === 0) {
      toast.error("Select at least one report type");
      return;
    }

    try {
      await axiosClient.post("api/templates", {
        template_name: templateName,
        status,
        types: selectedTypes,
      });

      fetchTemplates();
      setDialogOpen(false);
      setTemplateName("");
      setStatus("active");
      setTypes({ pl: false, bs: false, bills: false, invoices: false });

      toast.success("Template created successfully");
    } catch {
      toast.error("Failed to create template");
    }
  }, [templateName, status, types, fetchTemplates]);

  // STATUS TOGGLE

  const handleToggleStatus = useCallback(
    async (tpl: TemplateItem) => {
      const newStatus = tpl.status === "active" ? "offline" : "active";

      setTemplateList((prev) =>
        prev.map((t) => (t.id === tpl.id ? { ...t, status: newStatus } : t))
      );

      try {
        await axiosClient.patch(`/templates/${tpl.id}/status`, {
          status: newStatus,
        });

        newStatus === "active"
          ? toast.success("Template Activated Successfully")
          : toast.warning("Template Deactivated Successfully");
      } catch {
        toast.error("Failed to update status");
        fetchTemplates();
      }
    },
    [fetchTemplates]
  );

  // DELETE

  const handleDelete = useCallback(
    async (tpl: TemplateItem) => {
      try {
        await axiosClient.delete(`api/templates/${tpl.id}`);
        fetchTemplates();
        toast.success("Template deleted successfully");
      } catch {
        toast.error("Failed to delete template");
      }
    },
    [fetchTemplates]
  );
  return (
    <div className="max-w-4xl mx-auto space-y-8 mt-2">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <House width={20} className="text-black dark:text-white" />
            <BreadcrumbLink asChild>
              <a
                href="/admin/dashboard"
                className="ml-1 font-medium hover:text-primary"
              >
                Dashboard
              </a>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <a href="/admin/templates" className="font-medium">
                Templates
              </a>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Report Templates</h1>
        <p className="text-muted-foreground">
          Create and manage reporting templates for client outputs.
        </p>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4 space-y-0 pb-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <LayoutTemplate className="w-5 h-5 text-primary" />
            <CardTitle className="text-xl">All Templates</CardTitle>
          </div>
          <div className="flex w-full sm:w-auto items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button onClick={() => setDialogOpen(true)} className="shrink-0">
              <Plus className="w-4 h-4 mr-2" />
              Add Template
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="pl-6">Template Name</TableHead>
                <TableHead>Included Report Types</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-6">
                      <Skeleton className="h-4 w-40 bg-slate-200" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-60  bg-slate-200" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16  bg-slate-200" />
                    </TableCell>
                    <TableCell className="pr-6">
                      <Skeleton className="h-8 w-8 ml-auto  bg-slate-200" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <FileBox className="w-10 h-10 mb-2 opacity-20" />
                      <p>No templates found</p>
                      {search && (
                        <p className="text-sm">Try adjusting your search</p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((tpl) => (
                  <TableRow
                    key={tpl.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="pl-6 font-medium">
                      {tpl.template_name}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {tpl.types.map((type) => (
                          <Badge
                            key={type}
                            variant="secondary"
                            className="text-xs uppercase"
                          >
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {tpl.status === "active" ? (
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200 gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-gray-50 text-gray-600 border-gray-200 gap-1"
                          >
                            <XCircle className="w-3 h-3" /> Offline
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {tpl.status === "active" ? "On" : "Off"}
                          </span>
                          <Switch
                            checked={tpl.status === "active"}
                            onCheckedChange={() => handleToggleStatus(tpl)}
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8 w-8 hover:text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            setDeleteDialogOpen(true);
                            setSelectedTemplate(tpl);
                          }}
                        >
                          <Trash2 size={16} />
                        </Button>
                        <Dialog
                          open={deleteDialogOpen}
                          onOpenChange={setDeleteDialogOpen}
                        >
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Delete Template</DialogTitle>
                              <p>
                                Are you sure you want to delete{" "}
                                <strong>
                                  {selectedTemplate?.template_name}
                                </strong>
                                ?
                              </p>
                            </DialogHeader>

                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setDeleteDialogOpen(false);
                                  setSelectedTemplate(null);
                                }}
                              >
                                Cancel
                              </Button>

                              <Button
                                variant="default"
                                onClick={() => {
                                  if (selectedTemplate) {
                                    handleDelete(selectedTemplate);
                                    setDeleteDialogOpen(false);
                                    setSelectedTemplate(null);
                                  }
                                }}
                              >
                                Delete
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Template Dialog */}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
            <DialogDescription>
              Configure the reports included in this template.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="t-name">Template Name</Label>
              <Input
                id="t-name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g. Executive Summary"
              />
            </div>

            <div className="space-y-2">
              <Label>Default Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Included Report Types</Label>
              <div className="grid grid-cols-2 gap-4 border rounded-lg p-4">
                {(Object.keys(types) as ReportTypeKey[]).map((k) => (
                  <div key={k} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${k}`}
                      checked={types[k]}
                      onCheckedChange={() => toggleType(k)}
                    />
                    <label
                      htmlFor={`type-${k}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize cursor-pointer"
                    >
                      {k.toUpperCase()}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
