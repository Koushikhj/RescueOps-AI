
import { incidents } from "../data/incidents.js";
import { geocodeLocation } from "../services/geocodingService.js";

// Get all incidents
export const getIncidents = async (req, res) => {
  try {
    // Automatically geocode older incidents
    for (const incident of incidents) {
      if (
        incident.latitude == null ||
        incident.longitude == null
      ) {
        const coordinates = await geocodeLocation(
          incident.location
        );

        if (coordinates) {
          incident.latitude = coordinates.latitude;
          incident.longitude = coordinates.longitude;
        }
      }
    }

    res.status(200).json({
      success: true,
      count: incidents.length,
      data: incidents
    });

  } catch (error) {
    console.error("Incident retrieval error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve incidents"
    });
  }
};

// Create a new incident
export const createIncident = async (req, res) => {
  const {
    title,
    location,
    severity,
    description,
    incidentType
  } = req.body;

  if (!title || !location || !severity) {
    return res.status(400).json({
      success: false,
      message: "Title, location and severity are required"
    });
  }

  const validSeverities = [
    "Critical",
    "High",
    "Medium",
    "Low"
  ];

  if (!validSeverities.includes(severity)) {
    return res.status(400).json({
      success: false,
      message: "Invalid severity level"
    });
  }

  const coordinates = await geocodeLocation(location);

  const newIncident = {
    id: `INC-${String(Date.now()).slice(-6)}`,
    title,
    description: description || "",
    incidentType: incidentType || "Other",
    location,
    latitude: coordinates?.latitude ?? null,
    longitude: coordinates?.longitude ?? null,
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
