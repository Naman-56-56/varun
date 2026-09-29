import React from 'react';
import { AlertCircle, ChevronRight, Droplet, Mountain } from 'lucide-react';

export default function HotspotsTable({ zones, onSelectZone }) {
  const sortedZones = [...(zones || [])].sort(
    (a, b) => (b.properties?.predicted_water_depth_cm || 0) - (a.properties?.predicted_water_depth_cm || 0)
  );

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span>High-Risk Hotspot Inundation Watchlist</span>
          </h3>
          <p className="text-[11px] text-slate-400">
            Real-time ranked by ML predicted water depth & municipal risk score
          </p>
        </div>
        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
          {sortedZones.length} Monitored Sectors
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-400 border-b border-slate-800">
              <th className="py-2.5 px-3 font-semibold">Location / Hotspot</th>
              <th className="py-2.5 px-3 font-semibold">Risk Class</th>
              <th className="py-2.5 px-3 font-semibold">Predicted Depth</th>
              <th className="py-2.5 px-3 font-semibold">Flood Probability</th>
              <th className="py-2.5 px-3 font-semibold">Key Contributing Driver</th>
              <th className="py-2.5 px-3 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {sortedZones.map((zone, idx) => {
              const props = zone.properties || {};
              const depth = props.predicted_water_depth_cm || 0;
              const rClass = props.risk_class || 'LOW';
              const prob = Math.round((props.flood_probability || 0) * 100);

              const badgeColor =
                rClass === 'CRITICAL'
                  ? 'bg-red-500/20 text-red-400 border-red-500/40'
                  : rClass === 'HIGH'
                  ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                  : rClass === 'MODERATE'
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';

              const topFactor = props.contributing_factors?.[0]?.factor || 'Low Elevation Underpass';

              return (
                <tr
                  key={props.id || idx}
                  onClick={() => onSelectZone(zone)}
                  className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-3">
                    <div className="font-bold text-white">{props.name}</div>
                    <div className="text-[10px] text-slate-400">{props.ward}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                      {rClass}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-white">
                    <div className="flex items-center gap-1">
                      <Droplet className="w-3 h-3 text-cyan-400" />
                      <span>{depth} cm</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-200">{prob}%</td>
                  <td className="py-3 px-3 text-slate-300 text-[11px] truncate max-w-xs">{topFactor}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectZone(zone);
                      }}
                      className="p-1 rounded-lg bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-400 transition-all inline-flex items-center"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
