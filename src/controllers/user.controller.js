import User from "../models/User.model.js";
import { ROLES } from "../constants/roles.js";
import Contest from "../models/Contest.model.js";

//get role
export const getRole = async (req, res) => {
  try {
    const { role } = req.user;
    res.json({ role });
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

export const joinedContests = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user.id);
    const joinedContests = user.joinedContests.includes(id);
    res.json({ message: "Joined contests", joinedContests });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userUid } = req.params;
    const user = await User.findOneAndDelete({ firebaseUID: userUid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
