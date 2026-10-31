import React, { useEffect, useState } from 'react';
import { campService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Clock,
  MapPin,
  PlusCircle,
  Users,
  Search,
  Building,
  Heart
} from 'lucide-react';

const DonationCampsPage = () => {
  const { user } = useAuth();
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState('');

  // Admin Create Camp Modal
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('05:00 PM');
  const [targetUnits, setTargetUnits] = useState(100);
  const [description, setDescription] = useState('');

  const fetchCamps = async () => {
    try {
      setLoading(true);
      const res = await campService.getAllCamps({ city: cityFilter || undefined });
      if (res.data.success) {
        setCamps(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCamps();
  }, [cityFilter]);

  const handleCreateCamp = async (e) => {
    e.preventDefault();
    try {
      const res = await campService.createCamp({
        title,
        organizer,
        venue,
        address: { city },
        date,
        startTime,
        endTime,
        targetUnits: Number(targetUnits),
        description
      });
      if (res.data.success) {
        setShowModal(false);
        fetchCamps();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs uppercase font-bold text-red-600 tracking-wider">
            Community Drives
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-1">
            Mobile Blood Donation Drives
          </h1>
          <p className="text-xs text-slate-500">
            Find an upcoming voluntary blood drive in your city or corporate park
          </p>
        </div>

        {user && (user.role === 'admin' || user.role === 'superadmin') && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-3 rounded-xl shadow-md shadow-red-500/20 transition flex items-center gap-2 text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Publish New Camp
          </button>
        )}
      </div>

      {/* City Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 max-w-md">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Filter by city (e.g. Metro City)..."
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="w-full text-xs text-slate-700 focus:outline-none"
        />
        {cityFilter && (
          <button onClick={() => setCityFilter('')} className="text-xs text-slate-400 hover:text-slate-600">
            Clear
          </button>
        )}
      </div>

      {/* Camps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {camps.map((camp) => (
          <div
            key={camp._id}
            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-red-100 text-red-700">
                  {camp.status}
                </span>
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {camp.registeredDonorsCount} Registered
                </span>
              </div>

              <h3 className="font-extrabold text-xl text-slate-900 mb-1">{camp.title}</h3>
              <p className="text-xs text-slate-500 font-medium mb-3">Organized by {camp.organizer}</p>
              <p className="text-xs text-slate-600 line-clamp-3 mb-6 leading-relaxed">{camp.description}</p>

              <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <Calendar className="w-4 h-4 text-red-500" />
                  <span>
                    {new Date(camp.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{camp.startTime} - {camp.endTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{camp.venue}, {camp.address?.city}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Target Units</span>
                <span className="text-lg font-black text-slate-900">{camp.targetUnits}</span>
              </div>
              <a
                href={`/register?role=donor`}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5"
              >
                <Heart className="w-3.5 h-3.5 fill-current" />
                Register as Donor
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Admin Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">Publish Blood Donation Camp</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateCamp} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase text-slate-600 mb-1">Camp Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. City Tech Park Lifesaver Camp"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-slate-600 mb-1">Organizer</label>
                  <input
                    type="text"
                    required
                    value={organizer}
                    onChange={(e) => setOrganizer(e.target.value)}
                    placeholder="e.g. Red Cross Chapter"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-slate-600 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Metro City"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-600 mb-1">Venue Details</label>
                <input
                  type="text"
                  required
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. Innovation Center, Ground Hall"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold uppercase text-slate-600 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-slate-600 mb-1">Start Time</label>
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-slate-600 mb-1">End Time</label>
                  <input
                    type="text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-600 mb-1">Target Units Goal</label>
                <input
                  type="number"
                  value={targetUnits}
                  onChange={(e) => setTargetUnits(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-600 mb-1">Camp Overview / Description</label>
                <textarea
                  rows="2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe registration steps, donor refreshments, etc."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-md shadow-red-500/20"
                >
                  Publish Camp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationCampsPage;
