import React, { useState } from 'react';
import { CheckCircle2, XCircle, Info, Sparkles } from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const COMPONENTS = [
  'Packed Red Blood Cells (PRBC)',
  'Whole Blood',
  'Fresh Frozen Plasma (FFP)',
  'Platelets'
];

const COMPATIBILITY_RULES = {
  'A+': {
    giveTo: ['A+', 'AB+'],
    receiveFrom: ['A+', 'A-', 'O+', 'O-']
  },
  'O+': {
    giveTo: ['O+', 'A+', 'B+', 'AB+'],
    receiveFrom: ['O+', 'O-']
  },
  'B+': {
    giveTo: ['B+', 'AB+'],
    receiveFrom: ['B+', 'B-', 'O+', 'O-']
  },
  'AB+': {
    giveTo: ['AB+'],
    receiveFrom: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] // Universal Recipient
  },
  'A-': {
    giveTo: ['A+', 'A-', 'AB+', 'AB-'],
    receiveFrom: ['A-', 'O-']
  },
  'O-': {
    giveTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], // Universal Red Cell Donor
    receiveFrom: ['O-']
  },
  'B-': {
    giveTo: ['B+', 'B-', 'AB+', 'AB-'],
    receiveFrom: ['B-', 'O-']
  },
  'AB-': {
    giveTo: ['AB+', 'AB-'],
    receiveFrom: ['AB-', 'A-', 'B-', 'O-']
  }
};

const BloodCompatibilityMatrix = () => {
  const [selectedRecipient, setSelectedRecipient] = useState('O-');
  const [selectedDonor, setSelectedDonor] = useState('O-');
  const [component, setComponent] = useState('Packed Red Blood Cells (PRBC)');

  const recipientRules = COMPATIBILITY_RULES[selectedRecipient] || { giveTo: [], receiveFrom: [] };
  const isMatch = recipientRules.receiveFrom.includes(selectedDonor);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-700 via-rose-700 to-red-800 text-white p-6 sm:p-8">
        <div className="flex items-center gap-2 text-rose-200 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          Clinical Precision Cross-Match
        </div>
        <h3 className="text-2xl sm:text-3xl font-extrabold">
          Blood Group Compatibility Matrix
        </h3>
        <p className="text-rose-100 text-sm mt-1 max-w-2xl">
          Instantly simulate donor-to-recipient crossmatching based on ABO antigen and Rh (D) factor transfusion rules.
        </p>
      </div>

      <div className="p-6 sm:p-8 space-y-8">
        {/* Component Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Selected Blood Component
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {COMPONENTS.map((comp) => (
              <button
                key={comp}
                type="button"
                onClick={() => setComponent(comp)}
                className={`text-xs font-semibold px-3 py-2.5 rounded-xl border transition text-center ${
                  component === comp
                    ? 'bg-red-600 text-white border-red-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {comp}
              </button>
            ))}
          </div>
        </div>

        {/* Selection Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Recipient Blood Group */}
          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-900">1. Recipient (Patient) Blood Group</span>
              <span className="text-xs text-slate-500">Who is receiving blood?</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {BLOOD_GROUPS.map((bg) => (
                <button
                  key={`rec-${bg}`}
                  type="button"
                  onClick={() => setSelectedRecipient(bg)}
                  className={`py-3 rounded-xl font-black text-base border transition ${
                    selectedRecipient === bg
                      ? 'bg-red-700 text-white border-red-700 ring-2 ring-red-300 shadow'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-red-300 hover:bg-red-50/50'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>

          {/* Donor Blood Group */}
          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-900">2. Potential Donor Blood Group</span>
              <span className="text-xs text-slate-500">Who is providing blood?</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {BLOOD_GROUPS.map((bg) => (
                <button
                  key={`don-${bg}`}
                  type="button"
                  onClick={() => setSelectedDonor(bg)}
                  className={`py-3 rounded-xl font-black text-base border transition ${
                    selectedDonor === bg
                      ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-slate-400 shadow'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Compatibility Verdict Banner */}
        <div
          className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-center gap-4 justify-between transition-all ${
            isMatch
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-rose-50 border-rose-300 text-rose-950'
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md ${
                isMatch ? 'bg-emerald-600' : 'bg-rose-600'
              }`}
            >
              {isMatch ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
            </div>
            <div>
              <h4 className="text-xl font-black">
                {isMatch
                  ? `Transfusion Compatible: ${selectedDonor} ➔ ${selectedRecipient}`
                  : `Incompatible: ${selectedDonor} ➔ ${selectedRecipient}`}
              </h4>
              <p className="text-xs mt-1 leading-relaxed opacity-90">
                {isMatch
                  ? `A donor with blood group ${selectedDonor} can safely transfuse ${component} to recipient ${selectedRecipient} without adverse hemolytic agglutination.`
                  : `Transfusing ${selectedDonor} into ${selectedRecipient} triggers acute hemolytic transfusion reaction (AHTR) due to anti-antigen antibodies.`}
              </p>
            </div>
          </div>

          <div className="shrink-0 bg-white px-4 py-2 rounded-xl border border-slate-200 text-center shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Compatibility</span>
            <span
              className={`text-lg font-black ${
                isMatch ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {isMatch ? 'SAFE MATCH' : 'DO NOT TRANSFUSE'}
            </span>
          </div>
        </div>

        {/* Full Compatible Donor Breakdown */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-slate-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              All Eligible Donors for Recipient {selectedRecipient}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {recipientRules.receiveFrom.map((bg) => (
              <span
                key={bg}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 font-bold text-sm shadow-sm"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {bg}
              </span>
            ))}
          </div>

          <p className="text-xs text-slate-500 mt-3 italic">
            {selectedRecipient === 'AB+' && '🌟 AB+ is the Universal Recipient for Red Blood Cells.'}
            {selectedRecipient === 'O-' && '🛡️ O- recipients can only safely receive red cells from O- donors.'}
            {selectedDonor === 'O-' && '🌟 O- is the Universal Donor for Red Blood Cells.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BloodCompatibilityMatrix;
