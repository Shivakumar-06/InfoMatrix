import express from 'express';
import { addClients, deleteClients, getClients, OauthToken } from '../controller/adminController.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();

router.post("/add-client", verifyToken(["admin"]), addClients); 
router.get("/clients", verifyToken(["admin"]), getClients); 
router.delete("/clients/:client_id", verifyToken(["admin"]), deleteClients);
router.get('/oauth/callback', OauthToken ); 
export default router;
