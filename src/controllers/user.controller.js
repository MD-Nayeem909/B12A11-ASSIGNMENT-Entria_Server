import User from "../models/User.model.js";
import { ROLES } from "../constants/roles.js";

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

export const getSingleUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ firebaseUID: id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      image: user.image,
      bio: user.bio,
      address: user.address,
      role: user.role,
      participatedCount: user.joinedContests?.length || 0,
      wonCount: user.wonContests?.length || 0,
      totalWins: user.totalWins || 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching profile" });
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

export const updateUserProfile = async (req, res) => {
  const { bio, address } = req.body;
  console.log(req.params.uid);

  const user = await User.findOneAndUpdate(
    { firebaseUID: req.params.uid },
    { bio, address },
    { new: true }
  );

  res.json(user);
};
