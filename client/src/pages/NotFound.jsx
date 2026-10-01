import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F3F7FD] flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#153D7A] to-[#2563C7] flex items-center justify-center shadow-md mb-6">
        <Layers className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-6xl font-extrabold text-[#153D7A] tracking-tight">404</h1>
      <h2 className="text-2xl font-bold text-[#172B4D] mt-2">Page Not Found</h2>
      <p className="text-sm text-[#7185A5] mt-2 max-w-md font-medium">
        The workspace path or resource you are looking for does not exist or has been relocated.
      </p>
      <Link
        to="/dashboard"
        className="mt-6 px-5 py-2.5 bg-[#2563C7] hover:bg-[#1D4FB2] text-white text-sm font-semibold rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
}
