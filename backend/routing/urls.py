from django.urls import path
from . import views

urlpatterns = [
    path("routes/", views.RouteAPIView.as_view(), name="routes"),
    path("weather/", views.WeatherAPIView.as_view(), name="weather")
]