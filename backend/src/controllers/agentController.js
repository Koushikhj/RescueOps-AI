
import { analyzeIncident } from "../services/incidentAnalyzer.js";

// Existing AI agent information
const agents = [
  {
    id: "AGENT-01",
    name: "Incident Analyzer",
    role: "Incident Understanding",
    status: "Active",
    description: "Analyzes emergency reports and extracts important details."
  },
  {
    id: "AGENT-02",
    name: "Risk Assessment",
    role: "Emergency Risk Evaluation",
    status: "Active",
    description: "Evaluates potential risks and incident severity."
  },
  {
    id: "AGENT-03",
    name: "Resource Coordinator",
    role: "Resource Management",
    status: "Active",
    description: "Identifies resources required for emergency response."
  },
  {
    id: "AGENT-04",
    name: "Response Planner",
    role: "Emergency Response Planning",
    status: "Active",
    description: "Creates structured emergency response recommendations."
  }
];

// GET: Return all available agents
export const getAgents = (req, res) => {
  res.status(200).json({
    success: true,
    count: agents.length,
    data: agents
  });
};

// POST: Analyze an incident using Gemini AI
export const analyzeIncidentController = async (req, res) => {
  try {
    const { title, location, severity, description } = req.body;

    // Validate required fields
    if (!title || !location || !severity) {
      return res.status(400).json({
        success: false,
        message: "Title, location and severity are required"
      });
    }

    // Validate severity
    const validSeverities = ["Critical", "High", "Medium", "Low"];

    if (!validSeverities.includes(severity)) {
      return res.status(400).json({
        success: false,
        message: "Invalid severity level"
      });
    }

    // Call Incident Analyzer Agent
    const analysis = await analyzeIncident({
      title,
      location,
      severity,
      description
    });

    return res.status(200).json({
      success: true,
      message: "Incident analyzed successfully",
      data: analysis
    });

  } catch (error) {
    console.error("Incident Analyzer Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to analyze incident",
      error: error.message
    });
  }
};
