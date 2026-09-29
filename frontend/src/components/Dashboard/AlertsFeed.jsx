import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, Clock, MapPin, ArrowRight, CheckCircle2, ChevronRight, ShieldCheck, Sparkles } from 'lucide-react';
import { getAlerts } from '../../services/api';

export default function AlertsFeed({ timeHorizon = 'NOW', onSelectZone, onAskAssistant, onAskGemini }) {
  const askHandler = onAskAssistant || onAskGemini;
  const [alertsData, setAlertsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getAlerts(timeHorizon)
      .then((res) => {
        setAlertsData(res.data?.alerts || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching alerts:', err);
        setLoading(false);
      });
  }, [timeHorizon]);

  if (loading) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl text-xs text-slate-400">
        Loading active municipal flood alerts...
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Active Urban Inundation Warnings ({alertsData.length})</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 font-mono">
                Horizon: {timeHorizon}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Coupled rainfall-drainage threshold alerts for emergency response & traffic diversion
            </p>
          </div>
        </div>

        <span className="text-[10px] px-2 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-semibold">
          Simulated Demonstration Alerts
        </span>
      </div>

      <div className="space-y-3">
        {alertsData.map((alert, idx) => {
          const isCritical = alert.severity === 'CRITICAL';
          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border transition-all text-xs ${
                isCritical
                  ? 'bg-red-950/30 border-red-500/40 hover:border-red-400'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                      isCritical
                        ? 'bg-red-500/20 text-red-400 border-red-500/50'
                        : 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                    }`}
                  >
                    {alert.severity} RISK
                  </span>
                  <h4 className="font-extrabold text-white text-xs flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{alert.location_name}</span>
                  </h4>
                  <span className="text-[10px] text-slate-500">({alert.ward})</span>
                </div>

                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1 text-slate-400 font-medium">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>Peak: <strong className="text-white">{alert.expected_time}</strong></span>
                  </span>
                  <span className="text-red-400 font-bold">
                    Est. Depth: {alert.estimated_depth_cm} cm
                  </span>
                </div>
              </div>

              {/* Coupling Reason */}
              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800/80 mb-2.5 text-[11px] text-slate-300 leading-relaxed">
                <strong className="text-amber-300">Coupled Physical Cause: </strong>
                {alert.reason}
              </div>

              {/* Recommended Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">
                    Action: <strong className="text-slate-200">{alert.recommended_actions?.[0]}</strong>
                  </span>
                </div>

                {askHandler && (
                  <button
                    onClick={() =>
                      askHandler(
                        `Explain emergency response protocol for ${alert.location_name} under ${alert.severity} flood alert with ${alert.estimated_depth_cm} cm water depth.`
                      )
                    }
                    className="flex items-center gap-1 text-purple-400 hover:text-purple-300 font-semibold text-[11px] transition-all shrink-0"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>AI Action Plan</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
