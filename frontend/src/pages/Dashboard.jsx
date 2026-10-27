import Navbar from "../components/layout/nav";
import RouteForm from "../components/route-form/RouteForm";
import RouteMap from "../components/map/RouteMap";
import RouteOptions from "../components/routes/RouteOptions";
import "./Dashboard.css";
import { useState, useRef } from "react";import { getRoutes } from "../services/routeService";

function Dashboard() {
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [recommendedRoute, setRecommendedRoute] = useState(null);
    const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
    const [showWeatherMessage, setShowWeatherMessage] = useState(false);
    const mapSectionRef = useRef(null);
    const routeOptionsRef = useRef(null);
    const scrollToSection = (ref) => {
  ref.current?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
};

    const handleRouteSubmit = async (formData) => {
  setLoading(true);
  setError("");

  try {
    const data = await getRoutes(formData);
    console.log("Backend response:", data);
    setRoutes(data.routes ?? []);
    console.log("Routes being stored:", data.routes.length);
    setRecommendedRoute(data.recommended_route ?? null);
    
  } catch (err) {
    setError(err.message || "Failed to fetch routes.");
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="dashboard-page">
      <Navbar
  onPlanRouteClick={() => scrollToSection(mapSectionRef)}
  onRouteOptionsClick={() => scrollToSection(routeOptionsRef)}
    onWeatherClick={() => {
  scrollToSection(mapSectionRef);
  setShowWeatherMessage(true);

  setTimeout(() => {
    setShowWeatherMessage(false);
  }, 2000);
}}
/>
{showWeatherMessage && (
  <div className="weather-hint">
    Click any checkpoint on the map to view the weather.
  </div>
)}

      <main className="dashboard-content">
        <aside className="dashboard-sidebar" id="plan">
    <RouteForm onSubmit={handleRouteSubmit} loading={loading} />
  </aside>
<div className="dashboard-main" ref={mapSectionRef}>  {loading && (
  <div className="request-status" role="status">
    <span className="loading-spinner" aria-hidden="true"></span>
    <div>
      <strong>Analyzing routes...</strong>
      <p>Evaluating weather conditions and truck safety risks.</p>
    </div>
  </div>
)}

  {error && (
    <p className="request-error" role="alert">
      {error}
    </p>
  )}

  <RouteMap
  routes={routes}
  recommendedRoute={recommendedRoute}
  selectedRouteIndex={selectedRouteIndex}
  onSelectRoute={setSelectedRouteIndex}
/>

  <RouteOptions
  routes={routes}
  recommendedRoute={recommendedRoute}
  selectedRouteIndex={selectedRouteIndex}
  onSelectRoute={(index) => {
  setSelectedRouteIndex(index);
  scrollToSection(mapSectionRef);
}}
  sectionRef={routeOptionsRef}
/>
</div>
</main>
    </div>
  );
}

export default Dashboard;
