import express from "express";
import verifyJWT from "../middlewares/verifyJWT.js";
import { confirmPayment, createPaymentIntent } from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/create-payment-intent", verifyJWT, createPaymentIntent);
router.post("/confirm-payment", verifyJWT, confirmPayment);

export default router;
