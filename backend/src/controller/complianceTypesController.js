import supabase from "../config/supabase.js";

// create types for compliance
const createComplianceTypes = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Compliance type name is required",
      });
    }

    const { data, error } = await supabase
      .from("compliance_types")
      .insert([{ name, description }])
      .select("id, name")
      .single();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.status(200).json({ data });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

// get all types for compliance

// In-memory cache
let complianceTypesCache = null;
let complianceTypesCacheTime = 0;
const COMPLIANCE_TYPES_TTL = 5 * 60 * 1000; // 5 minutes

const getComplianceTypes = async (req, res) => {
  try {
    if (
      complianceTypesCache &&
      Date.now() - complianceTypesCacheTime < COMPLIANCE_TYPES_TTL
    ) {
      return res.status(200).json(complianceTypesCache);
    }

    const { data, error } = await supabase
      .from("compliance_types")
      .select("id, name, description, status, created_at")
      .order("created_at", { ascending: false });

    if (error) return res.status(400).json({ message: error.message });

    // Save to cache
    complianceTypesCache = data;
    complianceTypesCacheTime = Date.now();

    res.status(200).json(data);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

// update compliance types
const updateComplianceTypes = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;

    const { data, error } = await supabase
      .from("compliance_types")
      .update(payload)
      .eq("id", id)
      .select("id, name, description")
      .single();

    if (error) return res.status(400).json({ message: error.message });

    res.status(200).json(data);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

// delete compliance types
const deleteComplianceTypes = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("compliance_types")
      .delete()
      .eq("id", id)
      .select("id");

    if (!data?.length) {
      return res.status(404).json({ message: "Compliance type not found" });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

export {
  createComplianceTypes,
  getComplianceTypes,
  updateComplianceTypes,
  deleteComplianceTypes,
};
