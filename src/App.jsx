
import {
  Activity,
  AlertTriangle,
  Ambulance,
  ArrowUpRight,
  Bell,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Flame,
  LayoutDashboard,
  MapPin,
  Menu,
  Package,
  Radio,
  RefreshCw,
  ShieldCheck,
  Siren,
  Users,
  Waves,
  XCircle,
} from "lucide-react";

import "./App.css";

const incidents = [
  {
    id: "INC-2041",
    type: "Flood",
    location: "Riverside District",
    priority: "Critical",
    status: "Responding",
    time: "2 min ago",
    icon: Waves,
  },
  {
    id: "INC-2040",
    type: "Fire",
    location: "Industrial Area",
    priority: "High",
    status: "Assigned",
    time: "8 min ago",
    icon: Flame,
  },
  {
    id: "INC-2039",
    type: "Road Accident",
    location: "Central Highway",
    priority: "Medium",
    status: "Verifying",
    time: "14 min ago",
    icon: Ambulance,
  },
  {
    id: "INC-2038",
    type: "Flood",
    location: "North Valley",
    priority: "High",
    status: "Responding",
    time: "21 min ago",
    icon: Waves,
  },
];

const agents = [
  {
    name: "Incident Agent",
    description: "Extracting incident details",
    status: "Active",
    icon: AlertTriangle,
  },
  {
    name: "Verification Agent",
    description: "Checking duplicate reports",
    status: "Active",
    icon: ShieldCheck,
  },
  {
    name: "Resource Agent",
    description: "Monitoring available resources",
    status: "Active",
    icon: Package,
  },
  {
    name: "Planning Agent",
    description: "Generating allocation plans",
    status: "Processing",
    icon: BrainCircuit,
  },
  {
    name: "Coordinator Agent",
    description: "Preparing response summary",
    status: "Active",
    icon: Activity,
  },
];

const resources = [
  { name: "Ambulances", available: 8, total: 12, icon: Ambulance },
  { name: "Rescue Teams", available: 12, total: 16, icon: Users },
  { name: "Medical Units", available: 6, total: 10, icon: ShieldCheck },
  { name: "Supply Units", available: 9, total: 12, icon: Package },
];

function StatCard({ title, value, note, icon: Icon, color }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{title}</span>
        <div className={`stat-icon ${color}`}>
          <Icon size={21} />
        </div>
      </div>
      <h2>{value}</h2>
      <p>{note}</p>
    </div>
  );
}

