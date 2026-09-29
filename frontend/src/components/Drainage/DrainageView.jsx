import React, { useState, useEffect } from 'react';
import { GitFork, Droplet, AlertTriangle, ShieldAlert, Activity, Sparkles, Layers, ArrowRight, CheckCircle2, Sliders, RefreshCw } from 'lucide-react';
import { getDrainage, getDrainageSummary } from '../../services/api';

export default function DrainageView({ onNavigateToMap, onAskAssistant, onAskGemini, timeHorizon = 'NOW', simulatedRainfall = null }) {
  const askHandler = onAskAssistant || onAskGemini;
  const [drainageData, setDrainageData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  useEffect(() => {
    setLoading(true);
    getDrainage(timeHorizon, simulatedRainfall)
      .then((res) => {
        setDrainageData(res.data);
        setSummary(res.data?.summary || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching drainage network:', err);
        setLoading(false);
      });
  }, [timeHorizon, simulatedRainfall]);

  const features = drainageData?.features || [];

  const filteredFeatures = features.filter((feat) => {
    const props = feat.properties || {};
    if (selectedFilter === 'BOTTLENECKS') return props.is_bottleneck || props.utilization_pct >= 85;
    if (selectedFilter === 'PRIMARY') return props.type?.includes('Primary');
    if (selectedFilter === 'FEEDER') return props.type?.includes('Feeder') || props.type?.includes('Secondary') || props.type?.includes('Tertiary');
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-slate-900 border border-cyan-500/30 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0">
            <GitFork className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <span>DELHI URBAN DRAINAGE HYDRAULIC & SURCHARGE NETWORK</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                Coupled Rational Catchment Model
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Hydraulic monitoring of Delhi's 8 primary & secondary storm trunk drains, siltation bottlenecks, and outfall stages.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {askHandler && (
            <button
              onClick={() => askHandler('Which drainage segments are currently overloaded or acting as bottlenecks, and why?')}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-500/20 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Bottleneck Summary</span>
            </button>
          )}

          <button
            onClick={onNavigateToMap}
            className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all"
          >
            View on GIS Map
          </button>
        </div>
      </div>

      {/* Network KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Average Network Utilization</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {summary?.average_network_utilization_pct || 78.4}%
          </div>
          <div className="text-[11px] text-cyan-400 font-medium mt-1">
            Network Stress: <strong className="text-white">{summary?.network_stress_level || 'HIGH'}</strong>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Active Surcharge Bottlenecks</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-black text-red-400">
            {summary?.bottlenecks_count || 3}{' '}
            <span className="text-xs font-normal text-slate-400">/ {summary?.total_segments || 8} segments</span>
          </div>
          <div className="text-[11px] text-red-300 font-medium mt-1">
            {summary?.surcharged_segments_count || 2} severely surcharged (&gt;95%)
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total Estimated Flow</span>
            <Droplet className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {summary?.total_estimated_flow_m3s || 345.2}{' '}
            <span className="text-xs font-normal text-slate-400">m³/s</span>
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-1">
            Effective Cap: <strong className="text-white">{summary?.total_effective_capacity_m3s || 382.0} m³/s</strong>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Effective Rainfall Surge</span>
            <Droplet className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-300">
            {summary?.effective_rainfall_mm_hr || 48.5}{' '}
            <span className="text-xs font-normal text-slate-400">mm/h</span>
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-1">
            Time Horizon: <strong className="text-white">{timeHorizon}</strong>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800 w-fit text-xs font-semibold">
        {[
          { id: 'ALL', label: 'All Drainage Corridors' },
          { id: 'BOTTLENECKS', label: 'Overloaded Bottlenecks (≥85%)' },
          { id: 'PRIMARY', label: 'Primary Trunk Basins' },
          { id: 'FEEDER', label: 'Secondary / Feeder Channels' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedFilter(tab.id)}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedFilter === tab.id
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Drainage Corridors Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFeatures.map((feat, idx) => {
          const p = feat.properties || {};
          const util = p.utilization_pct || 75;
          const isBottleneck = p.is_bottleneck || util >= 85;

          const badgeBg =
            util >= 95
              ? 'bg-red-500/20 text-red-400 border-red-500/40'
              : util >= 85
              ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
              : util >= 65
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
              : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40';

          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl border transition-all shadow-xl bg-slate-900/90 ${
                isBottleneck ? 'border-red-500/40 hover:border-red-400' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between pb-3 mb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${badgeBg}`}>
                      {p.surcharge_status || 'MONITORED'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">{p.id}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white tracking-tight">{p.name}</h3>
                  <div className="text-[11px] text-slate-400">{p.type}</div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-black text-white">{util}%</div>
                  <div className="text-[10px] text-slate-400">Utilization</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      util >= 95 ? 'bg-red-500' : util >= 85 ? 'bg-orange-500' : util >= 65 ? 'bg-amber-500' : 'bg-cyan-500'
                    }`}
                    style={{ width: `${Math.min(100, util)}%` }}
                  />
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-center mb-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400">Current Flow</span>
                  <div className="font-bold text-white text-xs">{p.current_flow_m3s || 24} m³/s</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Effective Cap</span>
                  <div className="font-bold text-cyan-400 text-xs">{p.effective_capacity_m3s || 30} m³/s</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Siltation</span>
                  <div className="font-bold text-amber-400 text-xs">{p.siltation_pct || 30}%</div>
                </div>
              </div>

              {/* Upstream & Outfall */}
              <div className="text-[11px] space-y-1.5 text-slate-300">
                <div>
                  <span className="text-slate-500 font-semibold">Catchment Feeders: </span>
                  <span>{Array.isArray(p.upstream_catchments) ? p.upstream_catchments.join(', ') : 'Local Sub-Catchment'}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold">Terminal Outfall: </span>
                  <span className="text-emerald-400 font-medium">{p.downstream_outfall || p.outfall}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
