
import { incidents } from "../data/incidents.js";

// Get all incidents
export const getIncidents = (req, res) => {
  res.status(200).json({
    success: true,
    count: incidents.length,
    data: incidents
  });
};

// Create a new incident
export const createIncident = (req, res) => {
  const { title, location, severity } = req.body;

  if (!title || !location || !severity) {
    return res.status(400).json({
      success: false,
      message: "Title, location and severity are required"
    });
  }

  const validSeverities = ["Critical", "High", "Medium", "Low"];

  if (!validSeverities.includes(severity)) {
    return res.status(400).json({
      success: false,
      message: "Invalid severity level"
    });
  }

  const newIncident = {
    id: `INC-${String(Date.now()).slice(-6)}`,
    title,
    location,
    severity,
    status: "Analyzing",
    time: "Just now"
  };

  incidents.unshift(newIncident);

  res.status(201).json({
    success: true,
    message: "Incident created successfully",
    data: newIncident
  });
};
