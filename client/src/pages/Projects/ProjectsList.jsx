import React, { useState, useEffect } from 'react';
import { Plus, FolderKanban, Users, Calendar, DollarSign, Search, CheckCircle, Clock } from 'lucide-react';
import API from '../../services/api';

export default function ProjectsList() {
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [keyCode, setKeyCode] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [budget, setBudget] = useState('');
  const [teamId, setTeamId] = useState('');

  const fetchProjects = async () => {
    try {
      const [pRes, tRes] = await Promise.all([
        API.get('/projects'),
        API.get('/teams')
      ]);
      if (pRes.data.success) setProjects(pRes.data.data);
      if (tRes.data.success) setTeams(tRes.data.data);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/projects', {
        name,
        key_code: keyCode,
        description,
        priority,
        budget: parseFloat(budget || 0),
        team_id: teamId || null
      });

      if (res.data.success) {
        setShowModal(false);
        setName('');
        setKeyCode('');
        setDescription('');
        fetchProjects();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create project.');
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#172B4D] tracking-tight">WorkSphere Projects</h1>
          <p className="text-xs text-[#7185A5] mt-1 font-medium">
            Manage organization project initiatives, budgets, milestones, and deliverables.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-[#2563C7] hover:bg-[#1D4FB2] text-white font-semibold text-xs rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((p) => {
          const totalTasks = p.task_count || 0;
          const doneTasks = p.completed_task_count || 0;
          const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

          return (
            <div key={p.id} className="saas-card p-6 border border-[#DCE8F7] rounded-2xl space-y-4 hover:shadow-card-hover transition-all duration-200">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#EBF3FE] text-[#2563C7] border border-[#DCE8F7]">
                  {p.key_code}
                </span>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  p.status === 'In Progress' ? 'bg-amber-50 text-[#D58B13] border border-amber-200' :
                  p.status === 'Completed' ? 'bg-emerald-50 text-[#159B72] border border-emerald-200' :
                  'bg-blue-50 text-[#2563C7] border border-blue-200'
                }`}>
                  {p.status}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-lg text-[#172B4D] mb-1">{p.name}</h3>
                <p className="text-xs text-[#7185A5] line-clamp-2 leading-relaxed">{p.description || 'No project summary provided.'}</p>
              </div>

              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs text-[#7185A5]">
                  <span className="font-medium">Task Completion</span>
                  <span className="font-bold text-[#172B4D]">{progress}% ({doneTasks}/{totalTasks})</span>
                </div>
                <div className="w-full h-2 bg-[#F3F7FD] rounded-full overflow-hidden border border-[#DCE8F7]">
                  <div className="h-full bg-gradient-to-r from-[#153D7A] to-[#2563C7] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#DCE8F7] text-xs text-[#7185A5]">
                <div className="flex items-center gap-1.5 font-medium">
                  <Users className="w-4 h-4 text-[#7185A5]" />
                  <span>{p.team_name || 'Cross-functional'}</span>
                </div>
                {p.budget > 0 && (
                  <span className="font-semibold text-[#159B72]">${parseFloat(p.budget).toLocaleString()}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#DCE8F7] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-[#172B4D] pb-3 border-b border-[#DCE8F7]">Create New Project</h3>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#7185A5] uppercase tracking-wider mb-1.5">Project Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#F3F7FD] border border-[#DCE8F7] rounded-xl px-3.5 py-2.5 text-sm text-[#172B4D] focus:outline-none focus:border-[#2563C7] focus:bg-white transition-all placeholder:text-slate-400"
                  placeholder="e.g. Design System Refresh"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#7185A5] uppercase tracking-wider mb-1.5">Key Code *</label>
                  <input
                    type="text"
                    required
                    maxLength="6"
                    value={keyCode}
                    onChange={(e) => setKeyCode(e.target.value.toUpperCase())}
                    className="w-full bg-[#F3F7FD] border border-[#DCE8F7] rounded-xl px-3.5 py-2.5 text-sm text-[#172B4D] focus:outline-none focus:border-[#2563C7] focus:bg-white transition-all placeholder:text-slate-400"
                    placeholder="DSR"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#7185A5] uppercase tracking-wider mb-1.5">Budget ($)</label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full bg-[#F3F7FD] border border-[#DCE8F7] rounded-xl px-3.5 py-2.5 text-sm text-[#172B4D] focus:outline-none focus:border-[#2563C7] focus:bg-white transition-all placeholder:text-slate-400"
                    placeholder="25000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#7185A5] uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#F3F7FD] border border-[#DCE8F7] rounded-xl px-3.5 py-2.5 text-sm text-[#172B4D] focus:outline-none focus:border-[#2563C7] focus:bg-white transition-all placeholder:text-slate-400"
                  placeholder="Project scope and goals..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#DCE8F7]">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#7185A5] text-xs font-semibold rounded-xl transition-all cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#2563C7] hover:bg-[#1D4FB2] text-white text-xs font-semibold rounded-xl shadow-sm transition-all cursor-pointer">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
