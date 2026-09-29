import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBusiness } from '../context/BusinessContext';
import { Building2, ChevronDown, Plus, LogOut, User as UserIcon, Sparkles } from 'lucide-react';

interface NavbarProps {
  onOpenOnboarding: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenOnboarding }) => {
  const { user, logout } = useAuth();
  const { businesses, activeBusiness, setActiveBusiness } = useBusiness();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between">
      {/* Brand Logo & Name */}
      <div className="flex items-center space-x-3">
        <div className="bg-gradient-to-tr from-brand-600 to-indigo-500 p-2.5 rounded-xl shadow-lg shadow-brand-500/20">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            LocalSEO Pulse
          </span>
          <span className="ml-2 text-[10px] font-semibold bg-brand-500/20 text-brand-300 px-2 py-0.5 rounded-full border border-brand-500/30 uppercase tracking-widest">
            Search Intelligence
          </span>
        </div>
      </div>

      {/* Multi-Business Switcher & Actions */}
      <div className="flex items-center space-x-4">
        {/* Business Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm font-medium text-slate-200 transition shadow-sm"
          >
            <Building2 className="w-4 h-4 text-brand-400" />
            <div className="text-left max-w-[180px] truncate">
              {activeBusiness ? (
                <span className="font-semibold block truncate">{activeBusiness.business.name}</span>
              ) : (
                <span className="text-slate-400">Select Business</span>
              )}
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-slate-850 border border-slate-700/90 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Your Businesses ({businesses.length})
              </div>
              <div className="max-h-60 overflow-y-auto py-1">
                {businesses.map(b => (
                  <button
                    key={b.business.id}
                    onClick={() => {
                      setActiveBusiness(b);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-slate-800 transition ${
                      activeBusiness?.business.id === b.business.id
                        ? 'bg-brand-500/10 text-brand-400 font-semibold border-l-4 border-brand-500'
                        : 'text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{b.business.name}</div>
                      <div className="text-xs text-slate-400 font-normal">
                        {b.location.city}, {b.location.country}
                      </div>
                    </div>
                    {activeBusiness?.business.id === b.business.id && (
                      <span className="w-2 h-2 rounded-full bg-brand-400 shadow-glow"></span>
                    )}
                  </button>
                ))}
              </div>

              <div className="p-2 border-t border-slate-800 mt-1">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onOpenOnboarding();
                  }}
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold py-2 px-3 rounded-xl transition shadow-md shadow-brand-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Onboard New Business</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Add Business Quick Button */}
        <button
          onClick={onOpenOnboarding}
          className="hidden md:flex items-center space-x-1.5 bg-brand-500/15 hover:bg-brand-500/25 border border-brand-500/30 text-brand-300 text-xs font-semibold px-3 py-2 rounded-xl transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Location</span>
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdown(!profileDropdown)}
            className="flex items-center space-x-2 bg-slate-800 p-2 rounded-xl hover:bg-slate-750 transition border border-slate-700/60"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
          </button>

          {profileDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-850 border border-slate-700/90 rounded-2xl shadow-2xl py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-800">
                <div className="text-sm font-semibold text-white">{user?.full_name}</div>
                <div className="text-xs text-slate-400 truncate">{user?.email}</div>
              </div>
              <button
                onClick={() => {
                  setProfileDropdown(false);
                  logout();
                }}
                className="w-full text-left px-4 py-2.5 text-xs text-red-400 hover:bg-slate-800 flex items-center space-x-2 transition mt-1"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
