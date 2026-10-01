import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layers, ArrowRight, Lock, Mail, User, Briefcase, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Member');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register({ fullName, email, password, role, jobTitle, department });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F7FD] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#2563C7]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#153D7A] to-[#2563C7] flex items-center justify-center shadow-md">
            <Layers className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-[#153D7A]">WorkSphere</span>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-[#172B4D]">
          Create Account
        </h2>
        <p className="mt-2 text-center text-sm text-[#7185A5] font-medium">
          Join your organization platform and start collaborating.
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

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-[#7185A5] uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7185A5]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#F3F7FD] border border-[#DCE8F7] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#172B4D] focus:outline-none focus:border-[#2563C7] focus:bg-white transition-all placeholder:text-slate-400"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#7185A5] uppercase tracking-wider mb-1.5">
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
                  className="w-full bg-[#F3F7FD] border border-[#DCE8F7] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#172B4D] focus:outline-none focus:border-[#2563C7] focus:bg-white transition-all placeholder:text-slate-400"
                  placeholder="john@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#7185A5] uppercase tracking-wider mb-1.5">
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
                  className="w-full bg-[#F3F7FD] border border-[#DCE8F7] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#172B4D] focus:outline-none focus:border-[#2563C7] focus:bg-white transition-all placeholder:text-slate-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#7185A5] uppercase tracking-wider mb-1.5">
                  Account Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-[#F3F7FD] border border-[#DCE8F7] rounded-xl px-3.5 py-2.5 text-sm text-[#172B4D] focus:outline-none focus:border-[#2563C7] focus:bg-white transition-all"
                >
                  <option value="Member">Member</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#7185A5] uppercase tracking-wider mb-1.5">
                  Job Title
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full bg-[#F3F7FD] border border-[#DCE8F7] rounded-xl px-3.5 py-2.5 text-sm text-[#172B4D] focus:outline-none focus:border-[#2563C7] focus:bg-white transition-all placeholder:text-slate-400"
                  placeholder="Developer"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#7185A5] uppercase tracking-wider mb-1.5">
                Department
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7185A5]">
                  <Briefcase className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-[#F3F7FD] border border-[#DCE8F7] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#172B4D] focus:outline-none focus:border-[#2563C7] focus:bg-white transition-all placeholder:text-slate-400"
                  placeholder="Engineering"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 mt-4 rounded-xl shadow-sm text-sm font-semibold text-white bg-[#2563C7] hover:bg-[#1D4FB2] focus:outline-none transition-all cursor-pointer"
            >
              {submitting ? 'Creating Account...' : 'Register Account'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-[#7185A5] font-medium">
              Already registered?{' '}
              <Link to="/login" className="font-bold text-[#2563C7] hover:underline">
                Log in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
