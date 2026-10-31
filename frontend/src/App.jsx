
import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import ResponseDetails from "./pages/ResponseDetails";
import OperationsMap from "./components/OperationsMap";


const API_URL = "http://127.0.0.1:5000/api";

const AGENT_INFO = [
  {
    key: "incidentAnalyzer",
    id: "AGENT-01",
    name: "Incident Analyzer",
    description: "Analyzes and classifies incoming incidents",
    icon: "🔍",
  },
  {
    key: "riskAssessment",
    id: "AGENT-02",
    name: "Risk Assessment",
    description: "Evaluates severity and potential risks",
    icon: "⚠️",
  },
  {
    key: "resourceCoordinator",
    id: "AGENT-03",
    name: "Resource Coordinator",
    description: "Identifies potentially required resources",
    icon: "🚑",
  },
  {
    key: "responsePlanner",
    id: "AGENT-04",
    name: "Response Planner",
    description: "Creates a coordinated response plan",
    icon: "🧭",
  },
];

const INITIAL_STATUSES = {
  incidentAnalyzer: "pending",
  riskAssessment: "pending",
  resourceCoordinator: "pending",
  responsePlanner: "pending",
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function getIncidentId(incident) {
  return incident.id || incident._id || incident.incidentId;
}

function getIncidentTitle(incident) {
  return (
    incident.title ||
    incident.incidentType ||
    incident.type ||
    "Emergency Incident"
  );
}

function getStatusColor(status) {
  const value = String(status || "").toLowerCase();

  if (["completed", "success", "resolved"].includes(value)) return "#35c98b";
  if (["running", "processing", "in_progress"].includes(value)) return "#55a8ff";
  if (["failed", "error"].includes(value)) return "#ff6b76";
  if (value === "partial") return "#f2b84b";

  return "#8796ad";
}

function StatusBadge({ status }) {
  return (
    <span
      style={{
        background: "#1b2a40",
        color: getStatusColor(status),
        padding: "5px 9px",
        borderRadius: 20,
        fontSize: 10,
        fontWeight: 700,
        textTransform: "capitalize",
      }}
    >
      {String(status || "pending").replaceAll("_", " ")}
    </span>
  );
}

function StatCard({ label, value, icon, detail }) {
  return (
    <div className="rescue-card">
      <div className="rescue-stat-label">
        {label} <span>{icon}</span>
      </div>
      <div className="rescue-stat-value">{value}</div>
      {detail && <div className="rescue-muted">{detail}</div>}
    </div>
  );
}

function AgentCard({ agent, status, message }) {
  return (
    <div className="rescue-card rescue-agent-card">
      <div className="rescue-row">
        <span style={{ fontSize: 23 }}>{agent.icon}</span>
        <StatusBadge status={status} />
      </div>

      <h4>{agent.name}</h4>
      <p className="rescue-muted">{agent.description}</p>

      {message && <p className="rescue-agent-message">{message}</p>}

      <small className="rescue-muted">{agent.id}</small>
    </div>
  );
}

function AgentResult({ title, data }) {
  if (data === undefined || data === null) return null;

  return (
    <div className="rescue-card rescue-result-card">
      <h4>{title}</h4>
      <pre className="rescue-result-content">
        {typeof data === "string"
          ? data
          : JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

// ==========================================
// SMART RESOURCE MATCH CARD
// ==========================================

function ResourceMatchCard({ match }) {
  const score = Math.max(
    0,
    Math.min(100, Number(match.matchScore) || 0)
  );

  return (
    <div className="rescue-match">
      <div className="rescue-row">
        <div>
          <strong>{match.name}</strong>
          <p className="rescue-muted">{match.type}</p>
        </div>

        <div
          style={{
            color: "#35c98b",
            fontSize: 20,
            fontWeight: 800,
          }}
        >
          {score}/100
        </div>
      </div>

      <div
        style={{
          background: "#263449",
          height: 8,
          borderRadius: 10,
          overflow: "hidden",
          margin: "12px 0",
        }}
      >
        <div
          style={{
            width: `${score}%`,
            height: "100%",
            background: "#35c98b",
            borderRadius: 10,
            transition: "width 0.5s ease",
          }}
        />
      </div>

      <p className="rescue-muted">
        📍 Area: {match.area || "Not specified"}
      </p>

      <p className="rescue-muted">
        Location match: {match.locationMatch || "Not available"}
      </p>

      <p className="rescue-muted">
        Resource priority: {match.priority || "Not specified"}
      </p>

      <p className="rescue-warning-text">
        Availability: Not verified
      </p>

      {Array.isArray(match.matchReasons) &&
        match.matchReasons.length > 0 && (
          <div>
            <strong>Why this resource matched</strong>
            <ul>
              {match.matchReasons.map((reason, index) => (
                <li key={index}>{reason}</li>
              ))}
            </ul>
          </div>
        )}
    </div>
  );
}

// ==========================================
// MAIN APPLICATION
// ==========================================

export default function App() {
  const [incidents, setIncidents] = useState([]);
  const [agents, setAgents] = useState([]);
  const [resources, setResources] = useState([]);

  const [activeNav, setActiveNav] = useState("Overview");

  const [loading, setLoading] = useState(true);
  const [resourceLoading, setResourceLoading] = useState(false);
  const [error, setError] = useState("");
  const [resourceError, setResourceError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const [incidentForm, setIncidentForm] = useState({
    title: "",
    description: "",
    location: "",
    severity: "High",
    incidentType: "Medical Emergency",
  });

  const [coordinatingId, setCoordinatingId] = useState(null);
  const [activeJob, setActiveJob] = useState(null);

  const [agentStatuses, setAgentStatuses] = useState(INITIAL_STATUSES);
  const [agentMessages, setAgentMessages] = useState({});
  const [progressEvents, setProgressEvents] = useState([]);

  const [coordinationResults, setCoordinationResults] = useState({});
  const [coordinationErrors, setCoordinationErrors] = useState({});
  const [resourceRecommendations, setResourceRecommendations] = useState({});

  const pollingTimerRef = useRef(null);
  const requestLockRef = useRef(false);

  const navigation = [
    ["▦", "Overview"],
    ["🚨", "Incidents"],
    ["🤖", "AI Agents"],
    ["🧠", "AI Response"],
    ["🚑", "Resources"],
    ["📊", "Analytics"],
  ];

  // ==========================================
  // 1. FETCH DASHBOARD DATA
  // ==========================================

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [incidentResponse, agentResponse] = await Promise.all([
        fetch(`${API_URL}/incidents`),
        fetch(`${API_URL}/agents`),
      ]);

      if (!incidentResponse.ok || !agentResponse.ok) {
        throw new Error("Unable to fetch dashboard data.");
      }

      const incidentData = await incidentResponse.json();
      const agentData = await agentResponse.json();

      const incidentList = Array.isArray(incidentData)
        ? incidentData
        : incidentData.data || incidentData.incidents || [];

      const agentList = Array.isArray(agentData)
        ? agentData
        : agentData.data || agentData.agents || [];

      setIncidents(Array.isArray(incidentList) ? incidentList : []);
      setAgents(Array.isArray(agentList) ? agentList : []);
    } catch (err) {
      setError(err.message || "Backend connection failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================
  // 2. FETCH RESOURCE CATALOG
  // ==========================================

  const fetchResources = useCallback(async () => {
    setResourceLoading(true);
    setResourceError("");

    try {
      const response = await fetch(`${API_URL}/resources`);

      if (!response.ok) {
        throw new Error("Could not load resources.");
      }

      const data = await response.json();

      const resourceList = Array.isArray(data)
        ? data
        : data.data || data.resources || [];

      setResources(Array.isArray(resourceList) ? resourceList : []);
    } catch (err) {
      setResourceError(err.message);
    } finally {
      setResourceLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    fetchResources();

    return () => {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
      }
    };
  }, [fetchDashboardData, fetchResources]);

  // ==========================================
  // 3. CREATE INCIDENT
  // ==========================================

  async function addIncident(event) {
    event.preventDefault();

    if (!incidentForm.title.trim() || !incidentForm.location.trim()) {
      alert("Please enter an incident title and location.");
      return;
    }

    setCreating(true);

    try {
      const response = await fetch(`${API_URL}/incidents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(incidentForm),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Incident creation failed.");
      }

      setShowModal(false);

      setIncidentForm({
        title: "",
        description: "",
        location: "",
        severity: "High",
        incidentType: "Medical Emergency",
      });

      await fetchDashboardData();
    } catch (err) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  }

  // ==========================================
  // 4. SMART RESOURCE RECOMMENDATIONS
  // ==========================================

  async function loadResourceRecommendations(
    incidentId,
    agentResults,
    incidentLocation
  ) {
    const resourceData = agentResults?.resourceRecommendations;

    if (!resourceData?.requiredResources) {
      return;
    }

    setResourceError("");

    try {
      const response = await fetch(`${API_URL}/resources/recommendations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          incidentLocation: incidentLocation || "",
          resourceRecommendations: resourceData,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Resource recommendation failed.");
      }

      const result = data.data || data;

      setResourceRecommendations((previous) => ({
        ...previous,
        [incidentId]: result,
      }));
    } catch (err) {
      setResourceError(err.message);
    }
  }

  // ==========================================
  // 5. COORDINATE INCIDENT RESPONSE
  // ==========================================

  
async function coordinateResponse(incident) {
  const incidentId = getIncidentId(incident);

  if (!incidentId) {
    alert("Invalid incident ID.");
    return;
  }

  if (requestLockRef.current) return;

  requestLockRef.current = true;

  if (pollingTimerRef.current) {
    clearInterval(pollingTimerRef.current);
    pollingTimerRef.current = null;
  }

  setCoordinatingId(incidentId);
  setAgentStatuses({ ...INITIAL_STATUSES });
  setAgentMessages({});
  setProgressEvents([]);
  setActiveJob(null);

  setCoordinationErrors((previous) => ({
    ...previous,
    [incidentId]: null,
  }));

  try {
    // 1. Start AI coordination
    const response = await fetch(`${API_URL}/response/coordinate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ incident }),
    });

    const data = await response.json();

    if (!response.ok || data.success === false) {
      throw new Error(data.message || "Could not start coordination.");
    }

    const jobId = data.jobId || data.id;

    if (!jobId) {
      throw new Error("Backend did not return a job ID.");
    }

    setActiveJob({ jobId, incidentId });

    // 2. Poll backend for agent execution status
    const pollStatus = async () => {
      try {
        const statusResponse = await fetch(
          `${API_URL}/response/status/${jobId}`
        );

        const job = await statusResponse.json();

        if (!statusResponse.ok) {
          throw new Error(job.message || "Unable to fetch job status.");
        }

        // 3. Update agent statuses
        if (job.agentStatuses) {
          setAgentStatuses(job.agentStatuses);
        }

        // 4. Update execution timeline
        if (Array.isArray(job.progressEvents)) {
          setProgressEvents(job.progressEvents);

          const messages = {};

          job.progressEvents.forEach((event) => {
            if (event.agent) {
              messages[event.agent] = event.message;
            }
          });

          setAgentMessages(messages);
        }

        // 5. Save AI results
        if (job.result) {
          setCoordinationResults((previous) => ({
            ...previous,
            [incidentId]: job.result,
          }));
        }

        // 6. Check whether execution has finished
        const finished = ["completed", "partial", "failed"];

        if (finished.includes(job.status)) {
          if (pollingTimerRef.current) {
            clearInterval(pollingTimerRef.current);
            pollingTimerRef.current = null;
          }

          setCoordinatingId(null);
          setActiveJob(null);
          requestLockRef.current = false;

          // 7. Load smart resource recommendations
          if (job.result) {
            await loadResourceRecommendations(
              incidentId,
              job.result,
              incident.location
            );
          }

          // 8. Handle backend errors
          if (job.error) {
            setCoordinationErrors((previous) => ({
              ...previous,
              [incidentId]: job.error,
            }));
          }

          // 9. Refresh dashboard
          await fetchDashboardData();

          // 10. Automatically open AI Response Center
          if (job.result) {
            window.history.replaceState(
              {},
              "",
              `${window.location.pathname}?jobId=${encodeURIComponent(jobId)}`
            );

            setActiveNav("AI Response");
          }
        }
      } catch (err) {
        if (pollingTimerRef.current) {
          clearInterval(pollingTimerRef.current);
          pollingTimerRef.current = null;
        }

        setCoordinationErrors((previous) => ({
          ...previous,
          [incidentId]: err.message,
        }));

        setCoordinatingId(null);
        setActiveJob(null);
        requestLockRef.current = false;
      }
    };

    // 11. Immediately check status once
    await pollStatus();

    // 12. Continue polling while the job is running
    if (requestLockRef.current) {
      pollingTimerRef.current = setInterval(pollStatus, 1500);
    }
  } catch (err) {
    setCoordinationErrors((previous) => ({
      ...previous,
      [incidentId]: err.message,
    }));

    setCoordinatingId(null);
    setActiveJob(null);
    requestLockRef.current = false;
  }
}

  // ==========================================
  // 6. DASHBOARD STATISTICS
  // ==========================================

  const totalIncidents = incidents.length;

  const activeIncidents = incidents.filter((incident) => {
    const status = String(incident.status || "").toLowerCase();

    return !["resolved", "completed", "closed"].includes(status);
  }).length;

  const criticalIncidents = incidents.filter(
    (incident) =>
      String(incident.severity || "").toLowerCase() === "critical"
  ).length;

  const completedAgents = Object.values(agentStatuses).filter(
    (status) => status === "completed"
  ).length;

  const pageTitle =
    activeNav === "Overview"
      ? "Operations Overview"
      : activeNav === "AI Agents"
        ? "AI Agent Network"
        : activeNav === "AI Response"
          ? "AI Response Center"
          : activeNav === "Resources"
            ? "Resource Intelligence"
            : activeNav;

  // ==========================================
  // 7. OVERVIEW PAGE
  // ==========================================

  function renderOverview() {
    return (
      <>
        <div className="rescue-stats-grid">
          <StatCard label="Total Incidents" value={totalIncidents} icon="🚨" detail="All recorded incidents" />
          <StatCard label="Active Incidents" value={activeIncidents} icon="⚡" detail="Awaiting resolution" />
          <StatCard label="Critical Incidents" value={criticalIncidents} icon="🔴" detail="Marked critical" />
          <StatCard label="AI Agents" value={agents.length || 4} icon="🤖" detail="Configured agent network" />
        </div>

        <div className="rescue-content-grid">
          <section className="rescue-card">
            <div className="rescue-row">
              <h3>Recent Incidents</h3>
              <button className="rescue-secondary-button" onClick={() => setActiveNav("Incidents")}>
                View all
              </button>
            </div>

            {incidents.length === 0 ? (
              <p className="rescue-muted">No incidents created yet.</p>
            ) : (
              incidents.slice(0, 6).map((incident) => (
                <div key={getIncidentId(incident)} className="rescue-incident-item">
                  <div className="rescue-row">
                    <div>
                      <strong>{getIncidentTitle(incident)}</strong>
                      <p className="rescue-muted">📍 {incident.location || "Location not specified"}</p>
                    </div>
                    <StatusBadge status={incident.severity} />
                  </div>

                  <div className="rescue-row">
                    <span className="rescue-muted">{incident.status || "New"}</span>
                    <button
                      className="rescue-secondary-button"
                      disabled={Boolean(coordinatingId)}
                      onClick={() => coordinateResponse(incident)}
                    >
                      Coordinate
                    </button>
                  </div>
                </div>
              ))
            )}
          </section>

          <OperationsMap
  incidents={incidents}
  resources={resources}
/>
        </div>

        <section className="rescue-card rescue-section-gap">
          <div className="rescue-row">
            <h3>Multi-Agent Network</h3>
            <StatusBadge status="System ready" />
          </div>
          <div className="rescue-agent-grid">
            {AGENT_INFO.map((agent) => (
              <AgentCard key={agent.key} agent={agent} status={agentStatuses[agent.key]} message={agentMessages[agent.key]} />
            ))}
          </div>
        </section>
      </>
    );
  }

  // ==========================================
  // 8. INCIDENTS PAGE
  // ==========================================

  function renderIncidents() {
    return (
      <section className="rescue-card">
        <div className="rescue-row">
          <h3>Incident Management</h3>
          <button className="rescue-primary-button" onClick={() => setShowModal(true)}>
            + New Incident
          </button>
        </div>

        {incidents.length === 0 ? (
          <p className="rescue-muted">No incidents found. Create your first incident.</p>
        ) : (
          incidents.map((incident) => {
            const incidentId = getIncidentId(incident);
            const isRunning = coordinatingId === incidentId;

            return (
              <div key={incidentId} className="rescue-incident-card">
                <div className="rescue-row">
                  <div>
                    <strong>{getIncidentTitle(incident)}</strong>
                    <p className="rescue-muted">{incidentId} · {incident.location}</p>
                  </div>
                  <StatusBadge status={incident.severity} />
                </div>

                <p className="rescue-muted">{incident.description || "No description provided."}</p>

                <div className="rescue-row">
                  <span className="rescue-muted">Status: {incident.status || "New"}</span>
                  <button
                    className="rescue-primary-button"
                    disabled={Boolean(coordinatingId)}
                    onClick={() => coordinateResponse(incident)}
                  >
                    {isRunning ? "Coordinating..." : "🤖 Coordinate Response"}
                  </button>
                </div>

                {coordinationErrors[incidentId] && (
                  <p className="rescue-error">{coordinationErrors[incidentId]}</p>
                )}
              </div>
            );
          })
        )}
      </section>
    );
  }

  // ==========================================
  // 9. AI AGENTS PAGE
  // ==========================================

  function renderAgents() {
    return (
      <>
        <section className="rescue-card">
          <div className="rescue-row">
            <h3>Agent Execution Tracker</h3>
            <StatusBadge status={coordinatingId ? "running" : "waiting"} />
          </div>

          <div className="rescue-agent-grid">
            {AGENT_INFO.map((agent) => (
              <AgentCard key={agent.key} agent={agent} status={agentStatuses[agent.key]} message={agentMessages[agent.key]} />
            ))}
          </div>

          {coordinatingId && (
            <p className="rescue-muted">Processing incident: {coordinatingId}</p>
          )}
        </section>

        <section className="rescue-card rescue-section-gap">
          <h3>Execution Timeline</h3>

          {progressEvents.length === 0 ? (
            <p className="rescue-muted">Start coordination to see agent activity.</p>
          ) : (
            progressEvents.map((event, index) => (
              <div key={`${event.timestamp || index}-${index}`} className="rescue-timeline-item">
                <span style={{ color: getStatusColor(event.status) }}>●</span>
                <div>
                  <strong>{event.agent} · {event.status}</strong>
                  <p className="rescue-muted">{event.message}</p>
                  {event.timestamp && (
                    <small className="rescue-muted">{new Date(event.timestamp).toLocaleTimeString()}</small>
                  )}
                </div>
              </div>
            ))
          )}
        </section>

        <section className="rescue-card rescue-section-gap">
          <h3>Agent Response Reports</h3>

          {Object.keys(coordinationResults).length === 0 ? (
            <p className="rescue-muted">No reports available yet.</p>
          ) : (
            Object.entries(coordinationResults).map(([incidentId, result]) => (
              <div key={incidentId}>
                <h4>Incident: {incidentId}</h4>
                <AgentResult title="Incident Analyzer" data={result.incidentAnalysis || result.analysis} />
                <AgentResult title="Risk Assessment" data={result.riskAssessment} />
                <AgentResult title="Resource Coordinator" data={result.resourceRecommendations} />
                <AgentResult title="Response Planner" data={result.responsePlan || result.responsePlanner} />
              </div>
            ))
          )}
        </section>
      </>
    );
  }

  // ==========================================
  // 10. RESOURCES PAGE
  // ==========================================

  function renderResources() {
    return (
      <>
        <div className="rescue-warning">
          ⚠️ <strong>Demo data:</strong> Resource records are illustrative. Locations and availability are not verified. RescueOps AI does not contact or dispatch emergency services. Human verification and approval are required.
        </div>

        <div className="rescue-row">
          <div>
            <h3>Resource Catalog</h3>
            <p className="rescue-muted">Demonstration resources for emergency coordination.</p>
          </div>
          <button className="rescue-secondary-button" onClick={fetchResources} disabled={resourceLoading}>
            {resourceLoading ? "Refreshing..." : "↻ Refresh"}
          </button>
        </div>

        {resourceError && <p className="rescue-error">{resourceError}</p>}

        <div className="rescue-stats-grid">
          <StatCard label="Catalog Resources" value={resources.length} icon="🏥" detail="Illustrative records" />
          <StatCard label="Resource Categories" value={new Set(resources.map((resource) => resource.type)).size} icon="📦" />
          <StatCard label="Verified Availability" value="0" icon="🔎" detail="No live verification connected" />
        </div>

        {resourceLoading && resources.length === 0 ? (
          <p className="rescue-muted">Loading resources...</p>
        ) : resources.length === 0 ? (
          <p className="rescue-muted">No resources returned by the backend.</p>
        ) : (
          <div className="rescue-resource-grid">
            {resources.map((resource) => (
              <div key={resource.id || resource._id} className="rescue-card">
                <div className="rescue-row">
                  <span style={{ fontSize: 24 }}>🚑</span>
                  <StatusBadge status="Not verified" />
                </div>
                <h4>{resource.name}</h4>
                <p className="rescue-muted">{resource.type}</p>
                <p className="rescue-muted">📍 {resource.area || "Location not specified"}</p>

                {Array.isArray(resource.capabilities) &&
                  resource.capabilities.map((capability) => (
                    <span className="rescue-service-tag" key={capability}>{capability}</span>
                  ))}

                <hr />
                <small className="rescue-warning-text">Demo record · Verification required</small>
              </div>
            ))}
          </div>
        )}

        <section className="rescue-card rescue-section-gap">
          <div className="rescue-row">
            <h3>🧠 Smart Resource Recommendations</h3>
            <StatusBadge status="AI powered" />
          </div>

          <p className="rescue-muted">
            Resources are ranked using resource type, area-name matching and priority. Scores are heuristic demo scores, not verified distance or availability measurements.
          </p>

          {Object.keys(resourceRecommendations).length === 0 ? (
            <div className="rescue-empty-state">
              <div style={{ fontSize: 30 }}>🧠</div>
              <p className="rescue-muted">No AI recommendations yet.</p>
              <button className="rescue-secondary-button" onClick={() => setActiveNav("Incidents")}>
                Go to Incidents
              </button>
            </div>
          ) : (
            Object.entries(resourceRecommendations).map(([incidentId, data]) => (
              <div key={incidentId} className="rescue-recommendation">
                <h4>Incident: {incidentId}</h4>
                <p className="rescue-muted">Incident location: {data.incidentLocation || "Not provided"}</p>

                <div className="rescue-stats-grid">
                  <StatCard label="Resource Types" value={data.totalResourceTypes ?? 0} icon="📦" />
                  <StatCard label="Catalog Matches" value={data.totalCatalogMatches ?? 0} icon="🎯" />
                </div>

                {(data.recommendations || []).map((recommendation, index) => (
                  <div key={`${recommendation.resourceType}-${index}`} className="rescue-recommendation-card">
                    <div className="rescue-row">
                      <strong>{recommendation.resourceType}</strong>
                      <StatusBadge status={recommendation.availabilityStatus || "Not verified"} />
                    </div>

                    <p className="rescue-muted">Requested quantity: {recommendation.requestedQuantity ?? 1}</p>
                    <p className="rescue-muted">Priority: {recommendation.priority || "Medium"}</p>
                    <p className="rescue-muted">Reason: {recommendation.reason || "Not specified"}</p>
                    <hr />
                    <strong>Ranked Resource Matches ({recommendation.matchingCount ?? 0})</strong>

                    {(recommendation.matchedResources || []).map((match, matchIndex) => (
                      <ResourceMatchCard key={match.id || match._id || matchIndex} match={match} />
                    ))}

                    {recommendation.matchingCount === 0 && (
                      <p className="rescue-muted">No matching catalog record found.</p>
                    )}
                  </div>
                ))}

                <div className="rescue-warning">
                  ⚠️ {data.importantNotice || "Demo recommendations only. Human verification is required."}
                </div>
              </div>
            ))
          )}
        </section>
      </>
    );
  }

  // ==========================================
  // 11. ANALYTICS PAGE
  // ==========================================

  function renderAnalytics() {
    return (
      <>
        <div className="rescue-stats-grid">
          <StatCard label="Total Incidents" value={totalIncidents} icon="📊" />
          <StatCard label="Active Incidents" value={activeIncidents} icon="⚡" />
          <StatCard label="Critical Incidents" value={criticalIncidents} icon="🔴" />
          <StatCard label="Completed Agent Stages" value={completedAgents} icon="🤖" />
        </div>

        <section className="rescue-card">
          <h3>Incident Summary</h3>
          <p className="rescue-muted">
            Analytics currently uses the incident list returned by the backend. Historical database-backed analytics are not configured.
          </p>
          <div className="rescue-row">
            <span>Total incidents</span>
            <strong>{totalIncidents}</strong>
          </div>
          <hr />
          <div className="rescue-row">
            <span>Active incidents</span>
            <strong>{activeIncidents}</strong>
          </div>
          <hr />
          <div className="rescue-row">
            <span>Critical incidents</span>
            <strong>{criticalIncidents}</strong>
          </div>
        </section>
      </>
    );
  }

  // ==========================================
  // 12. MAIN APPLICATION UI
  // ==========================================

  return (
    <div className="rescue-app">
      <aside className="rescue-sidebar">
        <div className="rescue-logo">
          RESCUE<span>OPS</span>
        </div>

        <p className="rescue-tagline">AI EMERGENCY RESPONSE PLATFORM</p>
        <p className="rescue-nav-label">WORKSPACE</p>

        {navigation.map(([icon, label]) => (
          <button
            key={label}
            className={`rescue-nav-item ${activeNav === label ? "active" : ""}`}
            onClick={() => setActiveNav(label)}
          >
            <span>{icon}</span>
            {label}
          </button>
        ))}

        <div className="rescue-sidebar-bottom">
          <strong>RESCUEOPS AI</strong>
          <p>Multi-Agent Emergency Response Coordinator</p>
          <StatusBadge status="Prototype" />
        </div>
      </aside>

      <main className="rescue-main">
        <header className="rescue-header">
          <div>
            <h1>{pageTitle}</h1>
            <p>Monitor incidents, coordinate AI agents and review resource recommendations.</p>
          </div>

          <div className="rescue-header-actions">
            <button
              className="rescue-secondary-button"
              onClick={() => {
                fetchDashboardData();
                fetchResources();
              }}
            >
              ↻ Refresh
            </button>

            <button className="rescue-primary-button" onClick={() => setShowModal(true)}>
              + New Incident
            </button>
          </div>
        </header>

        {error && (
          <div className="rescue-warning">
            Backend connection issue: {error}. Check that the backend is running at {API_URL}.
          </div>
        )}

        {loading && activeNav !== "AI Response" ? (
          <section className="rescue-card">
            <p className="rescue-muted">Loading dashboard...</p>
          </section>
        ) : (
          <>
            {activeNav === "Overview" && renderOverview()}
            {activeNav === "Incidents" && renderIncidents()}
            {activeNav === "AI Agents" && renderAgents()}
            {activeNav === "AI Response" && <ResponseDetails />}
            {activeNav === "Resources" && renderResources()}
            {activeNav === "Analytics" && renderAnalytics()}
          </>
        )}
      </main>

      {/* NEW INCIDENT MODAL */}

      {showModal && (
        <div
          className="rescue-modal-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowModal(false);
            }
          }}
        >
          <div className="rescue-modal">
            <div className="rescue-row">
              <h2>Create New Incident</h2>
              <button className="rescue-secondary-button" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            <p className="rescue-muted">Enter incident details to add it to the dashboard.</p>

            <form onSubmit={addIncident}>
              <label>Incident Title *</label>
              <input
                value={incidentForm.title}
                onChange={(event) =>
                  setIncidentForm({ ...incidentForm, title: event.target.value })
                }
                placeholder="Example: Building fire"
                required
              />

              <label>Incident Type</label>
              <select
                value={incidentForm.incidentType}
                onChange={(event) =>
                  setIncidentForm({ ...incidentForm, incidentType: event.target.value })
                }
              >
                <option>Medical Emergency</option>
                <option>Fire Emergency</option>
                <option>Road Accident</option>
                <option>Natural Disaster</option>
                <option>Crime / Security</option>
                <option>Other</option>
              </select>

              <label>Location *</label>
              <input
                value={incidentForm.location}
                onChange={(event) =>
                  setIncidentForm({ ...incidentForm, location: event.target.value })
                }
                placeholder="Enter incident location"
                required
              />

              <label>Severity</label>
              <select
                value={incidentForm.severity}
                onChange={(event) =>
                  setIncidentForm({ ...incidentForm, severity: event.target.value })
                }
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>

              <label>Description</label>
              <textarea
                value={incidentForm.description}
                onChange={(event) =>
                  setIncidentForm({ ...incidentForm, description: event.target.value })
                }
                placeholder="Describe what happened..."
                rows={4}
              />

              <div className="rescue-modal-actions">
                <button
                  type="button"
                  className="rescue-secondary-button"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="rescue-primary-button" disabled={creating}>
                  {creating ? "Creating..." : "Create Incident"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
