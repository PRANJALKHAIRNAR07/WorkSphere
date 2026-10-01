import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  Calendar,
  BarChart3,
  Bell,
  User,
  LogOut,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/projects', icon: FolderKanban },
    { name: 'Kanban Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Teams', href: '/teams', icon: Users },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Notifications', href: '/notifications', icon: Bell },
    { name: 'Profile Settings', href: '/profile', icon: User },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#153D7A] text-white transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between shadow-xl`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2563C7] flex items-center justify-center shadow-glow border border-white/20">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight text-white">
                  WorkSphere
                </span>
                <span className="block text-[10px] font-semibold text-blue-200 uppercase tracking-widest">
                  Enterprise SaaS
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="px-3 py-6 space-y-1">
            <p className="px-3 text-[11px] font-bold text-blue-200/70 uppercase tracking-wider mb-2">
              Main Navigation
            </p>
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.href);
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#2563C7] text-white font-semibold shadow-glow'
                      : 'text-blue-100/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-blue-200'}`} />
                    <span>{item.name}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-white/80" />}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-white/10 bg-[#113264]">
          <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#2563C7] border border-white/30 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="truncate min-w-0">
                <p className="text-sm font-bold text-white truncate">{user?.full_name || 'User'}</p>
                <p className="text-xs text-blue-200 font-medium capitalize">{user?.role || 'Member'}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 text-blue-200 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
