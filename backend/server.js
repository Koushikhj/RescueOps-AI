
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import incidentRoutes from "./src/routes/incidentRoutes.js";
import agentRoutes from "./src/routes/agentRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173"
}));

app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "RescueOps AI backend is running!",
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use("/api/incidents", incidentRoutes);
app.use("/api/agents", agentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found"
  });
});

// Start server
app.listen(PORT, () => {
  console.log("-----------------------------------");
  console.log(" RESCUEOPS AI BACKEND");
  console.log("-----------------------------------");
  console.log(` Server running: http://localhost:${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/api/health`);
  console.log("-----------------------------------");
});
