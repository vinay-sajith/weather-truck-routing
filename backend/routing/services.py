import os
import requests
from math import radians, sin, cos, sqrt, atan2
from datetime import timedelta,timezone
from timezonefinder import TimezoneFinder
from zoneinfo import ZoneInfo
import time

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
        "steps": "true",
    }

    response = requests.get(url, params=params, timeout=20)
    response.raise_for_status()

    data = response.json()

    return data["routes"]



def get_weather_batch(coordinates):
    url = "https://api.open-meteo.com/v1/forecast"

    latitudes = ",".join(str(lat) for lat, lon in coordinates)
    longitudes = ",".join(str(lon) for lat, lon in coordinates)

    params = {
        "latitude": latitudes,
        "longitude": longitudes,
        "hourly": "wind_speed_10m,precipitation,rain,snowfall",
        "wind_speed_unit": "mph",
        "precipitation_unit": "inch",
        "forecast_days": 2,
        "timezone": "GMT",
    }
    print("Weather API URL length:", len(requests.Request("GET", url, params=params).prepare().url))
    print("Weather API locations:", len(coordinates))
    for attempt in range(3):
        response = requests.get(url, params=params, timeout=(30, 60))
        if response.status_code == 429:
            time.sleep(2 ** attempt)
            continue
        response.raise_for_status()
        return response.json()
    raise Exception("Open-Meteo rate limit exceeded after 3 attempts.")


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
def calculate_cumulative_step_distances(steps):
    total_distance = 0
    cumulative_distances = [0]

    for step in steps:
        distance = step["distance"] / 1609.344
        total_distance += distance
        cumulative_distances.append(total_distance)
        

    return cumulative_distances


def generate_route_checkpoints(steps, interval):
    total_distance=0
    checkpoints=[]
    target_mile=interval
    for step in steps:
        coordinates = step["geometry"]["coordinates"]
        road_distance = step["distance"] / 1609.344
        cumulative_geometry_distances=calculate_cumulative_distances(coordinates)
        geometry_distance = cumulative_geometry_distances[-1]
        if geometry_distance == 0 or road_distance == 0:
            continue
        scale_factor = road_distance / geometry_distance
        for i in range(1, len(coordinates)):
            segment_distance = calculate_distance(coordinates[i - 1],coordinates[i])
            adjusted_distance = segment_distance * scale_factor
            total_distance+=adjusted_distance
            if total_distance >= target_mile:
                previous_distance = total_distance - adjusted_distance
                fraction = (target_mile - previous_distance) / adjusted_distance
                longitude = coordinates[i - 1][0] + fraction * (coordinates[i][0] - coordinates[i - 1][0])
                latitude= coordinates[i - 1][1] + fraction * (coordinates[i][1] - coordinates[i - 1][1])
                checkpoints.append({"distance": target_mile,"coordinates": [longitude, latitude]})
                target_mile += interval
                



    return checkpoints



def add_arrival_times(checkpoints, departure_time, average_speed):
    for checkpoint in checkpoints:
        travel_time = checkpoint["distance"] / average_speed
        travel_duration = timedelta(hours=travel_time)
        arrival = departure_time + travel_duration
        checkpoint["arrival_time"] = arrival
    return checkpoints

def get_timezone(longitude,latitude):
    tf = TimezoneFinder()
    return tf.timezone_at(lng=longitude, lat=latitude)

    