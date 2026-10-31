
import { resources } from "../data/resources.js";
import { generateResourceRecommendations } from "../services/resourceService.js";

// ==========================================
// GET ALL RESOURCES
// ==========================================

export function getAllResources(req, res) {
  try {
    return res.status(200).json({
      success: true,
      count: resources.length,
      demoData: true,
      availabilityStatus: "Not verified",
      data: resources,

      importantNotice:
        "These are illustrative demo resources. Their locations and availability have not been verified."
    });
  } catch (error) {
    console.error("Get Resources Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve resources",
      error: error.message
    });
  }
}

// ==========================================
// GET SMART RESOURCE RECOMMENDATIONS
// ==========================================

export function getResourceRecommendations(req, res) {
  try {
    const {
      resourceRecommendations,
      incidentLocation
    } = req.body;

    // Validate request body
    if (!resourceRecommendations) {
      return res.status(400).json({
        success: false,
        message: "Resource recommendations are required"
      });
    }

    if (
      !Array.isArray(resourceRecommendations.requiredResources)
    ) {
      return res.status(400).json({
        success: false,
        message: "requiredResources must be an array"
      });
    }

    // Validate incident location
    if (
      incidentLocation !== undefined &&
      typeof incidentLocation !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "incidentLocation must be a string"
      });
    }

    // Generate ranked resource recommendations
    const result = generateResourceRecommendations(
      resourceRecommendations,
      incidentLocation || ""
    );

    return res.status(200).json({
      success: true,
      message: "Smart resource recommendations generated successfully",
      data: result
    });

  } catch (error) {
    console.error("Resource Recommendation Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate resource recommendations",
      error: error.message
    });
  }
}
