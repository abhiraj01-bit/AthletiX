import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleEMGData, getEMGHistory } from "./routes/emg";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);
  
  // EMG sensor routes
  app.post("/api/emg/data", handleEMGData);
  app.get("/api/emg/history/:userId", getEMGHistory);

  return app;
}
