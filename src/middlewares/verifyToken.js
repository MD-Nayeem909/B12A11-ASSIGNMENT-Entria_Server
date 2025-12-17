import admin from "firebase-admin";

// Firebase Admin SDK initialize
// (You must load your credentials earlier)
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decodedUser = await admin.auth().verifyIdToken(token);
    req.user = decodedUser; // store firebase data

    next();
  } catch (err) {
    console.error("Token verify failed:", err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
