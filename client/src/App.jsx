import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

import MainLayout from './components/layout/MainLayout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import ProjectsList from './pages/Projects/ProjectsList';
import KanbanBoard from './pages/Tasks/KanbanBoard';
import TeamsDirectory from './pages/Teams/TeamsDirectory';
import CalendarView from './pages/Calendar/CalendarView';
import AnalyticsView from './pages/Analytics/AnalyticsView';
import ProfileSettings from './pages/Profile/ProfileSettings';
import NotificationCenter from './pages/Notifications/NotificationCenter';
import NotFound from './pages/NotFound';

// Protected Route Guard
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F7FD] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#2563C7] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected SaaS App Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="projects" element={<ProjectsList />} />
              <Route path="tasks" element={<KanbanBoard />} />
              <Route path="teams" element={<TeamsDirectory />} />
              <Route path="calendar" element={<CalendarView />} />
              <Route path="analytics" element={<AnalyticsView />} />
              <Route path="profile" element={<ProfileSettings />} />
              <Route path="notifications" element={<NotificationCenter />} />
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}
