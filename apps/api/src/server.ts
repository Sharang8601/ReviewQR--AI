import cors from "cors";
import express from "express";
import { ZodError } from "zod";
import { connectDb } from "./config/db.js";
import { env } from "./config/env.js";
import authRoutes from "./routes/auth.js";
import businessRoutes from "./routes/business.js";
import paymentRoutes from "./routes/payments.js";
import reviewRoutes from "./routes/reviews.js";

const app = express();

app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payments", paymentRoutes);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);

  if (error instanceof ZodError) {
    return res.status(400).json({ message: "Invalid request", issues: error.flatten() });
  }

  return res.status(500).json({ message: "Something went wrong" });
});

connectDb()
  .then(() => {
    app.listen(env.port, () => {
      console.log(`API listening on http://localhost:${env.port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start API", error);
    process.exit(1);
  });

