import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getDashboardMetrics = (horizon = 'NOW', rainfall = null) => {
  const params = { horizon };
  if (rainfall !== null) params.rainfall = rainfall;
  return api.get('/dashboard/', { params });
};

export const getWeatherInfo = () => api.get('/weather/');

export const getRainfallStations = () => api.get('/rainfall/');

export const getFloodZones = (horizon = 'NOW', rainfall = null) => {
  const params = { horizon };
  if (rainfall !== null) params.rainfall = rainfall;
  return api.get('/flood/zones/', { params });
};

export const getZoneTimeline = (zoneId, rainfall = null) => {
  const params = { zone_id: zoneId };
  if (rainfall !== null) params.rainfall = rainfall;
  return api.get('/flood/timeline/', { params });
};

export const runSimulation = (rainfallIntensity, drainageEfficiency) => {
  return api.post('/flood/simulation/', {
    rainfall_intensity_mm_hr: rainfallIntensity,
    drainage_efficiency_pct: drainageEfficiency,
  });
};

export const getRoads = () => api.get('/roads/');

export const getDrainage = (horizon = 'NOW', rainfall = null) => {
  const params = { horizon };
  if (rainfall !== null) params.rainfall = rainfall;
  return api.get('/drainage/', { params });
};

export const getDrainageSummary = (horizon = 'NOW', rainfall = null) => {
  const params = { horizon };
  if (rainfall !== null) params.rainfall = rainfall;
  return api.get('/drainage/summary/', { params });
};

export const getDrainageNodes = () => api.get('/drainage/nodes/');

export const getDrainageSegmentDetail = (drainId, horizon = 'NOW', rainfall = null) => {
  const params = { horizon };
  if (rainfall !== null) params.rainfall = rainfall;
  return api.get(`/drainage/${drainId}/`, { params });
};

export const getAlerts = (horizon = 'NOW', rainfall = null) => {
  const params = { horizon };
  if (rainfall !== null) params.rainfall = rainfall;
  return api.get('/alerts/', { params });
};

export const getElevationGrid = () => api.get('/elevation/');

export const getRoutingNodes = () => api.get('/routing/nodes/');

export const getFloodSafeRoute = (originNode, destNode, rainfall = 48.5, maxSafeDepth = 25.0) => {
  return api.post('/routing/safe-route/', {
    origin_node: originNode,
    destination_node: destNode,
    rainfall_mm_hr: rainfall,
    max_safe_depth_cm: maxSafeDepth,
  });
};

export const getZoneExplanation = (zoneId) => {
  return api.get('/explanation/', { params: { zone_id: zoneId } });
};

export const getHistoricalEvents = () => api.get('/historical/');

export const sendChatbotQuery = (query, context = {}) => {
  return api.post('/chatbot/query/', { query, context });
};

export default api;

