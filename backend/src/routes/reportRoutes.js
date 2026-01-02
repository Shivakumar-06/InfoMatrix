import express from 'express';
import { verifyToken } from '../middlewares/auth.js';
import { allReports, deleteReport, preview, publish, publishedReports, saveGroups, syncData, unPublish } from '../controller/reportController.js';

const router = express.Router();

router.post("/sync", verifyToken(["admin"]), syncData)
router.get("/all-reports",verifyToken(["admin"]),allReports)
router.delete("/:id",verifyToken(["admin"]),deleteReport)
router.get("/:id/preview",verifyToken(["admin"]),preview)
router.post("/:id/publish",verifyToken(["admin"]),publish)
router.put("/:id/un-publish",verifyToken(["admin"]),unPublish)
router.get("/published",verifyToken(["client"]),publishedReports)
router.post("/:id/groups",verifyToken(["admin"]),saveGroups)
export default router;
