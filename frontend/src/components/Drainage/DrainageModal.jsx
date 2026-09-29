import React from 'react';
import { X, GitFork, Droplet, AlertTriangle, ShieldAlert, ArrowRight, ArrowDownRight, Sparkles, Activity, Layers, CornerDownRight } from 'lucide-react';

export default function DrainageModal({ element, onClose, onAskAssistant, onAskGemini }) {
  if (!element) return null;

  const askHandler = onAskAssistant || onAskGemini;
  const props = element.properties || {};
  const isNode = element.geometry?.type === 'Point';

  const utilization = props.utilization_pct || 75.0;
  const surchargeStatus = props.surcharge_status || (utilization >= 85 ? 'NEAR CAPACITY' : 'NORMAL FLOW');
  const isBottleneck = props.is_bottleneck || utilization >= 85;

  const statusColor = 
    utilization >= 95 ? 'bg-red-500/20 text-red-400 border-red-500/50' :
    utilization >= 85 ? 'bg-orange-500/20 text-orange-400 border-orange-500/50' :
    utilization >= 65 ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' :
    'bg-cyan-500/20 text-cyan-400 border-cyan-500/50';

  const handleTriggerAI = () => {
    if (askHandler) {
      askHandler(`Explain the hydraulic bottleneck and drainage surcharge status for ${props.name || props.id}. What de-siltation or pumping intervention is recommended?`);
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-[2000] w-full sm:w-[480px] bg-slate-900/98 backdrop-blur-2xl border-l border-slate-800 shadow-2xl p-5 sm:p-6 overflow-y-auto flex flex-col justify-between text-slate-100 transition-all duration-300">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between pb-4 mb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${statusColor}`}>
                {isNode ? (props.node_type || 'DRAINAGE NODE') : surchargeStatus}
              </span>
              <span className="text-xs text-slate-400 font-mono">{props.id}</span>
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              {props.name || 'Drainage Infrastructure Component'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bottleneck Warning Banner if Surcharged */}
        {isBottleneck && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 mb-5 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-red-300">Hydraulic Surcharge Bottleneck: </span>
              <span className="text-slate-300">
                Inflow exceeds effective cross-sectional discharge capacity. Siltation ({props.siltation_pct || 35}%) creates upstream backwater pooling in connected low-lying basins.
              </span>
            </div>
          </div>
        )}

        {/* Primary Hydraulic Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Droplet className="w-3.5 h-3.5 text-cyan-400" />
              <span>Current Estimated Flow</span>
            </div>
            <div className="text-2xl font-black text-white">
              {props.current_flow_m3s || (props.design_capacity_m3s ? (props.design_capacity_m3s * 0.8).toFixed(1) : '24.5')}{' '}
              <span className="text-xs font-normal text-slate-400">m³/s</span>
            </div>
            <div className="text-[11px] text-cyan-400 font-medium mt-0.5">
              Effective Cap: {props.effective_capacity_m3s || props.design_capacity_m3s || '30.0'} m³/s
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>Capacity Utilization</span>
            </div>
            <div className="text-2xl font-black text-white">
              {utilization}%
            </div>
            <div className={`text-[11px] font-bold mt-0.5 ${utilization >= 85 ? 'text-red-400' : 'text-emerald-400'}`}>
              {utilization >= 95 ? 'Severely Overloaded' : utilization >= 85 ? 'Near Capacity Limit' : 'Adequate Flow Capacity'}
            </div>
          </div>
        </div>

        {/* Capacity Utilization Progress Bar */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 mb-5">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-slate-300">Hydraulic Load Bar</span>
            <span className="text-xs font-mono text-cyan-400">{utilization}% of Effective Limit</span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                utilization >= 95 ? 'bg-red-500' : utilization >= 85 ? 'bg-orange-500' : utilization >= 65 ? 'bg-amber-500' : 'bg-cyan-500'
              }`}
              style={{ width: `${Math.min(100, utilization)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 mt-1.5 font-mono">
            <span>0 m³/s</span>
            <span>Design: {props.capacity_m3s || props.design_capacity_m3s || 35} m³/s</span>
            <span>Max Flow</span>
          </div>
        </div>

        {/* Upstream / Downstream Graph Topology */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 mb-5 space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <GitFork className="w-3.5 h-3.5 text-purple-400" />
            <span>Drainage Network Graph Topology</span>
          </h4>

          {/* Upstream */}
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <div className="text-[10px] text-slate-400 font-bold mb-1 flex items-center gap-1">
              <CornerDownRight className="w-3 h-3 text-cyan-400" />
              <span>UPSTREAM CATCHMENT FEEDERS & INLETS:</span>
            </div>
            <div className="text-white font-medium pl-4">
              {Array.isArray(props.upstream_catchments)
                ? props.upstream_catchments.join(', ')
                : (props.catchment || 'Central Catchment Inlets & Sump Collectors')}
            </div>
          </div>

          {/* Downstream */}
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <div className="text-[10px] text-slate-400 font-bold mb-1 flex items-center gap-1">
              <ArrowRight className="w-3 h-3 text-emerald-400" />
              <span>TERMINAL DISCHARGE / DOWNSTREAM OUTFALL:</span>
            </div>
            <div className="text-emerald-300 font-medium pl-4">
              {props.downstream_outfall || props.outfall || 'Yamuna River (Regulated Barrage)'}
            </div>
          </div>
        </div>

        {/* Physical & Engineering Specifications */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 mb-5 text-xs">
          <h4 className="font-bold text-slate-300 mb-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Physical Geometry & Engineering Attributes</span>
          </h4>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div><span className="text-slate-400">Classification:</span> <span className="font-semibold text-white">{props.type || props.node_type || 'Storm Conduit'}</span></div>
            <div><span className="text-slate-400">Design Capacity:</span> <span className="font-semibold text-white">{props.capacity_m3s || props.design_capacity_m3s || 30.0} m³/s</span></div>
            <div><span className="text-slate-400">Siltation Obstruction:</span> <span className="font-semibold text-amber-400">{props.siltation_pct || 35}%</span></div>
            <div><span className="text-slate-400">Bed Slope / Incline:</span> <span className="font-semibold text-white">{props.slope_pct ? `${props.slope_pct}%` : '0.06%'}</span></div>
          </div>
        </div>
      </div>

      {/* AI Assistant Action Button */}
      <div className="pt-3 border-t border-slate-800">
        <button
          onClick={handleTriggerAI}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-500/20 transition-all active:scale-98"
        >
          <Sparkles className="w-4 h-4" />
          <span>Ask AI Assistant to Analyze This Drainage Segment</span>
        </button>
      </div>
    </div>
  );
}
