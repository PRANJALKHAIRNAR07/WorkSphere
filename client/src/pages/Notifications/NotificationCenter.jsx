import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, Clock, Link as LinkIcon, Check } from 'lucide-react';
import API from '../../services/api';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const res = await API.get('/notifications');
      if (res.data.success) setNotifications(res.data.data);
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const markAsRead = async (id) => {
    try {
      await API.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
      );
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const markAllRead = async () => {
    try {
      await API.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-[#2563C7] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#172B4D] tracking-tight">Notification Center</h1>
          <p className="text-xs text-[#7185A5] mt-1 font-medium">
            Real-time updates, task assignments, project invites, and system notices.
          </p>
        </div>

        <button
          onClick={markAllRead}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-[#172B4D] font-semibold text-xs rounded-xl border border-[#DCE8F7] transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Check className="w-4 h-4 text-[#159B72]" />
          <span>Mark All as Read</span>
        </button>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="saas-card p-12 text-center rounded-2xl border border-[#DCE8F7]">
            <Bell className="w-12 h-12 text-[#7185A5] mx-auto mb-3 opacity-60" />
            <p className="text-[#7185A5] text-sm font-medium">You're all caught up! No unread notifications.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markAsRead(n.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                n.is_read
                  ? 'bg-white border-[#DCE8F7] opacity-80'
                  : 'bg-[#EBF3FE] border-[#2563C7]/40 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  n.is_read ? 'bg-slate-100 text-[#7185A5]' : 'bg-[#2563C7] text-white shadow-xs'
                }`}>
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#172B4D]">{n.title}</h4>
                  <p className="text-xs text-[#7185A5] mt-0.5 font-medium">{n.message}</p>
                  <span className="text-[10px] text-[#7185A5] block mt-2">
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {!n.is_read && (
                <span className="w-2.5 h-2.5 rounded-full bg-[#2563C7] shrink-0 mt-1" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
