
import express from "express";

import {
  coordinateIncident,
  getCoordinationStatus
} from "../controllers/responseController.js";

const router = express.Router();

// Start emergency response coordination.
router.post("/coordinate", coordinateIncident);

// Get live agent execution progress.
router.get("/status/:jobId", getCoordinationStatus);

export default router;
