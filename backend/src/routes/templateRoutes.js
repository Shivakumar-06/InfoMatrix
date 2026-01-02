import express from 'express'
import { createTemplate, deleteTemplate, getTemplate, listTemplates, updateTemplateStatus } from '../controller/templateController.js';

const router = express.Router();

router.post("/", createTemplate);
router.get("/", listTemplates);
router.get("/:id", getTemplate);
router.patch("/:id/status", updateTemplateStatus);
router.delete("/:id", deleteTemplate);

export default router;