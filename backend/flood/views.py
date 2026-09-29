from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from prediction.services import prediction_service
from prediction.explainability import get_zone_explanation
from gis.spatial_manager import spatial_manager
from routing.services import get_flood_safe_route
from routing.graph_builder import NODE_NAMES, NODE_COORDINATES
from simulation.services import run_flood_simulation
from data_providers.weather_provider import weather_provider

class DashboardMetricsView(APIView):
    def get(self, request):
        time_horizon = request.query_params.get("horizon", "NOW")
        rain_param = request.query_params.get("rainfall", None)
        
        weather_data = None
        if rain_param is not None:
            try:
                r_val = float(rain_param)
                weather_data = {
                    "rainfall_intensity": r_val,
                    "cumulative_3h_rain": r_val * 1.7,
                    "previous_24h_rain": 35.0,
                    "forecast_next_1h": r_val * 1.2
                }
            except ValueError:
                pass
                
        summary = prediction_service.compute_city_summary(weather_data, time_horizon)
        return Response(summary, status=status.HTTP_200_OK)

class WeatherView(APIView):
    def get(self, request):
        weather = weather_provider.get_current_weather()
        forecast = weather_provider.get_forecast_timeseries()
        stations = weather_provider.get_rainfall_grid_stations()
        return Response({
            "current": weather,
            "forecast_series": forecast,
            "stations": stations
        }, status=status.HTTP_200_OK)

class RainfallObservationView(APIView):
    def get(self, request):
        stations = weather_provider.get_rainfall_grid_stations()
        return Response({
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "properties": s,
                    "geometry": {
                        "type": "Point",
                        "coordinates": [s["lng"], s["lat"]]
                    }
                }
                for s in stations
            ]
        }, status=status.HTTP_200_OK)

class FloodZonesGeoJSONView(APIView):
    def get(self, request):
        time_horizon = request.query_params.get("horizon", "NOW")
        rain_param = request.query_params.get("rainfall", None)
        
        weather_data = None
        if rain_param is not None:
            try:
                r_val = float(rain_param)
                weather_data = {
                    "rainfall_intensity": r_val,
                    "cumulative_3h_rain": r_val * 1.7,
                    "previous_24h_rain": 35.0,
                    "forecast_next_1h": r_val * 1.2
                }
            except ValueError:
                pass
                
        fc = prediction_service.predict_all_zones(weather_data, time_horizon)
        return Response(fc, status=status.HTTP_200_OK)

class FloodPredictView(APIView):
    def post(self, request):
        zone_id = request.data.get("zone_id")
        weather_input = request.data.get("weather", {})
        
        zone = spatial_manager.get_zone_by_id(zone_id)
        if not zone:
            return Response({"error": f"Zone '{zone_id}' not found."}, status=status.HTTP_404_NOT_FOUND)
            
        prediction = prediction_service.engine.predict_single_zone(zone["properties"], weather_input)
        return Response({
            "zone_id": zone_id,
            "zone_name": zone["properties"].get("name"),
            "prediction": prediction
        }, status=status.HTTP_200_OK)

class FloodTimelineView(APIView):
    def get(self, request):
        zone_id = request.query_params.get("zone_id", "ZONE_MINTO")
        rain_param = request.query_params.get("rainfall", None)
        
        weather_data = None
        if rain_param:
            try:
                weather_data = {"rainfall_intensity": float(rain_param)}
            except ValueError:
                pass
                
        timeline = prediction_service.get_zone_timeline(zone_id, weather_data)
        zone = spatial_manager.get_zone_by_id(zone_id)
        zone_name = zone["properties"].get("name") if zone else zone_id
        
        return Response({
            "zone_id": zone_id,
            "zone_name": zone_name,
            "timeline": timeline
        }, status=status.HTTP_200_OK)

class FloodSimulationView(APIView):
    def post(self, request):
        rainfall_intensity = float(request.data.get("rainfall_intensity_mm_hr", 50.0))
        drainage_efficiency = float(request.data.get("drainage_efficiency_pct", 100.0))
        
        sim_result = run_flood_simulation(rainfall_intensity, drainage_efficiency)
        return Response(sim_result, status=status.HTTP_200_OK)

