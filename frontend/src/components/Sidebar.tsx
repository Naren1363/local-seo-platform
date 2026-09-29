import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  Users,
  SearchCheck,
  KeyRound,
  Lightbulb,
  CheckSquare,
  FileText,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/', label: 'Overview Dashboard', icon: LayoutDashboard },
    { to: '/nearby', label: 'Local Intelligence', icon: MapPin },
    { to: '/competitors', label: 'Competitor Intelligence', icon: Users },
    { to: '/audit', label: 'Website SEO Audit', icon: SearchCheck },
    { to: '/keywords', label: 'Keyword Intelligence', icon: KeyRound },
    { to: '/recommendations', label: 'Action Recommendations', icon: CheckSquare },
    { to: '/opportunities', label: 'Local Opportunities', icon: Lightbulb },
    { to: '/reports', label: 'SEO Reports', icon: FileText },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-[calc(100vh-61px)] sticky top-[61px] p-4 text-slate-300">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Platform Navigation
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Footer Info Card */}
      <div className="bg-slate-850 border border-slate-800 rounded-2xl p-3.5 text-xs text-slate-400">
        <div className="font-semibold text-slate-200 mb-1">Local SEO Engine 2.0</div>
        <p className="text-[11px] leading-relaxed text-slate-400">
          Spatial search, competitor matrix & real-time website auditor.
        </p>
      </div>
    </aside>
  );
};
