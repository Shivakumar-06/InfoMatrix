import { useEffect, useMemo, useState } from "react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "../../components/ui/breadcrumb";
import { House } from "lucide-react";

import ReportFilters from "../../components/ReportFilters";
import ReportsTable from "../../components/ReportsTable";
import ReportPreview from "../../components/ReportPreview";
import GroupManagementPanel from "../../components/admin-mis/GroupManagementPanel";

import { useReports } from "../../hooks/useReports";
import { usePreview } from "../../hooks/usePreview";
import { useGrouping } from "../../hooks/useGrouping";

import axiosClient from "../../api/axiosClient";
import { toast } from "sonner";
import { REPORT_META, GROUPING_ENABLED } from "../../service/reportMeta";

/* ---------------------------------- */
/* Utilities                          */
/* ---------------------------------- */

const normalizeDate = (d: string) => {
  if (!d) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  const [dd, mm, yyyy] = d.split("-");
  return `${yyyy}-${mm}-${dd}`;
};

/* ---------------------------------- */
/* Page                               */
/* ---------------------------------- */

const Reports = () => {
  /* Filters */
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  /* Hooks */
  const {
    clients,
    templates,
    reports,
    setReports,
    loading,
    setLoading,
    noData,
    setNoData,
  } = useReports();

  const {
    previewData,
    setPreviewData,
    previewReport,
    publish,
    unpublish,
    publishing,
  } = usePreview();

  const {
    previewGroups,
    setPreviewGroups,
    saveGroups,
    savingGroups,
  } = useGrouping();

  /* ---------------------------------- */
  /* Load reports on filter change      */
  /* ---------------------------------- */

  useEffect(() => {
    const loadReports = async () => {
      if (!selectedClient || !selectedTemplate || !startDate || !endDate) {
        setReports([]);
        setPreviewData(null);
        return;
      }

      setLoading(true);
      setNoData(false);

      try {
        const res = await axiosClient.get("/reports/all-reports");
        const all = res.data.reports || [];

        const s = normalizeDate(startDate);
        const e = normalizeDate(endDate);

        const filtered = all.filter((r: any) => {
          if (r.client_id !== selectedClient) return false;
          if (`${r.template_id}` !== `${selectedTemplate}`) return false;
          return (
            normalizeDate(r.start_date) === s &&
            normalizeDate(r.end_date) === e
          );
        });

        if (!filtered.length) {
          setNoData(true);
          setReports([]);
          setPreviewData(null);
          setPreviewGroups({});
          return;
        }

        setReports(filtered);
      } catch (err) {
        console.error("loadReports error", err);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, [selectedClient, selectedTemplate, startDate, endDate]);

  /* ---------------------------------- */
  /* Preview handler                    */
  /* ---------------------------------- */

  const handlePreview = async (reportId: string) => {
    try {
      setLoading(true);

      const res = await previewReport(reportId);
      const mis = res?.misData || {};
      const report = res?.report;

      const row = reports.find((r) => r.id === reportId);

      const remoteGroups = report?.mis_groups || {};
      const normalized: Record<string, any> = {};

      Object.keys(remoteGroups).forEach((k) => {
        const entry = remoteGroups[k];
        normalized[k] = {
          groups: Array.isArray(entry?.groups)
            ? entry.groups.map((g: any) => ({
                name: g.group_name || g.name || "Group",
                entries: g.entries || [],
              }))
            : [],
        };
      });

      setPreviewGroups(normalized);
      setPreviewData({
        id: reportId,
        published: row?.published ?? false,
        mis,
        report,
      });
    } catch (err) {
      console.error("preview error", err);
      toast.error("Failed to preview");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------- */
  /* Save Groups                        */
  /* ---------------------------------- */

  const handleSaveGroups = async () => {
    if (!previewData?.id) return;

    const payload: Record<string, any> = {};

    Object.keys(previewGroups).forEach((sectionKey) => {
      const reportType = sectionKey.split("-")[0];
      if (!GROUPING_ENABLED.includes(reportType)) return;

      payload[sectionKey] = {
        groups: previewGroups[sectionKey].groups.map((g: any) => ({
          group_name: g.name,
          entries: g.entries,
        })),
      };
    });

    await saveGroups(previewData.id, payload);
  };

  /* ---------------------------------- */
  /* Tabs order                         */
  /* ---------------------------------- */

  const previewKeys = useMemo(() => {
    if (!previewData?.mis) return [];
    const order = ["pl", "bs", "bills", "invoices"];
    return order.filter((k) => previewData.mis[k]);
  }, [previewData]);

  const showGroupManagement = previewKeys.some((k) =>
    GROUPING_ENABLED.includes(k)
  );

  /* ---------------------------------- */
  /* Render                             */
  /* ---------------------------------- */

  return (
    <div className="max-w-4xl mx-auto space-y-10 mt-2">
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
              <a href="/admin/reports">Reports</a>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Heading */}
      <div>
        <h1 className="text-2xl font-bold">Preview Reports</h1>
        <p className="text-muted-foreground">
          Preview synced reports, verify data, and organize entries before publishing.
        </p>
      </div>

      {/* Filters */}
      <ReportFilters
        clients={clients}
        templates={templates}
        selectedClient={selectedClient}
        setSelectedClient={setSelectedClient}
        selectedTemplate={selectedTemplate}
        setSelectedTemplate={setSelectedTemplate}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        onClear={() => {
          setSelectedClient("");
          setSelectedTemplate("");
          setStartDate("");
          setEndDate("");
          setReports([]);
          setPreviewData(null);
          setPreviewGroups({});
          setNoData(false);
        }}
      />

      {/* Reports list */}
      <ReportsTable
        reports={reports}
        loading={loading}
        noData={noData}
        onPreview={handlePreview}
      />

      {/* Group management */}
      {showGroupManagement && (
        <GroupManagementPanel
          previewData={previewData}
          previewKeys={previewKeys}
          previewGroups={previewGroups}
          setPreviewGroups={setPreviewGroups}
          REPORT_META={REPORT_META}
        />
      )}

      {/* Preview */}
      <ReportPreview
        previewData={previewData}
        previewKeys={previewKeys}
        previewGroups={previewGroups}
        setPreviewGroups={setPreviewGroups}
        REPORT_META={REPORT_META}
        GROUPING_ENABLED={GROUPING_ENABLED}
        onSaveGroups={handleSaveGroups}
        onPublish={() => publish(previewData.id)}
        onUnpublish={() => unpublish(previewData.id)}
        savingGroups={savingGroups}
        publishing={publishing}
      />
    </div>
  );
};

export default Reports;
