import express from "express";
import verifyJWT from "../middlewares/verifyJWT.js";
import { verifyRole } from "../middlewares/verifyRole.js";
import { getAllUsers, changeUserRole, getRole } from "../controllers/user.controller.js";
import { ROLES } from "../constants/roles.js";

const router = express.Router();

// get all users (admin only)
router.get("/role", verifyJWT, getRole);
router.get("/", verifyJWT, verifyRole(ROLES.ADMIN), getAllUsers);

// change role (admin only)
router.patch("/role/:userId", verifyJWT, verifyRole(ROLES.ADMIN), changeUserRole);

export default router;
