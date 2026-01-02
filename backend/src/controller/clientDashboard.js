import supabase from "../config/supabase.js";

// Client dashboard

const clientDashboard = async (req, res) => {
  try {
    const clientEmail = req.user.email;

    // Get client info

    const { data: client } = await supabase
      .from("clients")
      .select("id, org_id, name")
      .eq("email", clientEmail)
      .single();

    if (!client) return res.status(404).json({ message: "Client not found" });

    const clientId = client.id;

    const [
      { count: totalReports },
      { count: publishedReports },
      { data: lastReport },
    ] = await Promise.all([
      supabase
        .from("reports")
        .select("id", { count: "exact", head: true })
        .eq("client_id", clientId),

      supabase
        .from("reports")
        .select("id", { count: "exact", head: true })
        .eq("client_id", clientId)
        .eq("published", true),

      supabase
        .from("reports")
        .select("synced_at")
        .eq("client_id", clientId)
        .order("synced_at", { ascending: false })
        .limit(1)
        .single(),
    ]);

    res.json({
      totalReports: totalReports || 0,
      publishedReports: publishedReports || 0,
      lastSynced: lastReport?.synced_at || 0,
      orgId: client.org_id,
      name: client.name || "Client",
    });
  } catch (error) {
    console.log("clientDashboard", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Client report

const clientReports = async (req, res) => {
  try {
    const clientId = req.user.client_id;

    const { data: client } = await supabase
      .from("clients")
      .select("id")
      .eq("id", clientId)
      .single();

    if (!client) return res.status(404).json({ message: "Client not found" });

    const { data: reports } = await supabase
      .from("reports")
      .select("id, types, published, start_date, end_date")
      .eq("client_id", client.id)
      .order("synced_at", { ascending: false })
      .limit(10);

    const formatted = (reports || []).map((r) => ({
      type: (r.types || []).map((t) => t.toUpperCase()).join(", "),
      status: r.published ? "Published" : "Pending",
      startDate: r.start_date,
      endDate: r.end_date,
    }));

    res.json({ reports: formatted });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Client charts

const chartCache = new Map();
const CACHE_TTL = 60 * 1000; // 1 minute

const clientCharts = async (req, res) => {
  try {
    const clientId = req.user.client_id;

    // This line return cached result if available
    const cached = chartCache.get(clientId);
    if (cached && Date.now() - cached.time < CACHE_TTL) {
      return res.json(cached.data);
    }

    const { data: reports, error } = await supabase
      .from("reports")
      .select("types, published, synced_at")
      .eq("client_id", clientId);

    if (error) throw error;

    const monthlyStats = {};
    const typeStats = { pl: 0, bs: 0, gl: 0, bills: 0, invoices: 0 };

    for (const r of reports || []) {
      // month calculation
      const d = new Date(r.synced_at);
      const monthKey = `${d.getMonth() + 1}-${d.getFullYear()}`;

      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = {
          month: monthKey,
          Synced: 0,
          Published: 0,
        };
      }

      monthlyStats[monthKey].Synced++;
      if (r.published) monthlyStats[monthKey].Published++;

      // type distribution
      for (const t of r.types || []) {
        typeStats[t] = (typeStats[t] || 0) + 1;
      }
    }

    const response = {
      barData: Object.values(monthlyStats),
      pieData: [
        { name: "P/L", value: typeStats.pl },
        { name: "B/S", value: typeStats.bs },
        { name: "G/L", value: typeStats.gl },
        { name: "A/P", value: typeStats.bills },
        { name: "A/R", value: typeStats.invoices },
      ],
    };

    // store in cache
    chartCache.set(clientId, {
      time: Date.now(),
      data: response,
    });

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { clientDashboard, clientReports, clientCharts };
