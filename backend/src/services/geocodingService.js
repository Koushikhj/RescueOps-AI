
const geocodeCache = new Map();

let lastRequestTime = 0;

const USER_AGENT = "RescueOps-AI/1.0";

export async function geocodeLocation(location) {
  const query = `${location}, India`;
  const cacheKey = query.toLowerCase().trim();

  // Return cached coordinates if available
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey);
  }

  // Respect Nominatim's one-request-per-second limit
  const elapsed = Date.now() - lastRequestTime;
  const waitTime = Math.max(0, 1100 - elapsed);

  if (waitTime > 0) {
    await new Promise((resolve) =>
      setTimeout(resolve, waitTime)
    );
  }

  const url = new URL(
    "https://nominatim.openstreetmap.org/search"
  );

  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");

  try {
    lastRequestTime = Date.now();

    const response = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept": "application/json",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.status}`);
    }

    const results = await response.json();

    if (!results.length) {
      return null;
    }

    const coordinates = {
      latitude: Number(results[0].lat),
      longitude: Number(results[0].lon),
    };

    geocodeCache.set(cacheKey, coordinates);

    return coordinates;
  } catch (error) {
    console.error("Geocoding error:", error.message);
    return null;
  }
}
