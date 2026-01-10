import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../components/ui/table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "../../components/ui/breadcrumb";
import axiosClient from "../../api/axiosClient";
import { House, Search, Trash2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import Loader from "@/components/loaders/NoData";

// Row Component 

const ClientRow = React.memo(
  ({
    client,
    onDelete,
  }: {
    client: any;
    onDelete: () => void;
  }) => {
    return (
      <TableRow>
        <TableCell>{client.name}</TableCell>
        <TableCell>{client.email}</TableCell>
        <TableCell>{client.id}</TableCell>
        <TableCell>{client.org_id || "Not available"}</TableCell>
        <TableCell>
          {new Date(client.created_at).toLocaleDateString("en-IN")}
        </TableCell>
        <TableCell>
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </TableCell>
      </TableRow>
    );
  }
);

// Main Component

const Clients = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [clients, setClients] = useState<any[]>([]);
  const [searchItem, setSearchItem] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteClientId, setDeleteClientId] = useState<string | null>(null);
  const [deleteClientName, setDeleteClientName] = useState<string | null>(null);

  // Fetch Clients

  const fetchClients = useCallback(async () => {
    setLoadingClients(true);
    try {
      const res = await axiosClient.get("/admin/clients");
      setClients(res.data.clients);
    } catch (err) {
      console.error("Failed to load clients:", err);
    } finally {
      setLoadingClients(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Add Client

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosClient.post("api/admin/add-client", form);
      const { authUrl } = res.data;

      if (authUrl) {
        setForm({ name: "", email: "", password: "" });
        window.location.href = authUrl;
      }
    } catch (err: any) {
      toast.error("Client addition failed!", {
        description:
          err?.response?.data?.message || "Failed to add client.",
        icon: <X className="w-5 h-5 text-red-500" />,
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter Clients

  const query = searchItem.toLowerCase();

  const filteredClients = useMemo(() => {
    if (!query) return clients;
    return clients.filter(
      (c) =>
        c.name?.toLowerCase().includes(query) ||
        c.email?.toLowerCase().includes(query)
    );
  }, [clients, query]);

  // Delete Client 

  const handleDeleteClient = async () => {
    if (!deleteClientId) return;
    try {
      await axiosClient.delete(`/admin/clients/${deleteClientId}`);
      setDialogOpen(false);
      setDeleteClientId(null);
      setDeleteClientName(null);
      fetchClients();

      toast.error("Client has been deleted", {
        icon: <Trash2 className="w-5 h-5 text-red-500" />,
        position: "bottom-right",
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-8 mt-2">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <House width={20} />
              <BreadcrumbLink asChild>
                <a href="/admin/dashboard">Dashboard</a>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <a href="/admin/clients">Add Clients</a>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">
            Add Clients To Connect ZohoBooks
          </h1>
          <p className="text-muted-foreground">
            Register clients and securely connect their Zoho Books accounts.
          </p>
        </div>

        {/* Add Client */}
        <div className="flex gap-4">
          <Input
            placeholder="Client Name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />
          <Input
            placeholder="ZohoBooks Email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />
          <Input
            type="password"
            placeholder="ZohoBooks Password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />
          <Button onClick={handleAddClient} disabled={loading}>
            {loading ? "Adding..." : "Add Client"}
          </Button>
        </div>

        {/* Table */}
        <div>
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold">Existing Clients</h2>
            <div className="relative">
              <Search className="absolute left-2 top-2 w-4 h-4 text-gray-400" />
              <Input
                className="pl-8"
                placeholder="Search clients"
                value={searchItem}
                onChange={(e) => setSearchItem(e.target.value)}
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Org ID</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loadingClients ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full rounded-xl" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredClients.length ? (
                filteredClients.map((c) => (
                  <ClientRow
                    key={c.id}
                    client={c}
                    onDelete={() => {
                      setDeleteClientId(c.id);
                      setDeleteClientName(c.name);
                      setDialogOpen(true);
                    }}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center pt-6">
                    <Loader />
                    <p>No clients found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* SINGLE DELETE DIALOG */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Client</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete{" "}
            <strong>{deleteClientName}</strong>?
          </p>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDeleteClient}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Clients;
