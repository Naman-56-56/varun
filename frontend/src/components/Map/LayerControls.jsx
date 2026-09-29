import React from 'react';
import { Layers, Eye, EyeOff } from 'lucide-react';

export default function LayerControls({ layers, setLayers }) {
  const layerDefinitions = [
    { key: 'baseMap', label: 'Dark Base Map', group: 'Base' },
    { key: 'rainfallRadar', label: 'Rainfall Radar (IMD)', group: 'Meteorological' },
    { key: 'floodZones', label: 'Flood Risk Hotspot Zones', group: 'Risk Modeling' },
    { key: 'waterDepth', label: 'Water Depth Inundation', group: 'Hydrology' },
    { key: 'drainage', label: 'Storm Drainage Corridors', group: 'Infrastructure' },
    { key: 'drainageNodes', label: 'Inlet Sumps & Outfall Barrages', group: 'Infrastructure' },
    { key: 'roads', label: 'Road Network & Safety Status', group: 'Transport' },
    { key: 'elevationGrid', label: 'DEM Topographic Grid', group: 'Terrain' },
    { key: 'historicalFloods', label: 'Historical Inundation Footprints', group: 'Archives' },
  ];


  const toggleLayer = (key) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-2xl w-64 text-xs">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5 font-bold text-slate-200">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>GIS Layer Stack (10 Layers)</span>
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
          {Object.values(layers).filter(Boolean).length} Active
        </span>
      </div>

      <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
        {layerDefinitions.map((l) => {
          const isActive = layers[l.key];
          return (
            <button
              key={l.key}
              onClick={() => toggleLayer(l.key)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-all ${
                isActive
                  ? 'bg-slate-800 text-cyan-300 font-medium border border-cyan-500/30'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              <span className="truncate pr-2">{l.label}</span>
              {isActive ? (
                <Eye className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
