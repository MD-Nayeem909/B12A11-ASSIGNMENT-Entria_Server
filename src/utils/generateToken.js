import jwt from "jsonwebtoken";

export const generateToken = (user) => {
  // user: { id, email, role }

  return jwt.sign(
    { id: user._id || user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};
