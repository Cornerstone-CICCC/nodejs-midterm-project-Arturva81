import cookieSession from "cookie-session";
import cors from "cors";
import express from "express";

import authRoutes from "./routes/authRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";

const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:4321").split(",").map((o) => o.trim());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: [process.env.SESSION_SECRET ?? "development-secret"],
    httpOnly: true,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24
  })
);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/users", authRoutes);
app.use("/items", itemRoutes);

export default app;
