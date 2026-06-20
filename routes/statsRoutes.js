import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import verifyAdmin from "../middleware/verifyAdmin.js";
import verifyVendor from "../middleware/verifyVendor.js";
import { getVendorStats, getAdminStats } from "../controllers/statsController.js";

const router = express.Router();

router.get("/vendor-stats/:email", verifyToken, verifyVendor, getVendorStats);
router.get("/admin-stats", verifyToken, verifyAdmin, getAdminStats);

export default router;
