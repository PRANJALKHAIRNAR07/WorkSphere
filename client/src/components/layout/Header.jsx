import React, { useState, useEffect } from 'react';
import { Menu, Search, Bell, Plus, Wifi } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import API from '../../services/api';

export default function Header({ setSidebarOpen }) {
  const { user } = useAuth();
  const { connected } = useSocket();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await API.get('/notifications');
        if (res.data.success) {
          setNotifications(res.data.data);
          const unread = res.data.data.filter(n => !n.is_read).length;
          setUnreadCount(unread);
        }
      } catch (err) {
        console.error('Error loading notifications:', err);
      }
    };
    if (user) fetchNotifs();
  }, [user]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/tasks?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-[#DCE8F7] sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between shadow-sm">
      {/* Left section: Hamburger button & Quick Search */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 text-[#7185A5] hover:text-[#172B4D] hover:bg-[#F3F7FD] rounded-xl lg:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>

        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md hidden sm:block">
          <Search className="w-4 h-4 text-[#7185A5] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects, tasks, keys..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F3F7FD] border border-[#DCE8F7] rounded-xl pl-9 pr-4 py-2 text-sm text-[#172B4D] placeholder-[#7185A5] focus:outline-none focus:ring-2 focus:ring-[#2563C7]/30 focus:border-[#2563C7] transition-all"
          />
        </form>
      </div>

      {/* Right section: System Status, New Task Button, Notifications */}
      <div className="flex items-center gap-3">
        {/* Real-time Socket Indicator */}
        <div className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${
          connected ? 'bg-[#E8F8F3] border-[#159B72]/30 text-[#159B72]' : 'bg-[#FEF6E7] border-[#D58B13]/30 text-[#D58B13]'
        }`}>
          <Wifi className={`w-3.5 h-3.5 ${connected ? 'text-[#159B72] animate-pulse' : 'text-[#D58B13]'}`} />
          <span>{connected ? 'Real-time Live' : 'Connecting'}</span>
        </div>

        {/* Quick Action Button */}
        <button
          onClick={() => navigate('/tasks')}
          className="flex items-center gap-2 px-3.5 py-2 bg-[#2563C7] hover:bg-[#1D4FB2] text-white font-semibold text-sm rounded-xl transition-all shadow-glow hover-lift"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Task</span>
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="p-2 text-[#7185A5] hover:text-[#172B4D] hover:bg-[#F3F7FD] rounded-xl transition-colors relative border border-transparent hover:border-[#DCE8F7]"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#2563C7] text-white font-bold text-[10px] rounded-full flex items-center justify-center shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[#DCE8F7] rounded-2xl shadow-modal z-50 p-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#DCE8F7] mb-3">
                <span className="font-bold text-sm text-[#172B4D]">Notifications</span>
                <button
                  onClick={() => { setShowNotifMenu(false); navigate('/notifications'); }}
                  className="text-xs font-semibold text-[#2563C7] hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-xs text-[#7185A5] text-center py-4">No recent notifications</p>
                ) : (
                  notifications.slice(0, 4).map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        n.is_read ? 'bg-[#F8FAFC] border-[#DCE8F7] text-[#7185A5]' : 'bg-[#EBF3FE] border-[#B8D2F0] text-[#172B4D] font-medium'
                      }`}
                      onClick={() => { setShowNotifMenu(false); navigate(n.link || '/notifications'); }}
                    >
                      <p className="font-bold text-[#172B4D] mb-0.5">{n.title}</p>
                      <p className="line-clamp-2 text-[#7185A5]">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
