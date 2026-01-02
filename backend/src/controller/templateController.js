import supabase from "../config/supabase.js";

// Creating Template

const createTemplate = async (req, res) => {
  try {
    const { template_name, status = "active", types } = req.body;
    if (!template_name || !Array.isArray(types) || types.length === 0) {
      return res.status(400).json({ message: "All input fields are required" });
    }

    const { data, error } = await supabase
      .from("templates")
      .insert([{ template_name, status, types }])
      .select("id, template_name, status")
      .single();

    if (error) throw error;

    // console.log(data)
    return res.status(201).json({ template: data });
  } catch (error) {
    console.error("Template creation error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// List all templates

const listTemplates = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("templates")
      .select("id, template_name, status, types, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.json({ templates: data });
  } catch (error) {
    console.error("listTemplates", error);
    return res.status(500).json({ message: error.message });
  }
};

// Get all templates

const getTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("templates")
      .select("id, template_name, status, types, created_at, updated_at")
      .eq("id", id)
      .single();

    if (error || !data)
      return res.status(404).json({ message: "Template not found" });
    return res.json({ template: data });
  } catch (error) {
    console.error("getTemplate", error);
    return res.status(500).json({ message: error.message });
  }
};

// Updating the template

const updateTemplateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "offline"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const { data, error } = await supabase
      .from("templates")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id");

    if (!data?.length) {
      return res.status(404).json({ message: "Template not found" });
    }

    if (error) throw error;
    return res.json({ message: "Template status updated" });
  } catch (error) {
    console.error("updateTemplateStatus", error);
    return res.status(500).json({ message: error.message });
  }
};

// Delete the template

const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("templates")
      .delete()
      .eq("id", id)
      .select("id");

    if (error) throw error;

    if (!data?.length) {
      return res.status(404).json({ message: "Template not found" });
    }

    return res.json({ message: "Template deleted" });
  } catch (error) {
    console.error("deleteTemplate", error);
    return res.status(500).json({ message: error.message });
  }
};

export {
  createTemplate,
  listTemplates,
  getTemplate,
  updateTemplateStatus,
  deleteTemplate,
};
