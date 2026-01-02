import { useState } from "react";
import axiosClient from "../api/axiosClient";
import { toast } from "sonner";

export const useGrouping = () => {
  const [previewGroups, setPreviewGroups] = useState<any>({});
  const [savingGroups, setSavingGroups] = useState(false);

  const saveGroups = async (reportId: string, payload: any) => {
    setSavingGroups(true);
    try {
      await axiosClient.post(`/reports/${reportId}/groups`, {
        mis_groups: payload,
      });
      toast.success("Groups saved!");
    } finally {
      setSavingGroups(false);
    }
  };

  return {
    previewGroups,
    setPreviewGroups,
    saveGroups,
    savingGroups,
  };
};
