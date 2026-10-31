
import express from "express";
import cors from "cors";
import dotenv from "dotenv";




// ==========================================
// ROUTE IMPORTS
// ==========================================

import incidentRoutes from "./src/routes/incidentRoutes.js";
import agentRoutes from "./src/routes/agentRoutes.js";
import responseRoutes from "./src/routes/responseRoutes.js";
import resourceRoutes from "./src/routes/resourceRoutes.js";

// ==========================================
// ENVIRONMENT CONFIGURATION
// ==========================================

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());

app.use(express.json());

// ==========================================
// HEALTH CHECK
// ==========================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "RescueOps AI Backend is running!",
    version: "1.0.0",
    status: "Operational"
  });
});

// ==========================================
// API ROUTES
// ==========================================

app.use("/api/incidents", incidentRoutes);

app.use("/api/agents", agentRoutes);

app.use("/api/response", responseRoutes);

// Resource Intelligence API
app.use("/api/resources", resourceRoutes);

// ==========================================
// 404 HANDLER
// ==========================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

app.use((error, req, res, next) => {
  console.error("Backend Error:", error);

  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal Server Error"
  });
});

// ==========================================
// START SERVER WITH DATABASE CONNECTION
// ==========================================

app.listen(PORT, () => {
  console.log("\n==================================");
  console.log("       RESCUEOPS AI BACKEND");
  console.log("==================================");
  console.log(`Server running: http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/`);
  console.log(`Incidents: http://localhost:${PORT}/api/incidents`);
  console.log(`Agents: http://localhost:${PORT}/api/agents`);
  console.log(`Response: http://localhost:${PORT}/api/response`);
  console.log(`Resources: http://localhost:${PORT}/api/resources`);
  console.log("==================================\n");
});