import express from "express";
import {
  getAllUsers,
  createAdmin,
} from "../controllers/superAdmin.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { checkRole } from "../middleware/role.middleware.js";

const router = express.Router();

router.use(verifyJWT);
router.use(checkRole(["super_admin"]));

router.get("/users", getAllUsers);
router.post("/create-admin", createAdmin);

export default router;
