import mongoose from "mongoose";

const winnerSchema = new mongoose.Schema(
  {
    contest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contest",
      unique: true,
      required: true,
    },

    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    prizeMoney: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Winner", winnerSchema);

