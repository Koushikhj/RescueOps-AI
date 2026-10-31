
import express from "express";

import {
  getAllResources,
  getResourceRecommendations
} from "../controllers/resourceController.js";

const router = express.Router();

// Get all demo resources
router.get("/", getAllResources);

// Match AI recommendations with demo resources
router.post("/recommendations", getResourceRecommendations);

export default router;
