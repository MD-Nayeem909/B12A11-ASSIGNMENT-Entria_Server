import mongoose from "mongoose";

const ContestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    type: {
      type: String,
      enum: ["Design", "Writing", "Business", "Gaming", "Photography", "Other"],
      required: true,
    },
    price: { type: Number, default: 0 },
    prize: { type: Number, required: true },
    instruction: { type: String, required: true },
    deadline: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed"],
      default: "pending",
    },
    creatorId: { type: String, required: true }, // firebaseUID of creator
    participants: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        submission: String,
        submittedAt: Date,
      },
    ],
    winner: {
      userId: { type: String, default: null },
      announcedAt: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

const Contest = mongoose.model("Contest", ContestSchema);
export default Contest;
