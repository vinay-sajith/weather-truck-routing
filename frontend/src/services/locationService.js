const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

export async function searchLocations(query) {
  if (!query || query.trim().length < 3) {
    return [];
  }

  const url = new URL(
    "https://api.mapbox.com/geocoding/v5/mapbox.places/" +
      encodeURIComponent(query.trim()) +
      ".json"
  );

  url.searchParams.set("access_token", MAPBOX_TOKEN);
  url.searchParams.set("autocomplete", "true");
  url.searchParams.set("limit", "5");
  url.searchParams.set("types", "place,address,locality");

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch location suggestions.");
  }

  const data = await response.json();

  return data.features.map((feature) => ({
    id: feature.id,
    name: feature.place_name,
    coordinates: feature.center,
  }));
}