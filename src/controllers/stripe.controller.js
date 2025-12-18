// const stripe = require('stripe')('sk_test_51SeagMDPkvqwGkEX1SzQT43ohCKMpZ5BHRQnVCpK7xKRl0I950BZrHSDZ7Xpm44TR4n2Z82SBdbiSUOXVx7jVM8L002MVt5A6A');
// const express = require('express');
// const app = express();
// app.use(express.static('public'));

import Stripe from "stripe";

const YOUR_DOMAIN = "http://localhost:5173";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  const paymentInfo = req.body;
  console.log(paymentInfo);

  const amount = parseInt(paymentInfo.price) * 100;

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "USD",
          unit_amount: amount,
          product_data: {
            name: paymentInfo.contestName,
          },
        },
        quantity: 1,
      },
    ],
    customer_email: req.user.email,
    mode: "payment",
    metadata: { contestId: paymentInfo.contestId },
    success_url: `${YOUR_DOMAIN}?success=true`,
    cancel_url: `${YOUR_DOMAIN}?success=true`,
  });
  res.json({ url: session.url });
};

export const confirmPayment = async (req, res) => {
  try {
    const { transactionId } = req.query;
    if (!transactionId) {
      return res.status(400).json({ message: "Invalid payment data" });
    }
    const payment = await stripe.checkout.sessions.retrieve(transactionId);
    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
