import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { donationService, campService } from '../services/api';
import {
  Heart,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Award,
  AlertCircle,
  PlusCircle,
  Droplet
} from 'lucide-react';

const DonorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking Form State
  const [showModal, setShowModal] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('10:00 AM');
  const [selectedCamp, setSelectedCamp] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');

  const fetchDashboardData = async () => {
    try {
      const [appRes, campRes] = await Promise.all([
        donationService.getMyAppointments(),
        campService.getAllCamps({ status: 'Upcoming' })
      ]);
      if (appRes.data.success) setAppointments(appRes.data.data);
      if (campRes.data.success) setCamps(campRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Compute eligibility
  let daysSince = null;
  let isEligible = true;
  if (user?.donorProfile?.lastDonationDate) {
    const diffTime = Math.abs(new Date() - new Date(user.donorProfile.lastDonationDate));
    daysSince = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (daysSince < 56) isEligible = false;
  }

  const handleBook = async (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingSuccess('');

    try {
      const res = await donationService.bookAppointment({
        scheduledDate,
        timeSlot,
        bloodCamp: selectedCamp || undefined,
        donationCenter: selectedCamp ? undefined : 'Central Blood Bank & Transfusion Center'
      });

      if (res.data.success) {
        setBookingSuccess('Appointment confirmed successfully!');
        setTimeout(() => {
          setShowModal(false);
          setBookingSuccess('');
          fetchDashboardData();
        }, 1500);
      }
    } catch (err) {
      setBookingError(err.response?.data?.message || err.message || 'Booking failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs uppercase font-bold text-red-600 tracking-wider">
            Donor Life-Line Portal
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-1">
            Welcome back, {user?.name}
          </h1>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-3 rounded-xl shadow-md shadow-red-500/20 transition flex items-center gap-2 text-sm"
        >
          <PlusCircle className="w-4 h-4" />
          Schedule Donation
        </button>
      </div>

      {/* Cards Row: Digital Donor Card & Eligibility Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Digital Donor Card */}
        <div className="md:col-span-2 bg-gradient-to-tr from-red-700 via-rose-700 to-red-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 pointer-events-none" />

          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-2 text-rose-200 text-xs font-bold uppercase tracking-wider mb-1">
                <Award className="w-4 h-4 text-amber-300" />
                Official Voluntary Donor Card
              </div>
              <h2 className="text-2xl font-black">{user?.name}</h2>
              <span className="text-xs text-rose-200 font-mono">ID: {user?._id?.substring(0, 10).toUpperCase()}</span>
            </div>

            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center border border-white/20">
              <span className="text-[10px] uppercase font-bold text-rose-200">Group</span>
              <span className="text-2xl font-black text-white">{user?.bloodGroup}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/20 text-xs">
            <div>
              <span className="text-rose-200 block text-[11px]">Total Donations</span>
              <span className="text-2xl font-extrabold text-white">
                {user?.donorProfile?.totalDonations || 0}
              </span>
            </div>
            <div>
              <span className="text-rose-200 block text-[11px]">Lives Impacted</span>
              <span className="text-2xl font-extrabold text-white">
                {(user?.donorProfile?.totalDonations || 0) * 3}
              </span>
            </div>
            <div>
              <span className="text-rose-200 block text-[11px]">Donor Status</span>
              <span className="text-sm font-bold text-emerald-300 flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-4 h-4" /> Active Hero
              </span>
            </div>
          </div>
        </div>

        {/* Eligibility Status */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
              Donation Eligibility
            </h3>

            {isEligible ? (
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-sm font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  Eligible to Donate Today!
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Your physiological recovery period is complete. Reserve an appointment to replenish emergency reserves.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-amber-800 text-sm font-bold">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  Cooling Down: {56 - (daysSince || 0)} Days Remaining
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  You donated {daysSince} days ago. Medical safety protocols require at least 56 days between donations.
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 space-y-1">
            <p>Last Donation: {user?.donorProfile?.lastDonationDate ? new Date(user.donorProfile.lastDonationDate).toLocaleDateString() : 'Never'}</p>
            <p>Recommended component: Whole Blood / PRBC</p>
          </div>
        </div>
      </div>

      {/* Appointment History */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-red-600" />
          My Donation Appointments
        </h3>

        {appointments.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            <Heart className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            No donation appointments yet. Schedule your first one above!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Collected Bag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      {app.appointmentCode}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">
                        {new Date(app.scheduledDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-slate-400">{app.timeSlot}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {app.bloodCamp ? app.bloodCamp.title : app.donationCenter}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          app.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-700'
                            : app.status === 'Scheduled'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                      {app.collectedBag?.bagBarcode || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">
                Book Donation Appointment
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {bookingError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                {bookingError}
              </div>
            )}
            {bookingSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700">
                {bookingSuccess}
              </div>
            )}

            <form onSubmit={handleBook} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Preferred Date
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Time Slot
                </label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm bg-white"
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:30 AM">11:30 AM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="03:30 PM">03:30 PM</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Select Venue / Camp
                </label>
                <select
                  value={selectedCamp}
                  onChange={(e) => setSelectedCamp(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm bg-white"
                >
                  <option value="">Central Blood Bank & Transfusion Center</option>
                  {camps.map((camp) => (
                    <option key={camp._id} value={camp._id}>
                      {camp.title} ({camp.venue})
                    </option>
                  ))}
                </select>
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
                  Confirm Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonorDashboard;
