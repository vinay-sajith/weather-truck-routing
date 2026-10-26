from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import*
from rest_framework import status
from .services import *
from zoneinfo import ZoneInfo
from datetime import datetime, timezone
import requests
class RouteAPIView(APIView):

    def post(self, request):
        serializerRoute=RouteSerializer(data=request.data)
        if serializerRoute.is_valid():
            data = serializerRoute.validated_data
            origin=data["origin"]
            destination=data["destination"]
            departure_time=data["departure_time"]
            load_weight=data["load_weight"]
            interval_miles = data["interval_miles"]
            try:
                origin_coordinates = geocode_location(origin)
                longitude = origin_coordinates[0]
                latitude = origin_coordinates[1]
                timezone_name = get_timezone(longitude, latitude)
                origin_timezone = ZoneInfo(timezone_name)
                if departure_time.tzinfo is None:
                    departure_time = departure_time.replace(tzinfo=origin_timezone)
                else:
                    departure_time = departure_time.astimezone(origin_timezone)
                destination_coordinates = geocode_location(destination)
                routes = get_routes(origin_coordinates, destination_coordinates)
                for route in routes:
                    legs = route["legs"]
                    for leg in legs:
                        steps = leg["steps"]
                        checkpoints = generate_route_checkpoints(steps, interval_miles)
                        meters=route["distance"]
                        seconds=route["duration"]
                        distance_miles=meters/1609.344
                        duration_hours=seconds/3600
                        avg_speed=distance_miles/duration_hours
                        checkpoints = add_arrival_times(checkpoints, departure_time, avg_speed)
                        for checkpoint in checkpoints:
                            coordinates = checkpoint["coordinates"]
                            latitude=coordinates[1]
                            longitude=coordinates[0]
                            weather=get_weather(latitude, longitude)
                            checkpoint["weather"] = weather
                            arrival_utc = checkpoint["arrival_time"].astimezone(timezone.utc)
                            hourly = weather["hourly"]
                            forecast_times = hourly["time"]
                            forecast_datetimes = [datetime.strptime(t, "%Y-%m-%dT%H:%M").replace(tzinfo=timezone.utc)for t in forecast_times]
                            closest_index = min(range(len(forecast_datetimes)),key=lambda i: abs(forecast_datetimes[i] - arrival_utc))
                            wind_speed = hourly["wind_speed_10m"][closest_index]
                            precipitation = hourly["precipitation"][closest_index]
                            rain = hourly["rain"][closest_index]
                            snowfall = hourly["snowfall"][closest_index]
                            checkpoint_weather = {
    "wind_speed": wind_speed,
    "precipitation": precipitation,
    "rain": rain,
    "snowfall": snowfall
}
                            checkpoint["weather"] = checkpoint_weather
                        route["checkpoints"] = checkpoints

                print(routes[0]["checkpoints"][:2])
                return Response(
    {"routes": routes},
    status=status.HTTP_200_OK
)

            except Exception as e:
                print("Mapbox error:", repr(e))
                raise

        else:
            return Response(serializerRoute.errors,status=status.HTTP_400_BAD_REQUEST)


class WeatherAPIView(APIView):
    def get(self, request):
        latitude = float(request.query_params.get("latitude"))
        longitude = float(request.query_params.get("longitude"))
        weather=get_weather(latitude, longitude)
        return Response({"weather":weather},status=status.HTTP_200_OK)
    

