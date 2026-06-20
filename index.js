import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import { toNodeHandler } from "better-auth/node";

import { connectDB, getDB } from "./config/db.js";
import { initAuth } from "./lib/auth.js";

import userRoutes from "./routes/userRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";

const app = express();
const port = process.env.PORT || 5000;

const corsOptions = {
  origin: [process.env.CLIENT_URL, "http://localhost:3000"],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(cookieParser());

const start = async () => {
  await connectDB();

  // BetterAuth needs the live Mongo `Db` instance, so it is created only
  // after connectDB() resolves, then mounted BEFORE express.json() —
  // BetterAuth parses its own request body.
  const auth = initAuth(getDB());
  app.all("/api/auth/*", toNodeHandler(auth));

  app.use(express.json());

  app.get("/", (req, res) => {
    res.send("🎫 TicketBari server is running");
  });

  app.use("/", userRoutes);
  app.use("/", ticketRoutes);
  app.use("/", bookingRoutes);
  app.use("/", paymentRoutes);
  app.use("/", statsRoutes);

  // 404 handler
  app.use((req, res) => {
    res.status(404).send({ message: "Route not found" });
  });

  // Centralized error handler — keeps CORS headers on error responses too
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).send({ message: err.message || "Internal server error" });
  });

  app.listen(port, () => {
    console.log(`🎫 TicketBari server listening on port ${port}`);
  });
};

start();
