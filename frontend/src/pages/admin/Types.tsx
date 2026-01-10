import { useEffect, useMemo, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Trash2, Pencil, FileText, House } from "lucide-react";
import axiosClient from "@/api/axiosClient";
import { toast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Loader from "@/components/loaders/NoData";

type ComplianceType = {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive";
};

export default function Types() {
  const [types, setTypes] = useState<ComplianceType[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [editingType, setEditingType] = useState<ComplianceType | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // FETCH

  const fetchTypes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get("api/compliance-types/all");
      setTypes(res.data || []);
    } catch {
      console.log("Failed to load types");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTypes();
  }, [fetchTypes]);

  // FILTER

  const searchText = search.toLowerCase();

  const filtered = useMemo(
    () => types.filter((t) => t.name.toLowerCase().includes(searchText)),
    [types, searchText]
  );

  // CREATE / UPDATE

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      toast.error("Type name is required");
      return;
    }

    try {
      if (editingType) {
        await axiosClient.put(
          `api/compliance-types/${editingType.id}/update`,
          { name, description }
        );
        toast.success("Type updated");
      } else {
        await axiosClient.post("api/compliance-types/create", {
          name,
          description,
        });
        toast.success("Type created");
      }

      setDialogOpen(false);
      setEditingType(null);
      setName("");
      setDescription("");
      fetchTypes();
    } catch {
      toast.error("Operation failed");
    }
  }, [name, description, editingType, fetchTypes]);

  // DELETE

  const handleDelete = useCallback(async () => {
    if (!editingType) return;

    try {
      await axiosClient.delete(
        `api/compliance-types/${editingType.id}/delete`
      );
      toast.success("Type deleted");
      fetchTypes();
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleteDialog(false);
      setEditingType(null);
    }
  }, [editingType, fetchTypes]);

  
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
              <a href="/admin/compliance-types">Compliance Types</a>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Compliance Types</h1>
        <p className="text-muted-foreground">
          Manage categories used for compliances.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <CardTitle>All Types</CardTitle>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search types..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Button
              onClick={() => {
                setEditingType(null);
                setName("");
                setDescription("");
                setDialogOpen(true);
              }}
            >
              Add Type
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="pl-6">Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell className="pl-6">
                      <Skeleton className="h-4 w-40 bg-slate-300" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-52 bg-slate-200" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20 rounded-full bg-slate-300" />
                    </TableCell>
                    <TableCell className="pr-3 text-right">
                      <div className="flex justify-end gap-3">
                        <Skeleton className="h-8 w-8 rounded-md bg-slate-200" />
                        <Skeleton className="h-8 w-8 rounded-md bg-slate-300" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-gray-500 pt-8">
                    <Loader />
                    <p>No types found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((t) => (
                  <TableRow key={t.id} className="hover:bg-muted/50">
                    <TableCell className="pl-6 font-medium">{t.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {t.description || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          t.status === "active"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-gray-50 text-gray-600 border-gray-200"
                        }
                      >
                        {t.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <div className="flex justify-end gap-3">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => {
                            setEditingType(t);
                            setName(t.name);
                            setDescription(t.description);
                            setDialogOpen(true);
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => {
                            setEditingType(t);
                            setDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* CREATE / EDIT */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingType
                ? "Edit The Compliance-Type"
                : "Create a Compliance-Type"}
            </DialogTitle>
            <DialogDescription>
              {editingType
                ? "Edit the type details."
                : "Add a new compliance type."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Type name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Type description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <Button className="w-full" onClick={handleSave}>
              {editingType ? "Update" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* DELETE */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Type</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete{" "}
            <strong>{editingType?.name}</strong>?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
