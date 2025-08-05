import { Router } from "express";
import {
  createAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  loginAdmin,
  logoutAdmin,
} from "../controllers/admin.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// Admin routes
router.post("/logout", verifyJWT, logoutAdmin);

router.post("/login", loginAdmin);
router.post("/createAdmin", createAdmin);
router.get("/getAllAdmin", getAllAdmins);
router.get("/getAdminId/:id", getAdminById);
router.put("/update/:id", updateAdmin);
router.delete("/delete/:id", deleteAdmin);

export default router;
