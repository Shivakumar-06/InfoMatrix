import express from 'express'
import { verifyToken } from '../middlewares/auth.js'
import { createComplianceTypes, deleteComplianceTypes, getComplianceTypes, updateComplianceTypes } from '../controller/complianceTypesController.js'

const router = express.Router()

router.post("/create",verifyToken(["admin"]),createComplianceTypes)
router.get("/all",verifyToken(["admin"]),getComplianceTypes)
router.put("/:id/update",verifyToken(["admin"]),updateComplianceTypes)
router.delete("/:id/delete",verifyToken(["admin"]),deleteComplianceTypes)

export default router;