import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

export const useReports = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [noData, setNoData] = useState(false);

  useEffect(() => {
    const fetchBasic = async () => {
      try {
        setLoading(true);
        const [cRes, tRes] = await Promise.all([
          axiosClient.get("/admin/clients"),
          axiosClient.get("/templates"),
        ]);

        setClients(cRes.data.clients || []);
        setTemplates(tRes.data.templates || []);
      } finally {
        setLoading(false);
      }
    };
    fetchBasic();
  }, []);

  return {
    clients,
    templates,
    reports,
    setReports,
    loading,
    setLoading,
    noData,
    setNoData,
  };
};
