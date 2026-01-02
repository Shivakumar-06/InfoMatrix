import supabase from "../config/supabase.js";
import { previewCache } from "./previewReport.service.js"; // shared cache file

export const unPublishService = async (id) => {
  if (!id) {
    throw { status: 400, message: "Report ID is required" };
  }

  const { data: report } = await supabase
    .from("reports")
    .select("*")
    .eq("id", id)
    .single();

  if (!report) {
    throw { status: 404, message: "Report not found" };
  }

  if (!report.published) {
    throw { status: 400, message: "Already unpublished" };
  }

  const { error } = await supabase
    .from("reports")
    .update({
      published: false,
      mis_data: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;

  // Invalidate preview cache
  previewCache.delete(id);

  return { message: "Unpublished successfully" };
};
