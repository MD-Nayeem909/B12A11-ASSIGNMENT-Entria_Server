import admin from "../config/firebaseAdmin.js";
import User from "../models/User.model.js";
import { generateToken } from "../utils/generateToken.js";

export const firebaseLogin = async (req, res) => {
  const { idToken } = req.body;
  
  if (!idToken) return res.status(400).json({ message: "idToken required" });

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decoded;

    const filter = { email };
    const update = {
      firebaseUID: uid,
      name: name || decoded.name || "No name",
      email,
      image: picture || "",
    };
    const opts = { upsert: true, new: true, setDefaultsOnInsert: true };

    let user = await User.findOneAndUpdate(filter, update, opts);

    // ensure role exists (if new user, default is user)
    if (!user) {
      user = await User.create(update);
    }

    const token = generateToken(user);
    res.json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Invalid Firebase ID token" });
  }
};
