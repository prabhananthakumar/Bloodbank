import React from 'react';
import BloodCompatibilityMatrix from '../components/BloodCompatibilityMatrix';
import { Droplet, ShieldCheck, AlertCircle, Heart } from 'lucide-react';

const CompatibilityChecker = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <div>
        <span className="text-xs uppercase font-bold text-red-600 tracking-wider">
          Transfusion Medicine Simulator
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">
          Blood Group Cross-Match & Compatibility Engine
        </h1>
        <p className="text-sm text-slate-500 mt-2 max-w-2xl">
          Understand which blood types and components can be safely transfused without triggering fatal immunological reactions.
        </p>
      </div>

      <BloodCompatibilityMatrix />

      {/* Clinical Explanation Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
            <Droplet className="w-5 h-5 fill-current" />
            Red Blood Cell / PRBC Rules
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            Why O- Negative is the Universal Red Cell Donor
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Red blood cells have A, B, and Rh (D) antigens on their surface. Blood group O has neither A nor B antigens, and Rh-negative lacks the Rh antigen. Because there are no antigens for the recipient's immune system to attack, O- negative packed red cells can be given to virtually any emergency patient when there is no time for cross-matching.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
            <ShieldCheck className="w-5 h-5" />
            Plasma Transfusion Rules
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            Why AB+ is the Universal Plasma Donor
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            In fresh frozen plasma (FFP), the logic is the exact reverse of red blood cells. Plasma contains antibodies against absent antigens. People with AB blood have no anti-A or anti-B antibodies in their plasma, which makes their plasma universally safe for all recipients (A, B, AB, and O).
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompatibilityChecker;
