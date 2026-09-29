import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock, FastForward } from 'lucide-react';

const TIMESTEPS = [
  { id: 'NOW', label: 'NOW (T+0)', subtitle: 'Live Telemetry' },
  { id: '+30m', label: '+30 MIN', subtitle: 'Runoff Influx' },
  { id: '+60m', label: '+60 MIN', subtitle: 'Peak Inundation' },
  { id: '+90m', label: '+90 MIN', subtitle: 'Drainage Saturation' },
  { id: '+120m', label: '+120 MIN', subtitle: 'Stabilization' },
  { id: '+150m', label: '+150 MIN', subtitle: 'Slow Drainage' },
  { id: '+180m', label: '+180 MIN', subtitle: 'Receding Phase' },
];

export default function TimeSlider({ currentStep, onStepChange }) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        const currentIndex = TIMESTEPS.findIndex((t) => t.id === currentStep);
        const nextIndex = (currentIndex + 1) % TIMESTEPS.length;
        onStepChange(TIMESTEPS[nextIndex].id);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, onStepChange]);

  const currentIndex = TIMESTEPS.findIndex((t) => t.id === currentStep);

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-3.5 shadow-2xl text-slate-100 max-w-2xl w-full">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>0–3 HOUR TEMPORAL NOWCASTING TIMELINE</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-extrabold uppercase">
                {currentStep}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              LSTM Hydrograph Propagation & Drainage Outfall Lag
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'Pause' : 'Auto Play'}</span>
          </button>

          <button
            onClick={() => onStepChange('NOW')}
            title="Reset to live telemetry"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Slider Track */}
      <div className="relative pt-1 pb-1">
        <div className="flex items-center justify-between gap-1">
          {TIMESTEPS.map((step, idx) => {
            const isSelected = step.id === currentStep;
            const isPast = idx <= currentIndex;
            return (
              <button
                key={step.id}
                onClick={() => onStepChange(step.id)}
                className={`flex-1 flex flex-col items-center py-1.5 px-1 rounded-xl transition-all ${
                  isSelected
                    ? 'bg-cyan-500/20 border border-cyan-400/80 shadow-lg shadow-cyan-500/20 scale-105 z-10'
                    : 'hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full border-2 mb-1 transition-all ${
                    isSelected
                      ? 'bg-cyan-400 border-white scale-125'
                      : isPast
                      ? 'bg-cyan-600 border-cyan-800'
                      : 'bg-slate-800 border-slate-700'
                  }`}
                />
                <span className={`text-[11px] font-bold ${isSelected ? 'text-cyan-300 font-extrabold' : 'text-slate-300'}`}>
                  {step.label}
                </span>
                <span className="text-[8px] text-slate-500 truncate max-w-full">
                  {step.subtitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
