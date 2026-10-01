import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import API from '../../services/api';

export default function CalendarView() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingTasks = async () => {
      try {
        const res = await API.get('/tasks');
        if (res.data.success) {
          setTasks(res.data.data.filter(t => t.due_date));
        }
      } catch (err) {
        console.error('Error fetching calendar tasks:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUpcomingTasks();
  }, []);

  // Group tasks by Date
  const groupedByDate = tasks.reduce((acc, task) => {
    let dateStr = 'Upcoming';
    if (task.due_date) {
      try {
        const d = new Date(task.due_date);
        if (!isNaN(d.getTime())) {
          dateStr = d.toISOString().split('T')[0];
        }
      } catch (e) {}
    }
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(task);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedByDate).sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-[#2563C7] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#172B4D] tracking-tight">Calendar & Upcoming Deadlines</h1>
        <p className="text-xs text-[#7185A5] mt-1 font-medium">
          Chronological milestone timeline for project task deliverables and due dates.
        </p>
      </div>

      <div className="space-y-6">
        {sortedDates.length === 0 ? (
          <div className="saas-card p-12 text-center rounded-2xl border border-[#DCE8F7]">
            <CalendarIcon className="w-12 h-12 text-[#7185A5] mx-auto mb-3 opacity-60" />
            <p className="text-[#7185A5] text-sm font-medium">No scheduled task deadlines found.</p>
          </div>
        ) : (
          sortedDates.map((dateStr) => {
            const formattedDate = new Date(dateStr).toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
            const dateTasks = groupedByDate[dateStr];

            return (
              <div key={dateStr} className="saas-card p-5 rounded-2xl border border-[#DCE8F7] space-y-4 shadow-xs">
                <div className="flex items-center gap-3 pb-3 border-b border-[#DCE8F7]">
                  <div className="w-8 h-8 rounded-lg bg-[#EBF3FE] text-[#2563C7] flex items-center justify-center font-bold text-xs border border-[#DCE8F7]">
                    <CalendarIcon className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-base text-[#172B4D]">{formattedDate}</h3>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-[#7185A5] border border-slate-200">
                    {dateTasks.length} {dateTasks.length === 1 ? 'Task' : 'Tasks'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {dateTasks.map((t) => (
                    <div key={t.id} className="p-4 rounded-xl bg-[#F3F7FD] border border-[#DCE8F7] space-y-2 hover:border-[#2563C7] transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#2563C7]">{t.task_key}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          t.status === 'Completed' ? 'bg-emerald-50 text-[#159B72] border border-emerald-200' : 'bg-amber-50 text-[#D58B13] border border-amber-200'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-[#172B4D]">{t.title}</h4>
                      <p className="text-xs text-[#7185A5] font-medium">Project: {t.project_name}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
