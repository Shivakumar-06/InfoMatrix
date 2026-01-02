import supabase from "../config/supabase.js";

// Dashboard summary

const dashboardSummary = async (req, res) => {
  try {
    const [
      { count: clientCount },
      { count: totalReports },
      { count: publishReport },
      { count: pendingPreview },
    ] = await Promise.all([
      supabase.from("clients").select("id", { count: "exact", head: true }),
      supabase.from("reports").select("id", { count: "exact", head: true }),
      supabase
        .from("reports")
        .select("id", { count: "exact", head: true })
        .eq("published", true),
      supabase
        .from("reports")
        .select("id", { count: "exact", head: true })
        .eq("published", false),
    ]);

    res.json({
      totalClients: clientCount || 0,
      totalReports: totalReports || 0,
      publishReport: publishReport || 0,
      pendingPreview: pendingPreview || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Recent reports

const recentReport = async (req, res) => {
  try {
    const { data } = await supabase
      .from("reports")
      .select("id, types, published, client_id (name)")
      .order("synced_at", { ascending: false })
      .limit(10);

    res.json({ reports: data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Pending actions

const pendingActions = async (req, res) => {
  try {
    const { data: pendingReports } = await supabase
      .from("reports")
      .select(
        "id, types, client_id (name), templates:template_id ( template_name )"
      )
      .eq("published", false)
      .limit(50);

    res.json({ pendingReports });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Dashboard reports search

const dashboardReports = async (req, res) => {
  try {
    const { client, start_date, end_date } = req.query;

    let clientId = null;

    // Filter by client name

    if (client) {
      const { data: cData } = await supabase
        .from("clients")
        .select("id")
        .ilike("name", `%${client}%`) // to match case-sensitive search
        .limit(1);

      if (!cData?.length) return res.json({ reports: [] });

      clientId = cData[0].id;
    }

    // Base query

    let query = supabase
      .from("reports")
      .select("id, types, start_date, end_date, published, client_id (name)");

    if (clientId) query = query.eq("client_id", clientId);
    if (start_date) query = query.gte("start_date", start_date);
    if (end_date) query = query.lte("end_date", end_date);

    query = query.order("synced_at", { ascending: false });

    const { data, error } = await query;

    if (error) throw new Error(error.message);

    res.json({ reports: data || [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//  Admin charts

let chartCache = null;
let chartCacheTime = 0;

const CACHE_TTL = 60 * 1000; // 1 minute

const dashboardCharts = async (req, res) => {
  try {
    // Cache 
    if (chartCache && Date.now() - chartCacheTime < CACHE_TTL) {
      return res.json(chartCache);
    }

    const { data: reports, error } = await supabase
      .from("reports")
      .select("published, synced_at, types");

    if (error) throw new Error(error.message);

    // Monthly reports
    const monthlyMap = {};

    for (const r of reports) {
      const d = new Date(r.synced_at);
      const monthKey = `${d.getFullYear()}-${d.getMonth() + 1}`;

      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = {
          month: monthKey,
          total_reports: 0,
          published: 0,
        };
      }

      monthlyMap[monthKey].total_reports++;
      if (r.published) monthlyMap[monthKey].published++;
    }

    const monthly_reports = Object.values(monthlyMap);

    // Type distribution
    const typeCount = {};

    for (const r of reports) {
      for (const t of r.types) {
        typeCount[t] = (typeCount[t] || 0) + 1;
      }
    }

    const type_distribution = Object.entries(typeCount).map(
      ([type, total]) => ({
        type,
        total,
      })
    );

    // Cache result 
    chartCache = {
      charts: {
        monthly_reports,
        type_distribution,
      },
    };
    chartCacheTime = Date.now();

    res.json(chartCache);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export {
  dashboardSummary,
  recentReport,
  pendingActions,
  dashboardReports,
  dashboardCharts,
};
