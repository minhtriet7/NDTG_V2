import React from 'react';
import { Globe, Save } from 'lucide-react';

export default function GoogleLensConfig() {
  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-500" /> Agent 3: Google Lens Engine Configuration
        </h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition">
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Visual Match Limit</label>
          <input type="number" defaultValue="5" className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none text-sm" />
          <span className="text-xs text-slate-400">Maximum top visual results forwarded to the referee.</span>
        </div>
      </div>
    </div>
  );
}   