import React from 'react';
import { Droplet } from 'lucide-react';

export default function DepthLegend() {
  const depthClasses = [
    { label: '0 – 5 cm', color: 'bg-emerald-500', text: 'Nominal / Minor Splash' },
    { label: '5 – 15 cm', color: 'bg-amber-500', text: 'Curb Overflow' },
    { label: '15 – 30 cm', color: 'bg-orange-500', text: 'Sedan Hazard / Alert' },
    { label: '30 – 50 cm', color: 'bg-red-500', text: 'SUV Inundation / Closed' },
    { label: '50+ cm', color: 'bg-purple-600', text: 'Submerged / Catastrophic' },
  ];

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-2xl w-60 text-xs">
      <div className="flex items-center gap-1.5 font-bold text-slate-200 pb-2 mb-2 border-b border-slate-800">
        <Droplet className="w-3.5 h-3.5 text-cyan-400" />
        <span>Predicted Water Depth Scale</span>
      </div>

      <div className="space-y-1.5">
        {depthClasses.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div className={`w-3.5 h-3.5 rounded ${item.color} shrink-0 shadow-sm`} />
            <div className="flex items-center justify-between w-full text-[11px]">
              <span className="font-semibold text-slate-200">{item.label}</span>
              <span className="text-slate-400 text-[10px]">{item.text}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