class RoadsGeoJSONView(APIView):
    def get(self, request):
        roads = spatial_manager.get_roads()
        return Response(roads, status=status.HTTP_200_OK)

class DrainageGeoJSONView(APIView):
    def get(self, request):
        time_horizon = request.query_params.get("horizon", "NOW")
        rain_param = request.query_params.get("rainfall", 48.5)
        try:
            rainfall = float(rain_param)
        except (ValueError, TypeError):
            rainfall = 48.5
        drainage = spatial_manager.get_drainage_network(rainfall=rainfall, time_horizon=time_horizon)
        return Response(drainage, status=status.HTTP_200_OK)

class DrainageSummaryView(APIView):
    def get(self, request):
        time_horizon = request.query_params.get("horizon", "NOW")
        rain_param = request.query_params.get("rainfall", 48.5)
        try:
            rainfall = float(rain_param)
        except (ValueError, TypeError):
            rainfall = 48.5
        drainage = spatial_manager.get_drainage_network(rainfall=rainfall, time_horizon=time_horizon)
        return Response(drainage.get("summary", {}), status=status.HTTP_200_OK)

class DrainageNodesGeoJSONView(APIView):
    def get(self, request):
        nodes = spatial_manager.get_drainage_nodes()
        return Response(nodes, status=status.HTTP_200_OK)

class DrainageSegmentDetailView(APIView):
    def get(self, request, drain_id):
        time_horizon = request.query_params.get("horizon", "NOW")
        rain_param = request.query_params.get("rainfall", 48.5)
        try:
            rainfall = float(rain_param)
        except (ValueError, TypeError):
            rainfall = 48.5
        segment = spatial_manager.get_drainage_segment_by_id(drain_id, rainfall=rainfall, time_horizon=time_horizon)
        if not segment:
            return Response({"error": f"Drainage segment '{drain_id}' not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(segment, status=status.HTTP_200_OK)

class AlertsFeedView(APIView):
    def get(self, request):
        time_horizon = request.query_params.get("horizon", "NOW")
        rain_param = request.query_params.get("rainfall", None)
        
        weather_data = None
        if rain_param is not None:
            try:
                r_val = float(rain_param)
                weather_data = {"rainfall_intensity": r_val}
            except ValueError:
                pass
                
        alerts = prediction_service.get_simulated_alerts(weather_data, time_horizon)
        return Response({
            "time_horizon": time_horizon,
            "total_alerts": len(alerts),
            "critical_alerts_count": len([a for a in alerts if a["severity"] == "CRITICAL"]),
            "alerts": alerts,
            "disclaimer": "Simulated demonstration alerts for SIH disaster response prototyping."
        }, status=status.HTTP_200_OK)

class ElevationGridGeoJSONView(APIView):
    def get(self, request):
        elevation = spatial_manager.get_elevation_grid()
        return Response(elevation, status=status.HTTP_200_OK)

class RoutingNodesView(APIView):
    def get(self, request):
        nodes = [
            {"id": k, "name": v, "coordinates": NODE_COORDINATES.get(k)}
            for k, v in NODE_NAMES.items()
        ]
        return Response(nodes, status=status.HTTP_200_OK)

class FloodSafeRouteView(APIView):
    def post(self, request):
        origin = request.data.get("origin_node", "NODE_CP")
        destination = request.data.get("destination_node", "NODE_AIIMS")
        rainfall = float(request.data.get("rainfall_mm_hr", 48.5))
        threshold = float(request.data.get("max_safe_depth_cm", 25.0))
        
        result = get_flood_safe_route(origin, destination, rainfall, threshold)
        if "error" in result:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        return Response(result, status=status.HTTP_200_OK)

class ExplanationView(APIView):
    def get(self, request):
        zone_id = request.query_params.get("zone_id", "ZONE_MINTO")
        explanation = get_zone_explanation(zone_id)
        return Response(explanation, status=status.HTTP_200_OK)

class HistoricalEventsView(APIView):
    def get(self, request):
        events = spatial_manager.get_historical_events()
        return Response(events, status=status.HTTP_200_OK)

