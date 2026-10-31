import React from 'react';
import { Droplet, Heart, PhoneCall, ShieldCheck, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white">
                <Droplet className="w-5 h-5 fill-current" />
              </div>
              <span className="text-xl font-bold text-white">HemoSync</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time centralized blood banking, cold-chain tracking, and precision cross-matching network saving lives 24/7.
            </p>
            <div className="flex items-center gap-2 text-xs text-rose-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>AABB & WHO Standard Compliant</span>
            </div>
          </div>

          {/* Emergency Hotline */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Emergency Dispatch
            </h4>
            <div className="bg-red-950/40 border border-red-800/50 p-3 rounded-xl space-y-2">
              <p className="text-xs text-red-300 font-medium">Critical Blood Requisition Hotline:</p>
              <div className="flex items-center gap-2 text-red-400 font-bold text-base">
                <PhoneCall className="w-4 h-4 text-red-500 animate-pulse" />
                <span>1-800-HEMO-SOS</span>
              </div>
              <p className="text-[11px] text-slate-400">24/7 Priority Transfusion Logistics</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Direct Access
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="/compatibility" className="hover:text-red-400 transition">
                  Blood Group Compatibility Tool
                </a>
              </li>
              <li>
                <a href="/camps" className="hover:text-red-400 transition">
                  Mobile Donation Camps & Drives
                </a>
              </li>
              <li>
                <a href="/register?role=hospital" className="hover:text-red-400 transition">
                  Hospital Partner Enrollment
                </a>
              </li>
              <li>
                <a href="/register?role=donor" className="hover:text-red-400 transition">
                  Become a Voluntary Regular Donor
                </a>
              </li>
            </ul>
          </div>

          {/* Safety & Compliance */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Clinical Quality
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              All blood units undergo rigorous 5-stage serological screening for HIV 1/2, HBV, HCV, Syphilis, and Malaria before release from quarantine.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>support@hemosync.org</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} HemoSync Blood Bank Management System. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-red-500 fill-current inline" /> for healthcare resilience
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
