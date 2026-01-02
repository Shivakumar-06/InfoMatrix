import supabase from "../config/supabase.js";
import { previewCache } from "./previewReport.service.js"; // shared cache

export const saveGroupsService = async (id, mis_groups) => {
  if (!id || typeof mis_groups !== "object") {
    throw {
      status: 400,
      message: "Report id and mis_groups JSON required",
    };
  }

  const { error } = await supabase
    .from("reports")
    .update({
      mis_groups,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Supabase update error:", error);
    throw error;
  }

  // Invalidate preview cache
  previewCache.delete(id);

  return { message: "Groups saved" };
};
