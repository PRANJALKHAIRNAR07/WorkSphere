import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Plus,
  ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function Dashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [charts, setCharts] = useState(null);
  const [projects, setProjects] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [metricsRes, chartsRes, projectsRes, tasksRes] = await Promise.all([
          API.get('/analytics/dashboard'),
          API.get('/analytics/charts'),
          API.get('/projects'),
          API.get('/tasks')
        ]);

        if (metricsRes.data.success) setMetrics(metricsRes.data.data.metrics);
        if (chartsRes.data.success) setCharts(chartsRes.data.data);
        if (projectsRes.data.success) setProjects(projectsRes.data.data);
        if (tasksRes.data.success) setRecentTasks(tasksRes.data.data.slice(0, 5));
      } catch (err) {
        console.error('Error fetching dashboard content:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Enterprise SaaS Doughnut Chart setup
  const doughnutData = {
    labels: charts?.taskStatusChart?.labels || ['Backlog', 'To Do', 'In Progress', 'In Review', 'Completed'],
    datasets: [
      {
        data: charts?.taskStatusChart?.datasets[0]?.data || [1, 2, 2, 0, 1],
        backgroundColor: [
          '#7185A5', // Secondary Text
          '#2563C7', // Royal Blue
          '#D58B13', // Warning Amber
          '#153D7A', // Primary Navy
          '#159B72'  // Success Teal
        ],
        borderColor: '#FFFFFF',
        borderWidth: 2,
      },
    ],
  };

  const barData = {
    labels: charts?.taskPriorityChart?.labels || ['Low', 'Medium', 'High', 'Urgent'],
    datasets: [
      {
        label: 'Task Count',
        data: charts?.taskPriorityChart?.datasets[0]?.data || [1, 2, 1, 1],
        backgroundColor: '#2563C7',
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#172B4D', font: { family: 'Inter', size: 12, weight: 600 } }
      }
    },
    scales: {
      x: {
        ticks: { color: '#7185A5', font: { family: 'Inter', size: 11 } },
        grid: { display: false }
      },
      y: {
        ticks: { color: '#7185A5', font: { family: 'Inter', size: 11 } },
        grid: { color: '#DCE8F7' }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-[#2563C7] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="p-6 lg:p-8 rounded-2xl bg-gradient-to-r from-[#153D7A] to-[#2563C7] text-white shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-0.5 rounded-full bg-white/15 text-white text-xs font-semibold border border-white/20">
              {user?.role} Workspace
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.full_name || 'Team Member'} 👋
          </h1>
          <p className="text-sm text-blue-100/90 mt-1">
            Here is your live operational overview and project progress metrics today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/projects"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl border border-white/25 transition-all hover-lift"
          >
            View Projects
          </Link>
          <Link
            to="/tasks"
            className="px-4 py-2.5 bg-white text-[#153D7A] hover:bg-blue-50 font-bold text-sm rounded-xl shadow-md transition-all hover-lift flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="saas-card saas-card-hover p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7185A5] uppercase tracking-wider">Active Projects</span>
            <div className="w-9 h-9 rounded-xl bg-[#EBF3FE] text-[#2563C7] flex items-center justify-center">
              <FolderKanban className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-[#172B4D]">{metrics?.activeProjects || 0}</span>
            <span className="text-xs font-semibold text-[#7185A5]">Total {metrics?.totalProjects || 0}</span>
          </div>
        </div>

        <div className="saas-card saas-card-hover p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7185A5] uppercase tracking-wider">Completion Rate</span>
            <div className="w-9 h-9 rounded-xl bg-[#E8F8F3] text-[#159B72] flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-[#159B72]">{metrics?.completionRate || 0}%</span>
            <span className="text-xs font-semibold text-[#159B72]">{metrics?.completedTasks || 0} Done</span>
          </div>
        </div>

        <div className="saas-card saas-card-hover p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7185A5] uppercase tracking-wider">In Progress Tasks</span>
            <div className="w-9 h-9 rounded-xl bg-[#FEF6E7] text-[#D58B13] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-[#172B4D]">{metrics?.inProgressTasks || 0}</span>
            <span className="text-xs font-semibold text-[#7185A5]">Total {metrics?.totalTasks || 0}</span>
          </div>
        </div>

        <div className="saas-card saas-card-hover p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7185A5] uppercase tracking-wider">Overdue Tasks</span>
            <div className="w-9 h-9 rounded-xl bg-[#FDF2F2] text-[#D94848] flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-[#D94848]">{metrics?.overdueTasks || 0}</span>
            <span className="text-xs font-semibold text-[#D94848]">Needs Attention</span>
          </div>
        </div>
      </div>

      {/* Chart Widgets Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="saas-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#DCE8F7] pb-3">
            <h3 className="font-bold text-base text-[#172B4D]">Task Status Distribution</h3>
            <span className="text-xs font-semibold text-[#7185A5]">Live Breakdown</span>
          </div>
          <div className="h-64">
            <Doughnut data={doughnutData} options={chartOptions} />
          </div>
        </div>

        <div className="saas-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#DCE8F7] pb-3">
            <h3 className="font-bold text-base text-[#172B4D]">Task Priority Breakdown</h3>
            <span className="text-xs font-semibold text-[#7185A5]">Urgency Level</span>
          </div>
          <div className="h-64">
            <Bar data={barData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Active Projects Preview */}
      <div className="saas-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#DCE8F7] pb-3">
          <h3 className="font-bold text-base text-[#172B4D]">Active WorkSphere Projects</h3>
          <Link to="/projects" className="text-xs text-[#2563C7] font-bold hover:underline flex items-center gap-1">
            <span>View All Projects</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {projects.slice(0, 3).map((p) => {
            const pct = p.task_count > 0 ? Math.round((p.completed_task_count / p.task_count) * 100) : 0;
            return (
              <div key={p.id} className="p-4 rounded-xl bg-[#F8FAFC] border border-[#DCE8F7] space-y-3 hover:border-[#B8D2F0] transition-colors">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#EBF3FE] text-[#2563C7] border border-[#B8D2F0]">
                    {p.key_code}
                  </span>
                  <span className={`text-xs font-semibold ${
                    p.status === 'In Progress' ? 'text-[#D58B13]' : 'text-[#2563C7]'
                  }`}>
                    {p.status}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-[#172B4D] truncate">{p.name}</h4>
                <p className="text-xs text-[#7185A5] line-clamp-2">{p.description}</p>
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs text-[#7185A5]">
                    <span>Progress</span>
                    <span className="font-bold text-[#172B4D]">{pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#DCE8F7] rounded-full overflow-hidden">
                    <div className="h-full bg-[#2563C7] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
