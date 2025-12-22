import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import contestRoutes from "./routes/contest.routes.js";
import paymentRoutes from "./routes/stripe.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import creatorContestRoutes from "./routes/creator.contest.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const app = express();
// Configure CORS
const corsOptions = {
  origin: "http://localhost:5173", // Your frontend application's origin
  credentials: true, // Allow cookies to be sent
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // Explicitly allow methods
  allowedHeaders: ["Content-Type", "Authorization"], // Explicitly allow headers
};

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/contests", contestRoutes);
app.use("/api/creator/contests", creatorContestRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use("/", (req, res) => {
  res.send("Welcome to Entria API");
});

// health
app.get("/api/health", (req, res) => res.json({ ok: true }));

export default app;
