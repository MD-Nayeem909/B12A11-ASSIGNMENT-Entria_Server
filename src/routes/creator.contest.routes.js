import express from "express";
import verifyJWT from "../middlewares/verifyJWT.js";
import { verifyRole } from "../middlewares/verifyRole.js";

import { ROLES } from "../constants/roles.js";
import {
  createContest,
  declareWinner,
  deleteContest,
  getMyContests,
  updateContest,
} from "../controllers/creator.contest.controller.js";

const router = express.Router();

// all routes are protected
router.use(verifyJWT);
router.use(verifyRole(ROLES.CREATOR, ROLES.ADMIN));

//  Create contest
router.post("/", createContest);

//  Get creator's own contests
router.get("/my_contests", getMyContests);

//  Update contest (only pending)
router.patch("/:id", verifyJWT, updateContest);

//  Delete contest (only pending)
router.delete("/:id", deleteContest);

//  Declare winner
router.post("/:id/declare_winner", declareWinner);

export default router;
