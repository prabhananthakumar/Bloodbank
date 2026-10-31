import React from 'react';
import { Droplet } from 'lucide-react';

const StockLevelCard = ({ bloodGroup, units = 0 }) => {
  // Determine status thresholds
  let status = 'Adequate';
  let badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  let gaugeColor = 'bg-emerald-500';
  let fillPercent = Math.min((units / 15) * 100, 100);

  if (units === 0) {
    status = 'Depleted';
    badgeColor = 'bg-red-100 text-red-800 border-red-300 animate-pulse';
    gaugeColor = 'bg-red-600';
  } else if (units < 5) {
    status = 'Critical';
    badgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
    gaugeColor = 'bg-amber-500';
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
      {/* Background Accent */}
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-red-50 rounded-full group-hover:scale-125 transition-transform duration-300 pointer-events-none" />

      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-black text-lg border border-red-100 shadow-sm">
            {bloodGroup}
          </div>
          <div>
            <span className="text-xs uppercase font-semibold text-slate-400 block">Type</span>
            <span className="text-sm font-bold text-slate-800">Whole / Red Cell</span>
          </div>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeColor}`}>
          {status}
        </span>
      </div>

      <div className="my-4">
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-extrabold text-slate-900">{units}</span>
          <span className="text-xs font-medium text-slate-500">Units in cold vault</span>
        </div>

        {/* Progress Gauge */}
        <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
          <div
            className={`h-full ${gaugeColor} transition-all duration-700 ease-out`}
            style={{ width: `${Math.max(fillPercent, 6)}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
        <span>Min Reserve Target: 10</span>
        <span className="font-semibold text-slate-700">
          {units >= 10 ? '✓ Target Met' : `${10 - units} needed`}
        </span>
      </div>
    </div>
  );
};

export default StockLevelCard;
