import { syncDataService } from "../services/reportSync.service.js";
import { allReportsService } from "../services/allReport.service.js";
import { previewService } from "../services/previewReport.service.js";
import { saveGroupsService } from "../services/groupReport.service.js";
import { publishService } from "../services/publishReport.service.js";
import { unPublishService } from "../services/unPublishReport.service.js";
import { deleteReportService } from "../services/deleteReport.service.js";
import { publishedReportsService } from "../services/publishedReport.service.js";

// Sync Data
const syncData = async (req, res) => {
  try {
    const result = await syncDataService(req.body);
    console.log("Incoming multi-sync request:", req.body);
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

// All Reports
const allReports = async (req, res) => {
  try {
    const result = await allReportsService();
    return res.status(200).json(result);
  } catch (err) {
    console.error("allReports controller error:", err);

    return res.status(err.status || 500).json({
      message: err.message || "Failed to fetch reports",
    });
  }
};

// Preview Data

const preview = async (req, res) => {
  try {
    const data = await previewService(req.params.id);
    return res.json(data); 
  } catch (err) {
    console.error("Preview controller error:", err);

    return res.status(err.status || 500).json({
      message: err.message || "Internal server error",
    });
  }
};

// saving groups

const saveGroups = async (req, res) => {
  try {
    const result = await saveGroupsService(req.params.id, req.body.mis_groups);

    return res.json(result);
  } catch (err) {
    console.error("saveGroups controller error:", err);

    return res.status(err.status || 500).json({ message: err.message || err });
  }
};

// Publish report
const publish = async (req, res) => {
  try {
    const result = await publishService(req.params.id);
    return res.json(result);
  } catch (err) {
    console.error("Publish controller error:", err);
    return res.status(err.status || 500).json({ message: err.message });
  }
};

//  Un-Publish
const unPublish = async (req, res) => {
  try {
    const result = await unPublishService(req.params.id);
    return res.json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

// Delete reports
const deleteReport = async (req, res) => {
  try {
    const result = await deleteReportService(req.params.id);
    return res.status(200).json(result);
  } catch (err) {
    return res
      .status(err.status || 500)
      .json({ message: err.message, error: err.error });
  }
};

// Published
const publishedReports = async (req, res) => {
  try {
    const result = await publishedReportsService(req.user.client_id, req.query);

    res.json(result);
  } catch (err) {
    console.error("PublishedReports Error:", err);
    res.status(500).json({ message: err.message });
  }
};

export {
  syncData,
  allReports,
  deleteReport,
  preview,
  publish,
  unPublish,
  publishedReports,
  saveGroups,
};
