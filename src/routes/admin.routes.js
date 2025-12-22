import express from "express";
import Payment from "../models/Payment.model.js";
import { verifyRole } from "../middlewares/verifyRole.js";
import verifyJWT from "../middlewares/verifyJWT.js";
import { ROLES } from "../constants/roles.js";
import { allContestReports } from "../controllers/admin.controller.js";
const router = express.Router();

router.get(
  "/payment-history",
  verifyJWT,
  verifyRole(ROLES.ADMIN),
  async (req, res) => {
    try {
      const paymentHistory = await Payment.find({})
        .populate("user", "name email")
        .populate("contestId", "title")
        .sort({ createdAt: -1 });
      res.json(paymentHistory);
    } catch (error) {
      console.log("Hello", error);

      res.status(500).json({ message: "Server error" });
    }
  }
);
router.get("/reports", verifyJWT, verifyRole(ROLES.ADMIN), allContestReports);

router.get("/contest-history", verifyJWT, async (req, res) => {
  try {
    const contestHistory = await Contest.find({})
      .populate("creatorId", "name email")
      .sort({ createdAt: -1 });
    res.json(contestHistory);
  } catch (error) {
    console.log("Hello", error);

    res.status(500).json({ message: "Server error" });
  }
});

export default router;
