import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Droplet, Heart, Building2, User, AlertCircle, ArrowRight } from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const Register = () => {
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') || 'donor';

  const [role, setRole] = useState(defaultRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [weightKg, setWeightKg] = useState('65');
  const [city, setCity] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        name: role === 'hospital' ? hospitalName || name : name,
        email,
        password,
        role,
        phone,
        bloodGroup: role === 'donor' || role === 'recipient' ? bloodGroup : 'Unknown',
        address: { city },
        donorProfile: role === 'donor' ? { weightKg: Number(weightKg) } : undefined,
        hospitalDetails: role === 'hospital' ? { hospitalName, licenseNumber, emergencyContact: phone } : undefined
      };

      const res = await register(payload);
      if (res.user.role === 'donor') {
        navigate('/donor-dashboard');
      } else if (res.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/recipient-dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-red-500/30">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Join the HemoSync Network
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Choose your account role to complete registration
          </p>
        </div>

        {/* Role Picker */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setRole('donor')}
            className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
              role === 'donor'
                ? 'bg-red-50 border-red-500 text-red-700 ring-2 ring-red-200'
                : 'border-slate-200 hover:bg-slate-50 text-slate-600'
            }`}
          >
            <Heart className="w-5 h-5 text-red-500" />
            <span className="text-xs font-bold">Blood Donor</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('recipient')}
            className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
              role === 'recipient'
                ? 'bg-purple-50 border-purple-500 text-purple-700 ring-2 ring-purple-200'
                : 'border-slate-200 hover:bg-slate-50 text-slate-600'
            }`}
          >
            <User className="w-5 h-5 text-purple-500" />
            <span className="text-xs font-bold">Patient / Recipient</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('hospital')}
            className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
              role === 'hospital'
                ? 'bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-200'
                : 'border-slate-200 hover:bg-slate-50 text-slate-600'
            }`}
          >
            <Building2 className="w-5 h-5 text-blue-500" />
            <span className="text-xs font-bold">Hospital Org</span>
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                {role === 'hospital' ? 'Organization / Hospital Name' : 'Full Name'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === 'hospital' ? 'Metro General Hospital' : 'John Doe'}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1-555-0100"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              />
            </div>
          </div>

          {/* Role specific inputs */}
          {role !== 'hospital' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              {role === 'donor' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Approx Weight (kg)
                  </label>
                  <input
                    type="number"
                    min="45"
                    max="150"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Hospital License / Reg No.
                </label>
                <input
                  type="text"
                  required
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="HOSP-REG-98124"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  City / Jurisdiction
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Metro City"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md shadow-red-500/20 transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="text-red-600 font-bold hover:underline">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
