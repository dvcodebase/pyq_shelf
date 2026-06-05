import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { rateLimit } from "express-rate-limit";
import { connectDB } from "./db.js";
import pdfRoutes from "./routes/pdf.routes.js";

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Security & Middleware ────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(compression());
app.use(morgan("dev"));
app.use(
  cors({
    origin: (process.env.ALLOWED_ORIGINS || "").split(","),
    methods: ["GET", "POST", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// ─── Rate Limiter ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/pdfs", pdfRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Internal Server Error" });
});

// ─── Boot ─────────────────────────────────────────────────────────────────────
const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀  PDF Platform API running on http://localhost:${PORT}`);
  });
};

start();
