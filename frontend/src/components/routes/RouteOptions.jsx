import "./RouteOptions.css";

function RouteOptions({
  routes = [],
  recommendedRoute,
  selectedRouteIndex,
  onSelectRoute,
  sectionRef,
})  {
  if (routes.length === 0) {
    return (
    <section className="route-options" ref={sectionRef}>
          <div className="route-options-header">
          <div>
            <p className="eyebrow">ROUTE COMPARISON</p>
            <h2>Available routes</h2>
          </div>

          <span className="route-count">0 routes</span>
        </div>

        <div className="route-options-empty">
          <h3>No routes to display</h3>
          <p>
            Enter your journey details and analyze routes to see the available
            options here.
          </p>
        </div>
      </section>
    );
  }

  const formatDuration = (hours) => {
    const totalMinutes = Math.round(hours * 60);
    const wholeHours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${wholeHours}h ${minutes}m`;
  };

  const formatDistance = (meters) => {
    return `${(meters / 1609.344).toFixed(1)} mi`;
  };

  const formatEta = (eta) => {
    if (!eta) return "Unavailable";

    return new Date(eta).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
<section className="route-options" ref={sectionRef}>
        <div className="route-options-header">
        <div>
          <p className="eyebrow">ROUTE COMPARISON</p>
          <h2>Available routes</h2>
        </div>

        <span className="route-count">
          {routes.length} {routes.length === 1 ? "route" : "routes"}
        </span>
      </div>

      <div className="route-options-list">
        {routes.map((item, index) => {
          const route = item.route;
          const metrics = item.metrics ?? {};
          const isRecommended =recommendedRoute === item ||
  (
    recommendedRoute &&
    route.geometry?.coordinates &&
    JSON.stringify(route.geometry.coordinates) ===
      JSON.stringify(recommendedRoute.route?.geometry?.coordinates)
  );

          const distance = route.distance;
          const durationHours =
            metrics.duration_hours ??
            (typeof route.duration === "number"
              ? route.duration / 3600
              : null);

          return (
           <article
  className={`route-card ${selectedRouteIndex === index ? "selected" : ""}`}
  key={index}
  onClick={() => onSelectRoute(index)}
  role="button"
  tabIndex={0}
  onKeyDown={(event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelectRoute(index);
    }
  }}
>
              <div className="route-card-header">
                <div>
                  <h3>Route {index + 1}</h3>

                  {isRecommended && (
                    <span className="recommended-badge">
                      Recommended
                    </span>
                  )}
                </div>

                <span className="route-risk">
                  {metrics.severe_miles > 0
                    ? "Severe risk"
                    : metrics.high_miles > 0
                      ? "High risk"
                      : "Lower risk"}
                </span>
              </div>

              <div className="route-card-stats">
                <div>
                  <span className="stat-label">Distance</span>
                  <strong>
                    {typeof distance === "number"
                      ? formatDistance(distance)
                      : "Unavailable"}
                  </strong>
                </div>

                <div>
                  <span className="stat-label">Travel time</span>
                  <strong>
                    {typeof durationHours === "number"
                      ? formatDuration(durationHours)
                      : "Unavailable"}
                  </strong>
                </div>

                <div>
                  <span className="stat-label">Arrival</span>
                  <strong>{formatEta(item.destination_eta)}</strong>
                </div>
              </div>

              <div className="route-card-risk-details">
                <div>
                  <span className="stat-label">Severe miles</span>
                  <strong>{metrics.severe_miles ?? 0} mi</strong>
                </div>

                <div>
                  <span className="stat-label">High-risk miles</span>
                  <strong>{metrics.high_miles ?? 0} mi</strong>
                </div>

                <div>
                  <span className="stat-label">Average risk</span>
                  <strong>
                    {typeof metrics.average_risk === "number"
                      ? metrics.average_risk.toFixed(1)
                      : "Unavailable"}
                  </strong>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default RouteOptions;