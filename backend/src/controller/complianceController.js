import supabase from "../config/supabase.js";
import computeStatus from "../utils/computeStatus.js";

// ADMIN SECTION

// create compliance
const createCompliance = async (req, res) => {
  try {
    const {
      title,
      client_id,
      compliance_type_id,
      due_date,
      filing_date,
      description,
    } = req.body;

    const today = new Date().toISOString().split("T")[0];

    let status;
    if (filing_date) {
      status = "completed";
    } else if (due_date < today) {
      status = "overdue";
    } else if (due_date === today) {
      status = "pending";
    } else {
      status = "upcoming";
    }

    const { data, error } = await supabase
      .from("compliances")
      .insert([
        {
          title,
          client_id,
          compliance_type_id,
          due_date,
          filing_date,
          status,
          description,
        },
      ])
      .select("id, title, status")
      .single();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get all compliance
const allCompliance = async (req, res) => {
  try {
    const { role, id } = req.user;

    let query = supabase
      .from("compliances")
      .select(
        `id, title, due_date, filing_date, status, client_id, clients (id, name), compliance_types (name)`
      )
      .order("due_date", { ascending: true })
      .limit(100);

    if (role === "client") {
      query = query.eq("client_id", id);
    }

    const { data, error } = await query;
    if (error) throw error;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const updated = data.map((c) => {
      if (c.status === "completed") return c;

      const due = new Date(c.due_date);
      due.setHours(0, 0, 0, 0);

      if (due < today) return { ...c, status: "overdue" };
      if (due.getTime() === today.getTime()) return { ...c, status: "pending" };

      return { ...c, status: "upcoming" };
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// update compliance
const updateCompliance = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;

    // Auto mark completed
    if (payload.filing_date) {
      payload.status = "completed";
    }

    const { data, error } = await supabase
      .from("compliances")
      .update(payload)
      .eq("id", id)
      .select("id,status")
      .single();

    if (error) return res.status(400).json({ message: error.message });

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error.message);
  }
};

// delete compliance
const deleteCompliance = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("compliances")
      .delete()
      .eq("id", id)
      .select("id");

    if (!data?.length) {
      return res.status(404).json({ message: "Compliance not found" });
    }

    if (error) return res.status(400).json({ message: error.message });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error.message);
  }
};

const complianceSummary = async (req, res) => {
  try {
    const [
      { count: totalItems },
      { count: totalCompleted },
      { count: totalPending },
      { count: totalOverdue },
    ] = await Promise.all([
      supabase.from("compliances").select("id", { count: "exact", head: true }),
      supabase
        .from("compliances")
        .select("id", { count: "exact", head: true })
        .eq("status", "completed"),
      supabase
        .from("compliances")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("compliances")
        .select("id", { count: "exact", head: true })
        .eq("status", "overdue"),
    ]);

    res.json({
      totalItems,
      totalCompleted,
      totalPending,
      totalOverdue,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error.message);
  }
};

// CLIENT SECTION

// get client compliances
const getClientCompliances = async (req, res) => {
  try {
    const { client_id: clientId, role } = req.user;

    if (role !== "client") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { data, error } = await supabase
      .from("compliances")
      .select(
        `id, title, due_date, filing_date, status, compliance_types ( name )`
      )
      .eq("client_id", clientId)
      .order("due_date", { ascending: true })
      .limit(50);

    if (error) throw error;

    // Recalculate status (safety)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const updated = data.map((c) => ({
      ...c,
      status: computeStatus(c, today),
    }));

    res.status(200).json(updated);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: error.message });
  }
};

// get client compliance summary
const clientComplianceSummary = async (req, res) => {
  try {
    const { client_id: clientId, role } = req.user;

    if (role !== "client") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const [
      { count: totalItems },
      { count: totalCompleted },
      { count: totalPending },
      { count: totalOverdue },
    ] = await Promise.all([
      supabase
        .from("compliances")
        .select("id", { count: "exact", head: true })
        .eq("client_id", clientId),
      supabase
        .from("compliances")
        .select("id", { count: "exact", head: true })
        .eq("client_id", clientId)
        .eq("status", "completed"),
      supabase
        .from("compliances")
        .select("id", { count: "exact", head: true })
        .eq("client_id", clientId)
        .eq("status", "pending"),
      supabase
        .from("compliances")
        .select("id", { count: "exact", head: true })
        .eq("client_id", clientId)
        .eq("status", "overdue"),
    ]);

    res.status(200).json({
      totalItems,
      totalCompleted,
      totalPending,
      totalOverdue,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: error.message });
  }
};

export {
  createCompliance,
  allCompliance,
  updateCompliance,
  deleteCompliance,
  complianceSummary,
  getClientCompliances,
  clientComplianceSummary,
};
