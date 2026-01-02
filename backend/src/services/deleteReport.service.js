import supabase from "../config/supabase.js";

export const deleteReportService = async (id) => {
  // Validate ID
  if (!id) {
    throw { status: 400, message: "Report ID is required" };
  }

  // Delete report
  const { data, error } = await supabase
    .from("reports")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) {
    console.error("Supabase delete error:", error.message);
    throw {
      status: 500,
      message: "Failed to delete report",
      error: error.message,
    };
  }

  if (!data?.length) {
    throw { status: 404, message: "Report not found" };
  }

  return { message: "Report deleted successfully" };
};
