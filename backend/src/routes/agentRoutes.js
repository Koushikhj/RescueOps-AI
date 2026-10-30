
import express from "express";
import { getAgents } from "../controllers/agentController.js";

const router = express.Router();

// GET all AI agents
router.get("/", getAgents);

export default router;
