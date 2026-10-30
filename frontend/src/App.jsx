
import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api";

const agentIcons = {
  "Incident Analyzer": "🔍",
  "Risk Assessment": "🛡️",
  "Resource Coordinator": "🚑",
  "Response Planner": "🧠",
};

function App() {
  const [incidents, setIncidents] = useState([]);
  const [agents, setAgents] = useState([]);
  const [activeNav, setActiveNav] = useState("Overview");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  // Fetch incidents and agents from backend
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError("");

        const [incidentResponse, agentResponse] = await Promise.all([
          fetch(`${API_URL}/incidents`),
          fetch(`${API_URL}/agents`),
        ]);

        if (!incidentResponse.ok || !agentResponse.ok) {
          throw new Error("Unable to fetch dashboard data");
        }

        const incidentResult = await incidentResponse.json();
        const agentResult = await agentResponse.json();

        setIncidents(incidentResult.data);
        setAgents(agentResult.data);
      } catch (err) {
        console.error("Dashboard loading error:", err);
        setError("Could not connect to backend. Check whether the server is running.");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // Create a new incident through backend API
  async function addIncident() {
    const title = window.prompt("Enter emergency title:");

    if (!title || !title.trim()) return;

    const location = window.prompt("Enter emergency location:");

    if (!location || !location.trim()) return;

    const severityInput = window.prompt(
      "Enter severity: Critical, High, Medium or Low",
      "High"
    );

    if (!severityInput) return;

    const severity =
      severityInput.charAt(0).toUpperCase() +
      severityInput.slice(1).toLowerCase();

    if (!["Critical", "High", "Medium", "Low"].includes(severity)) {
      alert("Please enter a valid severity.");
      return;
    }

    try {
      setCreating(true);
      setError("");

      const response = await fetch(`${API_URL}/incidents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          location: location.trim(),
          severity,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create incident");
      }

      setIncidents((previousIncidents) => [
        result.data,
        ...previousIncidents,
      ]);

      alert("New incident created successfully!");
    } catch (err) {
      console.error("Incident creation error:", err);
      setError(err.message || "Could not create incident.");
    } finally {
      setCreating(false);
    }
  }

  const navigation = [
    ["▦", "Overview"],
    ["🚨", "Incidents"],
    ["🤖", "AI Agents"],
    ["🚑", "Resources"],
    ["📊", "Analytics"],
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">R</div>
          <div>
            <h2>RESCUEOPS<span>AI</span></h2>
            <p>EMERGENCY COMMAND</p>
          </div>
        </div>

        <div className="workspace-label">WORKSPACE</div>

        <nav>
          {navigation.map(([icon, name]) => (
            <button
              key={name}
              className={`nav-item ${activeNav === name ? "active" : ""}`}
              onClick={() => setActiveNav(name)}
            >
              <span>{icon}</span>
              {name}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="system-card">
            <div className="online-dot" />
            <div>
              <strong>System Operational</strong>
              <p>All services running</p>
            </div>
          </div>
          <p className="version">RESCUEOPS AI · v1.0.0</p>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="breadcrumb">Workspace / {activeNav}</p>
            <h1>{activeNav === "Overview" ? "Command Center" : activeNav}</h1>
          </div>

          <div className="topbar-right">
            <div className="live-status">
              <span className="online-dot" />
              SYSTEM LIVE
            </div>
            <div className="avatar">KH</div>
          </div>
        </header>

        <section className="welcome-section">
          <div>
            <h2>Emergency Operations Overview</h2>
            <p>Monitor incidents, coordinate resources and track AI agents.</p>
          </div>

          <button
            className="primary-button"
            onClick={addIncident}
            disabled={creating || loading}
          >
            {creating ? "Creating..." : "+ New Incident"}
          </button>
        </section>

        {error && (
          <div style={{
            padding: "12px",
            marginBottom: "16px",
            background: "#fee2e2",
            color: "#991b1b",
            borderRadius: "8px",
          }}>
            {error}
          </div>
        )}

        {loading ? (
          <div className="panel" style={{ padding: "30px", textAlign: "center" }}>
            Loading RescueOps dashboard...
          </div>
        ) : (
          <>
            <section className="stats-grid">
              <StatCard
                label="Total Incidents"
                value={incidents.length}
                icon="🚨"
                trend="Live backend data"
              />

              <StatCard
                label="Critical Incidents"
                value={incidents.filter(i => i.severity === "Critical").length}
                icon="⚠️"
                trend="Requires attention"
              />

              <StatCard
                label="Active Responses"
                value={incidents.filter(
                  i => i.status === "Responding" || i.status === "Dispatched"
                ).length}
                icon="🚑"
                trend="Teams deployed"
              />

              <StatCard
                label="AI Agents Online"
                value={String(agents.length).padStart(2, "0")}
                icon="🤖"
                trend="Backend agent data"
              />
            </section>

            <section className="content-grid">
              <div className="panel incidents-panel">
                <div className="panel-heading">
                  <div>
                    <h3>Active Incidents</h3>
                    <p>Emergency reports requiring attention</p>
                  </div>
                  <span className="count-badge">
                    {incidents.length} TOTAL
                  </span>
                </div>

                <div className="incident-list">
                  {incidents.length === 0 ? (
                    <p>No incidents available.</p>
                  ) : (
                    incidents.map(incident => (
                      <div className="incident-row" key={incident.id}>
                        <div className="incident-icon">🚨</div>

                        <div className="incident-info">
                          <strong>{incident.title}</strong>
                          <p>{incident.id} · {incident.location}</p>
                        </div>

                        <div className="incident-meta">
                          <span className={`severity ${incident.severity.toLowerCase()}`}>
                            {incident.severity}
                          </span>
                          <span className="incident-time">{incident.time}</span>
                        </div>

                        <span className="status-text">{incident.status}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="panel agents-panel">
                <div className="panel-heading">
                  <div>
                    <h3>AI Agent Network</h3>
                    <p>Multi-agent system status</p>
                  </div>
                  <span className="online-label">● ONLINE</span>
                </div>

                <div className="agent-list">
                  {agents.map(agent => (
                    <div className="agent-row" key={agent.id}>
                      <div className="agent-icon">
                        {agentIcons[agent.name] || "🤖"}
                      </div>

                      <div className="agent-info">
                        <strong>{agent.name}</strong>
                        <p>{agent.role}</p>
                      </div>

                      <span className="agent-status">{agent.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="bottom-grid">
              <div className="panel map-panel">
                <div className="panel-heading">
                  <div>
                    <h3>Emergency Coverage</h3>
                    <p>Illustrative operations area · Bengaluru</p>
                  </div>
                  <span className="count-badge">DEMO VIEW</span>
                </div>

                <div className="map-placeholder">
                  <div className="map-road road-one" />
                  <div className="map-road road-two" />
                  <div className="map-road road-three" />
                  <span className="map-pin pin-one">🚨</span>
                  <span className="map-pin pin-two">🚑</span>
                  <span className="map-pin pin-three">🚨</span>
                  <div className="map-caption">BENGALURU RESPONSE ZONE</div>
                </div>
              </div>

              <div className="panel activity-panel">
                <div className="panel-heading">
                  <div>
                    <h3>System Activity</h3>
                    <p>Latest demo events</p>
                  </div>
                </div>

                <div className="activity-item">
                  <span className="activity-dot green" />
                  <div>
                    <strong>Backend connected</strong>
                    <p>Dashboard data loaded successfully</p>
                  </div>
                </div>

                <div className="activity-item">
                  <span className="activity-dot red" />
                  <div>
                    <strong>Incident monitoring active</strong>
                    <p>{incidents.length} incidents loaded</p>
                  </div>
                </div>

                <div className="activity-item">
                  <span className="activity-dot blue" />
                  <div>
                    <strong>AI agent network loaded</strong>
                    <p>{agents.length} agents registered</p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        <footer>
          RESCUEOPS AI · MULTI-AGENT EMERGENCY RESPONSE COORDINATOR
          <span>Hackathon prototype · Backend connected</span>
        </footer>
      </main>
    </div>
  );
}

function StatCard({ label, value, icon, trend }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <span className="stat-icon">{icon}</span>
      </div>
      <h2>{value}</h2>
      <p>{trend}</p>
    </div>
  );
}

export default App;
