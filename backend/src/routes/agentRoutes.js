
import express from "express";

import {
  getAgents,
  analyzeIncidentController
} from "../controllers/agentController.js";

const router = express.Router();

// GET: Fetch all agents
router.get("/", getAgents);

// POST: Analyze an emergency incident using Gemini
router.post("/analyze", analyzeIncidentController);

export default router;
