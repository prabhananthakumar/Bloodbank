import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Droplet, Heart, ShieldAlert, LogOut, User as UserIcon, Calendar, Layers, Activity } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-red-500/20 group-hover:scale-105 transition">
              <Droplet className="w-6 h-6 fill-current" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-red-700 to-rose-600 bg-clip-text text-transparent">
                HemoSync
              </span>
              <span className="text-[10px] block font-semibold text-slate-400 tracking-wider uppercase -mt-1">
                Blood Transfusion Network
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link to="/" className="hover:text-red-600 transition flex items-center gap-1.5">
              Overview
            </Link>
            <Link to="/camps" className="hover:text-red-600 transition flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Donation Camps
            </Link>
            <Link to="/compatibility" className="hover:text-red-600 transition flex items-center gap-1.5">
              <Activity className="w-4 h-4" />
              Compatibility Matrix
            </Link>

            {/* Role-specific dashboard links */}
            {user && (user.role === 'admin' || user.role === 'superadmin') && (
              <>
                <Link to="/admin" className="text-red-600 font-semibold hover:text-red-700 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  Admin Console
                </Link>
                <Link to="/admin/inventory" className="hover:text-red-600 transition flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  Inventory
                </Link>
                <Link to="/admin/requests" className="hover:text-red-600 transition">
                  Requisitions
                </Link>
              </>
            )}

            {user && user.role === 'donor' && (
              <Link to="/donor-dashboard" className="text-red-600 font-semibold hover:text-red-700 flex items-center gap-1.5">
                <Heart className="w-4 h-4 fill-current text-rose-500" />
                Donor Hub
              </Link>
            )}

            {user && (user.role === 'recipient' || user.role === 'hospital') && (
              <Link to="/recipient-dashboard" className="text-red-600 font-semibold hover:text-red-700">
                Blood Requests
              </Link>
            )}
          </nav>

          {/* User Auth Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-800">{user.name}</span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700 self-end">
                    {user.role} {user.bloodGroup !== 'Unknown' && `(${user.bloodGroup})`}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-700 hover:text-red-600 px-3 py-2 rounded-lg transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 shadow-sm shadow-red-500/20 transition flex items-center gap-1.5"
                >
                  <Heart className="w-4 h-4" />
                  Donate Blood
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
