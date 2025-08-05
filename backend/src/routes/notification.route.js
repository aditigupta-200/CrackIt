import express from "express";
import { getNotifications } from "../controllers/notification.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();
router.get("/", verifyJWT, getNotifications);

export default router;
