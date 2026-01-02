import supabase from "../config/supabase.js";

export const publishedReportsService = async (
  clientId,
  { start_date, end_date }
) => {
  let query = supabase
    .from("reports")
    .select("id, start_date, end_date, types, mis_data, published")
    .eq("client_id", clientId)
    .eq("published", true)
    .order("synced_at", { ascending: false });

  if (start_date && end_date) {
    query = query.eq("start_date", start_date).eq("end_date", end_date);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return { reports: data };
};
