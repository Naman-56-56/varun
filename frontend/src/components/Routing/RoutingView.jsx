import React, { useState, useEffect } from 'react';
import { Navigation, ShieldCheck, AlertOctagon, Clock, MapPin, ArrowRight, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';
import { getRoutingNodes, getFloodSafeRoute } from '../../services/api';

export default function RoutingView({ onRouteCalculated, onNavigateToMap, onAskAssistant, onAskGemini }) {
  const askHandler = onAskAssistant || onAskGemini;
  const [nodes, setNodes] = useState([]);
  const [origin, setOrigin] = useState('NODE_CP');
  const [destination, setDestination] = useState('NODE_AIIMS');
  const [threshold, setThreshold] = useState(25.0);
  const [rainfall, setRainfall] = useState(48.5);
  const [routeResult, setRouteResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getRoutingNodes().then((res) => {
      setNodes(res.data || []);
    });
  }, []);

  const handleCalculateRoute = () => {
    setLoading(true);
    getFloodSafeRoute(origin, destination, rainfall, threshold)
      .then((res) => {
        setRouteResult(res.data);
        if (onRouteCalculated) {
          onRouteCalculated(res.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error calculating route:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    handleCalculateRoute();
  }, [origin, destination, threshold, rainfall]);

  const shortest = routeResult?.shortest_route;
  const safest = routeResult?.safest_route;
  const comparison = routeResult?.comparison;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 to-slate-900 border border-blue-500/30 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0">
            <Navigation className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <span>FLOOD-SAFE EMERGENCY ROUTING ENGINE</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                NetworkX A* with Hydrodynamic Penalties
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Dynamically routes emergency services & citizens around submerged underpasses, low ridges, and flooded corridors.
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateToMap}
          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all shrink-0"
        >
          View Active Route on GIS Map
        </button>
      </div>

      {/* Control Panel: Pickers & Thresholds */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        {/* Origin */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>Origin Starting Point</span>
          </label>
          <select
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-cyan-500"
          >
            {nodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}
              </option>
            ))}
          </select>
        </div>

        {/* Destination */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-red-400" />
            <span>Destination Point</span>
          </label>
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-cyan-500"
          >
            {nodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}
              </option>
            ))}
          </select>
        </div>

        {/* Max Safe Water Depth Slider */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-300">Vehicle Safety Threshold</label>
            <span className="text-xs font-bold text-cyan-400">{threshold} cm</span>
          </div>
          <input
            type="range"
            min="10"
            max="50"
            step="5"
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            className="w-full accent-cyan-500 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>Sedan (15cm)</span>
            <span>SUV (25cm)</span>
            <span>Truck (40cm)</span>
          </div>
        </div>

        {/* Rain Intensity */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-300">Rainfall Condition</label>
            <span className="text-xs font-bold text-cyan-400">{rainfall} mm/h</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            step="10"
            value={rainfall}
            onChange={(e) => setRainfall(parseFloat(e.target.value))}
            className="w-full accent-cyan-500 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>Moderate (20)</span>
            <span>Heavy (50)</span>
            <span>Cloudburst (100)</span>
          </div>
        </div>
      </div>

      {/* Comparison Cards: Shortest vs Safest Route */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Original / Shortest Route */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-red-500/20 text-red-400">
                  <AlertOctagon className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">Direct Shortest Route (Standard GPS)</h3>
                  <p className="text-[11px] text-slate-400">Unaware of localized underpass waterlogging</p>
                </div>
              </div>
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40">
                {shortest?.exposure_risk || 'CRITICAL RISK'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400">Distance</span>
                <div className="text-lg font-black text-white">{shortest?.total_distance_km || 0} km</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400">ETA</span>
                <div className="text-lg font-black text-white">{shortest?.total_time_min || 0} min</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400">Max Water Depth</span>
                <div className="text-lg font-black text-red-400">{shortest?.max_water_depth_cm || 0} cm</div>
              </div>
            </div>

            {/* Hazards Breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Detected Inundation Hazards ({shortest?.hazards?.length || 0})</span>
              </h4>
              {shortest?.hazards?.length === 0 ? (
                <p className="text-xs text-emerald-400">No dangerous flood hazards detected on this corridor.</p>
              ) : (
                shortest?.hazards?.map((h, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-red-950/30 border border-red-800/40 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-red-200">{h.segment}</div>
                      <div className="text-[10px] text-red-400 font-semibold">{h.status} • {h.depth_cm} cm depth</div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-extrabold">
                      {h.severity}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800">
            {askHandler && (
              <button
                onClick={() => askHandler(`Why is the shortest route from ${origin} to ${destination} unsafe during this monsoon rainfall?`)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Ask AI Assistant: Why is this route hazardous?</span>
              </button>
            )}
          </div>
        </div>

        {/* Flood-Safe Alternative Route */}
        <div className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-5 shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>Varun Flood-Safe Alternative</span>
                    <span className="text-[10px] px-2 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                      RECOMMENDED
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Elevated ridge routing avoiding submerged basins</p>
                </div>
              </div>
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                {safest?.exposure_risk || 'LOW RISK'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400">Distance</span>
                <div className="text-lg font-black text-white">{safest?.total_distance_km || 0} km</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400">ETA</span>
                <div className="text-lg font-black text-white">{safest?.total_time_min || 0} min</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400">Max Water Depth</span>
                <div className="text-lg font-black text-emerald-400">{safest?.max_water_depth_cm || 0} cm</div>
              </div>
            </div>

            {/* Differential / Impact Stat */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 mb-4 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Additional Detour Distance:</span>
                <span className="font-bold text-white">+{comparison?.additional_distance_km || 0} km</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Additional Travel Time:</span>
                <span className="font-bold text-white">+{comparison?.additional_time_min || 0} min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Flood Inundation Avoided:</span>
                <span className="font-bold text-emerald-400">-{comparison?.depth_reduction_cm || 0} cm</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/30 text-xs flex items-center gap-2 text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{comparison?.verdict || 'Safest route fully bypasses flooded underpasses.'}</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800">
            <button
              onClick={onNavigateToMap}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-emerald-500/20 transition-all"
            >
              Overlay Safest Route on GIS Map
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
