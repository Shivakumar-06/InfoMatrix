// services/report.service.js
import supabase from "../config/supabase.js";

export const allReportsService = async () => {
  const { data, error } = await supabase
    .from("reports")
    .select(
      "id, client_id, template_id, start_date, end_date, published, templates:template_id ( template_name )"
    )
    .order("synced_at", { ascending: false })
    .limit(50);

  if (error) {
    throw {
      status: 500,
      message: error.message,
    };
  }

  return { reports: data };
};
