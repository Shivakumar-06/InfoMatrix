import supabase from "../config/supabase.js";
import { convertMultiMIS } from "../utils/MIS tools/convertMultiMIS.js";
import { applyGroupsToMIS } from "../utils/MIS tools/applyGroupsToMIS.js";
import { normalizeMisGroups } from "../utils/MIS tools/normalizeMisGroups.js";
import { previewCache } from "./previewReport.service.js"; // shared cache

export const publishService = async (id) => {
  // Fetch report
  const { data: report } = await supabase
    .from("reports")
    .select("*")
    .eq("id", id)
    .single();

  if (!report) {
    throw { status: 404, message: "Report not found" };
  }

  // Build MIS for all types
  let misData = convertMultiMIS(report);

  // Incoming grouping from admin
  const misGroups = report.mis_groups || {};

  // Normalize groups
  const normalizedGroups = normalizeMisGroups(misGroups);

  for (const type of Object.keys(misData)) {
    if (!normalizedGroups[type]) continue;
    misData[type] = applyGroupsToMIS(
      misData[type],
      normalizedGroups[type]
    );
  }

  // Save published data
  const { error: updErr } = await supabase
    .from("reports")
    .update({
      published: true,
      mis_data: misData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (updErr) {
    throw { status: 500, message: updErr.message };
  }

  // Invalidate preview cache
  previewCache.delete(id);

  return {
    message: "Report published successfully",
    misData,
  };
};
