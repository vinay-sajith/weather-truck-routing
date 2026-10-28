import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "./RouteMap.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

function RouteMap({
  routes = [],
  recommendedRoute,
  selectedRouteIndex,
  onSelectRoute,
}) {  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  const routeColors = ["#2563eb", "#f59e0b", "#8b5cf6", "#0d9488"];

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-96.797, 32.7767],
      zoom: 7,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

  map.on("load", () => {
  map.resize();
  map.fire("routes-map-ready");
});

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

useEffect(() => {
  const map = mapRef.current;

  if (!map) return;
  console.log(
  "Selected route checkpoints:",
  routes[selectedRouteIndex]?.route?.checkpoints,
);
const selectedRoute = routes[selectedRouteIndex];
const checkpoints = selectedRoute?.route?.checkpoints ?? [];
markersRef.current.forEach((marker) => marker.remove());
markersRef.current = [];

checkpoints.forEach((checkpoint, index) => {
  const [longitude, latitude] = checkpoint.coordinates;

const marker = new mapboxgl.Marker({
  color:
    checkpoint.risk === "No Travel"
      ? "#7f1d1d"
      : checkpoint.risk === "Severe"
        ? "#dc2626"
        : checkpoint.risk === "High"
          ? "#ea580c"
          : checkpoint.risk === "Moderate"
            ? "#eab308"
            : "#16a34a",
})
  .setLngLat([longitude, latitude])
  .setPopup(
    new mapboxgl.Popup({ offset: 25 }).setHTML(`
      <div>
        <strong>Checkpoint ${index + 1}</strong>
        <p>Distance: ${Number(checkpoint.distance).toFixed(2)} miles</p>
        <p>Risk: ${checkpoint.risk}</p>
        <p>Wind: ${Number(checkpoint.weather.wind_speed).toFixed(2)} mph</p>
        <p>Precipitation: ${Number(checkpoint.weather.precipitation).toFixed(2)} in</p>
        <p>Rain: ${Number(checkpoint.weather.rain).toFixed(2)} in</p>
        <p>Snowfall: ${Number(checkpoint.weather.snowfall).toFixed(2)} cm</p>
        <p>Arrival: ${new Date(checkpoint.arrival_time).toLocaleString()}</p>
      </div>
    `),
  )
  .addTo(map);

markersRef.current.push(marker);

});

  const drawRoutes = () => {
  
  if (!map.isStyleLoaded()) {
    console.log("Map is not ready yet.");
    return;
  }

    routes.forEach((item, index) => {
      const coordinates = item.route?.geometry?.coordinates;

      if (!coordinates || coordinates.length < 2) return;

      const sourceId = `route-source-${index}`;
      const layerId = `route-layer-${index}`;

      const selected = index === selectedRouteIndex;

      const geojson = {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates,
        },
      };

      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, {
          type: "geojson",
          data: geojson,
        });

        map.addLayer({
          id: layerId,
          type: "line",
          source: sourceId,
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": routeColors[index % routeColors.length],
            "line-width": selected ? 7 : 4,
            "line-opacity": selected ? 1 : 0.65,
          },
        });
      } else {
        map.getSource(sourceId).setData(geojson);

        map.setPaintProperty(
          layerId,
          "line-width",
          selected ? 7 : 4,
        );

        map.setPaintProperty(
          layerId,
          "line-opacity",
          selected ? 1 : 0.65,
        );
      }
    });

  
    // Automatically zoom to show all available routes
if (routes.length > 0) {
  const bounds = new mapboxgl.LngLatBounds();

  routes.forEach((item) => {
    const coordinates = item.route?.geometry?.coordinates;

    if (coordinates && coordinates.length > 0) {
      coordinates.forEach((coordinate) => {
        bounds.extend(coordinate);
      });
    }
  });

  if (!bounds.isEmpty()) {
    map.fitBounds(bounds, {
      padding: 60,
      maxZoom: 12,
      duration: 1000,
    });
  }
}
  };

  if (map.isStyleLoaded()) {
    drawRoutes();
  } else {
    map.once("load", drawRoutes);
  }

  return () => {
    map.off("load", drawRoutes);
  };
}, [routes, recommendedRoute, selectedRouteIndex]);


  return (
    <section className="route-map">
      <div
        ref={mapContainerRef}
        className="mapbox-container"
        aria-label="Interactive route map"
      />
    </section>
  );
}

export default RouteMap;