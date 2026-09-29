import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Calculator, Info, Database, GitFork, ShieldAlert } from 'lucide-react';
import LayerControls from './LayerControls';
import TimeSlider from './TimeSlider';
import DepthLegend from './DepthLegend';
import ZoneModal from './ZoneModal';
import DrainageModal from '../Drainage/DrainageModal';
import DataSourcesModal from '../Common/DataSourcesModal';
import { getFloodZones, getDrainage, getDrainageNodes, getRoads, getRainfallStations, getElevationGrid } from '../../services/api';

// Map re-centering helper
function SetViewOnRoute({ routeCoords }) {
  const map = useMap();
  useEffect(() => {
    if (routeCoords && routeCoords.length > 0) {
      const bounds = L.latLngBounds(routeCoords.map((c) => [c[1], c[0]]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [routeCoords, map]);
  return null;
}

export default function FloodMap({
  timeHorizon,
  onTimeHorizonChange,
  activeRouteData,
  onAskAssistant,
  onAskGemini,
  simulatedRainfall = null,
  isAssistantOpen = false,
}) {
  const askHandler = onAskAssistant || onAskGemini;
  const [layers, setLayers] = useState({
    baseMap: true,
    rainfallRadar: true,
    floodZones: true,
    waterDepth: true,
    drainage: true,
    drainageNodes: true,
    roads: true,
    elevationGrid: false,
    historicalFloods: false,
  });

  const [floodZonesData, setFloodZonesData] = useState(null);
  const [drainageData, setDrainageData] = useState(null);
  const [drainageNodesData, setDrainageNodesData] = useState(null);
  const [roadsData, setRoadsData] = useState(null);
  const [stationsData, setStationsData] = useState(null);
  const [elevationGridData, setElevationGridData] = useState(null);
  
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedDrainage, setSelectedDrainage] = useState(null);
  const [isDataSourcesOpen, setIsDataSourcesOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const isDrawerOpen = Boolean(selectedZone || selectedDrainage || isAssistantOpen);

  // Fetch GIS layers
  useEffect(() => {
    setLoading(true);
    Promise.all([
      getFloodZones(timeHorizon, simulatedRainfall),
      getDrainage(timeHorizon, simulatedRainfall),
      getDrainageNodes(),
      getRoads(),
      getRainfallStations(),
      getElevationGrid(),
    ])
      .then(([zonesRes, drainRes, drainNodesRes, roadsRes, stationsRes, elevRes]) => {
        setFloodZonesData(zonesRes.data);
        setDrainageData(drainRes.data);
        setDrainageNodesData(drainNodesRes.data);
        setRoadsData(roadsRes.data);
        setStationsData(stationsRes.data);
        setElevationGridData(elevRes.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching GIS data:', err);
        setLoading(false);
      });
  }, [timeHorizon, simulatedRainfall]);

  // Color functions
  const getZoneStyle = (feature) => {
    const depth = feature.properties?.predicted_water_depth_cm || 0;
    const rClass = feature.properties?.risk_class || 'LOW';

    let fillColor = '#10b981';
    let fillOpacity = 0.35;
    let weight = 1.5;
    let color = '#34d399';

    if (depth >= 50 || rClass === 'CRITICAL') {
      fillColor = '#dc2626';
      color = '#f87171';
      fillOpacity = 0.65;
      weight = 2.5;
    } else if (depth >= 30 || rClass === 'HIGH') {
      fillColor = '#ea580c';
      color = '#fb923c';
      fillOpacity = 0.55;
      weight = 2;
    } else if (depth >= 15 || rClass === 'MODERATE') {
      fillColor = '#d97706';
      color = '#fbbf24';
      fillOpacity = 0.45;
    } else if (depth >= 5) {
      fillColor = '#eab308';
      color = '#fde047';
      fillOpacity = 0.35;
    }

    return {
      fillColor,
      weight,
      opacity: 1,
      color,
      dashArray: rClass === 'CRITICAL' ? '4' : null,
      fillOpacity,
    };
  };

  const getDrainageStyle = (feature) => {
    const util = feature.properties?.utilization_pct || 75;
    const isBottleneck = feature.properties?.is_bottleneck || util >= 85;
    return {
      color: isBottleneck ? '#f43f5e' : util > 65 ? '#38bdf8' : '#0284c7',
      weight: isBottleneck ? 4.5 : 3,
      opacity: 0.9,
      dashArray: isBottleneck ? '4, 4' : '6, 6',
    };
  };

  const getRoadsStyle = (feature) => {
    const isUnderpass = feature.properties?.is_underpass;
    return {
      color: isUnderpass ? '#f43f5e' : '#475569',
      weight: isUnderpass ? 3.5 : 2,
      opacity: 0.75,
    };
  };

  const onEachZone = (feature, layer) => {
    layer.on({
      click: () => {
        setSelectedDrainage(null);
        setSelectedZone(feature);
      },
      mouseover: (e) => {
        e.target.setStyle({ weight: 3.5, color: '#38bdf8', fillOpacity: 0.8 });
      },
      mouseout: (e) => {
        e.target.setStyle(getZoneStyle(feature));
      },
    });
  };

  const onEachDrainage = (feature, layer) => {
    layer.on({
      click: () => {
        setSelectedZone(null);
        setSelectedDrainage(feature);
      },
      mouseover: (e) => {
        e.target.setStyle({ weight: 5.5, color: '#38bdf8' });
      },
      mouseout: (e) => {
        e.target.setStyle(getDrainageStyle(feature));
      },
    });
  };

  const drainageSummary = drainageData?.summary || {};
  const currentRain = simulatedRainfall || 48.5;

  return (
    <div className="relative w-full h-[calc(100vh-65px)] overflow-hidden bg-[#0b0f19]">
      <MapContainer
        center={[28.6139, 77.2090]}
        zoom={12}
        className="w-full h-full"
        zoomControl={false}
      >
        {/* Base Map Tile - Esri World Dark Gray Canvas */}
        {layers.baseMap && (
          <TileLayer
            attribution='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ | Varun Flood Intelligence'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
            maxZoom={16}
          />
        )}

        {/* DEM Topographic Elevation Grid */}
        {layers.elevationGrid && elevationGridData && (
          <GeoJSON
            data={elevationGridData}
            style={(feat) => {
              const elev = feat.properties.elevation_m || 210;
              const simDepth = feat.properties.simulated_water_depth_cm || 0;
              return {
                fillColor: simDepth > 15 ? '#ef4444' : elev > 220 ? '#1e293b' : '#334155',
                weight: 1,
                color: '#475569',
                fillOpacity: 0.4,
              };
            }}
          />
        )}

        {/* Drainage Network (Interactive Channels) */}
        {layers.drainage && drainageData && (
          <GeoJSON
            key={`drainage-${timeHorizon}-${simulatedRainfall}`}
            data={drainageData}
            style={getDrainageStyle}
            onEachFeature={onEachDrainage}
          />
        )}

        {/* Drainage Nodes (Inlet Sumps, Manholes, Outfalls) */}
        {layers.drainageNodes &&
          drainageNodesData?.features?.map((node, idx) => {
            const coords = [node.geometry.coordinates[1], node.geometry.coordinates[0]];
            const isOutfall = node.properties.node_type?.includes('Outfall') || node.properties.node_type?.includes('Barrage');
            return (
              <CircleMarker
                key={`node-${idx}`}
                center={coords}
                radius={isOutfall ? 9 : 6}
                pathOptions={{
                  fillColor: isOutfall ? '#10b981' : '#a855f7',
                  color: '#ffffff',
                  weight: 1.5,
                  fillOpacity: 0.85,
                }}
                eventHandlers={{
                  click: () => {
                    setSelectedZone(null);
                    setSelectedDrainage(node);
                  },
                }}
              >
                <Popup>
                  <div className="text-xs">
                    <div className="font-bold text-white">{node.properties.name}</div>
                    <div className="text-purple-300 font-semibold">{node.properties.node_type}</div>
                    <div className="text-[10px] text-slate-400">Capacity: {node.properties.design_capacity_m3s} m³/s</div>
                    <div className="text-[10px] text-cyan-400 mt-1 cursor-pointer font-bold">Click to inspect node specs</div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

        {/* Roads Network */}
        {layers.roads && roadsData && (
          <GeoJSON data={roadsData} style={getRoadsStyle} />
        )}

        {/* Flood Risk Hotspot Zones */}
        {layers.floodZones && floodZonesData && (
          <GeoJSON
            key={`zones-${timeHorizon}-${simulatedRainfall}`}
            data={floodZonesData}
            style={getZoneStyle}
            onEachFeature={onEachZone}
          />
        )}

        {/* Rainfall Telemetry Radar Stations */}
        {layers.rainfallRadar &&
          stationsData?.features?.map((stn, idx) => {
            const coords = [stn.geometry.coordinates[1], stn.geometry.coordinates[0]];
            const intensity = stn.properties.intensity_mm_hr;
            return (
              <React.Fragment key={idx}>
                <CircleMarker
                  center={coords}
                  radius={14}
                  pathOptions={{
                    fillColor: intensity > 50 ? '#ef4444' : '#06b6d4',
                    color: '#ffffff',
                    weight: 1.5,
                    fillOpacity: 0.7,
                  }}
                >
                  <Popup>
                    <div className="text-xs">
                      <div className="font-bold text-white">{stn.properties.name}</div>
                      <div className="text-cyan-400 font-semibold">
                        {intensity} mm/hr Precipitation
                      </div>
                      <div className="text-[10px] text-slate-400">Live IMD Telemetry</div>
                    </div>
                  </Popup>
                </CircleMarker>
              </React.Fragment>
            );
          })}

        {/* Safe Routing Overlay if active */}
        {activeRouteData?.shortest_route && (
          <Polyline
            positions={activeRouteData.shortest_route.geometry.coordinates.map((c) => [c[1], c[0]])}
            pathOptions={{ color: '#ef4444', weight: 5, opacity: 0.75, dashArray: '8, 8' }}
          />
        )}

        {activeRouteData?.safest_route && (
          <Polyline
            positions={activeRouteData.safest_route.geometry.coordinates.map((c) => [c[1], c[0]])}
            pathOptions={{ color: '#10b981', weight: 6, opacity: 0.95 }}
          />
        )}

        {activeRouteData?.safest_route && (
          <SetViewOnRoute routeCoords={activeRouteData.safest_route.geometry.coordinates} />
        )}
      </MapContainer>

      {/* TOP COUPLING EQUATION RIBBON */}
      <div
        className={`absolute top-3 z-[1000] hidden md:flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-cyan-500/40 shadow-2xl text-xs transition-all duration-300 ${
          isDrawerOpen
            ? 'left-4 xl:left-[calc(50%-250px)] xl:-translate-x-1/2 max-w-[calc(100vw-540px)]'
            : 'left-1/2 -translate-x-1/2'
        }`}
      >
        <div className="flex items-center gap-1.5 font-bold text-cyan-300">
          <Calculator className="w-3.5 h-3.5 text-cyan-400" />
          <span>Coupled Hydrology:</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-slate-200">
          <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold">Rain {currentRain} mm/h</span>
          <span className="text-slate-500">+</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-bold">Runoff Depression</span>
          <span className="text-slate-500">-</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-purple-300 font-bold">Drainage ({drainageSummary.average_network_utilization_pct || 78}%)</span>
          <span className="text-slate-500">=</span>
          <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40 font-bold">
            {timeHorizon} Inundation Risk
          </span>
        </div>
      </div>

      {/* FLOATING PROTOTYPE TRANSPARENCY TRIGGER (Top Left) */}
      <div className="absolute top-4 left-4 z-[1000]">
        <button
          onClick={() => setIsDataSourcesOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-white text-xs font-semibold shadow-xl transition-all"
        >
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span>Data Sources & Disclaimer</span>
        </button>
      </div>

      {/* Floating Layer Controls (Top Right - auto adjusts when drawer opens) */}
      <div
        className={`absolute top-4 z-[1000] transition-all duration-300 ${
          isDrawerOpen ? 'right-4 sm:right-[520px] hidden sm:block' : 'right-4'
        }`}
      >
        <LayerControls layers={layers} setLayers={setLayers} />
      </div>

      {/* Floating Depth Scale (Bottom Left - hides on smaller screens when drawer is open) */}
      <div
        className={`absolute bottom-6 left-4 z-[1000] transition-all duration-300 ${
          isDrawerOpen ? 'hidden 2xl:block' : 'hidden sm:block'
        }`}
      >
        <DepthLegend />
      </div>

      {/* Floating Time Slider (Bottom Center - dynamically repositions cleanly when right drawer is open) */}
      <div
        className={`absolute bottom-6 z-[1000] px-2 transition-all duration-300 ${
          isDrawerOpen
            ? 'left-4 right-4 sm:right-[520px] sm:left-auto sm:w-[calc(100vw-540px)] sm:max-w-2xl'
            : 'left-1/2 -translate-x-1/2 w-11/12 max-w-2xl'
        }`}
      >
        <TimeSlider currentStep={timeHorizon} onStepChange={onTimeHorizonChange} />
      </div>

      {/* Zone Detail Modal / Drawer */}
      {selectedZone && (
        <ZoneModal
          zone={selectedZone}
          onClose={() => setSelectedZone(null)}
          onAskAssistant={(q) => {
            setSelectedZone(null);
            if (askHandler) askHandler(q);
          }}
        />
      )}

      {/* Drainage Detail Modal / Drawer */}
      {selectedDrainage && (
        <DrainageModal
          element={selectedDrainage}
          onClose={() => setSelectedDrainage(null)}
          onAskAssistant={(q) => {
            setSelectedDrainage(null);
            if (askHandler) askHandler(q);
          }}
        />
      )}

      {/* Data Sources Transparency Modal */}
      <DataSourcesModal
        isOpen={isDataSourcesOpen}
        onClose={() => setIsDataSourcesOpen(false)}
      />

    </div>
  );
}
