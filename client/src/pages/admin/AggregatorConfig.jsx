import React from 'react';
import { Award, Save } from 'lucide-react';

export default function AggregatorConfig() {
  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" /> Aggregator Agent voting logic
        </h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition">
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Conflict Resolution Strategy</label>
          <select className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none text-sm">
            <option>Consensus-Based (Majority Vote)</option>
            <option>Strict Trust (Prioritize Lens + LLM)</option>
            <option>ML Bound (Prioritize YOLO Boundary)</option>
          </select>
        </div>
      </div>
    </div>
  );
}