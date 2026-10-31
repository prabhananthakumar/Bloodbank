import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { requestService } from '../services/api';
import {
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Droplet
} from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const COMPONENTS = [
  'Packed Red Blood Cells (PRBC)',
  'Whole Blood',
  'Fresh Frozen Plasma (FFP)',
  'Platelets',
  'Cryoprecipitate'
];

const RecipientDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('Male');
  const [hospitalName, setHospitalName] = useState(user?.hospitalDetails?.hospitalName || '');
  const [doctorName, setDoctorName] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [component, setComponent] = useState('Packed Red Blood Cells (PRBC)');
  const [unitsRequired, setUnitsRequired] = useState(1);
  const [urgency, setUrgency] = useState('Normal');
  const [clinicalDiagnosis, setClinicalDiagnosis] = useState('');
  const [deliveryStreet, setDeliveryStreet] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('');

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const fetchRequests = async () => {
    try {
      const res = await requestService.getMyRequests();
      if (res.data.success) {
        setRequests(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    try {
      const payload = {
        patientName,
        patientAge: Number(patientAge),
        patientGender,
        hospitalName,
        doctorName,
        bloodGroup,
        component,
        unitsRequired: Number(unitsRequired),
        urgency,
        clinicalDiagnosis,
        deliveryAddress: {
          street: deliveryStreet,
          city: deliveryCity
        }
      };

      const res = await requestService.create(payload);
      if (res.data.success) {
        setFormSuccess('Blood requisition submitted to triage queue!');
        setTimeout(() => {
          setShowModal(false);
          setFormSuccess('');
          fetchRequests();
        }, 1500);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Submission failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs uppercase font-bold text-red-600 tracking-wider">
            Requisition Console
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-1">
            Blood Units Requisition
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit critical clinical transfusion orders directly to the blood bank cold vault
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-3 rounded-xl shadow-md shadow-red-500/20 transition flex items-center gap-2 text-sm"
        >
          <PlusCircle className="w-4 h-4" />
          Raise Blood Requisition
        </button>
      </div>

      {/* Requests Ledger */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <FileText className="w-5 h-5 text-red-600" />
          My Blood Requisitions
        </h3>

        {requests.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            <Droplet className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            No active blood requests filed. Use the button above to request units.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Req ID</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Blood & Component</th>
                  <th className="py-3 px-4">Units</th>
                  <th className="py-3 px-4">Urgency</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Allocated Bags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((req) => (
                  <tr key={req._id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      {req.requestId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{req.patientName}</div>
                      <div className="text-xs text-slate-400">
                        {req.hospitalName} (Age: {req.patientAge})
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-black text-red-600 mr-1.5">{req.bloodGroup}</span>
                      <span className="text-xs text-slate-600">{req.component}</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {req.unitsRequired} unit(s)
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          req.urgency === 'Critical/Emergency'
                            ? 'bg-red-100 text-red-700 border border-red-300 animate-pulse'
                            : req.urgency === 'High'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {req.urgency}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          req.status === 'Fulfilled'
                            ? 'bg-emerald-100 text-emerald-800'
                            : req.status === 'Approved'
                            ? 'bg-blue-100 text-blue-800'
                            : req.status === 'Rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                      {req.allocatedBags?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {req.allocatedBags.map((bag) => (
                            <span key={bag._id} className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-bold">
                              {bag.bagBarcode}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Pending review</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Raise Requisition Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">
                Blood Requisition Order Form
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                {formError}
              </div>
            )}
            {formSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700">
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Patient Name
                  </label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Patient full name"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="120"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Hospital / Facility Name
                  </label>
                  <input
                    type="text"
                    required
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    placeholder="e.g. City General Hospital"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Attending Physician
                  </label>
                  <input
                    type="text"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    placeholder="Dr. Gregory House"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Blood Group
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm bg-white"
                  >
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Component Type
                  </label>
                  <select
                    value={component}
                    onChange={(e) => setComponent(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm bg-white"
                  >
                    {COMPONENTS.map((comp) => (
                      <option key={comp} value={comp}>{comp}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Units Required
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={unitsRequired}
                    onChange={(e) => setUnitsRequired(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Urgency Level
                  </label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm bg-white font-bold"
                  >
                    <option value="Normal">Normal (Elective / Scheduled)</option>
                    <option value="High">High (Transfusion in &lt; 6 hrs)</option>
                    <option value="Critical/Emergency">🚨 Critical / Code Red (Immediate)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Clinical Diagnosis / Reason for Requisition
                </label>
                <textarea
                  required
                  rows="2"
                  value={clinicalDiagnosis}
                  onChange={(e) => setClinicalDiagnosis(e.target.value)}
                  placeholder="e.g. Acute hemorrhagic shock secondary to trauma; or Thalassemia scheduled transfusion"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-md shadow-red-500/20"
                >
                  Dispatch Requisition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipientDashboard;
