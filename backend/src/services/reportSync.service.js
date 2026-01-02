import supabase from "../config/supabase.js";
import { getMonthRanges } from "../utils/getMonthRanges.js";
import { refreshTokenIfNeeded } from "./tokenService.js";
import axios from "axios";

export const syncDataService = async ({
  client_id,
  template_id,
  start_date,
  end_date,
}) => {

  if (!client_id || !template_id || !start_date || !end_date) {
    throw { status: 400, message: "client_id, template_id, start_date, end_date required" };
  }

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("id, email, org_id, access_token, refresh_token, token_expires_at")
    .eq("id", client_id)
    .single();

  if (clientError || !client) {
    throw { status: 404, message: "Client not found" };
  }

  const { data: template, error: templateError } = await supabase
    .from("templates")
    .select("id, types")
    .eq("id", template_id)
    .single();

  if (templateError || !template) {
    throw { status: 404, message: "Template not found" };
  }

  if (!Array.isArray(template.types) || template.types.length === 0) {
    throw { status: 400, message: "Template has no types" };
  }

  const { data: existing } = await supabase
    .from("reports")
    .select("id")
    .eq("client_id", client_id)
    .eq("start_date", start_date)
    .eq("end_date", end_date)
    .limit(1);

  if (existing?.length) {
    throw { status: 409, message: "Report already synced" };
  }

  const access_token = await refreshTokenIfNeeded(client);
  if (!access_token) {
    throw new Error("Failed to retrieve valid access token");
  }

  const monthRanges = getMonthRanges(start_date, end_date);
  const finalData = {};

  for (const type of template.types) {
    const monthlyReports = [];

    for (const { from, to, label } of monthRanges) {
      let reportData = {};

      if (type === "bs") {
        const bsUrl = `https://www.zohoapis.in/books/v3/reports/balancesheet?organization_id=${client.org_id}&from_date=${from}&to_date=${to}&date_range_type=custom`;
        const plUrl = `https://www.zohoapis.in/books/v3/reports/profitandloss?organization_id=${client.org_id}&from_date=${start_date}&to_date=${to}&date_range_type=custom`;

        const [bsRes, plRes] = await Promise.all([
          axios.get(bsUrl, { headers: { Authorization: `Zoho-oauthtoken ${access_token}` } }),
          axios.get(plUrl, { headers: { Authorization: `Zoho-oauthtoken ${access_token}` } }),
        ]);

        reportData = {
          balance_sheet: bsRes.data.balance_sheet,
          profit_and_loss: plRes.data.profit_and_loss,
          page_context: {
            ...bsRes.data.page_context,
            from_date: from,
            to_date: to,
            date_range_label: `${from} - ${to}`,
          },
        };
      }

      else if (type === "pl") {
        const url = `https://www.zohoapis.in/books/v3/reports/profitandloss?organization_id=${client.org_id}&from_date=${from}&to_date=${to}&date_range_type=custom`;
        const { data } = await axios.get(url, {
          headers: { Authorization: `Zoho-oauthtoken ${access_token}` },
        });
        reportData = data;
      }

      else if (type === "bills") {
        const url = `https://www.zohoapis.in/books/v3/bills?organization_id=${client.org_id}&date_start=${from}&date_end=${to}&per_page=200`;
        const { data } = await axios.get(url, {
          headers: { Authorization: `Zoho-oauthtoken ${access_token}` },
        });

        const today = new Date();
        reportData = {
          ...data,
          bills: (data.bills || []).filter(
            (b) => b.balance > 0 && b.due_date && new Date(b.due_date) < today
          ),
        };
      }

      else if (type === "invoices") {
        const url = `https://www.zohoapis.in/books/v3/invoices?organization_id=${client.org_id}&date_start=${from}&date_end=${to}&per_page=200`;
        const { data } = await axios.get(url, {
          headers: { Authorization: `Zoho-oauthtoken ${access_token}` },
        });

        const today = new Date();
        reportData = {
          ...data,
          invoices: (data.invoices || []).filter(
            (i) => i.balance > 0 && i.due_date && new Date(i.due_date) < today
          ),
        };
      }

      monthlyReports.push({
        month: label,
        from_date: from,
        to_date: to,
        report: reportData,
      });

      await new Promise((r) => setTimeout(r, 800));
    }

    finalData[type] = { monthly_reports: monthlyReports };
  }

  await supabase.from("reports").insert([{
    client_id,
    template_id,
    types: template.types,
    start_date,
    end_date,
    data: finalData,
    published: false,
    synced_at: new Date().toISOString(),
  }]);

  return {
    message: "Multi-report sync completed",
    types: template.types,
    months: monthRanges.length,
  };
};
