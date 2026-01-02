import express from 'express'
import { verifyToken } from '../middlewares/auth.js';
import { dashboardCharts, dashboardReports, dashboardSummary, pendingActions, recentReport } from '../controller/adminDashboard.js';

const router = express.Router();

router.get("/summary",verifyToken(["admin"]),dashboardSummary);
router.get("/recent-report",verifyToken(["admin"]),recentReport);
router.get("/pending-actions",verifyToken(["admin"]),pendingActions);
router.get("/charts",verifyToken(["admin"]),dashboardCharts);
router.get("/reports",verifyToken(["admin"]),dashboardReports);

export default router