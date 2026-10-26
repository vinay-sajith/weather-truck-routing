from rest_framework import serializers

class RouteSerializer(serializers.Serializer):
    origin=serializers.CharField()
    destination=serializers.CharField()
    departure_time=serializers.DateTimeField()
    load_weight = serializers.FloatField(min_value=0)
    interval_miles = serializers.ChoiceField(
    choices=[10, 25, 50],
    default=25)





