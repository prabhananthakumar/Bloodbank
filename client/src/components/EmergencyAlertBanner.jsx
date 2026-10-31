import React from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmergencyAlertBanner = ({ criticalGroups = [] }) => {
  if (!criticalGroups || criticalGroups.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white py-2.5 px-4 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="p-1 bg-white/20 rounded-full animate-pulse">
            <AlertTriangle className="w-4 h-4 text-amber-300" />
          </span>
          <span className="font-semibold tracking-wide">CRITICAL STOCK SHORTAGE:</span>
          <span>
            Blood bank reserves are critically low for:{' '}
            <strong className="underline underline-offset-2">
              {criticalGroups.join(', ')}
            </strong>
            . Donors are urgently needed.
          </span>
        </div>
        <Link
          to="/register?role=donor"
          className="text-xs bg-white text-red-700 font-bold px-3 py-1 rounded-full shadow hover:bg-red-50 transition flex items-center gap-1 shrink-0"
        >
          Donate Now <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default EmergencyAlertBanner;
