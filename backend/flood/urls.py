from django.urls import path
from .views import (
    DashboardMetricsView,
    WeatherView,
    RainfallObservationView,
    FloodZonesGeoJSONView,
    FloodPredictView,
    FloodTimelineView,
    FloodSimulationView,
    RoadsGeoJSONView,
    DrainageGeoJSONView,
    DrainageSummaryView,
    DrainageNodesGeoJSONView,
    DrainageSegmentDetailView,
    AlertsFeedView,
    ElevationGridGeoJSONView,
    RoutingNodesView,
    FloodSafeRouteView,
    ExplanationView,
    HistoricalEventsView
)

urlpatterns = [
    path('dashboard/', DashboardMetricsView.as_view(), name='dashboard-metrics'),
    path('weather/', WeatherView.as_view(), name='weather-info'),
    path('rainfall/', RainfallObservationView.as_view(), name='rainfall-observations'),
    path('flood/zones/', FloodZonesGeoJSONView.as_view(), name='flood-zones'),
    path('flood/predict/', FloodPredictView.as_view(), name='flood-predict'),
    path('flood/timeline/', FloodTimelineView.as_view(), name='flood-timeline'),
    path('flood/simulation/', FloodSimulationView.as_view(), name='flood-simulation'),
    path('roads/', RoadsGeoJSONView.as_view(), name='roads-network'),
    path('drainage/', DrainageGeoJSONView.as_view(), name='drainage-network'),
    path('drainage/summary/', DrainageSummaryView.as_view(), name='drainage-summary'),
    path('drainage/nodes/', DrainageNodesGeoJSONView.as_view(), name='drainage-nodes'),
    path('drainage/<str:drain_id>/', DrainageSegmentDetailView.as_view(), name='drainage-segment-detail'),
    path('alerts/', AlertsFeedView.as_view(), name='alerts-feed'),
    path('elevation/', ElevationGridGeoJSONView.as_view(), name='elevation-grid'),
    path('routing/nodes/', RoutingNodesView.as_view(), name='routing-nodes'),
    path('routing/safe-route/', FloodSafeRouteView.as_view(), name='routing-safe-route'),
    path('explanation/', ExplanationView.as_view(), name='explanation-details'),
    path('historical/', HistoricalEventsView.as_view(), name='historical-events'),
]

