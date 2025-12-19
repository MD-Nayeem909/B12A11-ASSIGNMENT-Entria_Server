import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    contestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contest",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    transactionId: {
      type: String,
      required: true,
      unique: true,
    },

    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "paid",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
