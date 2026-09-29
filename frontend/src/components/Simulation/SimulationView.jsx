import React, { useState, useEffect } from 'react';
import { Cpu, CloudRain, Sliders, RefreshCw, Layers, Droplet, ArrowRight, ShieldAlert } from 'lucide-react';
import { runSimulation } from '../../services/api';

export default function SimulationView({ onApplySimulationToMap, onNavigateToMap }) {
  const [rainfall, setRainfall] = useState(50.0);
  const [drainageEff, setDrainageEff] = useState(100.0);
  const [simData, setSimData] = useState(null);
  const [loading, setLoading] = useState(false);

  const presets = [
    { label: 'Light Drizzle', val: 10, desc: 'Nominal surface runoff' },
    { label: 'Moderate Rain', val: 25, desc: 'Underpass curb ponding' },
    { label: 'Heavy Downpour', val: 50, desc: 'Severe street waterlogging' },
    { label: 'Torrential Deluge', val: 75, desc: 'Underpasses submerged' },
    { label: 'Cloudburst Crisis', val: 100, desc: 'Catastrophic city gridlock' },
  ];

  const handleSimulate = (rainVal = rainfall, drainVal = drainageEff) => {
    setLoading(true);
    runSimulation(rainVal, drainVal)
      .then((res) => {
        setSimData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error running simulation:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    handleSimulate(rainfall, drainageEff);
  }, []);

  const meta = simData?.simulation_meta || {};
  const cells = simData?.features || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-slate-900 border border-cyan-500/30 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0">
            <Cpu className="w-6 h-6 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <span>2D CELLULAR URBAN FLOOD PROPAGATION LAB</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                Finite Volume Mass-Balance Hydrodynamic Engine
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Simulate dynamic storm cloudburst scenarios, drainage choking, and downstream gravity flux across Delhi's topography.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (onApplySimulationToMap) onApplySimulationToMap(rainfall);
            if (onNavigateToMap) onNavigateToMap();
          }}
          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all shrink-0 flex items-center gap-1.5"
        >
          <span>Apply to GIS Map Twin</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Preset Quick Selectors */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {presets.map((p) => {
          const isSelected = rainfall === p.val;
          return (
            <button
              key={p.val}
              onClick={() => {
                setRainfall(p.val);
                handleSimulate(p.val, drainageEff);
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-cyan-500/20 border-cyan-400 shadow-lg shadow-cyan-500/20 scale-102'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-bold ${isSelected ? 'text-cyan-300' : 'text-white'}`}>
                  {p.label}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                  {p.val} mm/h
                </span>
              </div>
              <p className="text-[10px] text-slate-400">{p.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Interactive Controls & Live Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sliders Panel */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Hydrodynamic Boundary Parameters</span>
          </h3>

          {/* Rainfall Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
              <span>Rainfall Cloudburst Rate</span>
              <span className="text-cyan-400 font-bold">{rainfall} mm/hr</span>
            </div>
            <input
              type="range"
              min="5"
              max="120"
              step="5"
              value={rainfall}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setRainfall(v);
                handleSimulate(v, drainageEff);
              }}
              className="w-full accent-cyan-500 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Drainage Efficiency Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
              <span>Drainage Network Efficiency</span>
              <span className="text-cyan-400 font-bold">{drainageEff}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={drainageEff}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setDrainageEff(v);
                handleSimulate(rainfall, v);
              }}
              className="w-full accent-cyan-500 bg-slate-800 rounded-lg cursor-pointer"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Simulates siltation, trash obstruction, and backflow from swollen Yamuna outfalls.
            </p>
          </div>

          {/* Summary Stats */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Max Grid Inundation:</span>
              <span className="font-extrabold text-red-400">{meta.max_simulated_depth_cm || 0} cm</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Flooded Grid Cells:</span>
              <span className="font-extrabold text-amber-400">{meta.flooded_cells_count || 0} / {meta.total_cells || 24}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Governing Model:</span>
              <span className="text-[10px] text-slate-300 font-mono">Mass Balance 2D</span>
            </div>
          </div>
        </div>

        {/* 2D Topographic Cellular Grid Matrix Display */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Delhi Topographic 2D Mesh Simulation Grid (West to East)</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Cellular water pooling based on elevation gradient, runoff accumulation, and discharge
              </p>
            </div>
            {loading && <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />}
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {cells.map((cell, idx) => {
              const p = cell.properties || {};
              const depth = p.simulated_water_depth_cm || 0;
              const elev = p.elevation_m || 215;
              const basin = p.basin || `Cell ${idx}`;

              const bgClass =
                depth >= 30
                  ? 'bg-red-950/80 border-red-500/70 text-red-200'
                  : depth >= 15
                  ? 'bg-amber-950/70 border-amber-500/60 text-amber-200'
                  : depth >= 5
                  ? 'bg-yellow-950/50 border-yellow-500/40 text-yellow-200'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300';

              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border flex flex-col justify-between h-24 transition-all hover:scale-105 shadow-sm ${bgClass}`}
                >
                  <div className="flex items-center justify-between text-[9px] font-mono opacity-80">
                    <span className="truncate">{basin}</span>
                    <span>{elev}m</span>
                  </div>
                  <div className="text-center my-1">
                    <div className="text-base font-black flex items-center justify-center gap-1">
                      <Droplet className="w-3.5 h-3.5" />
                      <span>{depth}</span>
                      <span className="text-[9px] font-normal">cm</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[8px] font-medium opacity-70">
                    <span>In: +{p.inflow_rate_cm || 0}</span>
                    <span>Out: -{p.outflow_rate_cm || 0}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
