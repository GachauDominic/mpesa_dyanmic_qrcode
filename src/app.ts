import express from "express";
import { authRouter } from "./routes/auth.routes";
import { qrRouter } from "./routes/qr.routes";
import { c2bRouter } from "./routes/c2b.routes";
import { HttpError } from "./lib/errors";
import { logger } from "./middleware/logger";
import rateLimiterMidd from "./middleware/rateLimiter";
// import cors  from 'cors'

export function createApp() {
  const app = express();
  app.use(express.json());

  // {cors is used to tell the Backend/API what Frontend URL is allowed to access it}
  // app.use(cors({
  //   origin: "https://todo-client-2.vercel.app",
  //   methods: ["GET", "POST", 
  // "PUT", "DELETE" ],
  // }))

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.use(logger)

  // Rate limiting only applies to your own auth/QR endpoints — never to
  // /api/mpesa/c2b below, since those calls come from Safaricom's own
  // servers on behalf of many different customers, not a single abusive user.
  app.use("/api/auth", rateLimiterMidd, authRouter);
  app.use("/api/qr", rateLimiterMidd, qrRouter);
  // This path is what you register with Daraja as your Validation/Confirmation URLs.
  app.use("/api/mpesa/c2b", c2bRouter);

  app.use(
    (err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      if (err instanceof HttpError) {
        return res.status(err.status).json({ error: err.message });
      }
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  );

  return app;
}
