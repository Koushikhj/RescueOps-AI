
import { resources } from "../data/resources.js";

// ==========================================
// RESOURCE TYPE ALIASES
// ==========================================

const RESOURCE_TYPE_ALIASES = {
  Hospital: ["hospital", "medical center", "medical centre"],
  Ambulance: ["ambulance", "medical transport"],
  "Fire Service": ["fire service", "fire engine", "fire brigade"],
  Police: ["police", "law enforcement"],
  "Rescue Team": ["rescue team", "search and rescue"],
  "Blood Bank": ["blood bank", "blood centre", "blood center"]
};

const PRIORITY_WEIGHTS = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1
};

// ==========================================
// NORMALIZATION
// ==========================================

function normalize(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ");
}

function normalizeResourceType(type = "") {
  const requestedType = normalize(type);

  for (const [canonicalType, aliases] of Object.entries(
    RESOURCE_TYPE_ALIASES
  )) {
    const names = [canonicalType, ...aliases];

    if (names.some((name) => normalize(name) === requestedType)) {
      return canonicalType;
    }
  }

  return null;
}

// ==========================================
// LOCATION MATCHING
// ==========================================

function calculateLocationMatch(incidentLocation, resourceArea) {
  const incident = normalize(incidentLocation);
  const area = normalize(resourceArea);

  if (!incident || !area) {
    return {
      score: 0,
      status: "Location not provided",
      reason: "Location information is incomplete"
    };
  }

  // Exact area match
  if (incident === area) {
    return {
      score: 30,
      status: "Area match",
      reason: "Resource area matches incident location"
    };
  }

  // One location name contains the other
  if (
    incident.includes(area) ||
    area.includes(incident)
  ) {
    // Avoid treating a generic city name as a precise area match
    if (incident === "bengaluru" || area === "bengaluru") {
      return {
        score: 10,
        status: "City-level match",
        reason: "Resource and incident share a city-level location"
      };
    }

    return {
      score: 20,
      status: "Partial area match",
      reason: "Resource and incident location names partially match"
    };
  }

  // No verified geographic proximity can be inferred
  return {
    score: 0,
    status: "Area not matched",
    reason: "No matching area name found"
  };
}

// ==========================================
// PRIORITY MATCHING
// ==========================================

function calculatePriorityMatch(
  incidentPriority,
  resourcePriority
) {
  const incidentWeight =
    PRIORITY_WEIGHTS[incidentPriority] || 2;

  const resourceWeight =
    PRIORITY_WEIGHTS[resourcePriority] || 2;

  if (resourceWeight >= incidentWeight) {
    return {
      score: 20,
      reason: "Resource priority meets or exceeds incident priority"
    };
  }

  return {
    score: 10,
    reason: "Resource priority is below incident priority"
  };
}

// ==========================================
// RESOURCE MATCH SCORE
// ==========================================

function calculateResourceScore(resource, required, incidentLocation) {
  let score = 50;

  const reasons = [
    "Resource type matches requested requirement"
  ];

  const locationResult = calculateLocationMatch(
    incidentLocation,
    resource.area
  );

  score += locationResult.score;
  reasons.push(locationResult.reason);

  const priorityResult = calculatePriorityMatch(
    required.priority || "Medium",
    resource.priority
  );

  score += priorityResult.score;
  reasons.push(priorityResult.reason);

  return {
    matchScore: Math.min(score, 100),
    locationMatch: locationResult.status,
    matchReasons: reasons
  };
}

// ==========================================
// FIND AND RANK MATCHING RESOURCES
// ==========================================

function findMatchingResources(
  required,
  incidentLocation
) {
  const canonicalType = normalizeResourceType(
    required.resourceType
  );

  if (!canonicalType) {
    return [];
  }

  return resources
    .filter((resource) => resource.type === canonicalType)
    .map((resource) => {
      const scoreDetails = calculateResourceScore(
        resource,
        required,
        incidentLocation
      );

      return {
        ...resource,
        ...scoreDetails,
        matchStatus: "Demo catalog match",
        availabilityStatus: "Not verified",
        verificationRequired: true
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}

// ==========================================
// SMART RESOURCE RECOMMENDATION ENGINE
// ==========================================

export function generateResourceRecommendations(
  resourceRecommendations,
  incidentLocation = ""
) {
  const requiredResources =
    resourceRecommendations?.requiredResources || [];

  if (!Array.isArray(requiredResources)) {
    throw new Error("Invalid requiredResources format");
  }

  const recommendations = requiredResources.map((required) => {
    const matches = findMatchingResources(
      required,
      incidentLocation
    );

    return {
      resourceType: required.resourceType || "Unknown",

      requestedQuantity: Math.max(
        1,
        Number(required.quantity) || 1
      ),

      reason: required.reason || "No reason provided",

      priority: required.priority || "Medium",

      matchedResources: matches,

      matchingCount: matches.length,

      availabilityStatus: "Not verified",

      verificationRequired: true
    };
  });

  return {
    success: true,

    source: "RescueOps AI Smart Resource Matching Engine",

    demoData: true,

    matchingCriteria: [
      "Resource type",
      "Area-name matching",
      "Incident and resource priority"
    ],

    incidentLocation: incidentLocation || "Not provided",

    totalResourceTypes: recommendations.length,

    totalCatalogMatches: recommendations.reduce(
      (total, item) => total + item.matchingCount,
      0
    ),

    recommendations,

    importantNotice:
      "Recommendations are based on an illustrative demo catalog. Area matching is based on text, not GPS distance. Resource locations and availability are not verified. Human verification is required before any real-world action."
  };
}
