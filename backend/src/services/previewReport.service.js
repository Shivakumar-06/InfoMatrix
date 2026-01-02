import supabase from "../config/supabase.js";
import { convertMultiMIS } from "../utils/MIS tools/convertMultiMIS.js";
import { applyGroupsToMIS } from "../utils/MIS tools/applyGroupsToMIS.js";

// Preview cache (same logic, just moved)
export const previewCache = new Map();
const PREVIEW_TTL = 60 * 1000; // 1 minute

export const previewService = async (id) => {
  const cached = previewCache.get(id);
  if (cached && Date.now() - cached.time < PREVIEW_TTL) {
    return cached.data;
  }

  const { data: report, error } = await supabase
    .from("reports")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !report) {
    throw { status: 404, message: "Report not found" };
  }

  // Convert MIS section per type
  let misData = convertMultiMIS(report);

  // Apply saved groups
  const misGroups = report.mis_groups || {};
  if (Object.keys(misGroups).length) {
    misData = applyGroupsToMIS(misData, misGroups);
  }

  const response = { misData, report };
  previewCache.set(id, { time: Date.now(), data: response });

  return response;
};
