import express from "express";
import verifyJWT from "../middlewares/verifyJWT.js";
import { verifyRole } from "../middlewares/verifyRole.js";
import { getAllUsers, changeUserRole, getRole, joinedContests, deleteUser, updateUserProfile } from "../controllers/user.controller.js";
import { ROLES } from "../constants/roles.js";

const router = express.Router();

// app.use("/api/users", userRoutes);

// get all users (admin only)
router.get("/role", verifyJWT, getRole);
router.get("/", verifyJWT, verifyRole(ROLES.ADMIN), getAllUsers);
router.get("/:id", verifyJWT, joinedContests);

// user profile update
router.patch("/update/:uid", verifyJWT, updateUserProfile);

// change role (admin only)
router.patch("/role/:userId", verifyJWT, verifyRole(ROLES.ADMIN), changeUserRole);
router.delete("/:userUid", verifyJWT, deleteUser);

export default router;
