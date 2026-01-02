import express from 'express'
import { verifyToken } from '../middlewares/auth.js'
import { clientCharts, clientDashboard, clientReports } from '../controller/clientDashboard.js'

const router = express.Router()

router.get('/dashboard',verifyToken(['client']),clientDashboard);
router.get('/reports',verifyToken(['client']),clientReports);
router.get('/charts',verifyToken(['client']),clientCharts)

export default router;