function App() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Siren size={25} />
          </div>
          <div>
            <h2>RescueOps <span>AI</span></h2>
            <p>EMERGENCY INTELLIGENCE</p>
          </div>
        </div>

        <div className="nav-label">WORKSPACE</div>

        <nav className="navigation">
          <a className="nav-item active" href="#overview">
            <LayoutDashboard size={19} />
            Overview
          </a>
          <a className="nav-item" href="#incidents">
            <AlertTriangle size={19} />
            Incidents
          </a>
          <a className="nav-item" href="#resources">
            <Package size={19} />
            Resources
          </a>
          <a className="nav-item" href="#agents">
            <BrainCircuit size={19} />
            AI Coordination
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="system-card">
            <div className="system-status">
              <span className="pulse-dot"></span>
              Prototype Online
            </div>
            <p>Simulation environment</p>
          </div>
          <div className="team-info">
            <div className="team-avatar">24</div>
            <div>
              <strong>24GB Knights</strong>
              <small>Project Team</small>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <div className="breadcrumb">Workspace / Overview</div>
            <h1>Emergency Command Center</h1>
            <p>Monitor incidents and coordinate response operations.</p>
          </div>

          <div className="top-actions">
            <div className="live-indicator">
              <span className="pulse-dot"></span>
              SIMULATION LIVE
            </div>
            <button className="notification-btn" aria-label="Notifications">
              <Bell size={19} />
              <span></span>
            </button>
            <div className="profile">G</div>
          </div>
        </header>

        <section className="content-area" id="overview">
          <div className="welcome-row">
            <div>
              <h2>Situation Overview</h2>
              <p>Here's what's happening across your response network.</p>
            </div>
            <button className="refresh-btn" onClick={() => window.location.reload()}>
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          <div className="stats-grid">
            <StatCard
              title="Total Incidents"
              value="24"
              note="Reports received"
              icon={Radio}
              color="purple"
            />
            <StatCard
              title="Critical Incidents"
              value="06"
              note="Require immediate attention"
              icon={AlertTriangle}
              color="red"
            />
            <StatCard
              title="Available Teams"
              value="12"
              note="Ready for deployment"
              icon={Users}
              color="green"
            />
            <StatCard
              title="Active Responses"
              value="08"
              note="Operations in progress"
              icon={Activity}
              color="orange"
            />
          </div>

          <div className="dashboard-grid">
            <section className="panel incidents-panel" id="incidents">
              <div className="panel-heading">
                <div>
                  <h3>Recent Incidents</h3>
                  <p>Latest emergency reports</p>
                </div>
                <button className="text-button">View all <ArrowUpRight size={15} /></button>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>INCIDENT</th>
                      <th>LOCATION</th>
                      <th>PRIORITY</th>
                      <th>STATUS</th>
                      <th>REPORTED</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incidents.map((incident) => {
                      const IncidentIcon = incident.icon;
                      return (
                        <tr key={incident.id}>
                          <td>
                            <div className="incident-name">
                              <div className="incident-icon">
                                <IncidentIcon size={17} />
                              </div>
                              <div>
                                <strong>{incident.type}</strong>
                                <small>{incident.id}</small>
                              </div>
                            </div>
                          </td>
                          <td>{incident.location}</td>
                          <td>
                            <span className={`priority ${incident.priority.toLowerCase()}`}>
                              {incident.priority}
                            </span>
                          </td>
                          <td>
                            <span className="status-text">{incident.status}</span>
                          </td>
                          <td className="time-text">{incident.time}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="panel resources-panel" id="resources">
              <div className="panel-heading">
                <div>
                  <h3>Resource Availability</h3>
                  <p>Simulated resource inventory</p>
                </div>
                <Package size={19} className="muted-icon" />
              </div>

              <div className="resource-list">
                {resources.map((resource) => {
                  const ResourceIcon = resource.icon;
                  const percentage = (resource.available / resource.total) * 100;

                  return (
                    <div className="resource-item" key={resource.name}>
                      <div className="resource-info">
                        <div className="resource-title">
                          <ResourceIcon size={17} />
                          <strong>{resource.name}</strong>
                        </div>
                        <span>{resource.available}/{resource.total}</span>
                      </div>
                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="resource-note">
                <CheckCircle2 size={16} />
                Resource figures are simulated
              </div>
            </section>
          </div>

          <section className="panel agents-panel" id="agents">
            <div className="panel-heading">
              <div>
                <h3>Multi-Agent Coordination</h3>
                <p>Five specialized AI agents working together</p>
              </div>
              <span className="agent-count">05 AGENTS</span>
            </div>

            <div className="agents-grid">
              {agents.map((agent, index) => {
                const AgentIcon = agent.icon;
                return (
                  <div className="agent-card" key={agent.name}>
                    <div className="agent-card-top">
                      <div className="agent-icon">
                        <AgentIcon size={20} />
                      </div>
                      <span className={`agent-status ${agent.status.toLowerCase()}`}>
                        <span className="small-dot"></span>
                        {agent.status}
                      </span>
                    </div>
                    <h4>{agent.name}</h4>
                    <p>{agent.description}</p>
                    <small>AGENT 0{index + 1}</small>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="coordination-banner">
            <div className="coordination-icon">
              <Clock3 size={23} />
            </div>
            <div>
              <h3>Dynamic Replanning</h3>
              <p>
                The system can reassess its recommended response plan when new
                incidents arrive or resource availability changes.
              </p>
            </div>
            <span className="human-review">Human approval required</span>
          </section>

          <footer>
            <span>RESCUEOPS AI · 24GB KNIGHTS</span>
            <span>Prototype demonstration · All data is simulated</span>
          </footer>
        </section>
      </main>
    </div>
  );
}

export default App;
