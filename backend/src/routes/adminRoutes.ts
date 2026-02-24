import { Router } from "express";
import { authenticateUser, authorizeRoles } from "../middlewares/auth.js";
import {
  getAllInfoCtrl,
  getMonthlyStatsCtrl,
  updateUserRoleCtrl,
} from "../controllers/adminController.js";

const adminRoutes = Router();

adminRoutes.use(authenticateUser, authorizeRoles("admin"));

// /api/v1/admin/info
adminRoutes.get("/info", getAllInfoCtrl);

// /api/v1/admin/stats
adminRoutes.get("/stats", getMonthlyStatsCtrl);

// /api/v1/admin/update-role
adminRoutes.patch("/update-role", updateUserRoleCtrl);

export default adminRoutes;
