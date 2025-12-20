import express from "express";
import verifyJWT from "../middlewares/verifyJWT.js";
import { confirmPayment, createCheckoutSession } from "../controllers/stripe.controller.js";

const router = express.Router();

router.post("/create-checkout-session", verifyJWT, createCheckoutSession);
router.get("/confirm-payment", verifyJWT, confirmPayment);



export default router;
