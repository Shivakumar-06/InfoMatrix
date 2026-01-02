import express from 'express';
import { adminLogin, clientLogin } from '../controller/authController.js';

const router = express.Router();

router.post('/admin-login', adminLogin);
router.post('/client-login', clientLogin);

export default router;
