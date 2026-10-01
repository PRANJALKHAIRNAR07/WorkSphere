import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Clock,
  MessageSquare,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
  X,
  Send,
  Upload,
  User,
  Calendar as CalendarIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import API from '../../services/api';

const COLUMNS = [
  { id: 'Backlog', title: 'Backlog', color: 'border-slate-300 text-slate-700 bg-slate-100' },
  { id: 'To Do', title: 'To Do', color: 'border-blue-200 text-[#2563C7] bg-[#EBF3FE]' },
  { id: 'In Progress', title: 'In Progress', color: 'border-amber-200 text-[#D58B13] bg-amber-50' },
  { id: 'In Review', title: 'In Review', color: 'border-purple-200 text-purple-700 bg-purple-50' },
  { id: 'Completed', title: 'Completed', color: 'border-emerald-200 text-[#159B72] bg-emerald-50' }
];

export default function KanbanBoard() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [teamUsers, setTeamUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [selectedProject, setSelectedProject] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // New Task Form
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskProject, setNewTaskProject] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('Medium');
  const [newTaskStatus, setNewTaskStatus] = useState('To Do');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  // Comment Form
  const [commentInput, setCommentInput] = useState('');

  const fetchBoardData = async () => {
    try {
      const [tasksRes, projectsRes, usersRes] = await Promise.all([
        API.get('/tasks'),
        API.get('/projects'),
        API.get('/users/directory')
      ]);

      if (tasksRes.data.success) setTasks(tasksRes.data.data);
      if (projectsRes.data.success) {
        setProjects(projectsRes.data.data);
        if (projectsRes.data.data.length > 0 && !newTaskProject) {
          setNewTaskProject(projectsRes.data.data[0].id);
        }
      }
      if (usersRes.data.success) setTeamUsers(usersRes.data.data);
    } catch (err) {
      console.error('Error loading Kanban board:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoardData();
  }, []);

  // Listen for real-time task movement from other users
  useEffect(() => {
    if (socket) {
      socket.on('task_updated', (updatedData) => {
        setTasks((prevTasks) =>
          prevTasks.map((t) => (t.id === updatedData.taskId ? { ...t, status: updatedData.status } : t))
        );
      });
    }
  }, [socket]);

  // Drag and Drop Handlers
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, columnStatus) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData('taskId'));
    if (!taskId) return;

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: columnStatus } : t))
    );

    try {
      await API.patch(`/tasks/${taskId}/reorder`, { status: columnStatus });
      if (socket) {
        socket.emit('task_moved', { taskId, status: columnStatus });
      }
    } catch (err) {
      console.error('Failed to update task status:', err);
      fetchBoardData(); // Rollback on error
    }
  };

  // Create Task Handler
  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/tasks', {
        title: newTaskTitle,
        description: newTaskDesc,
        project_id: newTaskProject,
        assigned_to: newTaskAssignee || null,
        priority: newTaskPriority,
        status: newTaskStatus,
        due_date: newTaskDueDate || null
      });

      if (res.data.success) {
        setShowCreateModal(false);
        setNewTaskTitle('');
        setNewTaskDesc('');
        fetchBoardData();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create task.');
    }
  };

  // Open Detailed Modal
  const openTaskDetail = async (task) => {
    try {
      const res = await API.get(`/tasks/${task.id}`);
      if (res.data.success) {
        setSelectedTask(res.data.data);
      }
    } catch (err) {
      setSelectedTask(task);
    }
  };

  // Add Comment Handler
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentInput.trim() || !selectedTask) return;

    try {
      const res = await API.post(`/tasks/${selectedTask.id}/comments`, {
        content: commentInput
      });

      if (res.data.success) {
        setSelectedTask((prev) => ({
          ...prev,
          comments: [...(prev.comments || []), res.data.data]
        }));
        setCommentInput('');
      }
    } catch (err) {
      console.error('Error posting comment:', err);
    }
  };

  // File Upload Handler
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedTask) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await API.post(`/tasks/${selectedTask.id}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setSelectedTask((prev) => ({
          ...prev,
          attachments: [res.data.data, ...(prev.attachments || [])]
        }));
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to upload attachment.');
    }
  };

  // Filter tasks based on search and project
  const filteredTasks = tasks.filter((t) => {
    const matchesProject = !selectedProject || t.project_id === parseInt(selectedProject);
    const matchesSearch =
      !searchQuery ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.task_key.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProject && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Board Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#172B4D] tracking-tight">Kanban Workspace Board</h1>
          <p className="text-xs text-[#7185A5] mt-1 font-medium">
            Drag and drop task cards to adjust status across workflows in real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Project Selector */}
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="bg-white border border-[#DCE8F7] rounded-xl px-3.5 py-2 text-xs font-semibold text-[#172B4D] focus:outline-none focus:border-[#2563C7] shadow-xs"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.key_code})</option>
            ))}
          </select>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#7185A5] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-[#DCE8F7] rounded-xl pl-9 pr-3.5 py-2 text-xs text-[#172B4D] placeholder:text-slate-400 focus:outline-none focus:border-[#2563C7] w-44 shadow-xs"
            />
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-[#2563C7] hover:bg-[#1D4FB2] text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);
          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className="bg-[#F3F7FD]/80 rounded-2xl p-3.5 border border-[#DCE8F7] flex flex-col min-h-[600px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#DCE8F7] mb-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${col.color}`}>
                    {col.title}
                  </span>
                  <span className="text-xs font-bold text-[#7185A5]">({colTasks.length})</span>
                </div>
              </div>

              {/* Task Cards Dropzone */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {colTasks.map((t) => (
                  <div
                    key={t.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, t.id)}
                    onClick={() => openTaskDetail(t)}
                    className="p-4 rounded-xl bg-white border border-[#DCE8F7] hover:border-[#2563C7] cursor-grab active:cursor-grabbing hover:shadow-card-hover transition-all shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#2563C7] tracking-wider">
                        {t.task_key}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        t.priority === 'Urgent' ? 'bg-red-50 text-[#D94848] border border-red-200' :
                        t.priority === 'High' ? 'bg-amber-50 text-[#D58B13] border border-amber-200' :
                        'bg-slate-100 text-[#7185A5] border border-slate-200'
                      }`}>
                        {t.priority}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-[#172B4D] line-clamp-2">{t.title}</h4>
                    {t.description && (
                      <p className="text-xs text-[#7185A5] line-clamp-2">{t.description}</p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-[#DCE8F7] text-xs text-[#7185A5]">
                      <div className="flex items-center gap-2">
                        {t.due_date && (
                          <div className="flex items-center gap-1 text-[11px] text-[#7185A5]">
                            <Clock className="w-3 h-3 text-[#7185A5]" />
                            <span>{new Date(t.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                          </div>
                        )}
                      </div>

                      <div className="w-6 h-6 rounded-full bg-[#153D7A] flex items-center justify-center text-white text-[10px] font-bold" title={t.assignee_name || 'Unassigned'}>
                        {t.assignee_name ? t.assignee_name.charAt(0) : '?'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#DCE8F7] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE8F7]">
              <h3 className="font-bold text-lg text-[#172B4D]">Create New Task</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-[#7185A5] hover:text-[#172B4D] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#7185A5] uppercase tracking-wider mb-1.5">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full bg-[#F3F7FD] border border-[#DCE8F7] rounded-xl px-3.5 py-2.5 text-sm text-[#172B4D] focus:outline-none focus:border-[#2563C7] focus:bg-white transition-all placeholder:text-slate-400"
                  placeholder="e.g. Implement Real-time Socket Event Handlers"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#7185A5] uppercase tracking-wider mb-1.5">
                  Project *
                </label>
                <select
                  value={newTaskProject}
                  onChange={(e) => setNewTaskProject(e.target.value)}
                  className="w-full bg-[#F3F7FD] border border-[#DCE8F7] rounded-xl px-3.5 py-2.5 text-sm text-[#172B4D] focus:outline-none focus:border-[#2563C7] focus:bg-white transition-all"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.key_code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#7185A5] uppercase tracking-wider mb-1.5">
                    Assignee
                  </label>
                  <select
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                    className="w-full bg-[#F3F7FD] border border-[#DCE8F7] rounded-xl px-3.5 py-2.5 text-sm text-[#172B4D] focus:outline-none focus:border-[#2563C7] focus:bg-white transition-all"
                  >
                    <option value="">Unassigned</option>
                    {teamUsers.map((u) => (
                      <option key={u.id} value={u.id}>{u.full_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#7185A5] uppercase tracking-wider mb-1.5">
                    Priority
                  </label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                    className="w-full bg-[#F3F7FD] border border-[#DCE8F7] rounded-xl px-3.5 py-2.5 text-sm text-[#172B4D] focus:outline-none focus:border-[#2563C7] focus:bg-white transition-all"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#7185A5] uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  className="w-full bg-[#F3F7FD] border border-[#DCE8F7] rounded-xl px-3.5 py-2.5 text-sm text-[#172B4D] focus:outline-none focus:border-[#2563C7] focus:bg-white transition-all placeholder:text-slate-400"
                  placeholder="Task context, requirements, acceptance criteria..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#DCE8F7]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#7185A5] text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2563C7] hover:bg-[#1D4FB2] text-white text-xs font-semibold rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Detail & Discussion Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#DCE8F7] rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE8F7]">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-[#EBF3FE] text-[#2563C7] border border-[#DCE8F7]">
                  {selectedTask.task_key}
                </span>
                <span className="text-xs text-[#7185A5] font-semibold">{selectedTask.project_name}</span>
              </div>
              <button onClick={() => setSelectedTask(null)} className="text-[#7185A5] hover:text-[#172B4D] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Task Detail Content */}
            <div>
              <h2 className="text-xl font-bold text-[#172B4D] mb-2">{selectedTask.title}</h2>
              <p className="text-sm text-[#172B4D] whitespace-pre-line bg-[#F3F7FD] p-4 rounded-xl border border-[#DCE8F7]">
                {selectedTask.description || 'No detailed description provided.'}
              </p>
            </div>

            {/* Discussion Comments */}
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-[#172B4D] flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#2563C7]" />
                <span>Comments & Discussion ({selectedTask.comments?.length || 0})</span>
              </h3>

              <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                {selectedTask.comments?.map((c) => (
                  <div key={c.id} className="p-3 rounded-xl bg-[#F3F7FD] border border-[#DCE8F7] text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#153D7A]">{c.user_name}</span>
                      <span className="text-[#7185A5]">{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-[#172B4D]">{c.content}</p>
                  </div>
                ))}
              </div>

              {/* Add Comment Box */}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  className="flex-1 bg-[#F3F7FD] border border-[#DCE8F7] rounded-xl px-3.5 py-2 text-xs text-[#172B4D] focus:outline-none focus:border-[#2563C7] focus:bg-white placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2563C7] hover:bg-[#1D4FB2] text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-sm cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>

            {/* Attachments Section */}
            <div className="space-y-3 border-t border-[#DCE8F7] pt-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[#172B4D] flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-[#2563C7]" />
                  <span>Attachments ({selectedTask.attachments?.length || 0})</span>
                </h3>
                <label className="cursor-pointer px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-[#172B4D] rounded-lg flex items-center gap-1.5 transition-all">
                  <Upload className="w-3.5 h-3.5 text-[#2563C7]" />
                  <span>Upload File</span>
                  <input type="file" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {selectedTask.attachments?.map((att) => (
                  <a
                    key={att.id}
                    href={`/api/attachments/${att.id}/download`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-[#F3F7FD] border border-[#DCE8F7] hover:border-[#2563C7] text-xs flex items-center justify-between truncate"
                  >
                    <span className="truncate text-[#172B4D] font-medium">{att.file_name}</span>
                    <span className="text-[10px] text-[#2563C7] font-bold ml-2">Download</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
