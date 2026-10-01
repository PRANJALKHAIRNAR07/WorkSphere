import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layers, ArrowRight, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('admin@worksphere.io');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F7FD] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Gradient Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#2563C7]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#153D7A]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#153D7A] to-[#2563C7] flex items-center justify-center shadow-md">
            <Layers className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-[#153D7A]">WorkSphere</span>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-[#172B4D]">
          Welcome Back
        </h2>
        <p className="mt-2 text-center text-sm text-[#7185A5] font-medium">
          Sign in to access your projects, team workspace, and tasks.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-[#DCE8F7]">
          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-[#D94848] text-sm font-medium">
              <AlertCircle className="w-5 h-5 shrink-0 text-[#D94848]" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-[#7185A5] uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7185A5]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#F3F7FD] border border-[#DCE8F7] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#172B4D] placeholder:text-slate-400 focus:outline-none focus:border-[#2563C7] focus:bg-white transition-all"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#7185A5] uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7185A5]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#F3F7FD] border border-[#DCE8F7] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#172B4D] placeholder:text-slate-400 focus:outline-none focus:border-[#2563C7] focus:bg-white transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl shadow-sm text-sm font-semibold text-white bg-[#2563C7] hover:bg-[#1D4FB2] focus:outline-none transition-all cursor-pointer"
            >
              {submitting ? 'Signing In...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Preset Credentials Picker for Reviewers */}
          <div className="mt-6 pt-6 border-t border-[#DCE8F7]">
            <p className="text-xs font-bold text-[#7185A5] uppercase tracking-wider mb-3">
              Quick Test Accounts
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => { setEmail('admin@worksphere.io'); setPassword('Password123!'); }}
                className="py-1.5 px-2 bg-[#F3F7FD] hover:bg-slate-200 border border-[#DCE8F7] rounded-lg text-xs font-semibold text-[#172B4D] transition-colors cursor-pointer"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => { setEmail('manager@worksphere.io'); setPassword('Password123!'); }}
                className="py-1.5 px-2 bg-[#F3F7FD] hover:bg-slate-200 border border-[#DCE8F7] rounded-lg text-xs font-semibold text-[#172B4D] transition-colors cursor-pointer"
              >
                Manager
              </button>
              <button
                type="button"
                onClick={() => { setEmail('david@worksphere.io'); setPassword('Password123!'); }}
                className="py-1.5 px-2 bg-[#F3F7FD] hover:bg-slate-200 border border-[#DCE8F7] rounded-lg text-xs font-semibold text-[#172B4D] transition-colors cursor-pointer"
              >
                Member
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-[#7185A5] font-medium">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-[#2563C7] hover:underline">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
