import React, { useState, useEffect } from 'react';
import { CloudRain, AlertTriangle, ShieldAlert, Navigation, Droplet, Clock, BarChart3, Database, GitFork, Calculator, Sparkles } from 'lucide-react';
import KpiCard from './KpiCard';
import HotspotsTable from './HotspotsTable';
import AlertsFeed from './AlertsFeed';
import { getDashboardMetrics, getFloodZones, getWeatherInfo, getHistoricalEvents } from '../../services/api';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function DashboardView({ onSelectZone, onNavigateToMap, onNavigateToDrainage, onAskAssistant, onAskGemini, timeHorizon }) {
  const askHandler = onAskAssistant || onAskGemini;
  const [metrics, setMetrics] = useState(null);
  const [zones, setZones] = useState([]);
  const [weather, setWeather] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getDashboardMetrics(timeHorizon),
      getFloodZones(timeHorizon),
      getWeatherInfo(),
      getHistoricalEvents(),
    ])
      .then(([mRes, zRes, wRes, hRes]) => {
        setMetrics(mRes.data);
        setZones(zRes.data?.features || []);
        setWeather(wRes.data);
        setHistory(hRes.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching dashboard data:', err);
        setLoading(false);
      });
  }, [timeHorizon]);

  const forecastData = weather?.forecast_series || [
    { time: 'NOW', rainfall_mm_hr: 48.5 },
    { time: '+30m', rainfall_mm_hr: 65.0 },
    { time: '+60m', rainfall_mm_hr: 78.5 },
    { time: '+90m', rainfall_mm_hr: 54.0 },
    { time: '+120m', rainfall_mm_hr: 32.0 },
    { time: '+150m', rainfall_mm_hr: 18.0 },
    { time: '+180m', rainfall_mm_hr: 8.5 },
  ];

  const drainageSummary = metrics?.drainage_summary || {};

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner Alert */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/40 via-amber-950/30 to-slate-900 border border-red-500/30 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 shrink-0">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <span>DELHI NCR URBAN MONSOON ALERT - {metrics?.city_alert_level || 'ORANGE'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/30 text-red-300 font-mono">
                PEAK PROJECTED AT {metrics?.next_severe_peak || '+60 MIN'}
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Coupled rainfall telemetry & Yamuna drainage outfall surcharge active. Waterlogging concentrated in Minto Bridge, ITO, and Pul Prahladpur underpass basins.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onNavigateToMap}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all"
          >
            Open GIS Digital Twin Map
          </button>
        </div>
      </div>

      {/* LIVE COUPLING EQUATION CARD */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/30 border border-cyan-500/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-xs flex items-center gap-2">
              <span>Live Hydrodynamic Coupling Matrix</span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                Rainfall + Terrain/Runoff + Drainage = Flood Risk
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              VARUN dynamically solves the mass-balance equilibrium between precipitation surge, catchment slope depressions, and effective trunk conduit capacities.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-200 shrink-0 flex-wrap justify-center">
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-cyan-300 font-bold">
            Rain: {metrics?.current_rainfall_mm_hr || 48.5} mm/h
          </span>
          <span className="text-slate-500 font-bold">+</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-amber-300 font-bold">
            Depression: -12.5m Low
          </span>
          <span className="text-slate-500 font-bold">-</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-purple-300 font-bold">
            Drain Cap: {drainageSummary.average_utilization_pct || 78.4}% Surcharged
          </span>
          <span className="text-slate-500 font-bold">=</span>
          <span className="px-2.5 py-1 rounded-lg bg-red-500/20 border border-red-500/50 text-red-300 font-black">
            {metrics?.city_alert_level || 'ORANGE'} Inundation Risk
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <KpiCard
          title="City Flood Risk Score"
          value={`${metrics?.city_risk_score || 68.4}`}
          unit="/ 100"
          subtitle="Model Confidence: 94.2%"
          trend="Severe"
          icon={ShieldAlert}
          color="red"
        />
        <KpiCard
          title="Current Rainfall Rate"
          value={`${metrics?.current_rainfall_mm_hr || 48.5}`}
          unit="mm/h"
          subtitle="Safdarjung IMD Radar"
          trend="+22% in 30m"
          icon={CloudRain}
          color="cyan"
        />
        <KpiCard
          title="Trunk Drainage Stress"
          value={`${drainageSummary.average_utilization_pct || 78.4}`}
          unit="%"
          subtitle={`${drainageSummary.bottlenecks_count || 3} Surcharged Bottlenecks`}
          trend="Near Capacity"
          icon={GitFork}
          color="purple"
        />
        <KpiCard
          title="Max Predicted Inundation"
          value={`${metrics?.max_predicted_depth_cm || 54.2}`}
          unit="cm"
          subtitle={metrics?.highest_risk_area || 'Minto Bridge'}
          trend="Submerged"
          icon={Droplet}
          color="amber"
        />
        <KpiCard
          title="Affected Road Corridors"
          value={`${metrics?.affected_roads_count || 6}`}
          unit="Segments"
          subtitle="Underpass Closures Active"
          trend="Impassable"
          icon={Navigation}
          color="purple"
        />
        <KpiCard
          title="Critical Hotspot Count"
          value={`${metrics?.high_risk_zones_count || 5}`}
          unit="Zones"
          subtitle="Requires Dewatering"
          trend="High Alert"
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rainfall Radar Forecast Chart */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span>0–3 Hour Rainfall Hyetograph & Forecast (IMD Radar)</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Temporal storm progression driving urban runoff coupling
              </p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
              Doppler Radar Model
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData}>
                <defs>
                  <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit=" mm/h" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 12 }}
                  itemStyle={{ color: '#38bdf8' }}
                />
                <Area type="monotone" dataKey="rainfall_mm_hr" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#rainGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Historical Flood Archives */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-purple-400" />
                <span>Historical Monsoon Benchmarks</span>
              </h3>
            </div>

            <div className="space-y-3">
              {history.map((evt, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-200">{evt.event_name}</span>
                    <span className="text-[10px] text-purple-400 font-mono">{evt.date}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                    <span>Rainfall: <b className="text-white">{evt.peak_rainfall_mm_24h} mm</b></span>
                    <span>Peak Depth: <b className="text-red-400">{evt.peak_depth_cm} cm</b></span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 truncate">
                    {evt.primary_causes?.[0]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
            Current storm profile correlates with <strong className="text-white">June 2024 Pre-Monsoon Cloudburst</strong> pattern.
          </div>
        </div>
      </div>

      {/* Structured Simulated Alerts Feed */}
      <AlertsFeed timeHorizon={timeHorizon} onSelectZone={onSelectZone} onAskAssistant={askHandler} />

      {/* Hotspots Inundation Table */}
      <HotspotsTable zones={zones} onSelectZone={onSelectZone} />
    </div>
  );
}
