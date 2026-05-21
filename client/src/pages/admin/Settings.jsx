import React from 'react';
export default function Settings() {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm font-sans">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Global Security Settings</h3>
      <div className="text-sm text-slate-400 text-center py-10">CORS authorization strict bounds set to wildcards for verification environments.</div>
    </div>
  );
}