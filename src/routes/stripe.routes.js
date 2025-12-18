import express from "express";
import verifyJWT from "../middlewares/verifyJWT.js";
import { createCheckoutSession } from "../controllers/stripe.controller.js";

const router = express.Router();

router.post("/create-checkout-session", verifyJWT, createCheckoutSession);

export default router;
