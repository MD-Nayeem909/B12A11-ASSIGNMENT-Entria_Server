import Stripe from "stripe";
import Contest from "../models/Contest.model.js";
import PaymentModel from "../models/Payment.model.js";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * 🔹 Create Payment Intent
 * 🔹 Private Route
 */
export const createPaymentIntent = async (req, res) => {
  try {
    const { contestId } = req.body;

    if (!contestId) {
      return res.status(400).json({ message: "Contest ID is required" });
    }

    const contest = await Contest.findById(contestId);

    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    if (contest.status !== "approved") {
      return res.status(403).json({ message: "Contest is not approved yet" });
    }

    const amount = contest.price * 100; // Stripe needs cents

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      payment_method_types: ["card"],
      metadata: {
        contestId: contest._id.toString(),
        contestName: contest.name,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({ message: "Payment intent failed" });
  }
};

/**
 * 🔹 Save Payment Info After Success
 * 🔹 Private Route
 */
export const confirmPayment = async (req, res) => {
  try {
    const { contestId, transactionId, amount } = req.body;

    if (!contestId || !transactionId) {
      return res.status(400).json({ message: "Invalid payment data" });
    }

    // Save payment info
    const payment = await PaymentModel.create({
      userId: req.user.uid,
      contestId,
      transactionId,
      amount,
      status: "paid",
      paidAt: new Date(),
    });

    // Increase participant count
    await Contest.findByIdAndUpdate(contestId, {
      $inc: { participants: 1 },
      $push: { participantsList: req.user.uid },
    });




    res.json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error("Payment Save Error:", error);
    res.status(500).json({ message: "Payment confirmation failed" });
  }
};
