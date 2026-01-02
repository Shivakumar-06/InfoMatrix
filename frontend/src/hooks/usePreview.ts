import { useState } from "react";
import axiosClient from "../api/axiosClient";
import { toast } from "sonner";

export const usePreview = () => {
  const [previewData, setPreviewData] = useState<any>(null);
  const [publishing, setPublishing] = useState(false);

  const previewReport = async (reportId: string) => {
    const res = await axiosClient.get(`/reports/${reportId}/preview`);
    return res.data;
  };

  const publish = async (id: string) => {
    setPublishing(true);
    try {
      await axiosClient.post(`/reports/${id}/publish`);
      toast.success("Published");
      setPreviewData((p: any) => ({ ...p, published: true }));
    } finally {
      setPublishing(false);
    }
  };

  const unpublish = async (id: string) => {
    setPublishing(true);
    try {
      await axiosClient.put(`/reports/${id}/un-publish`);
      toast.success("Unpublished");
      setPreviewData((p: any) => ({ ...p, published: false }));
    } finally {
      setPublishing(false);
    }
  };

  return {
    previewData,
    setPreviewData,
    previewReport,
    publish,
    unpublish,
    publishing,
  };
};
