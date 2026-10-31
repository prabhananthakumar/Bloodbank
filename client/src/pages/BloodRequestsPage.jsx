import React, { useEffect, useState } from 'react';
import { requestService } from '../services/api';
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Truck,
  Sparkles,
  Search,
  User,
  Hospital
} from 'lucide-react';

const BloodRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterUrgency, setFilterUrgency] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [message, setMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await requestService.getAllRequests({
        urgency: filterUrgency || undefined,
        status: filterStatus || undefined
      });
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
  }, [filterUrgency, filterStatus]);

  const handleReview = async (id, status, autoAllocate = false) => {
    try {
      setActionLoading(true);
      const res = await requestService.reviewRequest(id, {
        status,
        autoAllocate,
        adminRemarks: autoAllocate
          ? 'Approved with automatic compatibility allocation'
          : `Reviewed: ${status}`
      });
      if (res.data.success) {
        setMessage(`Requisition marked as ${status}`);
        fetchRequests();
        setTimeout(() => setMessage(''), 3500);
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDispatch = async (id) => {
    if (!window.confirm('Confirm physical dispatch of allocated blood units?')) return;
    try {
      setActionLoading(true);
      const res = await requestService.dispatchRequest(id);
      if (res.data.success) {
        setMessage('Blood units successfully dispatched! Requisition fulfilled.');
        fetchRequests();
        setTimeout(() => setMessage(''), 3500);
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs uppercase font-bold text-red-600 tracking-wider">
          Requisition Command
        </span>
        <h1 className="text-3xl font-black text-slate-900 mt-1">
          Hospital & Patient Requisition Triage
        </h1>
        <p className="text-xs text-slate-500">
          Review clinical transfusion requests, auto-allocate crossmatch-compatible bags, and dispatch orders
        </p>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {message}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-3">
        <select
          value={filterUrgency}
          onChange={(e) => setFilterUrgency(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 text-slate-700"
        >
          <option value="">All Urgencies</option>
          <option value="Critical/Emergency">🚨 Critical / Emergency</option>
          <option value="High">High Urgency</option>
          <option value="Normal">Normal</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 text-slate-700"
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending Review</option>
          <option value="Approved">Approved (Bags Allocated)</option>
          <option value="Fulfilled">Fulfilled (Dispatched)</option>
          <option value="Rejected">Rejected</option>
        </select>

        <button
          onClick={() => { setFilterUrgency(''); setFilterStatus(''); }}
          className="text-xs text-slate-500 hover:text-red-600 underline"
        >
          Reset Filters
        </button>
      </div>

      {/* Requests Feed */}
      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-400 text-sm border border-slate-200">
            No blood requests found under the current filter criteria.
          </div>
        ) : (
          requests.map((req) => (
            <div
              key={req._id}
              className={`bg-white rounded-3xl border p-6 shadow-sm transition hover:shadow-md ${
                req.urgency === 'Critical/Emergency' && req.status === 'Pending'
                  ? 'border-red-300 ring-2 ring-red-100'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-700 font-black text-xl flex items-center justify-center border border-red-100 shadow-sm">
                    {req.bloodGroup}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 text-sm">{req.requestId}</span>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          req.urgency === 'Critical/Emergency'
                            ? 'bg-red-100 text-red-700 animate-pulse'
                            : req.urgency === 'High'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {req.urgency}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
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
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Patient: <strong className="text-slate-800">{req.patientName}</strong> ({req.patientAge} yrs) • Hospital: <strong className="text-slate-800">{req.hospitalName}</strong>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-black text-slate-900">{req.unitsRequired}</span>
                  <span className="text-xs text-slate-500 ml-1 font-semibold">Unit(s) of {req.component}</span>
                </div>
              </div>

              {/* Diagnosis & Allocated Bags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-700 block mb-1">Clinical Diagnosis / Indication:</span>
                  <p className="text-slate-600 leading-relaxed">{req.clinicalDiagnosis}</p>
                  {req.doctorName && (
                    <span className="text-[11px] text-slate-400 block mt-1">Prescribing Doctor: {req.doctorName}</span>
                  )}
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-700 block mb-1">Allocated Cold Vault Units:</span>
                  {req.allocatedBags?.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {req.allocatedBags.map((bag) => (
                        <span
                          key={bag._id}
                          className="px-2 py-1 bg-white border border-slate-200 text-slate-800 rounded font-mono font-bold text-[11px] shadow-sm"
                        >
                          🏷️ {bag.bagBarcode} ({bag.bloodGroup})
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">No units allocated yet.</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                <span className="text-slate-400">
                  Requested: {new Date(req.createdAt).toLocaleString()}
                </span>

                <div className="flex items-center gap-2">
                  {req.status === 'Pending' && (
                    <>
                      <button
                        disabled={actionLoading}
                        onClick={() => handleReview(req._id, 'Rejected')}
                        className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold transition"
                      >
                        Reject
                      </button>

                      <button
                        disabled={actionLoading}
                        onClick={() => handleReview(req._id, 'Approved', true)}
                        className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-sm transition flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Auto-Allocate & Approve
                      </button>
                    </>
                  )}

                  {req.status === 'Approved' && (
                    <button
                      disabled={actionLoading}
                      onClick={() => handleDispatch(req._id)}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm transition flex items-center gap-1.5"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      Confirm Dispatch Out of Vault
                    </button>
                  )}

                  {req.status === 'Fulfilled' && (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Units Dispatched
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BloodRequestsPage;
