
const agents = [
  {
    id: "AGENT-01",
    name: "Incident Analyzer",
    role: "Analyzes emergency reports",
    status: "Active"
  },
  {
    id: "AGENT-02",
    name: "Risk Assessment",
    role: "Evaluates emergency severity",
    status: "Active"
  },
  {
    id: "AGENT-03",
    name: "Resource Coordinator",
    role: "Coordinates emergency resources",
    status: "Active"
  },
  {
    id: "AGENT-04",
    name: "Response Planner",
    role: "Creates response strategies",
    status: "Active"
  }
];

export const getAgents = (req, res) => {
  res.status(200).json({
    success: true,
    count: agents.length,
    data: agents
  });
};
