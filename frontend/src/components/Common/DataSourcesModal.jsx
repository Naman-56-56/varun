import React from 'react';
import { X, Database, Info, ShieldCheck, Cpu, CloudRain, Layers, Radio } from 'lucide-react';

export default function DataSourcesModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const dataLayers = [
    {
      title: 'Rainfall Telemetry & Radar Nowcast',
      category: 'Meteorological Telemetry',
      status: 'SYNTHETIC PROTOTYPE',
      desc: 'Synthetic spatial grid simulating 6 IMD Doppler Radar stations across Delhi NCR with convective temporal hyetographs (0–3 hour progression at 10–100 mm/h).',
      realWorldCounterpart: 'IMD DWR (Palam / Lodhi Road) + AWS 15-min telemetry feeds.'
    },
    {
      title: 'Topographic Elevation & Slope (DEM)',
      category: 'Geomorphology',
      status: 'SYNTHETIC PROTOTYPE',
      desc: 'Synthetic digital elevation model grid (202m–235m ASL) modeling the Delhi Ridge natural high ground and underpass depression basins.',
      realWorldCounterpart: 'CartoDEM / SRTM 30m / Drone LiDAR municipal topography.'
    },
    {
      title: 'Urban Storm Drainage Network',
      category: 'Municipal Infrastructure GIS',
      status: 'SYNTHETIC PROTOTYPE',
      desc: 'Topological graph of trunk channels (Najafgarh, Barapullah, Shahdara, Kushak), feeder conduits, inlet sumps, and Yamuna barrage outfalls with design capacities and siltation modifiers.',
      realWorldCounterpart: 'Delhi Drainage Master Plan GIS + Irrigation & Flood Control Dept telemetry.'
    },
    {
      title: 'Historical Monsoon Inundation Footprints',
      category: 'Validation Archive',
      status: 'BENCHMARK DATASET',
      desc: 'Curated historical flood depth archives calibrated against June 2024, July 2023, and August 2020 Delhi monsoon cloudburst events.',
      realWorldCounterpart: 'Delhi Traffic Police & NDMA field waterlogging logs.'
    },
    {
      title: 'Machine Learning & Hydraulic Coupling',
      category: 'Nowcasting Core',
      status: 'ACTIVE MODEL',
      desc: 'Coupled XGBoost Classifier (93.58% accuracy), Depth Regressor, Rational runoff formulation, and NetworkX A* hazard routing.',
      realWorldCounterpart: 'Coupled 1D-2D Hydrodynamic Models (e.g. SWMM / HEC-RAS / Deep-Learning Nowcasters).'
    },
    {
      title: 'Grounded AI Interpretation Layer',
      category: 'Decision Support',
      status: 'ACTIVE AI ASSISTANT',
      desc: 'AI Assistant strictly conditioned on structured telemetry data and model feature importances to ensure zero hallucinations.',
      realWorldCounterpart: 'Municipal Emergency Operations Command AI Advisor.'
    }
  ];

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white tracking-tight">
                  Data Sources & Prototype Transparency
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                Architectural blueprint and data pedigree for the VARUN Urban Flood Digital Twin
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prototype Transparency Notice */}
        <div className="p-4 bg-amber-950/30 border-b border-amber-500/30 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-amber-300">Prototype Demonstration Notice:</strong> This prototype demonstration uses realistic <strong className="text-white">synthetic rainfall, terrain (DEM), municipal drainage GIS, and flood depth datasets</strong> engineered for Delhi NCR to demonstrate the coupled nowcasting workflow. In a production deployment, these pipelines connect directly to live IMD radar streams, municipal GIS databases, and IoT water-level sensors.
          </div>
        </div>

        {/* Data Architecture Grid */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Telemetry & Model Layer Hierarchy</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {dataLayers.map((layer, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between text-xs space-y-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white text-xs">{layer.title}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                      {layer.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {layer.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500">
                  <span className="text-slate-400 font-semibold">Production Target:</span> {layer.realWorldCounterpart}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs">
          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Ministry of Earth Sciences / NCMRWF — Disaster Management Domain</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-all"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
