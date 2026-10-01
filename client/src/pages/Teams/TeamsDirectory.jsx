import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, Mail, Briefcase, Plus } from 'lucide-react';
import API from '../../services/api';

export default function TeamsDirectory() {
  const [teams, setTeams] = useState([]);
  const [directory, setDirectory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamsRes, dirRes] = await Promise.all([
          API.get('/teams'),
          API.get('/users/directory')
        ]);
        if (teamsRes.data.success) setTeams(teamsRes.data.data);
        if (dirRes.data.success) setDirectory(dirRes.data.data);
      } catch (err) {
        console.error('Error fetching teams:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-[#2563C7] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-[#172B4D] tracking-tight">Teams & People Directory</h1>
        <p className="text-xs text-[#7185A5] mt-1 font-medium">
          Organization engineering squads, product teams, and platform contributors.
        </p>
      </div>

      {/* Teams Grid */}
      <div className="space-y-4">
        <h2 className="font-bold text-lg text-[#172B4D] flex items-center gap-2">
          <Users className="w-5 h-5 text-[#2563C7]" />
          <span>Active Organization Teams</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map((t) => (
            <div key={t.id} className="saas-card p-5 rounded-2xl border border-[#DCE8F7] space-y-3 hover:shadow-card-hover transition-all">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-[#172B4D]">{t.name}</h3>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#EBF3FE] text-[#2563C7] border border-[#DCE8F7]">
                  {t.member_count || 1} Members
                </span>
              </div>
              <p className="text-xs text-[#7185A5] leading-relaxed">{t.description || 'Dedicated operational unit.'}</p>
              <div className="flex items-center justify-between text-xs text-[#7185A5] pt-3 border-t border-[#DCE8F7]">
                <span>Created by {t.creator_name || 'Admin'}</span>
                <span className="font-medium text-[#172B4D]">{t.project_count || 0} Linked Projects</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Organization People Directory */}
      <div className="space-y-4">
        <h2 className="font-bold text-lg text-[#172B4D] flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#2563C7]" />
          <span>People Directory</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {directory.map((u) => (
            <div key={u.id} className="saas-card p-4 rounded-xl border border-[#DCE8F7] flex items-center gap-3 hover:shadow-card-hover transition-all">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#153D7A] to-[#2563C7] flex items-center justify-center font-bold text-white text-sm shadow-xs">
                {u.full_name ? u.full_name.charAt(0) : 'U'}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-[#172B4D] truncate">{u.full_name}</h4>
                <p className="text-xs text-[#7185A5] truncate">{u.job_title || 'Team Member'}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    u.role === 'Admin' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                    u.role === 'Manager' ? 'bg-amber-50 text-[#D58B13] border border-amber-200' : 'bg-slate-100 text-[#7185A5] border border-slate-200'
                  }`}>
                    {u.role}
                  </span>
                  <span className="text-[11px] text-[#7185A5] truncate">{u.department || 'WorkSphere'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
