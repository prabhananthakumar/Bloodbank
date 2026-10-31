import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { analyticsService } from '../services/api';
import {
  ShieldAlert,
  Droplet,
  Layers,
  FileText,
  Calendar,
  AlertTriangle,
  Clock,
  ArrowRight,
  UserCheck
} from 'lucide-react';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await analyticsService.getDashboardMetrics();
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = data?.stats;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase font-bold text-red-600 tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            Administrative Command Center
          </div>
          <h1 className="text-3xl font-black text-slate-900 mt-1">
            Central Blood Bank Operations
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/inventory"
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-sm transition flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4" />
            Vault Ledger
          </Link>
          <Link
            to="/admin/requests"
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-sm transition flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" />
            Requisitions ({stats?.pendingRequests || 0})
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Available Tested Stock */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs uppercase font-bold text-slate-400">Available Vault Stock</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Droplet className="w-5 h-5 fill-current" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{stats?.availableUnits || 0}</div>
          <p className="text-xs text-slate-500 mt-1">Tested & approved for immediate transfusion</p>
        </div>

        {/* Quarantine Laboratory Units */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs uppercase font-bold text-slate-400">Quarantine Units</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{stats?.quarantineUnits || 0}</div>
          <p className="text-xs text-slate-500 mt-1">Awaiting viral serology screening results</p>
        </div>

        {/* Pending Requisitions */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs uppercase font-bold text-slate-400">Pending Orders</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-600">{stats?.pendingRequests || 0}</div>
          <p className="text-xs text-slate-500 mt-1">Hospital & patient requests awaiting triage</p>
        </div>

        {/* Registered Donors */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs uppercase font-bold text-slate-400">Voluntary Donors</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{stats?.totalDonors || 0}</div>
          <p className="text-xs text-slate-500 mt-1">Enrolled lifesaver network participants</p>
        </div>
      </div>

      {/* Critical Stock Distribution Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Cold Vault Breakdown by Blood Type</h2>
            <p className="text-xs text-slate-500">Inventory levels across ABO/Rh groups</p>
          </div>
          <Link
            to="/admin/inventory"
            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            Manage Detailed Ledger <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => {
            const count = data?.inventoryMap?.[bg] ?? 0;
            const isLow = count < 5;
            return (
              <div
                key={bg}
                className={`p-4 rounded-2xl border text-center transition ${
                  isLow
                    ? 'bg-red-50/60 border-red-200 ring-1 ring-red-300'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <span className="text-xs uppercase font-extrabold text-slate-400 block">{bg}</span>
                <span
                  className={`text-2xl font-black my-1 block ${
                    isLow ? 'text-red-600' : 'text-slate-900'
                  }`}
                >
                  {count}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    isLow ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {isLow ? 'Low' : 'Adequate'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Access Operational Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold mb-2">Vault & Testing Ledger</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Register new collected bags, log NAT/ELISA test results (HIV, Hepatitis B/C, Syphilis), and release units from quarantine to available vault stock.
            </p>
          </div>
          <Link
            to="/admin/inventory"
            className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-center text-xs font-bold uppercase tracking-wider block transition"
          >
            Open Inventory System
          </Link>
        </div>

        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold mb-2">Requisition & Dispatch Triage</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Review emergency transfusions, run automated compatibility matching algorithm to reserve bags, and confirm barcode-verified courier dispatch.
            </p>
          </div>
          <Link
            to="/admin/requests"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-center text-xs font-bold uppercase tracking-wider block transition"
          >
            Review Requisitions
          </Link>
        </div>

        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-4">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold mb-2">Donation Camps & Outreach</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Plan and publish community blood collection drives, monitor target quotas vs collections, and manage on-site mobile phlebotomy teams.
            </p>
          </div>
          <Link
            to="/camps"
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-center text-xs font-bold uppercase tracking-wider block transition"
          >
            Organize Camps
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
