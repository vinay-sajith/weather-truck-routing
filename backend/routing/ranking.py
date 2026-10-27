def calculate_route_metrics(route):
    checkpoints = route["checkpoints"]
    distance_miles = route["distance"] / 1609.344
    severe_miles = 0
    high_miles = 0
    previous_distance = 0
    for checkpoint in checkpoints:
        segment_miles = checkpoint["distance"] - previous_distance
        if checkpoint["risk"] == "Severe":
            severe_miles += segment_miles
        elif checkpoint["risk"] == "High":
            high_miles += segment_miles

        previous_distance = checkpoint["distance"]
    remaining_miles = distance_miles - previous_distance
    if checkpoints and checkpoints[-1]["risk"] == "Severe":
        severe_miles += remaining_miles
    elif checkpoints and checkpoints[-1]["risk"] == "High":
        high_miles += remaining_miles
    risk_scores = {
    "Low": 1,
    "Moderate": 2,
    "High": 3,
    "Severe": 4,
    "No Travel": 5
}
    scores = [
    risk_scores[checkpoint["risk"]]
    for checkpoint in checkpoints
]
    average_risk = sum(scores) / len(scores) if scores else 0
    return {
    "severe_miles": severe_miles,
    "high_miles": high_miles,
    "average_risk": average_risk,
    "duration_hours": route["duration"]/3600}


def rank_routes(routes):
    ranked_routes = []
    for route in routes:
        metrics = calculate_route_metrics(route)
        ranked_routes.append({"route": route,"metrics": metrics})
    ranked_routes = sorted(
    ranked_routes,
    key=lambda item: (
        item["metrics"]["severe_miles"],
        item["metrics"]["high_miles"],
        item["metrics"]["average_risk"],
        item["metrics"]["duration_hours"],
    )
)
    return ranked_routes


