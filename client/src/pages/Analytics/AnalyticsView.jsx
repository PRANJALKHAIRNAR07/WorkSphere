import React, { useState, useEffect } from 'react';
import { Download, BarChart3, PieChart, TrendingUp, CheckCircle, FileSpreadsheet } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import API from '../../services/api';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function AnalyticsView() {
  const [charts, setCharts] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [mRes, cRes] = await Promise.all([
          API.get('/analytics/dashboard'),
          API.get('/analytics/charts')
        ]);
        if (mRes.data.success) setMetrics(mRes.data.data.metrics);
        if (cRes.data.success) setCharts(cRes.data.data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const handleExportCSV = () => {
    window.open('/api/analytics/export-csv', '_blank');
  };

  const doughnutData = {
    labels: charts?.taskStatusChart?.labels || ['Backlog', 'To Do', 'In Progress', 'In Review', 'Completed'],
    datasets: [
      {
        data: charts?.taskStatusChart?.datasets[0]?.data || [1, 2, 2, 0, 1],
        backgroundColor: [
          '#94A3B8',
          '#2563C7',
          '#D58B13',
          '#7C3AED',
          '#159B72'
        ],
        borderColor: '#FFFFFF',
        borderWidth: 2,
      },
    ],
  };

  const projectStatusData = {
    labels: charts?.projectStatusChart?.labels || ['Planning', 'In Progress', 'On Hold', 'Completed'],
    datasets: [
      {
        label: 'Projects',
        data: charts?.projectStatusChart?.datasets[0]?.data || [1, 2, 0, 0],
        backgroundColor: '#2563C7',
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#7185A5', font: { family: 'Inter', size: 12, weight: '600' } }
      }
    },
    scales: {
      x: {
        ticks: { color: '#7185A5' },
        grid: { color: '#EBF3FE' }
      },
      y: {
        ticks: { color: '#7185A5' },
        grid: { color: '#EBF3FE' }
      }
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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#172B4D] tracking-tight">Analytics & Productivity Reports</h1>
          <p className="text-xs text-[#7185A5] mt-1 font-medium">
            Data insights, project delivery velocity, task completion charts, and CSV report export.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 bg-[#159B72] hover:bg-[#12825F] text-white font-semibold text-xs rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2 self-start md:self-auto cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="saas-card p-5 rounded-2xl border border-[#DCE8F7] shadow-xs">
          <span className="text-xs font-bold text-[#7185A5] uppercase tracking-wider">Estimated Workload</span>
          <p className="text-3xl font-extrabold text-[#172B4D] mt-2">{metrics?.totalEstHours || 0} Hours</p>
        </div>
        <div className="saas-card p-5 rounded-2xl border border-[#DCE8F7] shadow-xs">
          <span className="text-xs font-bold text-[#7185A5] uppercase tracking-wider">Actual Hours Logged</span>
          <p className="text-3xl font-extrabold text-[#2563C7] mt-2">{metrics?.totalActualHours || 0} Hours</p>
        </div>
        <div className="saas-card p-5 rounded-2xl border border-[#DCE8F7] shadow-xs">
          <span className="text-xs font-bold text-[#7185A5] uppercase tracking-wider">Task Velocity Completion</span>
          <p className="text-3xl font-extrabold text-[#159B72] mt-2">{metrics?.completionRate || 0}%</p>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="saas-card p-6 rounded-2xl border border-[#DCE8F7] space-y-4 shadow-xs">
          <h3 className="font-bold text-base text-[#172B4D]">Task Velocity Breakdown</h3>
          <div className="h-64">
            <Doughnut data={doughnutData} options={chartOptions} />
          </div>
        </div>

        <div className="saas-card p-6 rounded-2xl border border-[#DCE8F7] space-y-4 shadow-xs">
          <h3 className="font-bold text-base text-[#172B4D]">Project Status Distribution</h3>
          <div className="h-64">
            <Bar data={projectStatusData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
