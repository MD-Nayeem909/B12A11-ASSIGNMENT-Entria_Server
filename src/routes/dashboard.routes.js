import express from "express";
import { dashboardStats } from "../controllers/dashboardStats.controller.js";
const router = express.Router();

router.get("/stats", dashboardStats);

export default router;
