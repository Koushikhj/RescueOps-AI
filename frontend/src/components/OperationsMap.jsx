
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import "leaflet/dist/leaflet.css";

// Custom map marker icons
const createIcon = (color) =>
  L.divIcon({
    className: "rescue-map-marker",
    html: `
      <div style="
        background:${color};
        width:18px;
        height:18px;
        border:3px solid white;
        border-radius:50%;
        box-shadow:0 0 12px ${color};
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

const criticalIcon = createIcon("#ff4d5e");
const highIcon = createIcon("#ff9f43");
const mediumIcon = createIcon("#f5d142");
const lowIcon = createIcon("#35c98b");
const resourceIcon = createIcon("#55a8ff");

// Bengaluru default coordinates
const BENGALURU = [12.9716, 77.5946];

// Fit map to available incident and resource coordinates
function MapBounds({ points }) {
  const map = useMap();

  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    }
  }, [points, map]);

  return null;
}

function getIncidentIcon(severity) {
  switch (String(severity || "").toLowerCase()) {
    case "critical":
      return criticalIcon;
    case "high":
      return highIcon;
    case "medium":
      return mediumIcon;
    default:
      return lowIcon;
  }
}


// Get coordinates from incident or resource records

// Get coordinates from incident or resource records

function getCoordinates(item) {
  const latitude = Number(
    item.latitude ?? item.lat ?? item.location?.latitude ?? item.location?.lat
  );

  const longitude = Number(
    item.longitude ?? item.lng ?? item.lon ??
    item.location?.longitude ?? item.location?.lng
  );

  if (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    (item.latitude != null || item.lat != null ||
      item.location?.latitude != null || item.location?.lat != null) &&
    (item.longitude != null || item.lng != null || item.lon != null ||
      item.location?.longitude != null || item.location?.lng != null) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  ) {
    return [latitude, longitude];
  }

  return null;
}



export default function OperationsMap({
  incidents = [],
  resources = [],
}) {
  const incidentPoints = incidents
    .map((incident) => ({
      item: incident,
      position: getCoordinates(incident),
    }))
    .filter((entry) => entry.position);

  const resourcePoints = resources
    .map((resource) => ({
      item: resource,
      position: getCoordinates(resource),
    }))
    .filter((entry) => entry.position);

  const allPoints = [
    ...incidentPoints.map((entry) => entry.position),
    ...resourcePoints.map((entry) => entry.position),
  ];

  return (
    <section className="rescue-card">
      <div className="rescue-row">
        <div>
          <h3>📍 Live Operations Map</h3>
          <p className="rescue-muted">
            Geographic view of incidents and resource records
          </p>
        </div>
        <span className="rescue-map-status">MAP VIEW</span>
      </div>

      <div className="rescue-map-legend">
        <span>🔴 Critical</span>
        <span>🟠 High</span>
        <span>🟡 Medium</span>
        <span>🟢 Low</span>
        <span>🔵 Resources</span>
      </div>

      <div className="rescue-map-container">
        <MapContainer
          center={BENGALURU}
          zoom={11}
          scrollWheelZoom
          style={{ height: "450px", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapBounds points={allPoints} />

          {incidentPoints.map(({ item, position }, index) => (
            <Marker
              key={item.id || item._id || `incident-${index}`}
              position={position}
              icon={getIncidentIcon(item.severity)}
            >
              <Popup>
                <strong>{item.title || item.incidentType || "Incident"}</strong>
                <p>Severity: {item.severity || "Unknown"}</p>
                <p>Location: {typeof item.location === "string" ? item.location : "Coordinates available"}</p>
                <p>Status: {item.status || "New"}</p>
              </Popup>
            </Marker>
          ))}

          {resourcePoints.map(({ item, position }, index) => (
            <Marker
              key={item.id || item._id || `resource-${index}`}
              position={position}
              icon={resourceIcon}
            >
              <Popup>
                <strong>{item.name || "Emergency Resource"}</strong>
                <p>Type: {item.type || "Not specified"}</p>
                <p>Area: {item.area || "Not specified"}</p>
                <p>Availability: Not verified</p>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <p className="rescue-muted">
        Showing {incidentPoints.length} incidents and {resourcePoints.length} resources with valid coordinates.
        Records without coordinates are not plotted. Resource availability is not verified.
      </p>
    </section>
  );
}
