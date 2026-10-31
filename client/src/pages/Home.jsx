import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { analyticsService, campService } from '../services/api';
import StockLevelCard from '../components/StockLevelCard';
import BloodCompatibilityMatrix from '../components/BloodCompatibilityMatrix';
import EmergencyAlertBanner from '../components/EmergencyAlertBanner';
import {
  Heart,
  Droplet,
  ShieldCheck,
  Calendar,
  ArrowRight,
  Clock,
  MapPin,
  Check,
  AlertCircle
} from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const Home = () => {
  const [metrics, setMetrics] = useState(null);
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricRes, campRes] = await Promise.all([
          analyticsService.getDashboardMetrics(),
          campService.getAllCamps({ status: 'Upcoming' })
        ]);
        if (metricRes.data.success) {
          setMetrics(metricRes.data.data);
        }
        if (campRes.data.success) {
          setCamps(campRes.data.data.slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching landing data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen space-y-16 pb-20">
      {/* Emergency Stock Shortage Banner */}
      {metrics && metrics.criticalShortages && (
        <EmergencyAlertBanner criticalGroups={metrics.criticalShortages} />
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 bg-gradient-to-b from-red-50/70 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 border border-red-200 text-red-800 text-xs font-bold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                CENTRALIZED BLOOD LOGISTICS NETWORK
              </div>

              <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Every Single Drop <br />
                <span className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 bg-clip-text text-transparent">
                  Powers a Second Chance.
                </span>
              </h1>

              <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
                HemoSync connects voluntary donors, transfusion medicine specialists, and trauma centers with real-time cold-chain tracking, algorithmic crossmatching, and rapid emergency dispatch.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/register?role=donor"
                  className="bg-red-600 text-white font-bold px-6 py-3.5 rounded-xl hover:bg-red-700 shadow-lg shadow-red-600/25 hover:shadow-red-600/40 transition flex items-center gap-2"
                >
                  <Heart className="w-5 h-5 fill-current" />
                  Become a Voluntary Donor
                </Link>

                <Link
                  to="/register?role=recipient"
                  className="bg-white text-slate-800 font-bold px-6 py-3.5 rounded-xl border border-slate-300 hover:border-slate-400 hover:bg-slate-50 shadow-sm transition flex items-center gap-2"
                >
                  Request Emergency Units
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Quick Trust Highlights */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200 text-slate-700">
                <div>
                  <div className="text-2xl font-black text-slate-900">
                    {metrics ? metrics.stats.availableUnits : '24'}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">Tested Units Available</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">
                    {metrics ? metrics.stats.totalDonors : '150+'}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">Registered Donors</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">&lt; 15 min</div>
                  <div className="text-xs text-slate-500 font-medium">Emergency Triage</div>
                </div>
              </div>
            </div>

            {/* Quick Compatibility Card Hero Teaser */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Droplet className="w-5 h-5 text-red-600" />
                    <span className="font-bold text-slate-800 text-sm">Real-time Stock Monitor</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                    LIVE REFRESH
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2.5 my-6">
                  {BLOOD_GROUPS.map((bg) => {
                    const count = metrics?.inventoryMap?.[bg] ?? 0;
                    return (
                      <div
                        key={bg}
                        className={`p-3 rounded-2xl text-center border transition ${
                          count < 5
                            ? 'bg-red-50/70 border-red-200'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <span className="text-sm font-black text-slate-800 block">{bg}</span>
                        <span
                          className={`text-xl font-black ${
                            count < 5 ? 'text-red-600' : 'text-slate-900'
                          }`}
                        >
                          {count}
                        </span>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">units</span>
                      </div>
                    );
                  })}
                </div>

                <Link
                  to="/compatibility"
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-center font-bold text-xs uppercase tracking-wider block transition"
                >
                  Launch Full Compatibility Tool →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Cold Vault Inventory Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-red-600 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              Verified & Screened Inventory
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900">
              Live Cold-Chain Inventory Vault
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Real-time count of tested units preserved at standard temperature (2°C - 6°C).
            </p>
          </div>
          <Link
            to="/register?role=hospital"
            className="text-xs font-bold text-red-600 hover:text-red-700 underline underline-offset-4"
          >
            Hospital Bulk Reservation →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {BLOOD_GROUPS.map((bg) => (
            <StockLevelCard
              key={bg}
              bloodGroup={bg}
              units={metrics?.inventoryMap?.[bg] ?? 0}
            />
          ))}
        </div>
      </section>

      {/* Interactive Compatibility Matrix Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BloodCompatibilityMatrix />
      </section>

      {/* Upcoming Blood Donation Camps */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <div className="flex items-center gap-2 text-rose-600 text-xs font-bold uppercase tracking-wider mb-1">
              <Calendar className="w-4 h-4" />
              Community Outreach
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900">
              Upcoming Blood Drives & Mobile Camps
            </h2>
          </div>
          <Link
            to="/camps"
            className="text-xs font-bold text-red-600 hover:text-red-700 underline underline-offset-4"
          >
            View All Camps →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {camps.map((camp) => (
            <div
              key={camp._id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-red-100 text-red-700">
                    {camp.status}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">
                    Target: {camp.targetUnits} units
                  </span>
                </div>

                <h3 className="font-bold text-lg text-slate-900 mb-2">{camp.title}</h3>
                <p className="text-xs text-slate-500 mb-4 line-clamp-2">{camp.description}</p>

                <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-red-500" />
                    <span>{new Date(camp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{camp.startTime} - {camp.endTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{camp.venue}, {camp.address?.city}</span>
                  </div>
                </div>
              </div>

              <Link
                to="/register?role=donor"
                className="mt-6 w-full py-2.5 bg-slate-100 hover:bg-red-600 hover:text-white text-slate-700 font-bold rounded-xl text-center text-xs transition"
              >
                RSVP & Donate at this Camp
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Donor Eligibility Quick Checklist */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12">
          <div className="max-w-3xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">
              Are You Eligible to Donate Blood?
            </h2>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              Standard clinical donor screening guidelines ensuring maximum safety for both the donor and recipient.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 bg-slate-800/60 p-4 rounded-xl border border-slate-700">
                <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-slate-200">Age: 18 - 65 Years</h4>
                  <p className="text-xs text-slate-400">In good general physical health.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-800/60 p-4 rounded-xl border border-slate-700">
                <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-slate-200">Weight: At least 50 kg (110 lbs)</h4>
                  <p className="text-xs text-slate-400">Guarantees safe blood volume withdrawal (350ml - 450ml).</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-800/60 p-4 rounded-xl border border-slate-700">
                <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-slate-200">Hemoglobin: ≥ 12.5 g/dL</h4>
                  <p className="text-xs text-slate-400">Rapid spot screening prior to each collection.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-800/60 p-4 rounded-xl border border-slate-700">
                <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-slate-200">Donation Interval: 56+ Days</h4>
                  <p className="text-xs text-slate-400">Minimum 8-week gap between whole blood donations.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
