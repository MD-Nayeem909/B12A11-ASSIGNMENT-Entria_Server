import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String, default: "" },
    bio: { type: String, default: "" },
    address: { type: String, default: "" },
    role: { type: String, enum: ["admin", "creator", "user"], default: "user" },
    firebaseUID: { type: String, required: true },
    totalWins: { type: Number, default: 0 },
    joinedContests: [{ type: mongoose.Schema.Types.ObjectId, ref: "Contest" }],
    wonContests: [{ type: mongoose.Schema.Types.ObjectId, ref: "Contest" }],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
