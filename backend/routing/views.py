from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import*
from rest_framework import status
from .services import geocode_location, get_routes, get_weather
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
            try:
                origin_coordinates = geocode_location(origin)
                destination_coordinates = geocode_location(destination)
                routes = get_routes(origin_coordinates, destination_coordinates)
                return Response({"routes":routes},status=status.HTTP_200_OK)
        
            except ValueError as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            except requests.exceptions.RequestException:
                return Response({"error": "Unable to retrieve routes from Mapbox."},
        status=status.HTTP_502_BAD_GATEWAY
    )

        else:
            return Response(serializerRoute.errors,status=status.HTTP_400_BAD_REQUEST)


class WeatherAPIView(APIView):
    def get(self, request):
        latitude = float(request.query_params.get("latitude"))
        longitude = float(request.query_params.get("longitude"))
        weather=get_weather(latitude, longitude)
        return Response({"weather":weather},status=status.HTTP_200_OK)
    

