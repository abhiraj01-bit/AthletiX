import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo.js";
import { handleEMGData, getEMGHistory, saveEMGSession, getEMGSessions, analyzeEMGSession } from "./routes/emg.js";
import { connectArduino, getEMGData, listSerialPorts, disconnectArduino, getConnectionStatus } from "./routes/serial-emg.js";
import { analyzeTest, getTestHistory, getTestStats, uploadVideo } from "./routes/tests.js";
import { getProfile, saveProfile } from "./routes/profile.js";
import { getLeaderboard } from "./routes/leaderboard.js";
import { getTrainingPlans, saveTrainingPlan } from "./routes/trainingPlans.js";


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
  app.post("/api/emg/session", saveEMGSession);
  app.post("/api/emg/analyze", analyzeEMGSession);
  app.get("/api/emg/history/:userId", getEMGHistory);
  app.get("/api/emg/sessions/:userId", getEMGSessions);
  
  // Arduino serial EMG routes
  app.post("/api/serial-emg/connect", connectArduino);
  app.post("/api/serial-emg/disconnect", disconnectArduino);
  app.get("/api/serial-emg/data", getEMGData);
  app.get("/api/serial-emg/ports", listSerialPorts);
  app.get("/api/serial-emg/status", getConnectionStatus);
  
  // Test analysis routes
  app.post("/api/tests/analyze", uploadVideo, analyzeTest);
  app.get("/api/tests/history/:userId", getTestHistory);
  app.get("/api/tests/stats/:userId", getTestStats);
  
  // Profile routes
  console.log('Registering profile routes...');
  app.get("/api/profile/:userId", getProfile);
  app.post("/api/profile/:userId", saveProfile);
  console.log('Profile routes registered');
  
  // Leaderboard routes
  app.get("/api/leaderboard", getLeaderboard);
  
  // Training plans routes
  app.get("/api/training-plans/:userId", getTrainingPlans);
  app.post("/api/training-plans/:userId", saveTrainingPlan);
  

  
  // Food analysis routes
  app.post("/api/food/analyze", async (req, res) => {
    const { analyzeFoodImage, uploadFoodImage } = await import("./routes/food.js");
    uploadFoodImage(req, res, (err) => {
      if (err) return res.status(400).json({ error: err.message });
      analyzeFoodImage(req, res);
    });
  });

  return app;
}
