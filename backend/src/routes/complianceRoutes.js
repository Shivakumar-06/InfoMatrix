import express from 'express'
import { verifyToken } from '../middlewares/auth.js';
import { allCompliance, clientComplianceSummary, complianceSummary, createCompliance, deleteCompliance, getClientCompliances, updateCompliance } from '../controller/complianceController.js';

const router = express.Router();

router.post("/create",verifyToken(["admin"]),createCompliance)
router.get("/all", verifyToken(["admin"]),allCompliance)
router.put("/:id/update", verifyToken(["admin"]), updateCompliance)
router.delete("/:id/delete", verifyToken(["admin"]), deleteCompliance)
router.get("/summary", verifyToken(["admin"]), complianceSummary)
router.get("/client/summary", verifyToken(["client"]), clientComplianceSummary)
router.get("/client", verifyToken(["client"]), getClientCompliances)

export default router;






























































