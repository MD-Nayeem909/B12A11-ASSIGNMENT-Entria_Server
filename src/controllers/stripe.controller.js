import Stripe from "stripe";
import Payment from "../models/Payment.model.js";
import Contest from "../models/Contest.model.js";
import User from "../models/User.model.js";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const YOUR_DOMAIN = "http://localhost:5173";

export const createCheckoutSession = async (req, res) => {
  try {
    const paymentInfo = req.body;
    const amount = parseInt(paymentInfo.contestPrice) * 100;

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "USD",
            unit_amount: amount,
            product_data: {
              name: paymentInfo.contestTitle,
            },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: req.user.email,
      metadata: { contestId: paymentInfo.contestId, userId: req.user.id },
      success_url: `${YOUR_DOMAIN}/dashboard/payment_success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${YOUR_DOMAIN}/dashboard/payment-cancel`,
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ message: "Stripe session failed" });
  }
};

export const confirmPayment = async (req, res) => {
  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({ message: "Session ID required" });
    }

    // Retrieve Stripe session
    const session = await stripe.checkout.sessions.retrieve(session_id);

    const alreadyPaid = await Payment.findOne({
      transactionId: session.id,
    });
    if (alreadyPaid) return res.json(alreadyPaid);

    if (session.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    const transactionId = session.id;
    const contestId = session.metadata?.contestId;
    const amount = session.amount_total / 100;

    //  Prevent duplicate payment
    const existingPayment = await Payment.findOne({ transactionId });

    if (existingPayment) {
      return res.json(existingPayment);
    }

    //  Save payment
    const payment = await Payment.create({
      user: req.user.id,
      contestId,
      transactionId,
      amount,
      status: session.payment_status,
    });

    // auto join contest

    await Contest.findByIdAndUpdate(
      contestId,
      {
        $addToSet: {
          participants: {
            userId: req.user.id,
            // submittedAt: Date.now(),
          },
        },
      },
      { new: true }
    );

    // User joni contest
    await User.findByIdAndUpdate(req.user.id, {
      $push: { joinedContests: contestId },
    });

    res.status(201).json(payment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Payment confirmation failed" });
  }
};
