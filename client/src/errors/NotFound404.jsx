import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export default function NotFound404() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 font-sans text-center">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-md w-full">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <FileQuestion className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2">404</h1>
        <h2 className="text-xl font-bold text-slate-800 mb-3">Page Not Found</h2>
        <p className="text-slate-500 text-sm mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link to="/" className="inline-flex items-center justify-center gap-2 w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold transition active:scale-95">
          <ArrowLeft className="w-4 h-4" /> Back to Safety
        </Link>
      </div>
    </div>
  );
}