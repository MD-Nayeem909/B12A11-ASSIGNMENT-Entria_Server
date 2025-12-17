import User from "../models/User.model.js";

export const verifyCreator = async (req, res, next) => {
  try {
    const firebaseUID = req.user.uid;

    const user = await User.findOne({ firebaseUID });

    if (!user || user.role !== "creator") {
      return res.status(403).json({ message: "Creators only access" });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: "Authorization error" });
  }
};
