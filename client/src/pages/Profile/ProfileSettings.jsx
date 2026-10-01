import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Briefcase, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';

export default function ProfileSettings() {
  const { user, updateUser } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [jobTitle, setJobTitle] = useState(user?.job_title || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [bio, setBio] = useState(user?.bio || '');

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setJobTitle(user.job_title || '');
      setDepartment(user.department || '');
      setBio(user.bio || '');
    }
  }, [user]);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [profileMsg, setProfileMsg] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    setErrorMsg('');
    try {
      const res = await API.put('/users/profile', {
        fullName,
        jobTitle,
        department,
        bio
      });

      if (res.data.success) {
        updateUser(res.data.data);
        setProfileMsg('Profile information updated successfully.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to update profile.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    setErrorMsg('');
    try {
      const res = await API.put('/users/change-password', {
        currentPassword,
        newPassword
      });

      if (res.data.success) {
        setPasswordMsg('Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to change password.');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-[#172B4D] tracking-tight">Account & Profile Settings</h1>
        <p className="text-xs text-[#7185A5] mt-1 font-medium">
          Manage your personal information, job details, and security credentials.
        </p>
      </div>

      {profileMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[#159B72] text-sm font-medium flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-[#159B72]" />
          <span>{profileMsg}</span>
        </div>
      )}

      {passwordMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[#159B72] text-sm font-medium flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-[#159B72]" />
          <span>{passwordMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-[#D94848] text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-[#D94848]" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* User Information Card */}
      <div className="saas-card p-6 rounded-2xl border border-[#DCE8F7] space-y-6 shadow-xs">
        <h3 className="font-bold text-base text-[#172B4D] border-b border-[#DCE8F7] pb-3">
          Personal Information
        </h3>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#7185A5] uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#F3F7FD] border border-[#DCE8F7] rounded-xl px-3.5 py-2.5 text-sm text-[#172B4D] focus:outline-none focus:border-[#2563C7] focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#7185A5] uppercase tracking-wider mb-1.5">
                Email Address (Read-only)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-[#7185A5] cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#7185A5] uppercase tracking-wider mb-1.5">
                Job Title
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full bg-[#F3F7FD] border border-[#DCE8F7] rounded-xl px-3.5 py-2.5 text-sm text-[#172B4D] focus:outline-none focus:border-[#2563C7] focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#7185A5] uppercase tracking-wider mb-1.5">
                Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-[#F3F7FD] border border-[#DCE8F7] rounded-xl px-3.5 py-2.5 text-sm text-[#172B4D] focus:outline-none focus:border-[#2563C7] focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#7185A5] uppercase tracking-wider mb-1.5">
              Short Bio
            </label>
            <textarea
              rows="3"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-[#F3F7FD] border border-[#DCE8F7] rounded-xl px-3.5 py-2.5 text-sm text-[#172B4D] focus:outline-none focus:border-[#2563C7] focus:bg-white transition-all"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-[#2563C7] hover:bg-[#1D4FB2] text-white font-semibold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
          >
            Save Changes
          </button>
        </form>
      </div>

      {/* Security Card */}
      <div className="saas-card p-6 rounded-2xl border border-[#DCE8F7] space-y-6 shadow-xs">
        <h3 className="font-bold text-base text-[#172B4D] border-b border-[#DCE8F7] pb-3">
          Security & Password
        </h3>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#7185A5] uppercase tracking-wider mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-[#F3F7FD] border border-[#DCE8F7] rounded-xl px-3.5 py-2.5 text-sm text-[#172B4D] focus:outline-none focus:border-[#2563C7] focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#7185A5] uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#F3F7FD] border border-[#DCE8F7] rounded-xl px-3.5 py-2.5 text-sm text-[#172B4D] focus:outline-none focus:border-[#2563C7] focus:bg-white transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#172B4D] font-semibold text-xs rounded-xl border border-[#DCE8F7] transition-all cursor-pointer"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}
