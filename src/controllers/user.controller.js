import User from "../models/User.model.js";
import { ROLES } from "../constants/roles.js";

//get role
export const getRole = async (req, res) => {
  try {
    const { role } = req.user;
    res.json({role});
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// get all users (admin)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-__v").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// change role (admin)
export const changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    if (!Object.values(ROLES).includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
