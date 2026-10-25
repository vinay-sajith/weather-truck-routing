import os
import requests
from math import radians, sin, cos, sqrt, atan2

def geocode_location(location):    
    token=os.getenv("MAPBOX_ACCESS_TOKEN")
    if not token:
            raise ValueError("Mapbox access token is not configured.")
    url = f"https://api.mapbox.com/geocoding/v5/mapbox.places/{location}.json"
    params = {
         "access_token": token,
         "limit": 1,
         }
    response = requests.get(url, params=params, timeout=20)
    response.raise_for_status()

    data = response.json()
    if data["features"]:
         return data["features"][0]["center"]
    else:
         raise ValueError(f"Location not found: {location}")
         



    

def get_routes(origin, destination):
    """Fetch driving routes between two coordinates from Mapbox."""

    token = os.getenv("MAPBOX_ACCESS_TOKEN")

    if not token:
        raise ValueError("Mapbox access token is not configured.")

    coordinates = f"{origin[0]},{origin[1]};{destination[0]},{destination[1]}"

    url = f"https://api.mapbox.com/directions/v5/mapbox/driving/{coordinates}"

    params = {
        "access_token": token,
        "alternatives": "true",
        "overview": "full",
        "geometries": "geojson",
    }

    response = requests.get(url, params=params, timeout=20)
    response.raise_for_status()

    data = response.json()

    return data["routes"]

def get_weather(latitude, longitude):
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
    "latitude": latitude,
    "longitude": longitude,
    "hourly": "wind_speed_10m,precipitation,rain,snowfall",
    "wind_speed_unit": "mph",
    "precipitation_unit": "inch",
    "forecast_days": 2,
}
     
    response = requests.get(url, params=params, timeout=20)
    response.raise_for_status()
    data = response.json()
    return data


def calculate_distance(point_a, point_b):
    # Calculate and return the distance between two coordinates in miles
    lat1 = radians(point_a[1])
    lon1 = radians(point_a[0])
    lat2 = radians(point_b[1])
    lon2 = radians(point_b[0])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat / 2)**2 + cos(lat1) * cos(lat2) * sin(dlon / 2)**2   
    c=2*atan2(sqrt(a),sqrt(1-a))
    distance=3958.8*c
    return distance
def calculate_cumulative_distances(coordinates):
    total_distance = 0
    cumulative_distances = [0]


    for i in range(1, len(coordinates)):
        current_point = coordinates[i]
        previous_point = coordinates[i - 1]
        segment_distance = calculate_distance(previous_point, current_point)
        total_distance+=segment_distance
        cumulative_distances.append(total_distance)
    return cumulative_distances


def generate_checkpoints(route, interval_miles):
     pass