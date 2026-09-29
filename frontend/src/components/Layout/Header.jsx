import React from 'react';
import { CloudRain, ShieldAlert, Navigation, Cpu, Sparkles, Activity, Layers, BarChart2, GitFork, Database } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, setIsAssistantOpen, onOpenDataSources, cityMetrics }) {
  const alertColor = cityMetrics?.city_alert_level === 'RED' 
    ? 'bg-red-500/20 text-red-400 border-red-500/50' 
    : cityMetrics?.city_alert_level === 'ORANGE'
    ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';

  const navItems = [
    { id: 'map', label: 'GIS Command Map', icon: Layers },
    { id: 'dashboard', label: 'Disaster Dashboard', icon: Activity },
    { id: 'drainage', label: 'Drainage Network', icon: GitFork },
    { id: 'routing', label: 'Flood-Safe Routing', icon: Navigation },
    { id: 'simulation', label: 'Dynamic Simulation', icon: Cpu },
    { id: 'analytics', label: 'Analytics & Explainability', icon: BarChart2 },
  ];

  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-3 sm:px-4 py-2">
      <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-2 sm:gap-4 overflow-x-auto">
        {/* Brand & Project Identity (Left) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 shadow-lg shadow-cyan-500/20 text-white font-black text-base sm:text-lg tracking-wider shrink-0">
            V
            <span className="absolute -top-1 -right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-red-500 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-red-500 rounded-full" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight leading-none">
              VARUN
            </h1>
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium mt-0.5 whitespace-nowrap">
              Urban Flood Digital Twin (Delhi NCR)
            </p>
          </div>
        </div>

        {/* Navigation Tabs (Center) */}
        <nav className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 shrink-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Live Status Indicators & AI Assistant (Right) */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-xs">
            <CloudRain className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
            <span className="text-slate-300 hidden xl:inline">Rainfall:</span>
            <span className="font-bold text-white whitespace-nowrap">
              {cityMetrics?.current_rainfall_mm_hr || 48.5} mm/h
            </span>
          </div>

          <div className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg border text-xs font-bold whitespace-nowrap ${alertColor}`}>
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span>
              {cityMetrics?.city_alert_level || 'ORANGE'} ({cityMetrics?.city_risk_score || 68}/100)
            </span>
          </div>

          {/* Data Sources Disclaimer Trigger */}
          {onOpenDataSources && (
            <button
              onClick={onOpenDataSources}
              title="View synthetic data pedigree & production interfaces"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs transition-all whitespace-nowrap"
            >
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden lg:inline">Data Sources</span>
            </button>
          )}

          {/* AI Assistant Quick Toggle */}
          <button
            onClick={() => setIsAssistantOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-purple-500/20 transition-all active:scale-95 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 animate-spin shrink-0" style={{ animationDuration: '4s' }} />
            <span>AI Assistant</span>
          </button>
        </div>
      </div>
    </header>
  );
}
