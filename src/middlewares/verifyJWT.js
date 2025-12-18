import jwt from "jsonwebtoken";

const verifyJWT = (req, res, next) => {
  const auth = req.headers.authorization;
  
  
  if (!auth || !auth.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "No token provided or invalid format" });
  }
  const token = auth.split(" ")[1];

  try {
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing in .env file");
      return res.status(500).json({ message: "Server configuration error" });
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    req.user = payload;
    next();
  } catch (err) {
    console.error("JWT Verification Error:", err.message);

    return res.status(401).json({
      message: "Invalid or expired token",
      error: err.message,
    });
  }
};

export default verifyJWT;
