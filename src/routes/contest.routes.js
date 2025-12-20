import express from "express";
import verifyJWT from "../middlewares/verifyJWT.js";
import { verifyRole } from "../middlewares/verifyRole.js";
import {
  createContest,
  listContests,
  manageContest,
  joinContest,
  submitTask,
  declareWinner,
  deleteContest,
  getContestSubmissions,
  getTopWinners,
} from "../controllers/contest.controller.js";
import { ROLES } from "../constants/roles.js";

const router = express.Router();

// public listing
router.get("/", listContests);
router.get("/winners", getTopWinners);
router.get("/:id", getContestSubmissions);

// create contest (creator or admin)
router.post(
  "/",
  verifyJWT,
  verifyRole(ROLES.CREATOR, ROLES.ADMIN),
  createContest
);

// approve (admin)
router.patch("/:id", verifyJWT, verifyRole(ROLES.ADMIN), manageContest);

router.delete("/:id", verifyJWT, verifyRole(ROLES.ADMIN), deleteContest);

// join contest (normal user)
router.post("/:id/join", verifyJWT, verifyRole(ROLES.USER), joinContest);

// submit task (after registration)
// app.use("/api/contests", contestRoutes);
router.post("/:id/submit", verifyJWT, submitTask);

// declare winner (creator or admin) - additional checks in controller
router.post(
  "/:id/declare-winner",
  verifyJWT,
  verifyRole(ROLES.CREATOR, ROLES.ADMIN),
  declareWinner
);



export default router;
