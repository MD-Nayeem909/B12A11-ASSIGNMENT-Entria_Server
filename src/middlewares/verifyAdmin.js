import User from "../models/User.model.js";

export const verifyAdmin = async (req, res, next) => {
  try {
    const firebaseUID = req.user.uid;
    const user = await User.findOne({ firebaseUID });

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admin only" });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: "Authorization error" });
  }
};
