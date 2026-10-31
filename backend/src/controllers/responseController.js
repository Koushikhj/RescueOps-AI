
import { randomUUID } from "crypto";
import { coordinateResponse } from "../services/responseCoordinator.js";

// ==========================================
// IN-MEMORY COORDINATION JOB STORAGE
// ==========================================

const coordinationJobs = new Map();

// ==========================================
// INITIAL AGENT STATUSES
// ==========================================

const createInitialAgentStatuses = () => ({
  incidentAnalyzer: "pending",
  riskAssessment: "pending",
  resourceCoordinator: "pending",
  responsePlanner: "pending",
});

// ==========================================
// PERFORMANCE TRACKING
// ==========================================

const calculateDuration = (startTime) => {
  return Date.now() - startTime;
};

const createPerformanceSummary = (
  startedAt,
  completedAt,
  totalDurationMs,
  agentPerformance = {}
) => ({
  startedAt,
  completedAt,
  totalDurationMs,
  durationSeconds: Number(
    (totalDurationMs / 1000).toFixed(2)
  ),
  incidentAnalyzer: agentPerformance.incidentAnalyzer ?? null,
  riskAssessment: agentPerformance.riskAssessment ?? null,
  resourceCoordinator: agentPerformance.resourceCoordinator ?? null,
  responsePlanner: agentPerformance.responsePlanner ?? null,
  totalPipelineTimeMs:
    agentPerformance.totalPipelineTimeMs ?? null,
  totalPipelineTimeSeconds:
    agentPerformance.totalPipelineTimeSeconds ?? null,
});

// ==========================================
// CONTROLLER 1: START COORDINATION
// ==========================================

export const coordinateIncident = async (req, res) => {
  try {
    const incidentData = req.body?.incident || req.body;

    const {
      title,
      location,
      severity,
      description,
    } = incidentData || {};

    // Validate required fields.
    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof location !== "string" ||
      !location.trim() ||
      !severity
    ) {
      return res.status(400).json({
        success: false,
        message: "Title, location and severity are required",
      });
    }

    // Validate severity.
    const validSeverities = [
      "Critical",
      "High",
      "Medium",
      "Low",
    ];

    if (!validSeverities.includes(severity)) {
      return res.status(400).json({
        success: false,
        message: "Invalid severity level",
        allowedSeverities: validSeverities,
      });
    }

    // Create unique job ID.
    const jobId = randomUUID();

    // Prepare incident data.
    const incident = {
      ...incidentData,
      title: title.trim(),
      location: location.trim(),
      severity,
      description:
        typeof description === "string" && description.trim()
          ? description.trim()
          : title.trim(),
    };

    // Start performance timer.
    const startedAt = new Date().toISOString();
    const startTimeMs = Date.now();

    // Create coordination job.
    const job = {
      jobId,
      incident,
      status: "processing",
      agentStatuses: createInitialAgentStatuses(),
      progressEvents: [],
      result: null,
      error: null,

      performance: createPerformanceSummary(
        startedAt,
        null,
        0
      ),

      createdAt: startedAt,
      completedAt: null,
    };

    coordinationJobs.set(jobId, job);

    console.log("\n=================================");
    console.log("NEW RESCUEOPS COORDINATION JOB");
    console.log("Job ID:", jobId);
    console.log("Incident:", incident.title);
    console.log("Location:", incident.location);
    console.log("Severity:", incident.severity);
    console.log("=================================\n");

    // Return immediately to frontend.
    res.status(202).json({
      success: true,
      message: "Emergency response coordination started",
      jobId,
      status: job.status,
      agentStatuses: job.agentStatuses,
    });

    // ==========================================
    // RUN AGENT PIPELINE IN BACKGROUND
    // ==========================================

    void (async () => {
      try {
        const result = await coordinateResponse(
          incident,
          (progress) => {
            // Update agent statuses.
            if (progress.agentStatuses) {
              job.agentStatuses = {
                ...progress.agentStatuses,
              };
            }

            // Store progress events.
            job.progressEvents.push(progress);

            console.log(
              `[${jobId}] ${progress.agent}: ${progress.status}`
            );
          }
        );

        // Store final results.
        job.status = "completed";
        job.result = result;

        // Preserve agent statuses.
        if (result?.agentStatuses) {
          job.agentStatuses = {
            ...result.agentStatuses,
          };
        }

        // Complete performance tracking.
        const completedAt = new Date().toISOString();
        const totalDurationMs = calculateDuration(startTimeMs);

        job.completedAt = completedAt;

        // Merge individual agent and controller timings.
        job.performance = createPerformanceSummary(
          startedAt,
          completedAt,
          totalDurationMs,
          result?.performance
        );

        console.log("\n=================================");
        console.log("COORDINATION PERFORMANCE");
        console.log("Job ID:", jobId);
        console.log("Status:", job.status);
        console.log("Total Duration:", totalDurationMs, "ms");

        console.log("\nINDIVIDUAL AGENT PERFORMANCE:");

        console.log(
          "Incident Analyzer:",
          job.performance.incidentAnalyzer,
          "ms"
        );

        console.log(
          "Risk Assessment:",
          job.performance.riskAssessment,
          "ms"
        );

        console.log(
          "Resource Coordinator:",
          job.performance.resourceCoordinator,
          "ms"
        );

        console.log(
          "Response Planner:",
          job.performance.responsePlanner,
          "ms"
        );

        console.log("=================================\n");

        console.log(
          `Coordination job ${jobId} completed successfully.`
        );

      } catch (error) {
        console.error(
          `Coordination job ${jobId} failed:`,
          error
        );

        // Preserve partial results.
        const partialResults = error.partialResults || null;

        job.status = partialResults ? "partial" : "failed";
        job.result = partialResults;
        job.error = error.message || "Agent coordination failed";

        if (partialResults?.agentStatuses) {
          job.agentStatuses = {
            ...partialResults.agentStatuses,
          };
        }

        // Record performance even when coordination fails.
        const completedAt = new Date().toISOString();
        const totalDurationMs = calculateDuration(startTimeMs);

        job.completedAt = completedAt;

        // Preserve any agent timings that were completed.
        job.performance = createPerformanceSummary(
          startedAt,
          completedAt,
          totalDurationMs,
          partialResults?.performance
        );

        console.log("\n=================================");
        console.log("COORDINATION PERFORMANCE");
        console.log("Job ID:", jobId);
        console.log("Status:", job.status);
        console.log("Total Duration:", totalDurationMs, "ms");
        console.log("=================================\n");
      }
    })();

  } catch (error) {
    console.error("Start Coordination Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to start emergency response coordination",
      error: error.message,
    });
  }
};

// ==========================================
// CONTROLLER 2: GET COORDINATION PROGRESS
// ==========================================

export const getCoordinationStatus = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = coordinationJobs.get(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Coordination job not found",
      });
    }

    return res.status(200).json({
      success: true,
      jobId: job.jobId,
      status: job.status,
      incident: job.incident,
      agentStatuses: job.agentStatuses,
      progressEvents: job.progressEvents,
      result: job.result,
      error: job.error,
      createdAt: job.createdAt,
      completedAt: job.completedAt,

      // Individual and total performance metrics.
      performance: {
        ...job.performance,
      },
    });

  } catch (error) {
    console.error("Get Coordination Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve coordination status",
      error: error.message,
    });
  }
};
